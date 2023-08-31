import * as web3Utils from "web3-utils";
import { EventEmitter } from "events";
import { 
  IBot, EBotBuyType, ETradingThread, StatusResult, 
  STATUS_SUCCESS, STATUS_PROCESSING, STATUS_ERROR, 
  shiftedBigNumber, Response, waitFor 
} from "@torobot/shared";
import { BotThread } from "./botThread";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";
export class StopLoss extends BotThread {
  txRealCounter: number;
  pairContractAddress: string = "";
  private intervalID = null;
  count: number = 0;
  isDetected: boolean = false;
  get logPrefix() {
    return `stopLoss`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
    this.init();
  }

  async init() {
    super.init();
  }

  start() {
    this.txRealCounter = 0;
    this.pairContractAddress === "";
    this.isDetected = false;
    this.logger.log(this.logPrefix, 'info', "==================     STOP LOSS     ===============");
    super.start();
    this.intervalID = setInterval(() => this.process(), 1000);
  }

  stop() {
    clearInterval(this.intervalID);
    this.intervalID = null;
    super.stop();
  }
  async trySell() {
    console.log(`stoploss thread trySell ---------> start...type(${this.type})`);
    if (this.processed) {
      this.onFinished(this.type, STATUS_SUCCESS);
      this.stop();
      return;
    }
    // get token balance and update db
    await this.tokenERC20.updateBalance();
    this.bot.sell.amount = this.tokenERC20.userBalance.toString();
    this.onUpdated(this.type, STATUS_PROCESSING);
    if (this.tokenERC20.userBalance.isZero()) {
      this.onFinished(this.type, STATUS_SUCCESS);
      this.stop();
      return;
    }
    console.log(`stoploss thread trySell ---------> current TokenAmount(${this.bot.sell.amount}) in Wallet`);
    // when approved, start selling
    const address = this.wallet.publicKey;
    // need to change by decimals
    const gasPrice = web3Utils.toWei(String(this.bot.sell.gasPrice), 'Gwei');
    const coinAddress = this.coinAddress;
    const sellToken = this.tokenAddress;
    const inAmount = shiftedBigNumber(this.bot.sell.amount, this.tokenERC20.decimals, "positive").toString();
    const isApproved = await this.approve(ETradingThread.APPROVING_SELL, shiftedBigNumber(inAmount, this.tokenERC20.decimals));
    this.onUpdated(this.type, STATUS_PROCESSING);
    if (isApproved === false) {
      this.onFinished(this.type, STATUS_ERROR);
      this.stop();
    } else {
      while (this.txRealCounter < 100 && this.processed === false) {
        try {
          const txCall = await this.swapDex.sellToken(sellToken, coinAddress, inAmount, address);
          const txRes: Response = await this.blockchainClient.sendSignedTransaction(this.dex.routerAddress, txCall, 0, gasPrice);
          if (txRes.status === STATUS_SUCCESS) {
            this.logger.log(this.logPrefix, 'info', `process-res: transactionHash(${txRes.data.transactionHash})`);
            const qRes = await this.blockchainClient.getTransactionReceipt(txRes.data.transactionHash);
            let amountOut = new BigNumber(0);
            if (qRes.logs) {
              for (const log of qRes.logs) {
                if (log.topics) {
                  if (log.topics.length === 3) {
                    // Get pair contract address
                    const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
                    if (pairContractAddress) {
                      // Transfer
                      if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
                        pairContractAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1
                        && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                          amountOut = new BigNumber(log.data).shiftedBy(-this.coinERC20.decimals);
                        break;
                      }
                    }
                  }
                }
              }
            }
            this.txRealCounter++;
            this.updateStatistics(0,0,0,amountOut.toNumber(), Number(this.bot.sell.amount),qRes.gasUsed * this.bot.sell.gasPrice / 1000000000);
            this.onUpdated(this.type, STATUS_SUCCESS);
            this.onTransaction(this.type, STATUS_SUCCESS, this.txRealCounter, txRes.data.transactionHash, qRes.gasUsed * this.bot.sell.gasPrice / 1000000000, amountOut.toNumber(), Number(this.bot.sell.amount));
            this.processed = true;
          } else {
            if (txRes.data !== null) {
              const error: Error = txRes.data;
              if (error.message.indexOf('Transaction has been reverted by the EVM:') > -1) {
                const _gasUsed = Number(error.message.split('"gasUsed": ')[1].split(",")[0]);
                this.updateStatistics(0,0,0,0,0,_gasUsed * this.bot.sell.gasPrice / 1000000000);
                this.txRealCounter++;
              }
            }
          }
        } catch (e) {
          this.logger.log(this.logPrefix, 'info', `process-err: error(${e.message})`);
        }
        await waitFor(100);
      }
    }

    // while (1) {

    // }
    // if (this.pairContractAddress === "") {
    //   try {
    //     const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(
    //       this.coinAddress,
    //       this.tokenAddress
    //     ).call();
    //     if (pairContractAddress) {
    //       console.log(pairContractAddress);
    //       this.pairContractAddress = pairContractAddress;
    //       const pairContract = this.swapDex.getPairContract(this.pairContractAddress);
    //     }
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
  }
  async process() {
    if (!this.isDetected) {
      if (this.botClient.botThreads.length > 0) {
        if (this.botClient.botThreads[0].type === ETradingThread.APPROVING_BUY || 
          this.botClient.botThreads[0].type === ETradingThread.BUYING_INSTANT ||
          this.botClient.botThreads[0].type === ETradingThread.BUYING_SPAM ||
          this.botClient.botThreads[0].type === ETradingThread.BUYING_EVENT
          ) {
            return;
          }
      }
      // analysis statistics
      if (this.bot.statistics) {
        const stopLimit = this.bot.config.stopLimit;
        if (!stopLimit) {
          return;
        }
        let _coinAmount: number = this.bot.statistics.buy?.coinAmount || 0;
        let _tokenAmount: number = this.bot.statistics.buy?.tokenAmount || 0;
        console.log(`stoploss thread -------(1)------coinAmount(${_coinAmount}), tokenAmount(${_tokenAmount})`);
        if (_coinAmount === 0 && _tokenAmount === 0) { return; }
        // checking the pool
        try {
          const res = await this.swapDex.routerContract.methods.getAmountsOut(
            shiftedBigNumber(_tokenAmount, this.tokenERC20.decimals, "positive").toFixed(0), [this.tokenAddress, this.coinAddress]
          ).call();
          console.log("stoploss thread -------(2)------", res);
          console.log("  >>>>",this.bot.config.stopLimit, shiftedBigNumber(new BigNumber(_coinAmount).multipliedBy(this.bot.config.stopLimit).toString(), this.coinERC20.decimals - 2, "positive").toString());
          console.log("  >>>>", new BigNumber(res[1]).toString());
          if (shiftedBigNumber(new BigNumber(_coinAmount).multipliedBy(this.bot.config.stopLimit).toString(), this.coinERC20.decimals - 2, "positive").isGreaterThan(new BigNumber(res[1]))) {
            this.isDetected = true;
            this.emit("DetectedStopLoss")
            return;
          }
        } catch (e) {
          console.log("###>", e);
          return;
        }
      }
    }
  }
}
