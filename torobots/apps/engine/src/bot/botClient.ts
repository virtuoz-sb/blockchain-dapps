import { EventEmitter } from "events";
import config from "../config";
import {
  BlockchainClient, ERC20Token, UniswapDex,
  IStoredUser, IStoredBot, IStoredBlockchain, IStoredNode, IStoredDex, IStoredWallet, IStoredCoin, IStoredToken, ITransaction,
  EBotType, ERunningStatus, ETradingThread, ETradingInitiator, EBotBuyType, EBotSellType, events,
  STATUS_READY, STATUS_SUCCESS,
  Logger, waitFor
} from "@torobot/shared";
import { BotThread } from "./botThread";
import { BuySpamming } from "./buySpamming";
import { BuyEvent } from "./buyEvent";
import { SellTimer } from "./sellTimer";
import { SellSpamming } from "./sellSpamming";
import { BuyInstant } from "./buyInstant";
import { SellInstant } from "./sellInstant";
import { StopLoss } from "./stopLoss";
import { AntiSell } from "./antiSell";
import { RugpoolDetected } from "./rugpoolDetected";
export class BotClient extends EventEmitter {
  logger: Logger;
  user: IStoredUser;
  bot: IStoredBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  dex: IStoredDex;
  wallet: IStoredWallet;
  coin: IStoredCoin;
  token: IStoredToken;

  coinAddress: string;
  tokenAddress: string;

  blockchainClient: BlockchainClient;
  swapDex: UniswapDex;
  coinERC20: ERC20Token;
  tokenERC20: ERC20Token;

  transaction: ITransaction;

  botThreads: BotThread[];
  botInstantThreads: BotThread[];
  stopLoss: StopLoss;
  rugpoolDetected: RugpoolDetected;

  get logPrefix() {
    return `botClient`;
  }

