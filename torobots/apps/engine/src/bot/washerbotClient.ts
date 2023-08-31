import { EventEmitter } from "events";
import config from "../config";
import moment from "moment";
import { getMaxGasPriceByBlockchainName, getCurrentPriceByChainAndSymbol } from "../scan";
import {
  BlockchainClient, ERC20Token, UniswapDex, EExchangeType,
  IStoredUser,
  IStoredWasherBot,
  IStoredBlockchain, IStoredNode, IStoredDex, IStoredWallet, IBaseWallet, IStoredCoin, IStoredToken,
  ERunningStatus, STATUS_SUCCESS, Logger, waitFor,
  Response, mongoDB, IAutoBotState, EWasherBotStatus, IStoredCompanyWallet, EWasherBotActionResult, IWasherBotState,
} from "@torobot/shared";
import BigNumber from "bignumber.js";
import routerABI from "./uniswapV2Router";
import pairABI from "./uniswapV2Pair";
import factoryABI from "../scan/factory";
import * as web3Utils from "web3-utils";
import axios from "axios";

export class WasherBotClient extends EventEmitter {
  tryCount: number = 0;
  processed: boolean = false;
  currentBlockNumber: number = 0;
  selectedSubWalletIndex: number = 0;
  periodCnt: number = 0;

  lockedProcess: boolean = false;

  state: IAutoBotState = {
    active: false,
    status: ERunningStatus.DRAFT,
    thread: 'NONE'
  }
  logger: Logger;
  user: IStoredUser;
  bot: IStoredWasherBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  dex: IStoredDex;
  wallet: IStoredWallet;
  coin: IStoredCoin;
  token: IStoredToken;

  coinAddress: string;
  tokenAddress: string;
  pairAddress: string;
  pairContract: any;
  factoryContract: any;
  routerContract: any;

  blockchainClient: BlockchainClient;
  swapDex: UniswapDex;
  coinERC20: ERC20Token;
  tokenERC20: ERC20Token;

  private intervalID = null;
  private intervalID_for_Saving_VolumeData = null;

  isDone: boolean = true;
  isCalculated: boolean = true;
  errCounter: number = 0;

  get logPrefix() { return `washerbotClient`; }

