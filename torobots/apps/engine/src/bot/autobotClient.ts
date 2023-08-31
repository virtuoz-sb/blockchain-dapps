import { EventEmitter } from "events";

import config from "../config";
import { getMaxGasPriceByBlockchainName } from "../scan";
import {
  BlockchainClient, ERC20Token, UniswapDex,
  IStoredUser, IStoredAutoBot, IStoredBlockchain, IStoredNode, IStoredDex, IStoredWallet, IStoredCoin, IStoredToken, ITransaction,
  ERunningStatus, ETradingThread, ETradingInitiator, EBotBuyType, EBotSellType, events,
  STATUS_READY, STATUS_SUCCESS, STATUS_ERROR,
  Logger, waitFor,
  Response, mongoDB, IAutoBotState, TransactionStatus
} from "@torobot/shared";
import BigNumber from "bignumber.js";
export class AutoBotClient extends EventEmitter {
  step = ETradingThread.AUTO_SENDING_COIN_TO_NEW_WALLET;
  tryCount: number = 0;
  lock: boolean = false;
  state: IAutoBotState = {
    active: false,
    status: ERunningStatus.DRAFT,
    thread: 'NONE'
  }
  processed: boolean = false;
  logger: Logger;
  user: IStoredUser;
  bot: IStoredAutoBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  dex: IStoredDex;
  wallet: IStoredWallet;
  coin: IStoredCoin;
  token: IStoredToken;

  coinAddress: string;
  tokenAddress: string;
  walletAddress: string;
  walletKey: string;

  blockchainClient: BlockchainClient;
  swapDex: UniswapDex;
  coinERC20: ERC20Token;
  tokenERC20: ERC20Token;

  transaction: ITransaction;

  private intervalID = null;

  get logPrefix() {
    return `autobotClient`;
  }