  constructor(bot: IStoredBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/bot/${bot._id}.txt`);

    this.bot = bot;
    this.botThreads = [];
    this.botInstantThreads = [];
  }

  async processStopLoss() {
    console.log("StopLoss Detected ===>");
    this.botThreads.forEach(client => client.stop());
    await waitFor(1000);
    await this.stopLoss.trySell();
  }

  async processRugpool() {
    console.log("Rugpool Detected ===>");
    await waitFor(1000);
    await this.rugpoolDetected.trySell();
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

    this.blockchainClient = new BlockchainClient(this.blockchain, this.node, this.bot.wallet as IStoredWallet, this.logger);
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
      initiator: ETradingInitiator.BOT,
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

    this.logger.log(this.logPrefix, 'info', 'init');
    if (this.bot.config?.stopLoss) {
      this.stopLoss = new StopLoss(ETradingThread.SELLING_STOP_LOSS, this);
      this.stopLoss.on("DetectedStopLoss", () => this.processStopLoss())
      this.stopLoss.start();
    }
    if (this.bot.config?.rugpool) {
      this.rugpoolDetected = new RugpoolDetected(ETradingThread.RUG_POOL_DETECTED, this);
      this.rugpoolDetected.on("DetectedRugPool", () => this.processRugpool());
      this.rugpoolDetected.start();
    }
  }

  start(thread: ETradingThread = ETradingThread.NONE) {
    if (!thread || thread === ETradingThread.NONE) {
      // buy thread
      if (this.bot.type === EBotType.BUY || this.bot.type === EBotType.BUY_SELL) {
        if (this.bot.buy.type === EBotBuyType.ONCE || this.bot.buy.type === EBotBuyType.SPAM) {
          const buySpamming = new BuySpamming(ETradingThread.BUYING_SPAM, this);
          this.botThreads.push(buySpamming);
        } else if (this.bot.buy.type === EBotBuyType.EVENT) {
          const buyEvent = new BuyEvent(ETradingThread.BUYING_EVENT, this);
          this.botThreads.push(buyEvent);
        }
      }
      // sell thread
      if (this.bot.type === EBotType.BUY_SELL || this.bot.type === EBotType.SELL) {
        if (this.bot.config?.antiSell) {
          const antiSell = new AntiSell(ETradingThread.ANTI_SELL_DETECTED, this);
          this.botThreads.push(antiSell);
        }
        if (this.bot.sell.type === EBotSellType.ONCE || this.bot.sell.type === EBotSellType.SPAM) {
          const sellSpamming = new SellSpamming(ETradingThread.SELLING_SPAM, this);
          this.botThreads.push(sellSpamming);
        } else if (this.bot.sell.type === EBotSellType.TIMER) {
          const timerSell = new SellTimer(ETradingThread.SELLING_TIMER, this);
          this.botThreads.push(timerSell);
        }
      }
      this.bot.state.result = STATUS_READY;
      this.bot.state.status = ERunningStatus.RUNNING;
      this.startThread();
    } else if (
      thread === ETradingThread.BUYING_INSTANT || thread === ETradingThread.BUYING_SPAM ||
      thread === ETradingThread.SELLING_INSTANT || thread === ETradingThread.SELLING_SPAM
    ) {
      let instant = null;
      if (thread === ETradingThread.BUYING_INSTANT || thread === ETradingThread.BUYING_SPAM) {
        instant = new BuyInstant(thread, this);
      } else if (thread === ETradingThread.SELLING_INSTANT || thread === ETradingThread.SELLING_SPAM) {
        instant = new SellInstant(thread, this);
      }
      if (instant) {
        this.botInstantThreads.push(instant);
      }
      this.startInstantThread();
    }
  }

  stop() {
    console.log("clicked stop!!!")
    if (this.bot.config?.stopLoss && this.stopLoss) {
      console.log("StopLoss Thread STOP !!!!!!!!!!!!!!!!!!!!!!!");
      this.stopLoss.stop();
    }
    if (this.bot.config?.rugpool && this.rugpoolDetected) {
      console.log("RugPool Thread STOP !!!!!!!!!!!!!!!!!!!!!!!");
      this.rugpoolDetected.stop();
    }
    this.botThreads.forEach(client => client.stop());
    this.botThreads = [];
    this.bot.state.active = false;
    this.bot.state.status = ERunningStatus.FAILED;
  }

  stopThread() {
    console.log("clicked stop!!!")
    if (this.bot.config?.stopLoss && this.stopLoss) {
      console.log("StopLoss Thread STOP !!!!!!!!!!!!!!!!!!!!!!!");
      this.stopLoss.stop();
    }
    if (this.bot.config?.rugpool && this.rugpoolDetected) {
      console.log("RugPool Thread STOP !!!!!!!!!!!!!!!!!!!!!!!");
      this.rugpoolDetected.stop();
    }
    this.botInstantThreads.forEach(client => client.stop());
    this.botInstantThreads = [];
  }

  /////////////////////////////////////////////////////////////////////
  startThread() {
    if (this.botThreads.length === 0) {
      if (this.rugpoolDetected || this.stopLoss) {

      } else {
        this.bot.state.active = false;
      }
      this.bot.state.status = this.bot.state.result === STATUS_SUCCESS ? ERunningStatus.SUCCEEDED : ERunningStatus.FAILED;
      if (!this.bot.config?.stopLoss) {
        this.emit(events.finished);
      }
      return;
    }
    const thread = this.botThreads[0];
    thread.on(events.transaction, () => this.onTransaction());
    thread.on(events.updated, () => this.onUpdated());
    thread.on(events.finished, () => this.onFinishedThread(thread));
    thread.start();
  }

  async onFinishedThread(thread: BotThread) {
    if (this.botThreads.length > 0) {
      const thread = this.botThreads[0];
      thread.stop();
      this.botThreads.shift();
    }
    this.startThread();
  }

  /////////////////////////////////////////////////////////////////////
  startInstantThread() {
    if (this.botInstantThreads.length === 0) {
      if (this.botThreads.length === 0) {
        this.startThread();
      }
      return;
    }
    const thread = this.botInstantThreads[0];
    thread.on(events.transaction, () => this.onTransaction());
    thread.on(events.updated, () => this.onUpdated());
    thread.on(events.finished, () => this.onFinishedInstantThread(thread));
    thread.start();
  }

  async onFinishedInstantThread(thread: BotThread) {
    if (this.botInstantThreads.length > 0) {
      const thread = this.botInstantThreads[0];
      thread.stop();
      this.botInstantThreads.shift();
    }
    this.startInstantThread();
  }

  /////////////////////////////////////////////////////////////////////
  async onUpdated() {
    // console.log(`${this.logPrefix()}onUpdated: ${this.bot.state}`)
    this.emit(events.updated);
  }

  async onTransaction() {
    // this.logger.log(this.logPrefix, 'info', `onTransaction:${JSON.stringify(this.transaction)}`);
    this.emit(events.transaction);
  }
}
