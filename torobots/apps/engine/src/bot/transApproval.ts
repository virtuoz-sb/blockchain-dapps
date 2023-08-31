import * as web3Utils from "web3-utils";
import BigNumber from "bignumber.js";
import { ERC20Token, IBot, ETradingThread, STATUS_SUCCESS, STATUS_ERROR, Response } from "@torobot/shared";
import { BotThread } from "./botThread";
import { BotClient } from "./botClient";

export class TransApproval extends BotThread {
  approvalERC20: ERC20Token;

  get logPrefix() {
    return `approval-${this.type}`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
    if (type === ETradingThread.APPROVING_BUY) {
      this.approvalERC20 = this.botClient.coinERC20;
    } else {
      this.approvalERC20 = this.botClient.tokenERC20;
    }
    this.init();
  }

  async init() {
    super.init();
  }

  async start() {
    super.start();
    this.process();
  }

  async stop() {
    super.stop();
  }

  async process() {
    this.logger.log(this.logPrefix, 'info', 'process');
    let _amount: number = 0;
    if (this.type === ETradingThread.APPROVING_BUY) {
      _amount = this.bot.buy.amount;
    } else {
      await this.tokenERC20.updateBalance();
      _amount = this.tokenERC20.userBalance.toNumber();
      // for (let i = 0; i < this.bot.sell.count; i++) {
      //   _amount = _amount + this.bot.sell.items[i].amount;
      // }
    }

    const amount = new BigNumber(_amount);
    const gasPrice = web3Utils.toWei(String(this.type === ETradingThread.APPROVING_BUY ? this.bot.buy.gasPrice : this.bot.sell.gasPrice), 'Gwei');
    let tryCount = 10;

    while (tryCount > 0) {
      this.logger.log(this.logPrefix, 'info', `processing: tx(${10-tryCount})`);
      const txCall = this.approvalERC20.approve(this.dex.routerAddress, amount);
      const txRes: Response = await this.blockchainClient.sendSignedTransaction(
        this.approvalERC20.address, txCall, 0, gasPrice);
      if (txRes.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `process-res: transactionHash(${txRes.data.transactionHash})`);
        this.onFinished(this.type, STATUS_SUCCESS);
        this.onTransaction(this.type, STATUS_SUCCESS, 11-tryCount, txRes.data.transactionHash, 0,
          this.type === ETradingThread.APPROVING_BUY ? amount.toNumber() : 0,
          this.type === ETradingThread.APPROVING_SELL ? amount.toNumber() : 0
        );
        return;
      }
      tryCount = tryCount - 1;
    }
    this.onTransaction(this.type, STATUS_ERROR, 11-tryCount);
    this.onFinished(this.type, STATUS_ERROR);
  }
}
