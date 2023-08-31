import { EventEmitter } from "events";
import coinbase from "coinbase";
import ccxt from "ccxt";
import config from "../config";
import {
  IStoredUser, IStoredLiquidatorBot, IStoredBlockchain,
  IStoredToken, IStoredNode, ERC20Token, BlockchainClient,
  Logger, waitFor,
  mongoDB, ELiquidatorBotStatus, IStoredCexAccount, SellingStrategy,
} from "@torobot/shared";
import BigNumber from "bignumber.js";

export class CoinbaseBotClient extends EventEmitter {
  processed: boolean = false;
  currentBlockNumber: number = 0;
  lockedProcess: boolean = false;
  logger: Logger;
  user: IStoredUser;
  bot: IStoredLiquidatorBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  token: IStoredToken;
  tokenAddress: string;
  cexAccount: IStoredCexAccount;

  blockchainClient: BlockchainClient;
  tokenERC20: ERC20Token;

  coinbaseClient: coinbase.Client;
  private intervalID = null;
  private orderIntervalID = null;

  get logPrefix() { return `liquidatorbotClient`; }

  constructor(bot: IStoredLiquidatorBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/liquidatorbot/${bot._id}.txt`);
    this.bot = bot;
  }

  async init() {
    this.user = this.bot.owner as IStoredUser;
    this.blockchain = this.bot.blockchain as IStoredBlockchain;
    this.node = this.bot.node as IStoredNode;
    this.token = this.bot.token as IStoredToken;
    this.blockchainClient = new BlockchainClient(this.blockchain, this.node)
    this.tokenERC20 = new ERC20Token(this.blockchainClient, this.token.address, this.logger);
    this.cexAccount = this.bot.cexAccount as IStoredCexAccount;
    this.coinbaseClient = new coinbase.Client({
      'apiKey': this.cexAccount.apiKey,
      'apiSecret': this.cexAccount.apiSecret,
      'strictSSL': false
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

  async saveSoldResult(xfer: coinbase.Sell, botId: string, tokenId: string) {
    console.log("saving result ----------->", xfer);
    const sellId: string = xfer.id;
    const amount = xfer.amount;
    const subtotal = xfer.subtotal;
    const total = xfer.total;
    const fees: any = xfer.fees;
    let currentFee = 0;
    for (const fee of fees) {
      if (fee.type === "coinbase") {
        currentFee = Number(fee.amount.amount);
      }
    }
    const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
      { 'sequenceName': 'Liquidator', sequenceId: botId },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    await mongoDB.LiquidatorTransactions.create({
      liquidator: botId,
      token: tokenId,
      isDex: false,
      txHash: sellId,
      tokenAmount: Number(amount.amount),
      fee: currentFee,
      price: Number(total.amount),
      uniqueNum: sequenceDocument.sequenceValue
    });
    let botDoc = await mongoDB.LiquidatorBots.findById(botId);
    botDoc.tokenSold += Number(amount.amount);
    botDoc.tokenUsdSold += Number(total.amount);
    await botDoc.save();
  }

  async start() {
    this.processed = false;
    this.lockedProcess = false;
    await this.setBotStatus(ELiquidatorBotStatus.RUNNING);
    this.intervalID = setInterval(() => this.process(), 1000);
    this.orderIntervalID = setInterval(() => this.storeOrderbook(), 60000);
    console.log("conbase started --------------------------------------");
  }

  async stop() {
    this.processed = true;
    this.lockedProcess = true;
    await this.setBotStatus(ELiquidatorBotStatus.STOPPED);
    if (this.intervalID) { clearInterval(this.intervalID); }
    if (this.orderIntervalID) { clearInterval(this.orderIntervalID); }
    console.log("conbase stopped --------------------------------------");
  }

  async getDepth(pair: string, price: number, x: BigNumber): Promise<number> {
    const coinbasepro = new ccxt.coinbasepro();
    const orderbook = await coinbasepro.fetch_order_book(pair);
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
  }

  async storeOrderbook() {
    const coinbasepro = new ccxt.coinbasepro();
    const orderbook = await coinbasepro.fetch_order_book(`${this.tokenERC20.symbol}/USD`);
    // console.log("--->", orderbook);
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
  }

  async getTodayOrderBookData(): Promise<number> {
    const today = new Date();
    const data = await mongoDB.LiquidatorDailyOrders.aggregate(
      [{
        $match: {
          liquidator: this.bot._id,
          date: [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-')
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
          buy: { $sum: "$buy" },
          sell: { $sum: '$sell' },
        }
      }]
    );
    // console.log("--------->", data);
    if (data.length === 0) {
      return 0
    }
    return data[0]?.count === 0 ? 0 : ((data[0]?.buy / data[0]?.count) || 0);
  }

  async process() {
    console.log("Processing... coinbase bot !!!", this.lockedProcess);
    if (this.processed) {
      clearInterval(this.intervalID);
      clearInterval(this.orderIntervalID);
      await this.setBotStatus(ELiquidatorBotStatus.SUCCESS);
      return;
    }
    if (this.lockedProcess) { return; }
    let todayOrderBookAmount = await this.getTodayOrderBookData();
    console.log("=============================>", todayOrderBookAmount);
    this.lockedProcess = true;
    // 1. check the current price
    //********** need to get pairs */
    const _this = this;
    const symbol = this.tokenERC20.symbol;
    const pair = `${symbol}-USD`;
    const bot = this.bot;
    const tokenId = this.token._id;
    const coinbaseClient = this.coinbaseClient;
    const accountId = this.bot.accountId;
    const saveSoldResult = this.saveSoldResult;
    this.coinbaseClient.getSpotPrice({ 'currencyPair': pair }, async function (err, res) {
      if (err) {
        // faild get price
        _this.lockedProcess = false;
        console.log("failed get price");
      } else {
        // success get price
        const price = Number(res.data.amount);
        console.log("current token price", price);
        if (price > bot.lowerPrice) {
          const x = new BigNumber(bot.rate);
          // caculate sellTokenAmount
          let sellTokenAmount = await _this.getDepth(`${symbol}/USD`, price, x);
          console.log("=============>", sellTokenAmount);
          let isLastSelling = false;
          if (sellTokenAmount + bot.tokenSold >= bot.tokenAmount) {
            sellTokenAmount = bot.tokenAmount - bot.tokenSold;
            isLastSelling = true;
          } else {
            if (sellTokenAmount * 1.5 > bot.tokenAmount - bot.tokenSold) {
              sellTokenAmount = bot.tokenAmount - bot.tokenSold;
              isLastSelling = true;
            }
          }
          // test for
          console.log("------------>", x.toNumber(), " sellTokenAmount: ", sellTokenAmount, sellTokenAmount * price, price, bot.tokenSold, bot.tokenAmount);
          if (sellTokenAmount * price > 2) {
            const args = { "amount": sellTokenAmount.toString(), "currency": symbol }
            console.log("sellTokenAmount: ", sellTokenAmount);
            // selling process
            coinbaseClient.getAccount(accountId, (err, account) => {
              if (err) {
                _this.lockedProcess = false;
              } else {
                if (Number(account.balance.amount) < sellTokenAmount) {
                  _this.lockedProcess = false;
                  _this.processed = true;
                } else {
                  account.sell(args, async (err, xfer) => {
                    if (err) {
                      _this.lockedProcess = false;
                    } else {
                      await saveSoldResult(xfer, bot._id, tokenId);
                      if (isLastSelling) {
                        _this.processed = true;
                      } else {
                        await waitFor(900000); // ------------ 15min
                      }
                      _this.lockedProcess = false;
                    }
                  })
                }
              }
            })
          } else {
            _this.lockedProcess = false;
          }
        }
      }
    })
  }
}
