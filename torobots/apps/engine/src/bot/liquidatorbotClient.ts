import { EventEmitter } from "events";
import config from "../config";
import { getMaxGasPriceByBlockchainName, getCurrentPriceByChainAndSymbol } from "../scan";
import {
  BlockchainClient, ERC20Token, UniswapDex,
  IStoredUser, IStoredLiquidatorBot, IStoredBlockchain, IStoredNode, IStoredDex, IStoredWallet, IStoredCoin, IStoredToken, 
  ERunningStatus, STATUS_SUCCESS, Logger, waitFor,
  Response, mongoDB, IAutoBotState, ELiquidatorBotStatus,
} from "@torobot/shared";
import BigNumber from "bignumber.js";
import routerABI from "./uniswapV2Router";
import pairABI from "./uniswapV2Pair";
import factoryABI from "../scan/factory";
import * as web3Utils from "web3-utils";

export class LiquidatorBotClient extends EventEmitter {
  tryCount: number = 0;
  processed: boolean = false;
  currentBlockNumber: number = 0;

  lockedProcess: boolean = false;

  state: IAutoBotState = {
    active: false,
    status: ERunningStatus.DRAFT,
    thread: 'NONE'
  }
  logger: Logger;
  user: IStoredUser;
  bot: IStoredLiquidatorBot;
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
  get logPrefix() { return `liquidatorbotClient`; }

  constructor(bot: IStoredLiquidatorBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/liquidatorbot/${bot._id}.txt`);
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

  async setBotStatus(st: ELiquidatorBotStatus) {
    let botDoc = await mongoDB.LiquidatorBots.findById(this.bot._id);
    botDoc.state = st;
    if (st === ELiquidatorBotStatus.STOPPED || st === ELiquidatorBotStatus.SUCCESS) {
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
      {'sequenceName': 'Liquidator', sequenceId: this.bot._id},
      { $inc: {sequenceValue: 1} },
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
    await this.setBotStatus(ELiquidatorBotStatus.RUNNING);
    this.intervalID = setInterval(() => this.process(), 1000);
  }

  async stop() {
    this.processed = true;
    await this.setBotStatus(ELiquidatorBotStatus.STOPPED);
    if (this.intervalID) { clearInterval(this.intervalID); }
  }

  async process() {
    console.log("Processing... Liquidator bot !!!", this.lockedProcess);
    if (this.lockedProcess) { return;}
    this.lockedProcess = true;
    let _currentBlockNumber = await this.blockchainClient.rpcWeb3.eth.getBlockNumber();
    console.log("oldBlockNumber, currentBlockNumber: --------------->", this.currentBlockNumber, _currentBlockNumber);
    if (this.currentBlockNumber === 0) {
      this.currentBlockNumber = _currentBlockNumber;
      this.lockedProcess = false;
      return;
    }

    //1. check the current price
    const reserveCoin = new BigNumber(await this.coinERC20.contract.methods.balanceOf(this.pairAddress).call()).shiftedBy(-this.coinERC20.decimals);
    const reserveToken = new BigNumber(await this.tokenERC20.contract.methods.balanceOf(this.pairAddress).call()).shiftedBy(-this.tokenERC20.decimals);
    console.log("reserve--------->", reserveCoin, reserveToken);
    let sellTokenAmount = new BigNumber(0);
    if (reserveCoin.isGreaterThan(0) && reserveToken.isGreaterThan(0)) {
      const curPrice = reserveCoin.dividedBy(reserveToken);
      // if (curPrice.isGreaterThan(new BigNumber(this.bot.upperPrice))) {
      //   sellTokenAmount = (reserveCoin.multipliedBy(reserveToken).dividedBy(new BigNumber(this.bot.upperPrice))).squareRoot().minus(reserveToken);
      // } else if (curPrice.isGreaterThan(new BigNumber(this.bot.lowerPrice))) {
      //   if (_currentBlockNumber > this.currentBlockNumber) {
      //     const _events = await this.pairContract.getPastEvents('Swap', { fromBlock: this.currentBlockNumber + 1, toBlock: _currentBlockNumber });
      //     for (const _event of _events) {
      //       let tokenAmount = new BigNumber(0);
      //       if (Number(this.coinAddress) < Number(this.tokenAddress)) {
      //         if (_event.returnValues.amount1In === '0') {
      //           tokenAmount = new BigNumber(_event.returnValues.amount1Out).shiftedBy(-this.tokenERC20.decimals);
      //         }
      //       } else {
      //         if (_event.returnValues.amount0In === '0') {
      //           tokenAmount = new BigNumber(_event.returnValues.amount0Out).shiftedBy(-this.tokenERC20.decimals);
      //         }
      //       }
      //       if (tokenAmount.isGreaterThanOrEqualTo(new BigNumber(this.bot.presetAmount))) {
      //         if (curPrice.isGreaterThan(this.bot.averagePrice)) {
      //           sellTokenAmount = tokenAmount.multipliedBy(new BigNumber(this.bot.bigSellPercentage)).shiftedBy(-2);
      //         } else {
      //           sellTokenAmount = tokenAmount.multipliedBy(new BigNumber(this.bot.smallSellPercentage)).shiftedBy(-2);
      //         }
      //         break;
      //       }
      //     }
      //   }
      // }
    }
    if (sellTokenAmount.isGreaterThanOrEqualTo(new BigNumber(this.bot.presetAmount).multipliedBy(new BigNumber(this.bot.smallSellPercentage)).shiftedBy(-2))) {
      const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
      let sellAmount: string = sellTokenAmount.shiftedBy(this.tokenERC20.decimals).toFixed(0);
      let tryCount = 0;
      // 1. token approving
      while (tryCount < 5) {
        try {
          const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(sellAmount).shiftedBy(-this.tokenERC20.decimals));
          const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
            this.wallet.publicKey,
            this.wallet.privateKey,
            this.tokenERC20.address,
            txCall,
            0,
            gasPrice
          );
          if (txRes.status === STATUS_SUCCESS) {
            this.logger.log(this.logPrefix, 'info', `token approving-for auto selling: transactionHash(${txRes.data.transactionHash})`);
            tryCount = 0;
            break;
          }
        } catch (e) {
          console.log("failed: token approving", tryCount)
        }
        await waitFor(3000);
        tryCount++;
      }
      if (tryCount > 0) {
        // failed
        this.lockedProcess = false;
        console.log("failed -> token approving !!!!!!");
        this.currentBlockNumber = _currentBlockNumber;
        return;
      }
      await waitFor(6000);
      // 2. selling token
      while (tryCount < 5) {
        try {
          const txCall = await this.swapDex.sellToken(
            this.tokenAddress, 
            this.coinAddress, 
            sellAmount,
            this.wallet.publicKey
          );
          const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
            this.wallet.publicKey,
            this.wallet.privateKey,
            this.dex.routerAddress,
            txCall,
            0,
            gasPrice
          );
          if (txRes.status === STATUS_SUCCESS) {
            this.logger.log(this.logPrefix, 'info', `pre selling: transactionHash(${txRes.data.transactionHash})`);
            await this.saveSoldResult(txRes.data.transactionHash, gasPrice, new BigNumber(sellAmount).shiftedBy(-this.tokenERC20.decimals).toNumber());
            tryCount = 0;
            break;
          }
        } catch (e) {
          console.log("failed: auto selling token");
        }
        tryCount++;
      }
      if (tryCount > 0) {
        console.log("failed: auto selling token !!!!!!!!")
      } else {
        console.log("success: auto selling token !!!!!!!")
      }
    }
    this.currentBlockNumber = _currentBlockNumber;
    this.lockedProcess = false;
  }
}
