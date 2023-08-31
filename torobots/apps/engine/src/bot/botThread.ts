import { EventEmitter } from "events";
import BigNumber from "bignumber.js";
import * as web3Utils from "web3-utils";
import { 
  BlockchainClient, ERC20Token, UniswapDex,
  IStoredUser, IStoredBot, IStoredBlockchain, IStoredNode, IStoredDex, IStoredWallet, ITransaction,
  IStoredCoin, IStoredToken,
  ETradingThread, TransactionStatus, STATUS_PROCESSING, STATUS_SUCCESS, STATUS_ERROR,
  events, Logger,
  Response
} from "@torobot/shared";
import { BotClient } from "./botClient";

export class BotThread extends EventEmitter {
  logger: Logger;
  type: ETradingThread;
  botClient: BotClient;

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

  startTime: Date;
  processed: boolean;

  get logPrefix() {
    return `botThread-${this.type}`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super();
    this.setMaxListeners(0);
    this.logger = botClient.logger;
    this.type = type;
    this.botClient = botClient;
    this.startTime = new Date();
  }

  async init() {
    this.user = this.botClient.user;
    this.bot = this.botClient.bot;
    this.blockchain = this.botClient.blockchain;
    this.node = this.botClient.node;
    this.dex = this.botClient.dex;
    this.wallet = this.botClient.wallet;
    this.coin = this.botClient.coin;
    this.token = this.botClient.token;

    this.coinAddress = this.botClient.coinAddress;
    this.tokenAddress = this.botClient.tokenAddress;

    this.blockchainClient = this.botClient.blockchainClient;
    this.swapDex = this.botClient.swapDex;
    this.coinERC20 = this.botClient.coinERC20;
    this.tokenERC20 = this.botClient.tokenERC20;

    this.transaction = this.botClient.transaction;
    this.logger.log(this.logPrefix, 'info', 'init');
  }

  start() {
    this.processed = false;
    this.onUpdated(this.type, STATUS_PROCESSING);
  }

  stop() {
    this.processed = true;
  }

  onUpdated(thread: ETradingThread, result: string='') {
    this.bot.state.thread = thread;
    if (result) {
      this.bot.state.result = result;
    }
    this.emit(events.updated);
  }

  onFinished(thread: ETradingThread, result: string='') {
    this.onUpdated(thread, result);
    this.emit(events.finished);
  }

  onTransaction(thread: ETradingThread, result: TransactionStatus, tryCount: number=0, txHash: string='', gasFee: number=0, coinAmount: number=0, tokenAmount: number=0, message: string="") {
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

  process() {
  }

  async approve(thread: ETradingThread, amountToApprove: BigNumber, gasPriceReserved: number = undefined): Promise<boolean> {
    this.logger.log(this.logPrefix, 'info', 'approving');
    this.onUpdated(thread, STATUS_PROCESSING);

    const approvalERC20: ERC20Token = thread === ETradingThread.APPROVING_BUY ? this.botClient.coinERC20 : this.botClient.tokenERC20;
    const amount = amountToApprove;
    const gasPrice = web3Utils.toWei(String(gasPriceReserved !== undefined ? gasPriceReserved : (thread === ETradingThread.APPROVING_BUY ? this.bot.buy.gasPrice : this.bot.sell.gasPrice)), 'Gwei');
    const maxTryCount = 10;
    let tryCount = maxTryCount;

    while (tryCount > 0) {
      this.logger.log(this.logPrefix, 'info', `approving: tx(${maxTryCount-tryCount})`);
      const txCall = approvalERC20.approve(this.dex.routerAddress, amount);
      const txRes: Response = await this.blockchainClient.sendSignedTransaction(approvalERC20.address, txCall, 0, gasPrice);
      if (txRes.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `approving-res: transactionHash(${txRes.data.transactionHash})`);
        this.onUpdated(thread, STATUS_SUCCESS);
        this.onTransaction(thread, STATUS_SUCCESS, maxTryCount + 1 -tryCount, txRes.data.transactionHash, 0,
          thread === ETradingThread.APPROVING_BUY ? amount.toNumber() : 0,
          thread === ETradingThread.APPROVING_SELL ? amount.toNumber() : 0
        );
        return true;
      }
      tryCount = tryCount - 1;
    }
    this.onUpdated(thread, STATUS_ERROR);
    this.onTransaction(thread, STATUS_ERROR, maxTryCount + 1 - tryCount);
    return false;
  }

  updateStatistics(buyCoinAmount: number, buyTokenAmount: number, buyFee: number, sellCoinAmount: number, sellTokenAmount: number, sellFee: number) {
    if (this.bot.statistics) {
      if (!this.bot.statistics.buy) {
        this.bot.statistics.buy = {coinAmount: 0, tokenAmount: 0, fee: 0}
      }
      if (!this.bot.statistics.sell) {
        this.bot.statistics.sell = {coinAmount: 0, tokenAmount: 0, fee: 0}
      }
    } else {
      this.bot.statistics = {
        buy: {coinAmount: 0, tokenAmount: 0, fee: 0},
        sell: {coinAmount: 0, tokenAmount: 0, fee: 0}
      }
    }
    this.bot.statistics.buy.coinAmount = this.bot.statistics.buy.coinAmount + buyCoinAmount;
    this.bot.statistics.buy.tokenAmount = this.bot.statistics.buy.tokenAmount + buyTokenAmount;
    this.bot.statistics.buy.fee = this.bot.statistics.buy.fee + buyFee;
    this.bot.statistics.sell.coinAmount = this.bot.statistics.sell.coinAmount + sellCoinAmount;
    this.bot.statistics.sell.tokenAmount = this.bot.statistics.sell.tokenAmount + sellTokenAmount;
    this.bot.statistics.sell.fee = this.bot.statistics.sell.fee + sellFee;
  }
}
