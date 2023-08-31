import * as web3Utils from "web3-utils";
import { EventEmitter } from "events";
import { IBot, ETradingThread, EBotSellType, StatusResult, STATUS_SUCCESS, STATUS_ERROR, STATUS_PROCESSING, shiftedBigNumber, Response, waitFor } from "@torobot/shared";
import { BotThread } from "./botThread";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";

const TIMELIMIT = 600000; // 10[min]
const COUNTLIMIT = 100;

export class SellSpamming extends BotThread {
  processedCount: number;
  txRealCounter: number;
  txCounter: number;
  resCounter: number;
  startSell: number;
  isApproved: boolean = false;
  isApproving: boolean = false;
  private intervalID = null;
  get logPrefix() {
    return `sellSpamming`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
    this.init();
  }

  async init() {
    super.init();
  }

  async start() {
    this.txRealCounter = 0;
    this.txCounter = 0;
    this.resCounter = 0;

    this.logger.log(this.logPrefix, 'info', "==================     SPAM SELLING     ===============");

    // get token balance and update db
    await this.tokenERC20.updateBalance();
    this.bot.sell.amount = this.tokenERC20.userBalance.toString();
    console.log("sell amount (wallet): ", this.bot.sell.amount);
    this.onUpdated(this.type);
    if (this.tokenERC20.userBalance.isZero()) {
      this.onFinished(this.type);
      this.stop();
      return;
    }
    super.start();

    const intervalTime = (this.bot.sell.interval || 1) * 1000;
    this.startSell = new Date().getTime();
    if (this.bot.sell.items) {
      this.startSell = this.startSell + this.bot.sell.items[0].deltaTime * 1000; // [ms]
    }
    this.intervalID = setInterval(() => this.process(), intervalTime);
    this.isApproving = false;
    // this.process();
  }

  async stop() {
    clearInterval(this.intervalID);
    this.intervalID = null;
    super.stop();
    this.txCounter = 0;
    this.resCounter = 0;
    this.processedCount = 0;
  }

  async process() {
    if (this.processed) {
      this.processedCount++;
      if (this.processedCount >= 5) {
        this.onFinished(this.type);
        this.stop();
      }
      return;
    }

    if (this.bot.sell.type === EBotSellType.ONCE && this.txRealCounter >= 1) {
      this.processed = true;
      return;
    }

    if (this.type === ETradingThread.SELLING_SPAM) {
      // if current time is before than Sell time
      if (this.startSell > new Date().getTime()) {
        return;
      }

      // timeout
      if (this.startSell + TIMELIMIT < new Date().getTime()) {
        console.log(`${this.logPrefix}stopped:`)

        this.onUpdated(this.type, STATUS_ERROR);
        this.onTransaction(this.type, STATUS_ERROR, this.txRealCounter);
        this.processedCount = 1;
        this.processed = true;
        return;
      }
    }

    const address = this.wallet.publicKey;
    // need to change by decimals
    const gasPrice = web3Utils.toWei(String(this.bot.sell.gasPrice), 'Gwei');
    const coinAddress = this.coinAddress;
    const sellToken = this.tokenAddress;
    const inAmount = this.bot.config.savings ? shiftedBigNumber(new BigNumber(this.bot.sell.amount).multipliedBy(this.bot.sell.items[0].amount).multipliedBy(100 - this.bot.config.saveLimit).toString(), this.tokenERC20.decimals - 4, "positive").toFixed(2).split('.')[0]
      : shiftedBigNumber(new BigNumber(this.bot.sell.amount).multipliedBy(this.bot.sell.items[0].amount).toString(), this.tokenERC20.decimals - 2, "positive").toFixed(2).split('.')[0];
    if (this.isApproving && this.isApproved === false) {
      return;
    }
    if (this.txCounter === 0) {
      // approving
      if (this.isApproving) {
        return;
      }
      this.isApproving = true;
      this.isApproved = await this.approve(ETradingThread.APPROVING_SELL, shiftedBigNumber(inAmount, this.tokenERC20.decimals));
      this.logger.log(this.logPrefix, 'info', `process-init: try(${this.txCounter}), token(${sellToken}), amount(${inAmount}), gasPrice(${this.bot.sell.gasPrice})`);
      if (this.isApproved === false) {
        this.onFinished(this.type);
        this.stop();
      }
      this.onUpdated(this.type, STATUS_PROCESSING);
    } else {
      this.logger.log(this.logPrefix, 'info', `processing: tx(${this.txCounter}), res(${this.resCounter})`);
    }
    this.txCounter++;
    try {
      const txCall = await this.swapDex.sellToken(sellToken, coinAddress, inAmount, address);

      const txRes: Response = await this.blockchainClient.sendSignedTransaction(this.dex.routerAddress, txCall, 0, gasPrice);

      if (txRes.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `process-res: transactionHash(${txRes.data.transactionHash})`);
        await waitFor(1000);
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
                    console.log("------------------->", amountOut.toString());
                    break;
                  }
                  // Swap
                  // if (log.topics[0] === "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822" &&
                  //   this.dex.routerAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1
                  //   && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                  //     const amount0Out = new BigNumber(log.data.substr(-128, 64), 16);
                  //     const amount1Out = new BigNumber(log.data.substr(-64), 16);
                  //     amountOut = amount0Out.plus(amount1Out).shiftedBy(-this.coinERC20.decimals);
                  //     console.log("------------------->", amountOut.toString());
                  //   break;
                  // }
                }
              }
            }
          }
        }
        this.txRealCounter++;
        this.updateStatistics(
          0, 0, 0, amountOut.toNumber(),
          this.bot.config.savings ? Number(this.bot.sell.amount) * (100 - this.bot.config.saveLimit) * this.bot.sell.items[0].amount / 10000 : Number(this.bot.sell.amount) * this.bot.sell.items[0].amount / 100,
          qRes.gasUsed * this.bot.sell.gasPrice / 1000000000
        );
        this.onUpdated(this.type, STATUS_SUCCESS);
        this.onTransaction(this.type, STATUS_SUCCESS, this.txRealCounter, txRes.data.transactionHash, qRes.gasUsed * this.bot.sell.gasPrice / 1000000000,
          amountOut.toNumber(),
          this.bot.config.savings ? Number(this.bot.sell.amount) * (100 - this.bot.config.saveLimit) * this.bot.sell.items[0].amount / 10000 : Number(this.bot.sell.amount) * this.bot.sell.items[0].amount / 100
        );
        this.processedCount = 1;
        this.processed = true;
      } else {
        if (txRes.data !== null) {
          const error: Error = txRes.data;
          if (error.message.indexOf('Transaction has been reverted by the EVM:') > -1) {
            const _gasUsed = Number(error.message.split('"gasUsed": ')[1].split(",")[0]);
            this.updateStatistics(0, 0, 0, 0, 0, _gasUsed * this.bot.sell.gasPrice / 1000000000);
            this.txRealCounter++;
          }
        }
      }
    } catch (e) {
      this.logger.log(this.logPrefix, 'info', `process-err: error(${e.message})`);
    }
    this.resCounter++;

    this.logger.log(this.logPrefix, 'info', `process`);
  }
}
