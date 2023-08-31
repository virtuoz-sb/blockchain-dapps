import * as web3Utils from "web3-utils";
import { EventEmitter } from "events";
import { IBot, ETradingThread, STATUS_SUCCESS, STATUS_ERROR, waitFor, shiftedBigNumber, Response } from "@torobot/shared";
import { BotThread } from "./botThread";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";
const TIMELIMIT = 60000; // 1[min]
export class SellTimer extends BotThread {
  txCounter: number;
  resCounter: number;
  stepStartTime: number;
  get logPrefix() {
    return `sellTimer`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
    this.init();
  }

  async init() {
    super.init();
  }

  async start() {
    this.txCounter = 0;
    this.resCounter = 0;
    this.stepStartTime = new Date(this.bot.buy.startTime+"-0800").getTime();
    for (let i = 0; i <= this.bot.sell.step; i++) {
      this.stepStartTime = this.stepStartTime + this.bot.sell.items[i].deltaTime * 1000;
    }
    this.logger.log(this.logPrefix, 'info', "==================     TIMER SELLING     ===============");
    if (this.bot.sell.step === 0) {
      // get token balance and update db
      await this.tokenERC20.updateBalance();
      this.bot.sell.amount = this.tokenERC20.userBalance.toString();
      this.onUpdated(this.type);
      if (this.tokenERC20.userBalance.isZero()) {
        this.onFinished(this.type);
        this.stop();
        return;
      }  
    }
    super.start();
    this.process();
  }

  async stop() {
    super.stop();
    this.txCounter = 0;
    this.resCounter = 0;
  }

  async process() {
    const address = this.wallet.publicKey;
    const gasPrice = web3Utils.toWei(String(this.bot.sell.gasPrice), 'Gwei');
    const coinAddress = this.coinAddress;
    const tokenAddress = this.tokenAddress;
    while (true) {
      if (this.processed) {
        // if (this.txCounter === this.resCounter) {
          this.stop();
          this.onFinished(this.type);
          await waitFor(100);
          return;
        // }
        continue;
      }
  
      if (new Date().getTime() < this.stepStartTime) {
        await waitFor(100);
        continue;
      }
      if (this.txCounter === 0) {
        this.logger.log(this.logPrefix, 'info', `process-init: try(${this.txCounter}), token(${tokenAddress}), amount(${this.bot.sell.items[this.bot.sell.step].amount}), gasPrice(${this.bot.sell.gasPrice}), step(${this.bot.sell.step})`);
      } else {
        this.logger.log(this.logPrefix, 'info', `processing: tx(${this.txCounter}), res(${this.resCounter})`);
      }
      if (this.bot.sell.step < this.bot.sell.count - 1) {
        if (new Date().getTime() >= this.stepStartTime + Math.min(this.bot.sell.items[this.bot.sell.step + 1].deltaTime * 1000, TIMELIMIT)) {
          this.bot.sell.step++;
          this.stepStartTime = this.stepStartTime + this.bot.sell.items[this.bot.sell.step].deltaTime;
          this.onUpdated(this.type, STATUS_ERROR);
        }
      } else {
        if (new Date().getTime() >= this.stepStartTime + TIMELIMIT) {
          this.onUpdated(this.type, STATUS_ERROR);
          this.processed = true;
        }
      }
      const inAmount = shiftedBigNumber(new BigNumber(this.bot.sell.amount).multipliedBy(this.bot.sell.items[this.bot.sell.step].amount).toString(), this.tokenERC20.decimals - 2, "positive").toFixed(2).split('.')[0]

      this.txCounter++;
      try {
        const txCall = await this.swapDex.sellToken(
          tokenAddress, coinAddress, inAmount, address
        );

        const txRes: Response = await this.blockchainClient.sendSignedTransaction(
          this.dex.routerAddress, txCall, 0, gasPrice);

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `process-res: transactionHash(${txRes.data.transactionHash})`);
          const qRes = await this.blockchainClient.getTransactionReceipt(txRes.data.transactionHash);
          let amountOut = new BigNumber(0);
          if (qRes.logs) {
            for (const log of qRes.logs) {
              if (log.topics) {
                if (log.topics.length === 3) {
                  if (log.topics[0] === "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822" &&
                    this.dex.routerAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1
                    && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                      const amount0Out = new BigNumber(log.data.substr(-128, 64), 16);
                      const amount1Out = new BigNumber(log.data.substr(-64), 16);
                      amountOut = amount0Out.plus(amount1Out).shiftedBy(-this.coinERC20.decimals);
                      console.log("------------------->", amountOut.toString());
                    break;
                  }
                }
              }
            }
          }

          this.onTransaction(this.type, STATUS_SUCCESS, this.txCounter, txRes.data.transactionHash, qRes.gasUsed * this.bot.buy.gasPrice / 1000000000,
            amountOut.toNumber(), Number(this.bot.sell.amount) * this.bot.sell.items[this.bot.sell.step].amount / 100);
          this.bot.sell.step++;
          this.onUpdated(this.type, STATUS_SUCCESS);
          if (this.bot.sell.step >= this.bot.sell.count) {
            this.processed = true;
          }
        }
      } catch (e) {
        this.logger.log(this.logPrefix, 'info', `process-err: error(${e.message})`);
      }
      this.resCounter++;

      this.logger.log(this.logPrefix, 'info', `process`);
    }
  }
}