  constructor(bot: IStoredAutoBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/autobot/${bot._id}.txt`);

    this.bot = bot;
  }

  async init() {
    this.user = this.bot.owner as IStoredUser;
    this.blockchain = this.bot.blockchain as IStoredBlockchain;
    this.node = this.bot.node as IStoredNode;
    this.dex = this.bot.dex as IStoredDex;
    this.wallet = this.bot.mainWallet as IStoredWallet;
    this.coin = this.bot.coin as IStoredCoin;
    this.token = this.bot.token as IStoredToken;
    this.coinAddress = this.coin.address;
    this.tokenAddress = this.token.address;

    this.blockchainClient = new BlockchainClient(this.blockchain, this.node, this.wallet as IStoredWallet, this.logger);
    this.swapDex = new UniswapDex(this.blockchainClient, this.dex, this.logger);
    this.coinERC20 = new ERC20Token(this.blockchainClient, this.coinAddress, this.logger);
    this.tokenERC20 = new ERC20Token(this.blockchainClient, this.tokenAddress, this.logger);

    this.transaction = {
      user: this.user._id,
      wallet: this.wallet._id,
      blockchain: this.blockchain._id,
      node: this.node._id,
      dex: this.dex._id,
      bot: this.bot._id,
      coin: this.coin._id,
      token: this.token._id,
      initiator: ETradingInitiator.AUTO,
      thread: ETradingThread.NONE,
      result: STATUS_READY,
      tryCount: 0,
      txHash: "",
      gasFee: 0,
      coinAmount: 0,
      tokenAmount: 0,
      message: "",
    };

    await this.blockchainClient.init();
    await this.swapDex.init();
    await this.coinERC20.init();
    await this.tokenERC20.init();
    if (!this.bot.walletAddress && !this.bot.walletKey) {
      const newAccount = await this.blockchainClient.rpcWeb3.eth.accounts.create(new Date().toString());
      this.walletAddress = newAccount.address;
      this.walletKey = newAccount.privateKey;
      // save the new walletAddress and walletKey on Database.
      this.bot.walletAddress = this.walletAddress;
      this.bot.walletKey = this.walletKey;
      const botDoc = await mongoDB.AutoBots.findById(this.bot._id);
      botDoc.walletAddress = this.walletAddress;
      botDoc.walletKey = this.walletKey;
      botDoc.save();
    } else {
      this.walletAddress = this.bot.walletAddress;
      this.walletKey = this.bot.walletKey;
    }

    this.logger.log(this.logPrefix, 'info', 'init');
  }

  async setState(st: IAutoBotState, nextStep?: ETradingThread) {
    this.state = st;
    this.bot.state = st;

    // save bot state and statistics
    let botDoc = await mongoDB.AutoBots.findById(this.bot._id);
    if (nextStep) {
      botDoc.step = nextStep;
      this.step = nextStep;
    }
    botDoc.state = st;
    botDoc.statistics = this.bot.statistics;
    await botDoc.save();

    // removed websocket
    // this.sendBotState({
    //   type: ESocketType.AUTO_BOT_STATE,
    //   data: this.bot
    // });
  }

  start() {
    this.setState({
      active: true,
      status: ERunningStatus.RUNNING
    });
    this.processed = false;
    if (this.bot.step !== ETradingThread.AUTO_FINISHED) {
      this.step = this.bot.step;
    }
    this.tryCount = 0;
    this.lock = false;
    this.intervalID = setInterval(() => this.process(), 1000);
  }

  stop() {
    this.setState({
      active: false,
      status: ERunningStatus.FAILED
    });
    this.processed = true;
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }

  onTransaction(
    thread: ETradingThread,
    result: TransactionStatus,
    tryCount: number = 0,
    txHash: string = '',
    gasFee: number = 0,
    coinAmount: number = 0,
    tokenAmount: number = 0,
    message: string = ""
  ) {
    this.transaction.thread = thread;
    this.transaction.result = result;
    this.transaction.tryCount = tryCount;
    this.transaction.txHash = txHash;
    this.transaction.coinAmount = coinAmount;
    this.transaction.tokenAmount = tokenAmount;
    this.transaction.gasFee = gasFee;
    this.transaction.message = message;
    this.emit(events.transaction);
  }

  updateStatistics(buyCoinAmount: number, buyTokenAmount: number, buyFee: number, sellCoinAmount: number, sellTokenAmount: number, sellFee: number) {
    if (this.bot.statistics) {
      if (!this.bot.statistics.buy) {
        this.bot.statistics.buy = { coinAmount: 0, tokenAmount: 0, fee: 0 }
      }
      if (!this.bot.statistics.sell) {
        this.bot.statistics.sell = { coinAmount: 0, tokenAmount: 0, fee: 0 }
      }
    } else {
      this.bot.statistics = {
        buy: { coinAmount: 0, tokenAmount: 0, fee: 0 },
        sell: { coinAmount: 0, tokenAmount: 0, fee: 0 }
      }
    }
    this.bot.statistics.buy.coinAmount = this.bot.statistics.buy.coinAmount + buyCoinAmount;
    this.bot.statistics.buy.tokenAmount = this.bot.statistics.buy.tokenAmount + buyTokenAmount;
    this.bot.statistics.buy.fee = this.bot.statistics.buy.fee + buyFee;
    this.bot.statistics.sell.coinAmount = this.bot.statistics.sell.coinAmount + sellCoinAmount;
    this.bot.statistics.sell.tokenAmount = this.bot.statistics.sell.tokenAmount + sellTokenAmount;
    this.bot.statistics.sell.fee = this.bot.statistics.sell.fee + sellFee;
  }

  async getTxInfoByTxHash(transactionHash: string, isBuying: boolean = true) {
    const qRes = await this.blockchainClient.getTransactionReceipt(transactionHash);
    let amountOut = new BigNumber(0);
    let rank: number = 0;
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
                this.walletAddress.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1
              ) {
                if (isBuying) {
                  amountOut = new BigNumber(log.data).shiftedBy(-this.tokenERC20.decimals);
                } else {
                  amountOut = new BigNumber(log.data).shiftedBy(-this.coinERC20.decimals);
                }

                // Get Ranking
                if (isBuying) {
                  const pairContract = this.swapDex.getPairContract(pairContractAddress);
                  const _events = await pairContract.getPastEvents('Swap', { fromBlock: qRes.blockNumber - 5000, toBlock: qRes.blockNumber });
                  const buy_events = _events.filter(item => item.returnValues.amount1In === '0');
                  for (const buy_event of buy_events) {
                    rank++;
                    if (buy_event.returnValues.to.toLowerCase() === this.walletAddress.toLowerCase()) {
                      break;
                    }
                  }
                }
                break;
              }
            }
          }
        }
      }
    }

    return {
      amount: amountOut,
      rank: rank,
      gasFee: qRes.gasUsed
    }
  }

  async process() {
    if (!this.state.active) {
      return;
    }
    if (this.processed && this.intervalID) {
      clearInterval(this.intervalID);
      return;
    }

    if (this.lock) {
      return;
    }
    console.log(`lock(${this.lock}), tryCount(${this.tryCount}), step(${this.step})`);
    this.lock = true;
    this.tryCount++;
    const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
    if (this.step === ETradingThread.AUTO_SENDING_COIN_TO_NEW_WALLET) {
      // 0. sending main network coin from mainWallet to walletAddress
      try {
        const tx = await this.blockchainClient.rpcWeb3.eth.accounts.signTransaction(
          {
            to: this.walletAddress,
            value: new BigNumber(this.blockchain.amountForFee).shiftedBy(18).toString(),
            gas: 2000000,
            gasPrice: gasPrice
          },
          this.wallet.privateKey
        );
        if (tx && tx?.rawTransaction) {
          const sendResult = await this.blockchainClient.rpcWeb3.eth.sendSignedTransaction(tx.rawTransaction);
          if (sendResult && sendResult?.status) {
            // save and emit status
            this.setState({
              active: !this.processed,
              status: ERunningStatus.RUNNING,
              thread: ETradingThread.AUTO_SENDING_COIN_TO_NEW_WALLET
            }, ETradingThread.AUTO_SENDING_BASETOKEN_TO_NEW_WALLET);

            this.onTransaction(
              ETradingThread.AUTO_SENDING_COIN_TO_NEW_WALLET,
              STATUS_SUCCESS,
              0,
              sendResult.transactionHash
            );
            this.tryCount = 0;
          }
        }
      } catch (e) {
        console.warn("step0: ", e);
      }
    } else if (this.step === ETradingThread.AUTO_SENDING_BASETOKEN_TO_NEW_WALLET) {
      // 1. sending base token for buying from mainWallet to walletAddress
      try {
        console.log(`wallet(${this.walletAddress}), buyAmount(${this.bot.buyAmount}), coin(${this.coinERC20.symbol}, ${this.coinERC20.decimals})`)
        const txCall = this.coinERC20.transfer(this.walletAddress, new BigNumber(this.bot.buyAmount));
        const txRes: Response = await this.blockchainClient.sendSignedTransaction(this.coinERC20.address, txCall, 0, gasPrice);
        console.log("step1: ", txRes);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
          // emit this succeed status
          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_SENDING_BASETOKEN_TO_NEW_WALLET
          }, ETradingThread.AUTO_APPROVE_PRE_BUYING);
          this.onTransaction(
            ETradingThread.AUTO_SENDING_BASETOKEN_TO_NEW_WALLET,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash
          );
          this.tryCount = 0;
        }
      } catch (e) {
        console.warn("step1: ", e);
      }
    } else if (this.step === ETradingThread.AUTO_APPROVE_PRE_BUYING) {
      // 2. approving for pre buying
      try {
        const txCall = this.coinERC20.approve(this.dex.routerAddress, new BigNumber(this.bot.buyAmount / 10000));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.coinERC20.address,
          txCall,
          0,
          gasPrice
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for pre buying: transactionHash(${txRes.data.transactionHash})`);
          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_APPROVE_PRE_BUYING
          }, ETradingThread.AUTO_PRE_BUYING);

          this.onTransaction(
            ETradingThread.AUTO_APPROVE_PRE_BUYING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash
          );
          this.tryCount = 0;
        }
      } catch (e) {
        console.warn("step2: ", e)
      }
    } else if (this.step === ETradingThread.AUTO_PRE_BUYING) {
      // 3. pre buying
      try {
        const inAmount = new BigNumber(this.bot.buyAmount).shiftedBy(this.coinERC20.decimals - 4).toString();
        console.log(`step3 : inAmount(${inAmount}), wallet(${this.walletAddress}, ${this.walletKey}), dex(${this.dex.routerAddress}), gasPrice(${gasPrice})`);
        const txCall = await this.swapDex.buyToken(this.coinAddress, this.tokenAddress, inAmount, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.dex.routerAddress,
          txCall,
          0,
          gasPrice
        );
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `pre buying: transactionHash(${txRes.data.transactionHash})`);

          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_PRE_BUYING
          }, ETradingThread.AUTO_APPROVE_PRE_SELLING);

          this.onTransaction(
            ETradingThread.AUTO_PRE_BUYING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash
          );
          await waitFor(3000);
          this.tryCount = 0;
        }
      } catch (e) {
        console.warn("step3: ", e)
      }

    } else if (this.step === ETradingThread.AUTO_APPROVE_PRE_SELLING) {
      // 4. approving for pre selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 4: approve for pre sell: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(balance).shiftedBy(-this.tokenERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.tokenERC20.address,
          txCall,
          0,
          gasPrice
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for pre selling: transactionHash(${txRes.data.transactionHash})`);

          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_APPROVE_PRE_SELLING
          }, ETradingThread.AUTO_PRE_SELLING);

          this.onTransaction(
            ETradingThread.AUTO_APPROVE_PRE_SELLING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash
          );
          this.tryCount = 0;
        }
      } catch (e) {
        console.warn("step4: ", e)
      }

    } else if (this.step === ETradingThread.AUTO_PRE_SELLING) {
      // 5. pre selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 5: pre selling: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = await this.swapDex.sellToken(this.tokenAddress, this.coinAddress, balance, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.dex.routerAddress,
          txCall,
          0,
          gasPrice
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `pre selling: transactionHash(${txRes.data.transactionHash})`);

          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_PRE_SELLING
          }, ETradingThread.AUTO_APPROVE_BUYING);

          this.onTransaction(
            ETradingThread.AUTO_PRE_SELLING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash
          );
          this.tryCount = 0;
          await waitFor(1000);
        }
      } catch (e) {
        console.warn("step5: ", e)
      }
    } else if (this.step === ETradingThread.AUTO_APPROVE_BUYING) {
      // 6. approving for main buying
      try {
        const buyAmount = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
        const inAmount = new BigNumber(buyAmount).shiftedBy(-this.coinERC20.decimals).toString();
        const txCall = this.coinERC20.approve(this.dex.routerAddress, new BigNumber(inAmount));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.coinERC20.address,
          txCall,
          0,
          gasPrice
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for main buying: transactionHash(${txRes.data.transactionHash})`);
          this.tryCount = 0;

          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_APPROVE_BUYING
          }, ETradingThread.AUTO_BUYING);

          this.onTransaction(
            ETradingThread.AUTO_APPROVE_BUYING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash
          );
        }
      } catch (e) {
        console.warn("step6: ", e)
      }

    } else if (this.step === ETradingThread.AUTO_BUYING) {
      // 7. main buying
      try {
        const inAmount = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
        const txCall = await this.swapDex.buyToken(this.coinAddress, this.tokenAddress, inAmount, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.dex.routerAddress,
          txCall,
          0,
          gasPrice
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `main buying: transactionHash(${txRes.data.transactionHash})`);
          this.tryCount = 0;

          const txInfo = await this.getTxInfoByTxHash(txRes.data.transactionHash);
          this.updateStatistics(this.bot.buyAmount, txInfo.amount.toNumber(), txInfo.gasFee * Number(gasPrice) / 1000000000, 0, 0, 0);

          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_BUYING
          }, ETradingThread.AUTO_APPROVE_SELLING);

          this.onTransaction(
            ETradingThread.AUTO_BUYING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash,
            txInfo.gasFee * Number(gasPrice) / 1000000000,
            this.bot.buyAmount,
            txInfo.amount.toNumber(),
            txInfo.rank > 0 ? txInfo.rank.toString() : ''
          );
          await waitFor(3000);
        }
      } catch (e) {
        console.warn("step7: ", e)
      }

    } else if (this.step === ETradingThread.AUTO_APPROVE_SELLING) {
      // 8. approving for main selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 8: main selling approve: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(balance).shiftedBy(-this.tokenERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.tokenERC20.address,
          txCall,
          0,
          gasPrice
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for main selling: transactionHash(${txRes.data.transactionHash})`);
          this.tryCount = 0;

          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_APPROVE_SELLING
          }, ETradingThread.AUTO_SELLING);

          this.onTransaction(
            ETradingThread.AUTO_APPROVE_SELLING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash
          );
        }
      } catch (e) {
        console.warn("step4: ", e)
      }

    } else if (this.step === ETradingThread.AUTO_SELLING) {
      // 9. main selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 9: main selling: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = await this.swapDex.sellToken(this.tokenAddress, this.coinAddress, balance, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.dex.routerAddress,
          txCall,
          0,
          gasPrice
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `main selling: transactionHash(${txRes.data.transactionHash})`);
          this.tryCount = 0;

          const txInfo = await this.getTxInfoByTxHash(txRes.data.transactionHash, false);
          this.updateStatistics(
            0, 0, 0,
            txInfo.amount.toNumber(),
            new BigNumber(balance).shiftedBy(-this.tokenERC20.decimals).toNumber(),
            txInfo.gasFee * Number(gasPrice) / 1000000000
          );

          this.setState({
            active: !this.processed,
            status: ERunningStatus.RUNNING,
            thread: ETradingThread.AUTO_SELLING
          }, ETradingThread.AUTO_FINISHED);

          this.onTransaction(
            ETradingThread.AUTO_SELLING,
            STATUS_SUCCESS,
            0,
            txRes.data.transactionHash,
            txInfo.gasFee * Number(gasPrice) / 1000000000,
            txInfo.amount.toNumber(),
            new BigNumber(balance).shiftedBy(-this.tokenERC20.decimals).toNumber(),
            ''
          );
        }
      } catch (e) {
        console.warn("step5: ", e)
      }
    } else if (this.step === ETradingThread.AUTO_FINISHED) {
      // 10. finish !!!!
      console.log(`completed all the process !!!!!!!!!!!!`);
      this.setState({
        active: false,
        status: ERunningStatus.SUCCEEDED,
        thread: ETradingThread.AUTO_FINISHED
      });
      await this.withdraw();
      this.processed = true;
    }
    if (this.tryCount > 10) {
      this.processed = true;
      // status: Failed
      this.setState({
        active: false,
        status: ERunningStatus.FAILED,
        thread: this.step
      });

      this.onTransaction(
        this.step,
        STATUS_ERROR,
        this.tryCount
      );
    }
    this.lock = false;
  }

  async withdraw() {
    const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
    console.log("=============================================================>", gasPrice)
    // transfer from sub wallet to main wallet
    // get base coin balance
    const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
    console.log("baseCoinBalance=============================================================>", baseCoinBalance)
    let i = 0;
    while (i < 10 && baseCoinBalance > 0) {
      try {
        const txCall = this.coinERC20.transfer(this.wallet.publicKey, new BigNumber(baseCoinBalance).shiftedBy(-this.coinERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.coinERC20.address,
          txCall,
          0,
          gasPrice
        );
        console.log("withdraw step1: ", txRes);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
          await waitFor(3000);
          break;
        }
      } catch (e) {
        console.warn("step1: ", e);
      }
      i++;
    }
    if (i >= 10) {
      return false;
    }
    // get token balance
    const tokenBalance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
    console.log("tokenBalance=============================================================>", tokenBalance)
    i = 0;
    while (i < 10 && tokenBalance > 0) {
      try {
        const txCall = this.tokenERC20.transfer(this.wallet.publicKey, new BigNumber(tokenBalance).shiftedBy(-this.tokenERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.tokenERC20.address,
          txCall,
          0,
          gasPrice
        );
        console.log("-------------->withdraw step2: ", txRes);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
          await waitFor(3000);
          break;
        }
      } catch (e) {
        console.warn("step2: ", e);
      }
      i++;
    }
    // if (i >= 10) {
    //   return false;
    // }
    // get main coin balance
    await waitFor(2000);
    const mainCoinBalance = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(this.walletAddress));
    console.log("mainCoinBalance===================================>", mainCoinBalance.toString(), gasPrice, Number(gasPrice)*21000);
    i = 0;
    while (i < 10 && mainCoinBalance.isGreaterThan(0)) {
      try {
        const tx = await this.blockchainClient.rpcWeb3.eth.accounts.signTransaction(
          {
            to: this.wallet.publicKey,
            value: mainCoinBalance.minus(new BigNumber(gasPrice).multipliedBy(21000)).toNumber(),
            gas: 21000,
            gasPrice: gasPrice
          },
          this.walletKey
        );
        if (tx && tx?.rawTransaction) {
          const sendResult = await this.blockchainClient.rpcWeb3.eth.sendSignedTransaction(tx.rawTransaction);
          if (sendResult && sendResult?.status) {
            break;
          }
        }
      } catch (e) {
        console.warn("withdraw step2: ", e);
      }
      i++;
    }
    if (i >= 10) {
      return false;
    }

    await this.getSubWalletInfo();
    return true;
  }
  
  async getSubWalletInfo() {
    const mainCoinBalance = await this.blockchainClient.rpcWeb3.eth.getBalance(this.walletAddress);
    const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
    const tokenBalance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();

    const retVal = {
      mainCoinBalance: new BigNumber(mainCoinBalance).shiftedBy(-18).toNumber(),
      baseCoinBalance: new BigNumber(baseCoinBalance).shiftedBy(-this.coinERC20.decimals).toNumber(),
      tokenBalance: new BigNumber(tokenBalance).shiftedBy(-this.tokenERC20.decimals).toNumber(),
    };

    // removed websocket data
    // const wsData = {
    //   type: ESocketType.AUTO_BOT_SUB_WALLET_INFO,
    //   data: {
    //     botId: this.bot._id,
    //     walletInfo: retVal
    //   }
    // };
    return retVal;
  }
}
