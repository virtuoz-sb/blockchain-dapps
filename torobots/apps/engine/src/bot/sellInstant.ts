import * as web3Utils from "web3-utils";
import { EventEmitter } from "events";
import { IBot, ETradingThread, ERunningStatus, EBotSellType, StatusResult, STATUS_SUCCESS, STATUS_ERROR, STATUS_PROCESSING, shiftedBigNumber, Response, events } from "@torobot/shared";
import { BotThread } from "./botThread";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";

export class SellInstant extends BotThread {
  txRealCounter: number;
  txCounter: number;
  resCounter: number;
  startSell: number;
  isApproved: boolean = false;
  private intervalID = null;
  tokenAmount: BigNumber;
  get logPrefix() {
    return `sellInstant`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
    this.init();
  }

  async init() {
    super.init();
  }

  async start() {
    if (!this.bot.state.extends) {
      this.bot.state.extends = {};
    }

    this.bot.state.extends.instant = {
      active: true,
      status: ERunningStatus.RUNNING,
      thread: this.type,
      result: ''
    };

    this.txRealCounter = 0;
    this.txCounter = 0;
    this.resCounter = 0;
    
    this.logger.log(this.logPrefix, 'info', "==================     INSTANT SELLING     ===============");

    // get token balance and update db
    await this.tokenERC20.updateBalance();
    this.tokenAmount = this.tokenERC20.userBalance;
    this.onUpdated(this.type);
    if (this.tokenERC20.userBalance.isZero()) {
      this.onFinished(this.type);
      this.stop();
      return;
    }
    // approving
    this.isApproved = await this.approve(ETradingThread.APPROVING_SELL, this.tokenAmount, this.blockchain.gasPrice);
    if (this.isApproved === false) {
      this.onFinished(this.type);
      this.stop();
    }
    this.onUpdated(this.type, STATUS_PROCESSING);
    super.start();

    this.intervalID = setInterval(() => this.process(), 1000);
  }

  async stop() {
    clearInterval(this.intervalID);
    this.intervalID = null;
    super.stop();
    this.txCounter = 0;
    this.resCounter = 0;
  }

  async process() {
    if (this.processed) {
      // if (this.txCounter === this.resCounter) {
        this.onFinished(this.type);
        this.stop();
      // }
      return;
    }

    const address = this.wallet.publicKey;
    // need to change by decimals
    const gasPrice = web3Utils.toWei(String(this.blockchain.gasPrice), 'Gwei');
    const coinAddress = this.coinAddress;
    const sellToken = this.tokenAddress;
    const inAmount = shiftedBigNumber(this.tokenAmount.toString(), this.tokenERC20.decimals, "positive").toFixed(0);
    if (this.txCounter === 0) {
      this.logger.log(this.logPrefix, 'info', `process-init: try(${this.txCounter}), token(${sellToken}), amount(${inAmount})`);
    } else {
      this.logger.log(this.logPrefix, 'info', `processing: tx(${this.txCounter}), res(${this.resCounter})`);
    }
    this.txCounter++;
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
                    pairContractAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1 && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                    amountOut = new BigNumber(log.data).shiftedBy(-this.coinERC20.decimals);
                    break;
                  }
                }
              }
            }
          }
        }
        this.txRealCounter++;
        this.updateStatistics(0,0,0,amountOut.toNumber(), Number(this.tokenAmount), qRes.gasUsed * this.blockchain.gasPrice / 1000000000);
        this.onUpdated(this.type, STATUS_SUCCESS);
        this.onTransaction(this.type, STATUS_SUCCESS, this.txRealCounter, txRes.data.transactionHash, qRes.gasUsed * this.blockchain.gasPrice / 1000000000,
          amountOut.toNumber(), Number(this.tokenAmount));
        this.processed = true;
      } else {
        if (txRes.data !== null) {
          const error: Error = txRes.data;
          if (error.message.indexOf('Transaction has been reverted by the EVM:') > -1) {
            const _gasUsed = Number(error.message.split('"gasUsed": ')[1].split(",")[0]);
            this.updateStatistics(0,0,0,0,0,_gasUsed * this.blockchain.gasPrice / 1000000000);
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

  onUpdated(thread: ETradingThread, result: string='') {
    this.bot.state.extends.instant.thread = thread;
    if (result) {
      this.bot.state.extends.instant.result = result;
    }
    this.emit(events.updated);
  }

  onFinished(thread: ETradingThread, result: string='') {
    if (thread === this.type) {
      this.bot.state.extends.instant.active = false;
      const result_ = result ? result : this.bot.state.extends.instant.result;
      this.bot.state.extends.instant.status = result_ === STATUS_SUCCESS ? ERunningStatus.SUCCEEDED : ERunningStatus.FAILED;
    }

    this.onUpdated(thread, result);
    this.emit(events.finished);
  }  
}
