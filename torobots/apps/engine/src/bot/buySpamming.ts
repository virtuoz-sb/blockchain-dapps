import * as web3Utils from "web3-utils";
import {
  EBotBuyType,
  ETradingThread,
  STATUS_SUCCESS,
  STATUS_ERROR,
  STATUS_PROCESSING,
  shiftedBigNumber,
  Response,
  waitFor
} from "@torobot/shared";
import { getMaxGasPriceByBlockchainName } from "../scan";

import { BotThread } from "./botThread";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";
export class BuySpamming extends BotThread {
  txCounter: number;
  processedCount: number;
  txRealCounter: number;
  resCounter: number;
  buypercent: number = 1;
  boughtpercent: number = 0;
  private intervalID = null;

  get logPrefix() {
    return `buySpamming`;
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
    this.processedCount = 0;
    this.buypercent = 1;
    this.boughtpercent = 0;
    this.txCounter = 0;
    this.resCounter = 0;
    this.logger.log(this.logPrefix, 'info', "==================     SPAM BUYING     ===============");
    super.start();
    if (this.bot.config?.buyAnyCost) {
      this.bot.buy.gasPrice = getMaxGasPriceByBlockchainName(this.blockchain.name)
    }
    if (this.bot.config?.autoBuyAmount) {
      // get pool size
      try {
        const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
        if (pairContractAddress) {
          const poolSize = await this.coinERC20.contract.methods.balanceOf(pairContractAddress);
          // if the buy amount > 10% of poolsize, set buy amount as 10% of poolsize.
          if (new BigNumber(poolSize).shiftedBy(-this.coinERC20.decimals-1).isLessThan(this.bot.buy.amount)) {
            this.bot.buy.amount = new BigNumber(poolSize).shiftedBy(-this.coinERC20.decimals-1).toNumber();
            // save buy amount as a new value on db also.
            // ????
          }
        }
      } catch (e) {
        console.log("error on check the pool size in buy spamming: ", e)
      }
    }
    // approving
    const isApproved = await this.approve(ETradingThread.APPROVING_BUY, new BigNumber(this.bot.buy.amount), this.bot.buy.gasPrice);
    if (isApproved === false) {
      this.onFinished(this.type);
      super.stop();
      return;
    }

    this.onUpdated(this.type, STATUS_PROCESSING);
    // start buying
    const intervalTime = 1000;
    this.intervalID = setInterval(() => this.process(), intervalTime);
  }

