import { EventEmitter } from "events";
import ccxt, { kucoin } from "ccxt";
import config from "../config";
import {
  IStoredLiquidatorBot, IStoredBlockchain,
  IStoredToken, IStoredNode, ERC20Token, BlockchainClient,
  Logger, waitFor,
  mongoDB, ELiquidatorBotStatus, IStoredCexAccount, SellingStrategy,
} from "@torobot/shared";
import BigNumber from "bignumber.js";

export class KucoinBotClient extends EventEmitter {
  processed: boolean = false;
  currentBlockNumber: number = 0;
  lockedProcess: boolean = false;
  logger: Logger;
  bot: IStoredLiquidatorBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  token: IStoredToken;
  tokenAddress: string;
  cexAccount: IStoredCexAccount;

  blockchainClient: BlockchainClient;
  tokenERC20: ERC20Token;

  kucoinClient: ccxt.kucoin;
  private intervalID = null;
  private orderIntervalID = null;
  overflowAmount: number = 0;

  get logPrefix() { return `kucoinbotClient`; }

  constructor(bot: IStoredLiquidatorBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/kucoinbot/${bot._id}.txt`);
    this.bot = bot;
  }

  async init() {
    this.blockchain = this.bot.blockchain as IStoredBlockchain;
    this.node = this.bot.node as IStoredNode;
    this.token = this.bot.token as IStoredToken;
    this.blockchainClient = new BlockchainClient(this.blockchain, this.node)
    this.tokenERC20 = new ERC20Token(this.blockchainClient, this.token.address, this.logger);
    this.cexAccount = this.bot.cexAccount as IStoredCexAccount;
    this.kucoinClient = new ccxt.kucoin({
      'apiKey': this.cexAccount.apiKey,
      'secret': this.cexAccount.apiSecret,
      'password': this.cexAccount.apiPassword,
      'version': '2'
    })
    await this.blockchainClient.init();
    await this.tokenERC20.init();
    this.logger.log(this.logPrefix, 'info', 'init');
  }

  async setBotStatus(st: ELiquidatorBotStatus) {
    let botDoc = await mongoDB.LiquidatorBots.findById(this.bot._id);
    botDoc.state = st;
    if (st === ELiquidatorBotStatus.STOPPED || st === ELiquidatorBotStatus.SUCCESS) {
      botDoc.stateNum = 0;
    }
    await botDoc.save();
    this.bot.state = st;
  }

  async saveMarketSoldResult(orderId: string, pair: string, currentPrice: number) {
    console.log("saving result ----------->", pair);
    let res = await this.kucoinClient.fetchOrder(orderId, pair);
    while (res.status == "open" || res.status == undefined) {
      await waitFor(10000);
      res = await this.kucoinClient.fetchOrder(orderId, pair);
    }
    if (res.status == "canceled") {
      return false;
    }
    if (res.status == "closed") {
      const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
        { 'sequenceName': 'Liquidator', sequenceId: this.bot._id },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      await mongoDB.LiquidatorTransactions.create({
        liquidator: this.bot._id,
        token: this.token._id,
        isDex: false,
        txHash: orderId,
        tokenAmount: Number(res.amount),
        fee: res.fee.cost,
        price: Number(res.cost), // sold price * amount as usd
        currentPrice: currentPrice,
        soldPrice: res.average ? Number(res.average) : Number(res.cost) / Number(res.amount),
        uniqueNum: sequenceDocument.sequenceValue
      });
      let botDoc = await mongoDB.LiquidatorBots.findById(this.bot._id);
      botDoc.tokenSold += Number(res.amount);
      this.bot.tokenSold = botDoc.tokenSold;
      botDoc.tokenUsdSold += Number(res.cost);
      await botDoc.save();
      return true;
    }
    return false;
  }

  async saveLimitSoldResult(orderId: string, pair: string, currentPrice: number) {
    console.log("saving result ----------->", pair);
    let res = await this.kucoinClient.fetchOrder(orderId, pair);
    let counter = 0;
    while (res.status == "open" || res.status == undefined) {
      counter = counter + 1;
      if (counter > 5) {
        await this.kucoinClient.cancelOrder(orderId);
        break;
      }
      await waitFor(10000);
      res = await this.kucoinClient.fetchOrder(orderId, pair);
    }
    if (counter > 5) {
      while (res.status != "canceled") {
        await waitFor(10000);
        res = await this.kucoinClient.fetchOrder(orderId, pair);
      }
    }
    if (res.filled > 0) {
      const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
        { 'sequenceName': 'Liquidator', sequenceId: this.bot._id },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      await mongoDB.LiquidatorTransactions.create({
        liquidator: this.bot._id,
        token: this.token._id,
        isDex: false,
        txHash: orderId,
        tokenAmount: Number(res.filled),
        fee: res.fee.cost,
        price: Number(res.cost), // sold price * amount as usd
        currentPrice: currentPrice,
        soldPrice: res.average ? Number(res.average) : Number(res.cost) / Number(res.filled),
        uniqueNum: sequenceDocument.sequenceValue
      });
      let botDoc = await mongoDB.LiquidatorBots.findById(this.bot._id);
      botDoc.tokenSold += Number(res.filled);
      this.bot.tokenSold = botDoc.tokenSold;
      botDoc.tokenUsdSold += Number(res.cost);
      await botDoc.save();
      if (Number(res.filled) == Number(res.amount)) {
        return true;
      }
      
    }
    return false;
  }

  async start() {
    this.processed = false;
    this.lockedProcess = false;
    await this.setBotStatus(ELiquidatorBotStatus.RUNNING);
    this.intervalID = setInterval(() => this.process(), 60000); // 1mins
    this.storeOrderbook();
    this.orderIntervalID = setInterval(() => this.storeOrderbook(), 600000); // 10mins
    console.log("kucoinbot started --------------------------------------");
  }

  async stop() {
    this.processed = true;
    this.lockedProcess = true;
    await this.setBotStatus(ELiquidatorBotStatus.STOPPED);
    if (this.intervalID) { clearInterval(this.intervalID); }
    if (this.orderIntervalID) { clearInterval(this.orderIntervalID); }
    console.log("kucoinbot stopped --------------------------------------");
  }

  async getDepth(pair: string, price: number, x: BigNumber): Promise<number> {
    try {
      const orderbook = await this.kucoinClient.fetchOrderBook(pair);
      let res = 0;
      let limit = new BigNumber(price).multipliedBy(new BigNumber(1).minus(x.dividedBy(100)))
      for (let i = 0; i < orderbook.bids.length; i++) {
        if (new BigNumber(orderbook.bids[i][0]).isGreaterThanOrEqualTo(limit)) {
          res += orderbook.bids[i][1];
        } else {
          break;
        }
      }
      return res;
    } catch (e) {
      console.log('getDepth --->', e);
      return 0;
    }
  }

  async storeOrderbook() {
    try {
      const orderbook = await this.kucoinClient.fetchOrderBook(`${this.tokenERC20.symbol}/USDT`);
      let bid = 0;
      for (let i = 0; i < orderbook.bids.length; i++) {
        bid += orderbook.bids[i][0] * orderbook.bids[i][1];
      }

      let ask = 0;
      for (let i = 0; i < orderbook.asks.length; i++) {
        ask += orderbook.asks[i][0] * orderbook.asks[i][1];
      }

      const today = new Date();
      mongoDB.LiquidatorDailyOrders.create({
        liquidator: this.bot._id,
        buy: bid,
        sell: ask,
        date: [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-')
      });
    } catch (e) {
      console.log("storeOderbook --->", e);
    }
  }

  async process() {
    console.log("Processing... kucoinbase bot !!!", this.lockedProcess);

    /* Total sold => bot status: SUCCESS, bot stop */
    if (this.processed) {
      clearInterval(this.intervalID);
      clearInterval(this.orderIntervalID);
      await this.setBotStatus(ELiquidatorBotStatus.SUCCESS);
      return;
    }

    /* last process is not finished yet => don't go */
    if (this.lockedProcess) { return; }

    /* locking process */
    this.lockedProcess = true;

    /* process main block */
    try {
      /* 1. get the current price from Kucoin. */
      const symbol = this.tokenERC20.symbol;
      const pair = `${symbol}/USDT`;
      const getPrice = await this.kucoinClient.fetchTicker(pair);
      const price = getPrice.last ? Number(getPrice.last) : (getPrice.close ? Number(getPrice.close) : Number(getPrice.open));
      console.log("1 ------> current token price", price);

      if (this.bot.orderType == "MARKET_ORDER") {
        /* if orderType is market order */

        /* 2. current price should be greater than Price limit considered the rate */
        if (price * (1 - this.bot.rate / 100) > this.bot.lowerPrice) {

          /* 3. caculate sellTokenAmount based on depth by the rate. */
          let sellTokenAmount = await this.getDepth(pair, price, new BigNumber(this.bot.rate));
          console.log("2 --------> calculated sellTokenAmount = ", sellTokenAmount);
          let isLastSelling = false;
          if (sellTokenAmount + this.bot.tokenSold >= this.bot.tokenAmount) {
            sellTokenAmount = this.bot.tokenAmount - this.bot.tokenSold;
            isLastSelling = true;
          } else {
            if ((this.bot.tokenAmount - this.bot.tokenSold - sellTokenAmount) * price < 100) {
              sellTokenAmount = this.bot.tokenAmount - this.bot.tokenSold;
              isLastSelling = true;
            }
          }
          console.log(`3 ----------> RATE(${this.bot.rate}), SELL_TOKEN_AMOUNT(${sellTokenAmount}), CUR_PRICE(${price}), SOLD(${this.bot.tokenSold}/${this.bot.tokenAmount})`);

          if (sellTokenAmount * price >= 100) {
            // selling process
            const balances = await this.kucoinClient.fetchFreeBalance();
            if (balances[symbol] < sellTokenAmount) {
              this.processed = true;
            } else {
              const sellOrder = await this.kucoinClient.createOrder(pair, 'market', 'sell', sellTokenAmount);
              const result = await this.saveMarketSoldResult(sellOrder.id, pair, price);
              if (isLastSelling) {
                this.processed = true;
              } else {
                if (result) {
                  await waitFor(60000 * this.bot.timeInterval); // sleep
                } else {
                  await waitFor(30000 * this.bot.timeInterval); // sleep an half
                }
              }
            }
          }
        }
      } else if (this.bot.orderType == "LIMIT_ORDER") {
        /* if orderType is limit order */

        /* 2. current price should be greater than Price limit */
        if (price > this.bot.lowerPrice) {

          /* get order book data */
          const orderbook = await this.kucoinClient.fetchOrderBook(pair);
          let bid = 0;
          let sellTokenAmount = 0;
          let limitPrice = price;
          for (let i = 0; i < orderbook.bids.length; i++) {
            if (orderbook.bids[i][0] < this.bot.lowerPrice) { break; }
            if (orderbook.bids[i][0] < price * 0.99) { break; }
            bid = bid + orderbook.bids[i][0] * orderbook.bids[i][1];
            sellTokenAmount = sellTokenAmount + orderbook.bids[i][1];
            limitPrice = orderbook.bids[i][0];
          }
          let isLastSelling = false;
          if (sellTokenAmount > this.bot.tokenAmount - this.bot.tokenSold) {
            sellTokenAmount = this.bot.tokenAmount - this.bot.tokenSold;
            isLastSelling = true;
          }
          if ((isLastSelling || bid >= 100) && limitPrice >= this.bot.lowerPrice) {
            console.log(`2--------------> caculated bids(${bid}) limit price(${limitPrice})`);
            const limitSellOrder = await this.kucoinClient.createLimitSellOrder(pair, sellTokenAmount, limitPrice);
            const result = await this.saveLimitSoldResult(limitSellOrder.id, pair, price);
            if (result) {
              if (isLastSelling) {
                this.processed = true;
              } else {
                await waitFor(60000 * this.bot.timeInterval); // sleep
              }
            } else {
              await waitFor(60000 * this.bot.timeInterval); // sleep
            }
          }

        }
      }
    } catch (e) {
      console.log("kucoin api --->", e);
      waitFor(300000) // 5mins
    }
    this.lockedProcess = false;
  }
}
