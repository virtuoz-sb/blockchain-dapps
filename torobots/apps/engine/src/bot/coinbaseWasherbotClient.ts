import { EventEmitter } from "events";
import coinbase from "coinbase";
import ccxt from "ccxt";
import moment from "moment";
import config from "../config";
import {
  IStoredWasherBot, Logger, waitFor,
  IStoredBlockchain, BlockchainClient, IStoredNode, IStoredToken, ERC20Token,
  mongoDB, EWasherBotStatus, EWasherBotActionResult, IStoredCexAccount, EExchangeType, IWasherBotState,
} from "@torobot/shared";
import axios from "axios";
export class CoinbaseWasherBotClient extends EventEmitter {
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

  coinbaseClient: coinbase.Client;
  private intervalID = null;
  private intervalID_for_Saving_VolumeData = null;

  overflowAmount: number = 0;
  isDone: boolean = true;
  isCalculated: boolean = true;
  errCounter: number = 0;

  get logPrefix() { return `coinbaseWasherbotClient`; }

  constructor(bot: IStoredWasherBot) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/coinbaseWasherbot/${bot._id}.txt`);
    this.bot = bot;
  }

  async init() {
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

  async start() {
    this.processed = false;
    this.lockedProcess = false;
    await this.setBotStatus({
      status: EWasherBotStatus.RUNNING,
      result: EWasherBotActionResult.DRAFT
    });

    this.overflowAmount = 0;
    this.isDone = true;
    this.isCalculated = true;

    this.intervalID = setInterval(() => this.process(), 10000);
    this.saveCoinMarketCapVolume();
    this.intervalID_for_Saving_VolumeData = setInterval(() => this.saveCoinMarketCapVolume(), 600000); // per 10min
    console.log("conbase washer started --------------------------------------");
  }

  async stop() {
    if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData) }
    if (this.intervalID) { clearInterval(this.intervalID); }
    this.processed = true;
    this.lockedProcess = true;
    await this.setBotStatus({
      status: EWasherBotStatus.STOPPED,
      result: EWasherBotActionResult.DRAFT
    });
    console.log("conbase washer stopped --------------------------------------");
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

  async saveResult(xferBuy: coinbase.Buy, xferSell: coinbase.Sell) {
    console.log("saving result ----------->", xferBuy, xferSell);
    let currentFee = 0;
    for (const fee of xferBuy.fees) {
      if (fee.type === "coinbase") {
        currentFee = currentFee + Number(fee.amount.amount);
      }
    }
    for (const fee of xferSell.fees) {
      currentFee = currentFee + Number(fee.amount);
    }
    const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
      { 'sequenceName': 'WasherTransaction', sequenceId: this.bot._id },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    const today = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });
    const dateStr = today.split(",")[0];
    const dateArr = dateStr.split("/");
    let botDoc = await mongoDB.WasherBots.findById(this.bot._id);
    await mongoDB.WasherTransactions.create({
      washer: this.bot._id,
      token: this.token._id,
      exchangeType: EExchangeType.CEX,
      txBuyHash: xferBuy.id,
      txSellHash: xferSell.id,
      tokenAmount: Number(xferBuy.amount.amount) + Number(xferSell.amount.amount),
      fee: currentFee,
      volume: Number(xferBuy.total.amount) + Number(xferSell.total.amount),
      loss: Number(xferBuy.total.amount) - Number(xferSell.total.amount),
      sellPrice: 0,
      buyPrice: 0,
      uniqueNum: sequenceDocument.sequenceValue,
      targetVolume: botDoc.targetVolume,
      date: dateStr,
      timeStamp: new Date(`${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`).getTime()
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
      console.log("-------", dayDiff, timeEnd, timeStart);
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
            await mongoDB.CoinMarketVolumes.create({
              token: this.token._id,
              open: quotes[i].quote?.USD?.open || 0,
              high: quotes[i].quote?.USD?.high || 0,
              low: quotes[i].quote?.USD?.low || 0,
              close: quotes[i].quote?.USD?.close || 0,
              volume: quotes[i].quote?.USD?.volume || 0,
              timestamp: quotes[i].quote?.USD?.timestamp || new Date(),
            });
          }

          console.log("================", dayDiff, timeEnd, timeStart)
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

  async getBlanceUSD(): Promise<number> {
    const coinbaseClient = this.coinbaseClient;
    if (coinbaseClient) {
      return new Promise((resolve, reject) => {
        coinbaseClient.getAccounts({}, (err, accounts) => {
          if (err) {
            resolve(0)
          } else {
            for (const account of accounts) {
              if (account.balance.currency === "USD" || account.balance.currency === "usd") {
                resolve(Number(account.balance.amount));
                break;
              }
            }
            resolve(0);
          }
        })
      })
    } else {
      console.log('no exist coinbase client!!!');
      return 0;
    }
  }

  async getBalanceToken(): Promise<number> {
    const coinbaseClient = this.coinbaseClient;
    const accountId = this.bot.accountId;
    if (coinbaseClient && accountId) {
      return new Promise((resolve, reject) => {
        coinbaseClient.getAccount(accountId, (err, account) => {
          if (err) {
            resolve(0)
          } else {
            console.log(`coinbase account: ${account.balance.amount} ${account.balance.currency}`);
            resolve(Number(account.balance.amount));
          }
        })
      });
    } else {
      console.log('no exist coinbase client or accountId !!!');
      return 0;
    }
  }

  async getAccount(): Promise<coinbase.Account> {
    const coinbaseClient = this.coinbaseClient;
    const accountId = this.bot.accountId;
    if (coinbaseClient && accountId) {
      return new Promise((resolve, reject) => {
        coinbaseClient.getAccount(accountId, (err, account) => {
          if (err) {
            resolve(null);
          } else {
            resolve(account);
          }
        })
      })
    } else {
      console.log('no exist coinbase client or accountId !!!');
      return null;
    }
  }

  async buy(amount: number): Promise<coinbase.Buy> {
    const args = { "amount": amount.toString(), "currency": this.tokenERC20.symbol }
    const account = await this.getAccount();
    if (account) {
      return new Promise((resolve, reject) => {
        account.buy(args, async (err, xfer) => {
          if (err) {
            resolve(null);
          } else {
            resolve(xfer);
          }
        })
      })
    } else {
      return null;
    }
  }

  async sell(amount: number): Promise<coinbase.Sell> {
    const args = { "amount": amount.toString(), "currency": this.tokenERC20.symbol }
    const account = await this.getAccount();
    if (account) {
      return new Promise((resolve, reject) => {
        account.sell(args, async (err, xfer) => {
          if (err) {
            resolve(null);
          } else {
            resolve(xfer);
          }
        })
      })
    } else {
      return null;
    }
  }

  async process() {
    console.log("Processing... coinbase washer bot !!!", this.lockedProcess);
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
      console.log("coinbase: ", date);
      let dateString = date.split(" ")[4].split(":");
      let h = Number(dateString[0]);
      let m = Number(dateString[1]);

      if (m % 5 === 4) {
        console.log("step----4");
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
                  const balanceUSD = await this.getBlanceUSD();
                  // const balances = await this.kucoinClient.fetchFreeBalance();

                  if (balanceUSD === 0 || balanceUSD * 0.8 < this.bot.minTradingAmount) {
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
                  if (balanceUSD * 0.8 < tradingAmount) {
                    tradingAmount = balanceUSD * 0.8;
                  }
                  if (tradingAmount > 0) {
                    let tradingTokenAmount = tradingAmount / openPrice;
                    const buyOrder = await this.buy(tradingTokenAmount);
                    if (!buyOrder) {
                      /// BOT FAILED : REASON - TRANSACTION FAILED
                      await this.setBotStatus({
                        status: EWasherBotStatus.FAILED,
                        result: EWasherBotActionResult.TRANSACTION_FAILED,
                        message: "Coinbase BUY TRANSACTION ERROR"
                      });
                      if (this.intervalID) { clearInterval(this.intervalID); }
                      if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
                      this.processed = true;
                    } else {
                      waitFor(60000);
                      const sellOrder = await this.sell(tradingTokenAmount);
                      if (!sellOrder) {
                        /// BOT FAILED : REASON - TRANSACTION FAILED
                        await this.setBotStatus({
                          status: EWasherBotStatus.FAILED,
                          result: EWasherBotActionResult.TRANSACTION_FAILED,
                          message: "Coinbase SELL TRANSACTION ERROR"
                        });
                        if (this.intervalID) { clearInterval(this.intervalID); }
                        if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
                        this.processed = true;
                      } else {
                        await this.saveResult(buyOrder, sellOrder);
                      }
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
        await this.setBotStatus({
          status: EWasherBotStatus.SUCCESS,
          result: EWasherBotActionResult.DRAFT
        });
        if (this.intervalID) { clearInterval(this.intervalID); }
        if (this.intervalID_for_Saving_VolumeData) { clearInterval(this.intervalID_for_Saving_VolumeData); }
      }
    }
    this.lockedProcess = false;
  }
}