  stop() {
    clearInterval(this.intervalID);
    this.intervalID = null;

    super.stop();
    this.processedCount = 0;
    this.txRealCounter = 0;
    this.txCounter = 0;
    this.resCounter = 0;
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

    if (this.bot.buy.type === EBotBuyType.ONCE && this.txRealCounter >= 1) {
      this.processed = true;
      return;
    }

    if (this.bot.buy.startTime && this.type === ETradingThread.BUYING_SPAM) {
      // if current time is before than buy time
      if (new Date(this.bot.buy.startTime+"-0800").getTime() > new Date().getTime()) {
        this.logger.log(this.logPrefix, 'info', `ready: not in time`);
        // this.processed = true;
        return;
      }

      // if time is over than buy time
      if ((new Date(this.bot.buy.startTime+"-0800").getTime() + this.bot.buy.period * 1000) < new Date().getTime()) {
        this.logger.log(this.logPrefix, 'info', `stopped: over time`);

        this.onUpdated(this.type, STATUS_ERROR);
        this.onTransaction(this.type, STATUS_ERROR, this.txRealCounter);
        this.processedCount = 1;
        this.processed = true;
        return;
      }
    }

    const address = this.wallet.publicKey;
    const inAmount = shiftedBigNumber(new BigNumber(this.bot.buy.amount * this.buypercent).toString(), this.coinERC20.decimals, "positive").toFixed(); // web3Utils.toWei(String(this.bot.buy.amount));
    const gasPrice = web3Utils.toWei(String(this.bot.buy.gasPrice), 'Gwei');
    const coinAddress = this.coinAddress;
    const tokenAddress = this.tokenAddress;

    if (this.txCounter === 0) {
      this.logger.log(this.logPrefix, 'info', `process-init: try(${this.txCounter}), coin(${coinAddress}), token(${tokenAddress}), amount(${this.bot.buy.amount}), gasPrice(${this.bot.buy.gasPrice})`);
    } else {
      this.logger.log(this.logPrefix, 'info', `processing: tx(${this.txCounter}), res(${this.resCounter})`);
    }

    this.txCounter++;
    try {
      const txCall = await this.swapDex.buyToken(coinAddress, tokenAddress, inAmount, address);

      const txRes: Response = await this.blockchainClient.sendSignedTransaction(this.dex.routerAddress, txCall, 0, gasPrice);

      if (txRes.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `process-res: transactionHash(${txRes.data.transactionHash})`);
        const qRes = await this.blockchainClient.getTransactionReceipt(txRes.data.transactionHash);
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
                    pairContractAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1
                    && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                    amountOut = new BigNumber(log.data).shiftedBy(-this.tokenERC20.decimals);
                    console.log("------------------->", amountOut.toString());
                    // Get Ranking
                    const pairContract = this.swapDex.getPairContract(pairContractAddress);
                    const _events = await pairContract.getPastEvents('Swap', { fromBlock: qRes.blockNumber - 5000, toBlock: qRes.blockNumber });
                    const buy_events = _events.filter(item => item.returnValues.amount1In === '0');
                    for (const buy_event of buy_events) {
                      rank++;
                      if (buy_event.returnValues.to.toLowerCase() === address.toLowerCase()) {
                        break;
                      }
                    }
                    break;
                  }
                  // Swap
                  // if (log.topics[0] === "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822" &&
                  //   this.dex.routerAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1
                  //   && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                  //     const amount0Out = new BigNumber(log.data.substr(-128, 64), 16);
                  //     const amount1Out = new BigNumber(log.data.substr(-64), 16);
                  //     amountOut = amount0Out.plus(amount1Out).shiftedBy(-this.tokenERC20.decimals);
                  //     console.log("------------------->", amountOut.toString());
                  //   break;
                  // }
                }
              }
            }
          }
        }
        this.txRealCounter++;
        this.updateStatistics(this.bot.buy.amount * this.buypercent, amountOut.toNumber(), qRes.gasUsed * this.bot.buy.gasPrice / 1000000000, 0, 0, 0);
        this.onUpdated(this.type, STATUS_SUCCESS);
        this.onTransaction(this.type, STATUS_SUCCESS, this.txRealCounter, txRes.data.transactionHash, qRes.gasUsed * this.bot.buy.gasPrice / 1000000000,
        this.bot.buy.amount * this.buypercent, amountOut.toNumber(), rank > 0 ? rank.toString() : '');
        this.processedCount = 1;
        this.boughtpercent += this.buypercent;
        if (this.boughtpercent >= 1) {
          this.processed = true;
        }
      } else {
        if (txRes.data !== null) {
          const error: Error = txRes.data;
          if (error.message.indexOf('Transaction has been reverted by the EVM:') > -1) {
            const _gasUsed = Number(error.message.split('"gasUsed": ')[1].split(",")[0]);
            this.updateStatistics(0, 0, _gasUsed * this.bot.buy.gasPrice / 1000000000, 0, 0, 0);
            this.txRealCounter++;
            if (this.bot.config?.buyLimitDetected && this.txRealCounter > 3) {
              this.buypercent -= 0.1;
              if (this.buypercent <= 0) {
                this.buypercent = 0.05
              }
            }
          }
        }
      }
    } catch (e) {
      this.logger.log(this.logPrefix, 'info', `process-err: error(${e.message})`);
    }
    // this.resCounter++;
  }
}
