import { EventEmitter } from "events";
import ccxt from "ccxt";
import moment from "moment";
import config from "../config";
import {
  IStoredWasherBot, Logger, waitFor,
  IStoredBlockchain, BlockchainClient, IStoredNode, IStoredToken, ERC20Token,
  mongoDB, EWasherBotStatus, EWasherBotActionResult, IStoredCexAccount, EExchangeType, IWasherBotState,
} from "@torobot/shared";
import axios from "axios";

export class KucoinWasherBotClient extends EventEmitter {
  processed: boolean = false;
  currentBlockNumber: number = 0;
  lockedProcess: boolean = false;
  timeframe: string = '1d'
  logger: Logger;
  bot: IStoredWasherBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  token: IStoredToken;
  tokenAddress: string;
  cexAccount: IStoredCexAccount;

  blockchainClient: BlockchainClient;
  tokenERC20: ERC20Token;

  kucoinClient: ccxt.kucoin;

  private intervalID = null;
  private intervalID_for_Saving_VolumeData = null;

  isDone: boolean = true;
  isCalculated: boolean = true;
  errCounter: number = 0;

  get logPrefix() { return `kucoinWasherbotClient`; }

  constructor(bot: IStoredWasherBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/kucoinWasherbot/${bot._id}.txt`);
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

  async start() {
    this.errCounter = 0;
    this.processed = false;
    this.lockedProcess = false;
    await this.setBotStatus({
      status: EWasherBotStatus.RUNNING,
      result: EWasherBotActionResult.DRAFT
    });

    this.isDone = true;
    this.isCalculated = true;

    this.intervalID = setInterval(() => this.process(), 10000); // per 10s
    this.saveCoinMarketCapVolume();
    this.intervalID_for_Saving_VolumeData = setInterval(() => this.saveCoinMarketCapVolume(), 600000); // per 10min
    console.log("kucoin washer started --------------------------------------");
  }

  async stop(result?: EWasherBotActionResult) {
    if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData) }
    if (this.intervalID) { clearInterval(this.intervalID); }
    this.processed = true;
    this.lockedProcess = true;
    await this.setBotStatus({
      status: EWasherBotStatus.STOPPED,
      result: result ? result : EWasherBotActionResult.DRAFT
    });
    console.log("kucoin washer stopped --------------------------------------");
  }

  async setBotStatus(st: IWasherBotState) {
    let botDoc = await mongoDB.WasherBots.findById(this.bot._id);
    botDoc.state = st;
    if (st.status === EWasherBotStatus.STOPPED || st.status === EWasherBotStatus.SUCCESS || st.status === EWasherBotStatus.FAILED) {
      botDoc.stateNum = 0;
    }
    await botDoc.save();
    this.bot.state = st;
  }

  async saveResult(buyId: string, sellId: string, symbol: string) {
    const buyres = await this.kucoinClient.fetchOrder(buyId, symbol);
    await waitFor(5000);
    const sellres = await this.kucoinClient.fetchOrder(sellId, symbol);
    const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
      { 'sequenceName': 'WasherTransaction', sequenceId: this.bot._id },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    const dateStr = sellres.datetime.split("T")[0];
    const dateArr = dateStr.split("-");
    let botDoc = await mongoDB.WasherBots.findById(this.bot._id);
    await mongoDB.WasherTransactions.create({
      washer: this.bot._id,
      token: this.token._id,
      exchangeType: EExchangeType.CEX,
      txBuyHash: buyId,
      txSellHash: sellId,
      tokenAmount: Number(buyres.amount) + Number(sellres.amount),
      fee: Number(buyres.fee.cost) + Number(sellres.fee.cost),
      volume: Number(buyres.cost + sellres.cost),
      loss: Number(buyres.cost) - Number(sellres.cost),
      sellPrice: 0,
      buyPrice: 0,
      uniqueNum: sequenceDocument.sequenceValue,
      targetVolume: botDoc.targetVolume,
      date: [dateArr[2], dateArr[1], dateArr[0]].join("/"),
      timeStamp: new Date(dateStr).getTime()
    });
  }

  async saveCurrentCoinMarketCapVolume(o: number, h: number, l: number, c: number, v: number, t: Date) {
    await mongoDB.CurrentCoinMarketVolumes.create({
      token: this.token._id,
      open: o,
      high: h,
      low: l,
      close: c,
      volume: v,
      timestamp: t,
    });

  }

  async saveCoinMarketCapVolume() {
    try {
      const volumeObj = await mongoDB.CoinMarketVolumes.find({ token: this.token._id }).sort({ 'timestamp': -1 }).limit(1);

      const today = new Date();
      const startDate = new Date(today);
      const endDate = new Date(today);
      let dayDiff = 20;
      if (volumeObj?.length) {
        const todayTime = today.getTime();
        const volumeLastTime = new Date(volumeObj[0].timestamp).getTime();
        dayDiff = Math.floor((todayTime - volumeLastTime) / (1000 * 60 * 60 * 24));
        dayDiff = Math.min(dayDiff, 20);
      }
      startDate.setDate(startDate.getDate() - dayDiff - 1);
      const timeStart = moment(startDate).format("YYYY-MM-DD");
      const timeEnd = moment(endDate).format("YYYY-MM-DD");
      // 
      if (dayDiff > 0) {
        const res = await axios.get(
          `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/historical?id=${this.bot.coinmarketcapId}&time_start=${timeStart}&time_end=${timeEnd}`,
          {
            headers: { 'X-CMC_PRO_API_KEY': 'f11d72ac-59ba-4c67-9220-95fababf3e68' }
          }
        );

        if (res.data.status.error_code === 0) {
          const quotes = res.data.data[this.bot.coinmarketcapId]?.quotes || [];
          for (let i = 0; i < quotes.length; i++) {
            try {
              await mongoDB.CoinMarketVolumes.create({
                token: this.token._id,
                open: quotes[i].quote?.USD?.open || 0,
                high: quotes[i].quote?.USD?.high || 0,
                low: quotes[i].quote?.USD?.low || 0,
                close: quotes[i].quote?.USD?.close || 0,
                volume: quotes[i].quote?.USD?.volume || 0,
                timestamp: quotes[i].quote?.USD?.timestamp || new Date(),
              });
            } catch (err) {
            }
          }
        } else {
          console.log({
            error_code: res.data.status.error_code,
            error_message: res.data.status.error_message
          });
        }
      }
    } catch (err) {
      console.log(err);
    }

  }

  async getLastestVolume() {
    let data = await mongoDB.WasherTransactions.aggregate(
      [{
        $match: {washer: String(this.bot._id)}
      },
      {
        $group: {
          _id: '$date',
          count: {$sum: 1},
          timeStamp: {$avg: "$timeStamp"},
          targetVolume: {$sum: "$targetVolume"},
          volume: {$sum: "$volume"},
          fee: {$sum: "$fee"},
          loss: {$sum: "$loss"}
        }
      },
      {
        $sort: {timeStamp: -1}
      },
      { $limit : 1 }]
    );

    if (data?.length) {
      const today = moment(new Date()).format("DD/MM/YYYY");
      if (today === data[0]._id) {
        return (data[0].fee - data[0].loss) / data[0].volume || 0;
      }
    }

    return 0;
  }

  async process() {
    console.log("Processing... kucoin washer bot !!!", this.lockedProcess);
    if (this.processed) {
      if (this.intervalID) clearInterval(this.intervalID);
      await this.setBotStatus({
        status: EWasherBotStatus.SUCCESS,
        result: EWasherBotActionResult.DRAFT
      });
      return;
    }
    if (this.lockedProcess) { return; }
    this.lockedProcess = true;
    let currentTimeStamp = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).getTime();
    let startTimeStamp = new Date(this.bot.start).getTime();
    let endTimeStamp = new Date(this.bot.end).getTime();
    if ((startTimeStamp < currentTimeStamp) && (currentTimeStamp < endTimeStamp)) {
      let date = new Date().toUTCString();
      console.log("kucoin: ", date);
      let dateString = date.split(" ")[4].split(":");
      let h = Number(dateString[0]);
      let m = Number(dateString[1]);

      if (m % 5 === 4) {
        if (this.isDone === false) {
          this.isDone = true;
          try {
            // 1. get current coinmarketcap volume.
            const res = await axios.get(
              `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/latest?id=${this.bot.coinmarketcapId}`,
              {
                headers: { 'X-CMC_PRO_API_KEY': 'f11d72ac-59ba-4c67-9220-95fababf3e68' }
              }
            );
            if (res.data.status.error_code === 0) {
              const quote = res.data.data[this.bot.coinmarketcapId]["quote"];
              await this.saveCurrentCoinMarketCapVolume(
                quote["USD"]["open"],
                quote["USD"]["high"],
                quote["USD"]["low"],
                quote["USD"]["close"],
                quote["USD"]["volume"],
                quote["USD"]["last_updated"]
              );
              const openPrice = quote["USD"]["open"];
              const currentVolume = quote["USD"]["volume"];
              const lackVolume = this.bot.targetVolume - currentVolume;
              console.log(`------->last_updated(${quote["USD"].last_updated}), targetVolume(${this.bot.targetVolume}), currrentVolume(${currentVolume}) : lack=`, lackVolume);
              if (lackVolume > 0) {
                let tradingAmount = this.bot.minTradingAmount;
                if (lackVolume > this.bot.minTradingAmount * 120) {
                  tradingAmount = Math.ceil(lackVolume / 120);
                }
                console.log("trading amount ------->$", tradingAmount);
                try {
                  const balances = await this.kucoinClient.fetchFreeBalance();
                  if (!balances['USDT'] || balances['USDT'] * 0.9 < this.bot.minTradingAmount) {
                    /// BOT FAILED : REASON - LOW BALANCE
                    await this.setBotStatus({
                      status: EWasherBotStatus.FAILED,
                      result: EWasherBotActionResult.INSUFFICIENT_BALANCE,
                      message: "USDT LACK in Kucoin Wallet For Transaction"
                    });
                    if (this.intervalID) { clearInterval(this.intervalID); }
                    if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
                    this.processed = true;
                  }
                  if (balances['USDT'] * 0.9 < tradingAmount) {
                    tradingAmount = balances['USDT'] * 0.9;
                  }
                  if (tradingAmount > 0) {
                    try {
                      let tradingTokenAmount = tradingAmount / openPrice;
                      const buyOrder = await this.kucoinClient.createOrder(`${this.tokenERC20.symbol}/USDT`, 'market', 'buy', tradingTokenAmount);
                      waitFor(10000);
                      const sellOrder = await this.kucoinClient.createOrder(`${this.tokenERC20.symbol}/USDT`, 'market', 'sell', tradingTokenAmount);
                      await this.saveResult(buyOrder.id, sellOrder.id, `${this.tokenERC20.symbol}/USDT`);
                    } catch (e) {
                      console.warn("error: ", e);
                      /// BOT FAILED : REASON - TRANSACTION FAILED
                      await this.setBotStatus({
                        status: EWasherBotStatus.FAILED,
                        result: EWasherBotActionResult.TRANSACTION_FAILED,
                        message: "Kucoin TRANSACTION ERROR: " + e.toString()
                      });
                      if (this.intervalID) { clearInterval(this.intervalID); }
                      if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
                      this.processed = true;
                    }
                  }
                } catch (e) {
                  /// BOT FAILED : REASON - KUCOIN API CALL FAILED
                  await this.setBotStatus({
                    status: EWasherBotStatus.FAILED,
                    result: EWasherBotActionResult.API_ERROR,
                    message: "Kucoin API ERROR: " + e.toString()
                  });
                  if (this.intervalID) { clearInterval(this.intervalID); }
                  if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
                  this.processed = true;
                }
              }
            } else {
              ////////////// BOT FAILED : REASON - COINMARKETCAP API ERROR...
              await this.setBotStatus({
                status: EWasherBotStatus.FAILED,
                result: EWasherBotActionResult.API_ERROR,
                message: "COINMARKETCAP API ERROR: " + res.data.status.error_message.toString()
              });
              if (this.intervalID) { clearInterval(this.intervalID); }
              if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
              this.processed = true;
            }
          } catch (err) {
            this.errCounter++;
            console.log(`UNKNOWN ERROR COUNTER(${this.errCounter})`, err);
            if (this.errCounter > 5) {
              /////////////// BOT FAILED : REASON - UNKNOWN ERROR....
              await this.setBotStatus({
                status: EWasherBotStatus.FAILED,
                result: EWasherBotActionResult.UNKNOWN,
                message: err.toString()
              });
              if (this.intervalID) { clearInterval(this.intervalID); }
              if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
              this.processed = true;
            }
          }
        }
      } else {
        this.isDone = false;
      }
    } else {
      if (endTimeStamp < currentTimeStamp) {
        this.processed = true;
        if (this.intervalID) { clearInterval(this.intervalID); }
        if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
        await this.setBotStatus({
          status: EWasherBotStatus.SUCCESS,
          result: EWasherBotActionResult.DRAFT
        });
      }
    }
    this.lockedProcess = false;
  }
}