  constructor(bot: IStoredWasherBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/washerbot/${bot._id}.txt`);
    this.bot = bot;
  }

  async init() {
    this.user = this.bot.owner as IStoredUser;
    this.blockchain = this.bot.blockchain as IStoredBlockchain;
    this.node = this.bot.node as IStoredNode;
    this.dex = this.bot.dex as IStoredDex;
    this.wallet = this.bot.wallet as IStoredWallet;
    this.coin = this.bot.coin as IStoredCoin;
    this.token = this.bot.token as IStoredToken;
    this.coinAddress = this.coin.address;
    this.tokenAddress = this.token.address;

    this.blockchainClient = new BlockchainClient(this.blockchain, this.node, this.wallet as IStoredWallet, this.logger);
    this.swapDex = new UniswapDex(this.blockchainClient, this.dex, this.logger);
    this.coinERC20 = new ERC20Token(this.blockchainClient, this.coinAddress, this.logger);
    this.tokenERC20 = new ERC20Token(this.blockchainClient, this.tokenAddress, this.logger);

    await this.blockchainClient.init();
    await this.swapDex.init();
    await this.coinERC20.init();
    await this.tokenERC20.init();
    this.routerContract = new this.blockchainClient.rpcWeb3.eth.Contract(routerABI as web3Utils.AbiItem[], this.dex.routerAddress);
    this.factoryContract = new this.blockchainClient.rpcWeb3.eth.Contract(factoryABI as web3Utils.AbiItem[], this.dex.factoryAddress);
    this.pairAddress = await this.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
    this.pairContract = new this.blockchainClient.rpcWeb3.eth.Contract(pairABI as web3Utils.AbiItem[], this.pairAddress);
    this.logger.log(this.logPrefix, 'info', 'init');
  }

  async setBotStatus(st: IWasherBotState) {
    let botDoc = await mongoDB.WasherBots.findById(this.bot._id);
    botDoc.state = st;
    if (st.status === EWasherBotStatus.STOPPED || st.status === EWasherBotStatus.SUCCESS || st.status === EWasherBotStatus.FAILED) {
      botDoc.stateNum = 0;
    }
    await botDoc.save();
    this.bot.state = st;
  }
  async saveSoldResult(txHash: string, gasPrice: string, tokenAmount: number) {
    console.log("--------------> saveSoldResult: ", txHash);
    const qRes = await this.blockchainClient.getTransactionReceipt(txHash);
    let coinAmount = new BigNumber(0);
    if (qRes.logs) {
      for (const log of qRes.logs) {
        if (log.topics) {
          if (log.topics.length === 3) {
            // Get pair contract address
            const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
            if (pairContractAddress) {
              // Transfer
              if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
                pairContractAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1 &&
                this.wallet.publicKey.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1
              ) {
                coinAmount = new BigNumber(log.data).shiftedBy(-this.coinERC20.decimals);
                break;
              }
            }
          }
        }
      }
    }

    const fee = qRes.gasUsed ? new BigNumber(qRes.gasUsed).multipliedBy(gasPrice).shiftedBy(-18).multipliedBy(new BigNumber(getCurrentPriceByChainAndSymbol(this.blockchain.name, this.blockchain.coinSymbol))).toNumber() : 0;
    const price = coinAmount.multipliedBy(new BigNumber(getCurrentPriceByChainAndSymbol(this.blockchain.name, this.coin.symbol))).toNumber();
    const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
      { 'sequenceName': 'Liquidator', sequenceId: this.bot._id },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    await mongoDB.LiquidatorTransactions.create({
      liquidator: this.bot._id,
      token: this.token._id,
      txHash: txHash,
      tokenAmount: tokenAmount,
      fee: fee,
      price: price,
      uniqueNum: sequenceDocument.sequenceValue
    });
  }

  async start() {
    this.processed = false;
    this.tryCount = 0;
    this.lockedProcess = false;
    this.periodCnt = 0;
    await this.setBotStatus({
      status: EWasherBotStatus.RUNNING,
      result: EWasherBotActionResult.DRAFT
    });
    this.isDone = true;
    this.isCalculated = true;
    // await this.buy(0);
    // await this.sell(0);
    // await this.withdraw();
    this.intervalID = setInterval(() => this.process(), 1000);
    this.saveCoinMarketCapVolume();
    this.intervalID_for_Saving_VolumeData = setInterval(() => this.saveCoinMarketCapVolume(), 600000); // per 10min
    console.log("washer started --------------------------------------");
  }

  async stop(result?: EWasherBotActionResult) {
    if (this.bot.isProcessing) return;
    this.processed = true;
    this.lockedProcess = true;
    await this.setBotStatus({
      status: EWasherBotStatus.STOPPED,
      result: result ? result : EWasherBotActionResult.DRAFT
    });
    if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData) }
    if (this.intervalID) { clearInterval(this.intervalID); }
    console.log("washer bot Stoped ----------------------------- ")
  }

  async saveCoinMarketCapVolume() {
    try {
      const volumeObj = await mongoDB.CoinMarketVolumes.find({ token: this.token._id }).sort({ 'timestamp': -1 }).limit(1);

      const today = new Date();
      const startDate = new Date(today);
      const endDate = new Date(today);
      let dayDiff = 20;
      if (volumeObj?.length) {
        const todayTime = today.getTime();
        const volumeLastTime = new Date(volumeObj[0].timestamp).getTime();
        dayDiff = Math.floor((todayTime - volumeLastTime) / (1000 * 60 * 60 * 24));
        dayDiff = Math.min(dayDiff, 20);
      }
      startDate.setDate(startDate.getDate() - dayDiff - 1);
      const timeStart = moment(startDate).format("YYYY-MM-DD");
      const timeEnd = moment(endDate).format("YYYY-MM-DD");
      console.log("-------", dayDiff, timeEnd, timeStart);
      // 
      if (dayDiff > 0) {
        const res = await axios.get(
          `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/historical?id=${this.bot.coinmarketcapId}&time_start=${timeStart}&time_end=${timeEnd}`,
          {
            headers: { 'X-CMC_PRO_API_KEY': 'f11d72ac-59ba-4c67-9220-95fababf3e68' }
          }
        );
        if (res.data.status.error_code === 0) {
          const quotes = res.data.data[this.bot.coinmarketcapId]?.quotes || [];
          for (let i = 0; i < quotes.length; i++) {
            await mongoDB.CoinMarketVolumes.create({
              token: this.token._id,
              open: quotes[i].quote?.USD?.open || 0,
              high: quotes[i].quote?.USD?.high || 0,
              low: quotes[i].quote?.USD?.low || 0,
              close: quotes[i].quote?.USD?.close || 0,
              volume: quotes[i].quote?.USD?.volume || 0,
              timestamp: quotes[i].quote?.USD?.timestamp || new Date(),
            });
          }

        } else {
        }
      }
    } catch (err) {}
  }

  async saveCurrentCoinMarketCapVolume(o: number, h: number, l: number, c: number, v: number, t: Date) {
    await mongoDB.CurrentCoinMarketVolumes.create({
      token: this.token._id,
      open: o,
      high: h,
      low: l,
      close: c,
      volume: v,
      timestamp: t,
    });

  }

  async deposit() {
    let depositMainCoin = this.bot.depositMainCoin;
    let depositBaseCoin = this.bot.depositBaseCoin;
    const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
    console.log("gas price ------->", gasPrice);
    for (let i = 0; i < this.bot.cntWallet; i++) {
      // 0. sending main coin from wallet to subwallet
      let subWallet = this.bot.subWallets[i] as IStoredCompanyWallet;
      console.log("---------SUBWALLET ", i, ": ", subWallet.publicKey);
      try {
        const tx = await this.blockchainClient.rpcWeb3.eth.accounts.signTransaction(
          {
            to: subWallet.publicKey,
            value: new BigNumber(depositMainCoin).shiftedBy(18).toString(),
            gas: 2000000,
            gasPrice: gasPrice
          },
          this.wallet.privateKey
        );

        if (tx && tx?.rawTransaction) {
          const sendResult = await this.blockchainClient.rpcWeb3.eth.sendSignedTransaction(tx.rawTransaction);
          if (sendResult && sendResult?.status) {
            // save and emit status
            console.log(sendResult);
          }
        }
      } catch (e) {
        console.warn("---------DEPOSIT STEP1: ", e);
      }
      await this.waitOneBlock();
      // 1. sending base token for buying from mainWallet to walletAddress
      try {
        console.log(`----------from(${this.wallet.publicKey}), to(${subWallet.publicKey}), Amount(${this.bot.depositBaseCoin}), coin(${this.coinERC20.symbol}, ${this.coinERC20.decimals})`)
        const txCall = this.coinERC20.transfer(subWallet.publicKey, new BigNumber(depositBaseCoin));
        const txRes: Response = await this.blockchainClient.sendSignedTransaction(this.coinERC20.address, txCall, 0, gasPrice);
        console.log("----------step1: ", txRes);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
        }
      } catch (e) {
        console.warn("---------DEPOSIT STEP2: ", e);
      }
      await this.waitOneBlock();
    }
  }

  async approve() {
    // 2. approving for pre buying
    const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
    for (let i = 0; i < this.bot.cntWallet; i++) {
      // 0. sending main coin from wallet to subwallet
      let subWallet = this.bot.subWallets[i] as IStoredCompanyWallet;
      try {
        const txCall = this.coinERC20.approve(this.dex.routerAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          subWallet.publicKey,
          subWallet.privateKey,
          this.coinERC20.address,
          txCall,
          0,
          gasPrice
        );
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for buying: transactionHash(${txRes.data.transactionHash})`);
        }
      } catch (e) {
        console.warn("BASECOIN APPROVING ERROR: ", e)
      }
      await this.waitOneBlock();
      try {
        const txCall = this.tokenERC20.approve(this.dex.routerAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          subWallet.publicKey,
          subWallet.privateKey,
          this.tokenERC20.address,
          txCall,
          0,
          gasPrice
        );
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for selling: transactionHash(${txRes.data.transactionHash})`);
        }
      } catch (e) {
        console.warn("TOEKN APPROVING ERROR: ", e)
      }
      await this.waitOneBlock();
    }
  }

  async withdraw() {
    let botDoc = await mongoDB.WasherBots.findById(this.bot._id);
    botDoc.isProcessing = true;
    botDoc.save();

    const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
    console.log("gas price ------->", gasPrice);
    for (let i = 0; i < this.bot.cntWallet; i++) {
      let subWallet = this.bot.subWallets[i] as IStoredCompanyWallet;

      // 1. sending base token for buying from subWallet to mainwallet
      const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
      if (new BigNumber(baseCoinBalance).isGreaterThan(0)) {
        try {
          console.log(`----------from(${subWallet.publicKey}), to(${this.wallet.publicKey}), Amount(${baseCoinBalance}), coin(${this.coinERC20.symbol}, ${this.coinERC20.decimals})`)
          const txCall = this.coinERC20.transfer(this.wallet.publicKey, new BigNumber(baseCoinBalance).shiftedBy(-this.coinERC20.decimals));
          const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
            subWallet.publicKey,
            subWallet.privateKey,
            this.coinERC20.address,
            txCall,
            0,
            gasPrice
          );
          console.log("----------step1: ", txRes);
          if (txRes.status === STATUS_SUCCESS) {
            this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
          }
        } catch (e) {
          console.warn("---------WITHDRAW STEP2: ", e);
        }
        await this.waitOneBlock();
      }

      // 0. withdraw main coin from subwallet to wallet
      const mainCoinBalance = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
      console.log("---------SUBWALLET ", i, ": ", subWallet.publicKey);
      if (mainCoinBalance.isGreaterThan(0)) {
        try {
          const tx = await this.blockchainClient.rpcWeb3.eth.accounts.signTransaction(
            {
              to: this.wallet.publicKey,
              value: mainCoinBalance.minus(new BigNumber(gasPrice).multipliedBy(21000)).toString(),
              gas: 21000,
              gasPrice: gasPrice
            },
            subWallet.privateKey
          );

          if (tx && tx?.rawTransaction) {
            const sendResult = await this.blockchainClient.rpcWeb3.eth.sendSignedTransaction(tx.rawTransaction);
            if (sendResult && sendResult?.status) {
              // save and emit status
              console.log(sendResult);
            }
          }
        } catch (e) {
          console.warn("---------WITHDRAW STEP1: ", e);
        }
        await this.waitOneBlock();
      }
    }

    // Delete subwallets in bot
    let subWallets = this.bot.subWallets as IStoredCompanyWallet[];
    for (let i = 0; i < subWallets.length; i++) {
      const walletDoc = await mongoDB.CompanyWallets.findById(subWallets[i]._id);
      walletDoc.cntInUse = 0;
      walletDoc.save();
    }

    botDoc = await mongoDB.WasherBots.findById(this.bot._id);
    botDoc.subWallets = [];
    botDoc.cntWallet = 0;
    botDoc.isReady = false;
    botDoc.isProcessing = false;
    botDoc.save();

    this.bot.isReady = false;
    this.bot.isProcessing = false;

    return true;
  }

  async waitOneBlock() {
    let _startBlockNumber = await this.blockchainClient.rpcWeb3.eth.getBlockNumber();
    let _currentBlockNumber = _startBlockNumber;
    while (_currentBlockNumber <= _startBlockNumber + 3) {
      _currentBlockNumber = await this.blockchainClient.rpcWeb3.eth.getBlockNumber();
      await waitFor(1000);
    }
  }
  // async sell(subWalletIndex: number) {
  //   let subWallet = this.bot.subWallets[subWalletIndex] as IStoredCompanyWallet;
  //   let mainCoinPrice = getCurrentPriceByChainAndSymbol(this.blockchain.name, this.blockchain.coinSymbol);
  //   let coinPrice = getCurrentPriceByChainAndSymbol(this.blockchain.name, this.coinERC20.symbol);
  //   const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
  //   const mainCoinBalance = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
  //   const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
  //   const tokenBalance = await this.tokenERC20.contract.methods.balanceOf(subWallet.publicKey).call();
  //   console.log("===============> tokenBalance: ", tokenBalance);
  //   try {
  //     const txCall = await this.swapDex.sellToken(
  //       this.tokenAddress,
  //       this.coinAddress,
  //       tokenBalance,
  //       subWallet.publicKey
  //     );
  //     const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
  //       subWallet.publicKey,
  //       subWallet.privateKey,
  //       this.dex.routerAddress,
  //       txCall,
  //       0,
  //       gasPrice
  //     );
  //     if (txRes.status === STATUS_SUCCESS) {
  //       this.logger.log(this.logPrefix, 'info', `selling: transactionHash(${txRes.data.transactionHash})`);        
  //       let baseCoinBalance1 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
  //       while (new BigNumber(baseCoinBalance1).isEqualTo(new BigNumber(baseCoinBalance))) {
  //         baseCoinBalance1 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
  //         await waitFor(1000);
  //       }
  //       const mainCoinBalance1 = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
  //       const fee = new BigNumber(mainCoinBalance).minus(mainCoinBalance1).shiftedBy(-18).multipliedBy(mainCoinPrice).toNumber();
  //       await this.saveResult(txRes.data.transactionHash, (new BigNumber(baseCoinBalance1).minus(baseCoinBalance)).shiftedBy(-this.coinERC20.decimals).multipliedBy(coinPrice).toNumber(), fee);
  //     }
  //   } catch (e) {
  //     console.log("failed: auto selling token");
  //   }
  //   await this.waitOneBlock();
  // }
  // async buy(subWalletIndex: number) {
  //   let subWallet = this.bot.subWallets[subWalletIndex] as IStoredCompanyWallet;
  //   let mainCoinPrice = getCurrentPriceByChainAndSymbol(this.blockchain.name, this.blockchain.coinSymbol);
  //   let coinPrice = getCurrentPriceByChainAndSymbol(this.blockchain.name, this.coinERC20.symbol);
  //   const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
  //   const mainCoinBalance = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
  //   try {
  //     const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
  //     console.log("baseCoinBalance:----------------------->", baseCoinBalance);
  //     const inAmount = new BigNumber(baseCoinBalance).multipliedBy(1 - Math.random() / 10).toFixed(0);
  //     console.log(`BUYING : inAmount(${inAmount}), wallet(${subWallet.publicKey}, ${subWallet.privateKey}), dex(${this.dex.routerAddress}), gasPrice(${gasPrice})`);

  //     const txCall = await this.swapDex.buyToken(this.coinAddress, this.tokenAddress, inAmount, subWallet.publicKey);
  //     const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
  //       subWallet.publicKey,
  //       subWallet.privateKey,
  //       this.dex.routerAddress,
  //       txCall,
  //       0,
  //       gasPrice
  //     );
  //     if (txRes.status === STATUS_SUCCESS) {
  //       this.logger.log(this.logPrefix, 'info', `buying: transactionHash(${txRes.data.transactionHash})`);
  //       let baseCoinBalance1 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
  //       while (new BigNumber(baseCoinBalance1).isEqualTo(new BigNumber(baseCoinBalance))) {
  //         baseCoinBalance1 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
  //         await waitFor(1000);
  //       }
  //       const mainCoinBalance1 = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
  //       const fee = new BigNumber(mainCoinBalance).minus(mainCoinBalance1).shiftedBy(-18).multipliedBy(mainCoinPrice).toNumber();
  //       await this.saveResult(txRes.data.transactionHash, new BigNumber(inAmount).shiftedBy(-this.coinERC20.decimals).multipliedBy(coinPrice).toNumber(), fee);
  //     }
  //   } catch (e) {
  //     console.warn("BUYING ERROR: ", e)
  //   }
  //   await this.waitOneBlock();

  // }

  async trading(subWalletIndex: number, tradingAmount: number) {
    console.log("tradingAmount: -------------->", tradingAmount);
    let subWallet = this.bot.subWallets[subWalletIndex] as IStoredCompanyWallet;
    let mainCoinPrice = getCurrentPriceByChainAndSymbol(this.blockchain.name, this.blockchain.coinSymbol);
    let coinPrice = getCurrentPriceByChainAndSymbol(this.blockchain.name, this.coinERC20.symbol);
    const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
    const mainCoinBalance = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
    const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
    let buyTxHash;
    let sellTxHash;
    try {
      if (tradingAmount > coinPrice * baseCoinBalance) {
        /////////////// BOT FAILED : REASON - BASECOIN_LIMIT_ERROR....
        await this.setBotStatus({
          status: EWasherBotStatus.FAILED,
          result: EWasherBotActionResult.MIN_BASECOIN_LIMIT,
        });
        if (this.intervalID) { clearInterval(this.intervalID); }
        if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
        this.processed = true;
        return;
      } else {
        const inAmount = new BigNumber(tradingAmount).dividedBy(coinPrice).shiftedBy(this.coinERC20.decimals).toFixed(0);
        console.log(`BUYING : inAmount(${inAmount}), wallet(${subWallet.publicKey}, ${subWallet.privateKey}), dex(${this.dex.routerAddress}), gasPrice(${gasPrice})`);
        const txCall = await this.swapDex.buyToken(this.coinAddress, this.tokenAddress, inAmount, subWallet.publicKey, this.bot.slippageLimit);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          subWallet.publicKey,
          subWallet.privateKey,
          this.dex.routerAddress,
          txCall,
          0,
          gasPrice
        );
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `buying: transactionHash(${txRes.data.transactionHash})`);
          buyTxHash = txRes.data.transactionHash;
          let baseCoinBalance1 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
          while (new BigNumber(baseCoinBalance1).isEqualTo(new BigNumber(baseCoinBalance))) {
            baseCoinBalance1 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
            await waitFor(1000);
          }
          const mainCoinBalance1 = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
          const fee = new BigNumber(mainCoinBalance).minus(mainCoinBalance1).shiftedBy(-18).multipliedBy(mainCoinPrice).toNumber();
          // await this.saveResult(txRes.data.transactionHash, new BigNumber(inAmount).shiftedBy(-this.coinERC20.decimals).multipliedBy(coinPrice).toNumber(), fee);
        } else {
          console.log("Washerbot buy transaction Failed: ", txRes);
          /////////////// BOT FAILED : REASON - TRANSACTION_FAILED....
          await this.setBotStatus({
            status: EWasherBotStatus.FAILED,
            result: EWasherBotActionResult.TRANSACTION_FAILED,
          });
          if (this.intervalID) { clearInterval(this.intervalID); }
          if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
          this.processed = true;
          return;
        }
      }
    } catch (e) {
      // ******** bot stop : reason unknown
      /////////////// BOT FAILED : REASON - UNKNOWN....
      await this.setBotStatus({
        status: EWasherBotStatus.FAILED,
        result: EWasherBotActionResult.UNKNOWN,
      });
      if (this.intervalID) { clearInterval(this.intervalID); }
      if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
      this.processed = true;
      return;
    }
    await this.waitOneBlock();

    // selling -------------
    // const mainCoinBalance2 = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
    const tokenBalance = await this.tokenERC20.contract.methods.balanceOf(subWallet.publicKey).call();
    const baseCoinBalance1 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
    try {
      const txCall = await this.swapDex.sellToken(
        this.tokenAddress,
        this.coinAddress,
        tokenBalance,
        subWallet.publicKey
      );
      const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
        subWallet.publicKey,
        subWallet.privateKey,
        this.dex.routerAddress,
        txCall,
        0,
        gasPrice
      );
      if (txRes.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `selling: transactionHash(${txRes.data.transactionHash})`);
        sellTxHash = txRes.data.transactionHash;
        let baseCoinBalance2 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
        while (new BigNumber(baseCoinBalance2).isEqualTo(new BigNumber(baseCoinBalance1))) {
          baseCoinBalance2 = await this.coinERC20.contract.methods.balanceOf(subWallet.publicKey).call();
          await waitFor(1000);
        }
        const mainCoinBalance2 = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(subWallet.publicKey));
        const fee = new BigNumber(mainCoinBalance).minus(mainCoinBalance2).shiftedBy(-18).multipliedBy(mainCoinPrice).toNumber();
        await this.saveResult(
          buyTxHash, sellTxHash,
          (new BigNumber(baseCoinBalance).minus(baseCoinBalance1).plus(baseCoinBalance2).minus(baseCoinBalance1))
            .shiftedBy(-this.coinERC20.decimals).multipliedBy(coinPrice).toNumber(),
          (new BigNumber(baseCoinBalance).minus(baseCoinBalance2))
            .shiftedBy(-this.coinERC20.decimals).multipliedBy(coinPrice).toNumber(),
          fee
        );
      } else {
        /////////////// BOT FAILED : REASON - TRANSACTION_FAILED....
        await this.setBotStatus({
          status: EWasherBotStatus.FAILED,
          result: EWasherBotActionResult.TRANSACTION_FAILED,
        });
        if (this.intervalID) { clearInterval(this.intervalID); }
        if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
        this.processed = true;
      }
    } catch (e) {
      console.log(e);
      /////////////// BOT FAILED : REASON - UNKNOWN....
      await this.setBotStatus({
        status: EWasherBotStatus.FAILED,
        result: EWasherBotActionResult.UNKNOWN,
      });
      if (this.intervalID) { clearInterval(this.intervalID); }
      if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
      this.processed = true;
    }
    await this.waitOneBlock();
  }
  async saveResult(buyTxHash: string, sellTxHash: string, amount: number, loss: number, fee: number) {
    const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
      { 'sequenceName': 'WasherTransaction', sequenceId: this.bot._id },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    const today = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });
    const dateStr = today.split(",")[0];
    const dateArr = dateStr.split("/");
    await mongoDB.WasherTransactions.create({
      washer: this.bot._id,
      token: this.token._id,
      exchangeType: EExchangeType.DEX,
      txBuyHash: buyTxHash,
      tySellHash: sellTxHash,
      tokenAmount: 0,
      fee: fee,
      loss: loss,
      volume: amount,
      uniqueNum: sequenceDocument.sequenceValue,
      targetVolume: this.bot.targetVolume,
      date: dateStr,
      timeStamp: new Date(`${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`).getTime()
    });
  }
  async process() {
    console.log("Processing... Washer bot !!!", this.lockedProcess);
    let currentTimeStamp = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).getTime();
    let startTimeStamp = new Date(this.bot.start).getTime();
    let endTimeStamp = new Date(this.bot.end).getTime();
    if (this.lockedProcess) { return; }
    this.lockedProcess = true;

    // step 1. sending coins
    if (this.bot.isReady === false) {
      this.bot.isProcessing = true;
      let botDoc = await mongoDB.WasherBots.findById(this.bot._id);
      botDoc.isProcessing = true;
      botDoc.save();

      await this.deposit();
      await this.approve();

      botDoc = await mongoDB.WasherBots.findById(this.bot._id);
      botDoc.isProcessing = false;
      botDoc.isReady = true;
      botDoc.save();
      this.bot.isReady = true;
      this.bot.isProcessing = false;
    } else {
      console.log("------------------------>", currentTimeStamp, new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })), new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
      // console.log("------------------------>", startTimeStamp, new Date(this.bot.start), this.bot.start)
      // console.log("------------------------>", endTimeStamp, new Date(this.bot.end), this.bot.end)
      if ((startTimeStamp < currentTimeStamp) && (currentTimeStamp < endTimeStamp)) {
        this.periodCnt++;
        let coinPrice = getCurrentPriceByChainAndSymbol(this.blockchain.name, this.coinERC20.symbol);
        if (coinPrice > 0 && this.bot.targetVolume > 0) {
          let date = new Date().toUTCString();
          console.log("DEX: ", date);
          let dateString = date.split(" ")[4].split(":");
          let h = Number(dateString[0]);
          let m = Number(dateString[1]);
          if (m % 5 === 2) {
            if (this.isDone === false) {
              this.isDone = true;
              try {
                // 1. get currenct coinmarketcap volume.
                const res = await axios.get(
                  `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/latest?id=${this.bot.coinmarketcapId}`,
                  {
                    headers: { 'X-CMC_PRO_API_KEY': 'f11d72ac-59ba-4c67-9220-95fababf3e68' }
                  }
                );
                if (res.data.status.error_code === 0) {
                  const quote = res.data.data[this.bot.coinmarketcapId]["quote"];
                  await this.saveCurrentCoinMarketCapVolume(
                    quote["USD"]["open"],
                    quote["USD"]["high"],
                    quote["USD"]["low"],
                    quote["USD"]["close"],
                    quote["USD"]["volume"],
                    quote["USD"]["last_updated"]
                  );
                  const openPrice = quote["USD"]["open"];
                  const currentVolume = quote["USD"]["volume"];
                  const lackVolume = this.bot.targetVolume - currentVolume;
                  console.log(`---->last_updated(${quote["USD"].last_updated}), targetVolume(${this.bot.targetVolume}), currentVolume(${currentVolume}): lackVolume(${lackVolume})`);
                  if (lackVolume > 0) {
                    let tradingAmount = this.bot.minTradingAmount;
                    if (lackVolume > this.bot.minTradingAmount * 120) {
                      tradingAmount = Math.ceil(lackVolume / 120);
                    }
                    if (tradingAmount > 0) {
                      console.log("trading amount ------->$", tradingAmount);
                      this.selectedSubWalletIndex = (this.selectedSubWalletIndex + 1) % this.bot.cntWallet;
                      await this.trading(this.selectedSubWalletIndex, tradingAmount);
                    }
                  }
                } else {
                  ////////////// BOT FAILED : REASON - COINMARKETCAP API ERROR...
                  await this.setBotStatus({
                    status: EWasherBotStatus.FAILED,
                    result: EWasherBotActionResult.API_ERROR,
                    message: "COINMARKETCAP API ERROR: " + res.data.status.error_message.toString()
                  });
                  if (this.intervalID) { clearInterval(this.intervalID); }
                  if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
                  this.processed = true;
                }
              } catch (err) {
                this.errCounter++;
                console.log(`UNKNOWN ERROR COUNTER(${this.errCounter})`, err);
                if (this.errCounter > 5) {
                  /////////////// BOT FAILED : REASON - UNKNOWN ERROR....
                  await this.setBotStatus({
                    status: EWasherBotStatus.FAILED,
                    result: EWasherBotActionResult.UNKNOWN,
                    message: err.toString()
                  });
                  if (this.intervalID) { clearInterval(this.intervalID); }
                  if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
                  this.processed = true;
                }
              }
            }
          } else {
            this.isDone = false;
          }
        }
      } else {
        if (endTimeStamp < currentTimeStamp) {
          this.processed = true;
          if (this.intervalID) { clearInterval(this.intervalID); }
          if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
          await this.setBotStatus({
            status: EWasherBotStatus.SUCCESS,
            result: EWasherBotActionResult.DRAFT
          });
        }
      }
    }
    this.lockedProcess = false;
  }
}

          // console.log("coinPrice===============>", coinPrice);
          // if (this.periodCnt > (86400 * coinPrice * this.bot.depositBaseCoin * 1.8 / this.bot.targetVolume)) {
          //   this.periodCnt = 0;
          //   this.selectedSubWalletIndex = (this.selectedSubWalletIndex + 1) % this.bot.cntWallet;
          //   await this.buy(this.selectedSubWalletIndex);
          //   await this.sell(this.selectedSubWalletIndex);
          // }
