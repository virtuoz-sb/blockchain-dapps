import * as web3Utils from "web3-utils";
import { EventEmitter } from "events";
import { IBot, EBotBuyType, ETradingThread, ERunningStatus, StatusResult, STATUS_SUCCESS, STATUS_ERROR, events } from "@torobot/shared";
import { BuySpamming } from "./buySpamming";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";

export class BuyInstant extends BuySpamming {

  get logPrefix() {
    return `buyInstant`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
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
  
    super.start();
  }

  stop() {
    super.stop();
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
  
  async process() {
    super.process();
  }
}
