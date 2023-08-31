/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable-next-line no-await-in-loop */
/* eslint-disable-next-line no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable dot-notation */
import { HttpService, Injectable, Logger } from "@nestjs/common";
import { PartialBalances } from "ccxt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cron, CronExpression, Interval } from "@nestjs/schedule";
import * as moment from "moment";
import * as mongoose from "mongoose";
import { On } from "nest-event";
import { timer } from "rxjs";
import { take } from "rxjs/operators";
import { performance } from "perf_hooks";
import {
  PortfolioSummary,
  BtcAmount,
  DistributionOverview,
  PortfolioFiltered,
  AccountToUpdate,
  UbxtBalance,
  UbxtBalanceCache,
} from "../models/portfolio.dto";
import ExchangeKeyService from "../../exchange-key/services/exchange-key.service";
import { Evolution, EvolutionData, AccountsEvolution, PortfolioEvolution } from "../models/evolution.schema";
import SettingsService from "../../settings/services/settings.service";
import { computeDistribution, findNonZeroAndNonIgnoredCurrencies, findUniqueCurrencies, ignoreLocked, selectBtcRates } from "./utils";
import ConversionRateService from "../../cryptoprice/conversion-rate.service";
import { CurrencyRate } from "../models/currency-convert-map";
import replaceCoinBalance from "./utils/replace-coin-balance";
import ProxyFactoryService from "../../exchangeProxy/services/proxy-factory.service";
import fixCryptoRates from "./utils/fix-crypto-rates";

@Injectable()
export default class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  private readonly apiCoingeckoUrl = "https://api.coingecko.com/api/v3/simple/token_price/ethereum";

  private readonly ubxtContract = "0x8564653879a18C560E7C0Ea0E084c516C62F5653";

  private ratesCacheInMemory = {} as UbxtBalanceCache;

  constructor(
    private keySvc: ExchangeKeyService,
    private rateSvc: ConversionRateService,
    private settingsSvc: SettingsService,
    private readonly httpService: HttpService,
    private proxyFactoryService: ProxyFactoryService,
    @InjectModel(Evolution.name) private EvolutionModel: Model<Evolution> // TODO: inject this to implement cache invalidation @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getCompatibleExchanges(): Promise<string[]> {
    return this.settingsSvc.getCompatibleExchanges();
  }

  async getUbxtBalance(userId: string): Promise<UbxtBalance> {
    let toReturn = {} as UbxtBalance;

    // FIXME: remove this old caching
    if (
      !this.ratesCacheInMemory.timestamp ||
      (this.ratesCacheInMemory.timestamp && new Date().getTime() > this.ratesCacheInMemory.timestamp + 86400000)
    ) {
      const ubxtToBtcConversionRate = await this.httpService
        .get(`${this.apiCoingeckoUrl}?contract_addresses=${this.ubxtContract}&vs_currencies=btc`)
        .toPromise()
        .then((res) => Object.values(res.data)[0]);

      const rates = await this.rateSvc.getConversionRates(["BTC"]);

      const btceur = rates.BTC.EUR;
      const btcusd = rates.BTC.USD;

      this.ratesCacheInMemory = {
        timestamp: new Date().getTime(),
        ubxtToBtcConversionRate: ubxtToBtcConversionRate["btc"],
        btcToUsdConversionRate: btcusd,
        btcToEurConversionRate: btceur,
      };
    }

    const keyCredentials = await this.keySvc.getDecryptedExchangeCredentials(userId);
    if (!keyCredentials || keyCredentials.length === 0) {
      return toReturn;
    }

    const ubxtExchanges = keyCredentials.filter((key) => key.exchangeName === "ftx" || key.exchangeName === "kucoin");
    if (ubxtExchanges.length === 0) {
      return toReturn;
    }
    const ubxtBalances = await Promise.all(
      ubxtExchanges.map((key) => {
        if (key.exchangeName === "ftx") {
          const ftxProxy = this.proxyFactoryService.setExchangeProxy(key.exchangeName);
          return ftxProxy.getTotalBalance(key.id, userId, key.credentials).then((r) => {
            return r.totalBalances.UBXT ?? 0; // avoid null propagation when summing UBXT balance
          });
        }
        if (key.exchangeName === "kucoin") {
          const kucoinProxy = this.proxyFactoryService.setExchangeProxy(key.exchangeName);
          return kucoinProxy.getTotalBalance(key.id, userId, key.credentials).then((r) => {
            return r.totalBalances.UBXT ?? 0; // avoid null propagation when summing UBXT balance
          });
        }
        return Promise.resolve(0);
      })
    );
    // this.logger.debug(`ubxt bal: ${JSON.stringify(ubxtBalances)}`);
    const ubxtBalance = ubxtBalances.reduce((a, b) => a + b, 0);
    const convertedInBtcBalance = ubxtBalance * this.ratesCacheInMemory.ubxtToBtcConversionRate;
    const convertedInUsdBalance = convertedInBtcBalance * this.ratesCacheInMemory.btcToUsdConversionRate;
    const convertedInEurBalance = convertedInBtcBalance * this.ratesCacheInMemory.btcToEurConversionRate;

    toReturn = {
      ubxt: ubxtBalance,
      btc: convertedInBtcBalance,
      usd: convertedInUsdBalance,
      eur: convertedInEurBalance,
    };

    return toReturn;
  }

  getPortforlioFilterAll(userId: string): Promise<PortfolioFiltered> {
    return this.getPortforlioSummary(userId);
  }

  getPortforlioFiltered(userId: string, keynameFilter: string, size?: number): Promise<PortfolioFiltered> {
    if (!keynameFilter) {
      return Promise.resolve({
        aggregated: BtcAmount.Zero,
        distribution: new DistributionOverview(),
      } as PortfolioFiltered);
    }
    return this.getPortforlioSummary(userId, keynameFilter.split(","), false, size);
  }

  async getPortforlioEvolution(userId: string, start: Date, end: Date, account?: string[]): Promise<PortfolioEvolution> {
    const toReturn: PortfolioEvolution = {
      accounts: [],
      aggregated: [],
    };

    const match: { [k: string]: any } = {
      user: mongoose.Types.ObjectId(userId),
      eur: { $ne: null },
      usd: { $ne: null },
      btc: { $ne: null },
      realDate: {
        $gte: start,
        $lte: end,
      },
    };

    const nowTime = new Date().getTime();
    const aggrePeriod = (end ? end.getTime() : nowTime) - (start ? start.getTime() : nowTime); // in milliseconds

    if (aggrePeriod > 2 * 24 * 3600 * 1000) {
      // weekly, or more
      match["$expr"] = {
        $lt: [{ $strLenCP: "$date" }, 12],
      };
    } else {
      // daily
      match["$expr"] = {
        $gt: [{ $strLenCP: "$date" }, 12],
      };
    }

    if (account && account.length > 0) {
      match.account = {
        $in: [...account].map((a) => mongoose.Types.ObjectId(a)),
      };
    }

    const results = await this.EvolutionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { account: "$account", exchange: "$exchange" },
          data: { $push: "$$ROOT" },
        },
      },
    ]);

    toReturn.accounts = results.map<AccountsEvolution>((result) => {
      /* eslint-disable no-shadow */
      const { account, exchange } = result._id;
      const data = result.data.map((element) => {
        const { date, realDate, btc, eur, usd } = element;
        return { date, realDate, btc, eur, usd };
      });
      return { account, exchange, data };
    });

    const aggregatedData = results.map((result) => result.data);
    const dates = [...new Set([].concat(...aggregatedData.map((data) => data.map((element) => element.date))))];
    toReturn.aggregated = dates.map<EvolutionData>((date) => {
      const dayData = {
        date,
        btc: 0,
        eur: 0,
        usd: 0,
      };
      aggregatedData.forEach((account) =>
        account.forEach((day) => {
          if (day.date === date) {
            dayData.btc += Number(day.btc) ? day.btc : 0;
            dayData.eur += Number(day.eur) ? day.eur : 0;
            dayData.usd += Number(day.usd) ? day.usd : 0;
          }
        })
      );
      return dayData;
    });

    return toReturn;
  }

  @On("key-added")
  async saveTodayAccountValue({ userId, exchange, keyId, keyName }: AccountToUpdate) {
    const portfolioSummary = await this.getPortforlioSummary(userId, [keyName], true);
    const isError = portfolioSummary.accounts && portfolioSummary.accounts[0].error;
    const { btc, eur, usd } = portfolioSummary.aggregated;
    const dateHourly = moment().format("YYYY-MM-DD HH:00"); // 2021-10-22 14:00
    const dateDaily = moment().format("YYYY-MM-DD"); // 2021-10-22
    const realDate = new Date();
    this.logger.debug(`Upsert portfolio evolution for ${dateHourly} key ${keyId} (btc,eu,usd)=${btc} ${eur} ${usd}`);

    if (!isError) {
      await this.EvolutionModel.updateOne(
        { date: dateHourly, user: userId, account: keyId },
        { exchange, date: dateHourly, realDate, user: userId, account: keyId, btc, eur, usd },
        { upsert: true }
      )
        .then((res) => this.logger.debug(`${keyName} account value saved for date-time ${dateHourly}.`))
        .catch((err) => this.logger.error(`"Key-Added" hourly event failed for key ${keyName}`));
      await this.EvolutionModel.updateOne(
        { date: dateDaily, user: userId, account: keyId },
        { exchange, date: dateDaily, realDate, user: userId, account: keyId, btc, eur, usd },
        { upsert: true }
      )
        .then((res) => this.logger.debug(`${keyName} account value saved for day ${dateDaily}.`))
        .catch((err) => this.logger.error(`"Key-Added" daily event failed for key ${keyName}`));
    }
  }

  // utils to set in a shared one depending of job refacto
  public static tryPositiveParseInt(value: string, defaultValue: number): number {
    const parsedValue = parseInt(value, 10);
    if (parsedValue < 0 || Number.isNaN(parsedValue)) {
      // Failed to parse. Return the default value.
      return defaultValue;
    }
    // Return the parsed value.
    return parsedValue;
  }

  async runPortforlioEvolutionTask() {
    this.logger.log(`run cex evolution update manually`);
    this.portforlioEvolutionTask();
  }

  @Cron("0 1,10,18 * * *") // run it at 1AM, 10AM and 6PM
  async portforlioEvolutionTask() {
    this.logger.log(`starting job portforlioEvolutionTask`);
    const start = new Date();
    const keys = await this.keySvc.getAllDecryptedExchangeCredentials();
    const taskSleep = PortfolioService.tryPositiveParseInt(process.env.PORTFOLIO_EVOLUTION_TASK_SLEEP_MS, 0);
    const taskPacket = PortfolioService.tryPositiveParseInt(process.env.PORTFOLIO_EVOLUTION_TASK_PACKET, 0);
    this.logger.debug(`portforlioEvolutionTask PORTFOLIO_EVOLUTION_TASK_SLEEP_MS ${taskSleep}`);
    this.logger.debug(`portforlioEvolutionTask PORTFOLIO_EVOLUTION_TASK_PACKET ${taskPacket}`);

    let i = 0;

    for (const key of keys) {
      const { userId, exchangeName, id, keyName, valid } = key;
      if (valid) {
        // can't request for invalid keys
        i += 1;
        if (taskSleep > 0) {
          if (i === taskPacket) {
            i = 0;
            this.logger.debug(`portforlioEvolutionTask before waiting ${new Date()}`);
            await timer(taskSleep).pipe(take(1)).toPromise();
            this.logger.debug(`portforlioEvolutionTask after waiting ${new Date()}`);
          }
        }
        try {
          await this.saveTodayAccountValue({ userId, exchange: exchangeName, keyId: id, keyName });
        } catch (e) {
          this.logger.debug(`portforlioEvolutionTask saveTodayAccountValue-error: ${e.message}`);
        }
      }
    }

    const execTime = new Date().getTime() - start.getTime();
    this.logger.log(`end of job portforlioEvolutionTask ${execTime} msec`);
  }

  /**
   * returns coin balances (converted to btc,eur,usd) + display aggregated per exchange + total aggregated
   * @param userId
   * @param keynameFilter : if null, filter all. If set, filters on keynames.
   * @param aggregatedOnly : (false by default): computes potfolio distribution. If true: does not compute coin distribution.
   */
  async getPortforlioSummary(
    userId: string,
    keynamesFilter?: string[],
    aggregatedOnly?: boolean,
    take?: number,
    admin?: boolean
  ): Promise<PortfolioSummary | any> {
    const toReturn = new PortfolioSummary();
    let keyCredentials = await this.keySvc.getDecryptedExchangeCredentials(userId, keynamesFilter);
    if (!keyCredentials || keyCredentials.length === 0) {
      return toReturn;
    }

    keyCredentials = keyCredentials.filter((x) => x.valid === true); // Can't request for invalid KEYS
    const startTime = performance.now();
    const getBalances = keyCredentials.map(async (acc) => {
      const { id, exchangeName, credentials } = acc;
      const proxy = this.proxyFactoryService.setExchangeProxy(exchangeName);
      credentials.useLoadBalancer = true;
      let totalBalance = await proxy.getTotalBalance(id, userId, credentials);
      if (exchangeName === "kucoin-future") {
        totalBalance = await proxy.getFreeBalance(id, userId, credentials);
      }
      // if (totalBalance.error) {
      //   credentials.useLoadBalancer = false;
      //   totalBalance = await proxy.getTotalBalance(id, userId, credentials);
      // }
      return totalBalance;
    });

    let getBalancesRes = await Promise.all(getBalances);
    const endTime = performance.now();
    this.logger.log(`FETCH BALANCE: userID: ${userId} took: ${endTime - startTime} milliseconds`);
    // this.logger.debug(`getPortforlioSummary getBalancesRes ${userId} ${JSON.stringify(getBalancesRes)}`);

    getBalancesRes = replaceCoinBalance(replaceCoinBalance(getBalancesRes, "IOTA", "MIOTA"), "BQX", "VGX");
    if (admin) {
      return getBalancesRes;
    }

    let uniqueCurrencies = ignoreLocked(findUniqueCurrencies(getBalancesRes));
    uniqueCurrencies = [...new Set(["BTC", ...uniqueCurrencies])]; // add btc prior to fetching exchange rates
    let rates = await this.rateSvc.getConversionRates(uniqueCurrencies);

    rates = fixCryptoRates(rates);
    this.logger.debug(`coinRates ${JSON.stringify(rates)}`);

    const btcRates = selectBtcRates(rates);
    // this.logger.debug(`btcRates ${JSON.stringify(btcRates)}`);

    for (let i = 0; i < keyCredentials.length; i += 1) {
      const convertedAccount = this.computeBtcConversion(getBalancesRes[i].totalBalances, btcRates, rates.BTC.EUR, rates.BTC.USD);

      toReturn.accounts.push({
        id: keyCredentials[i].id,
        name: keyCredentials[i].keyName,
        exchange: keyCredentials[i].exchangeName,
        subAccounts: [],
        total: convertedAccount,
        error: !!getBalancesRes[i].error,
      });

      let convertedSubAccount = [];
      if (getBalancesRes[i].subAccountBalances && getBalancesRes[i].subAccountBalances.length > 0) {
        convertedSubAccount = getBalancesRes[i].subAccountBalances.map((sub) => {
          return {
            [sub.nickname]: { ...this.computeBtcConversion(sub.balances, btcRates, rates.BTC.EUR, rates.BTC.USD) },
          };
        });
        toReturn.accounts[i].subAccounts.push(
          getBalancesRes[i].subAccountBalances.map((sub, j) => {
            return {
              nickname: sub.nickname,
              total: convertedSubAccount[j][sub.nickname],
            };
          })
        );
      }
    }

    // compute aggregated total
    const aggregated = toReturn.accounts
      .map((a) => a.total)
      .reduce<BtcAmount>((prev, curr) => {
        return new BtcAmount({
          btc: prev.btc + curr.btc,
        });
      }, BtcAmount.Zero);
    aggregated.eur = aggregated.btc * rates.BTC.EUR;
    aggregated.usd = aggregated.btc * rates.BTC.USD;
    toReturn.aggregated = aggregated;

    // If aggregatedOnly is true, then we return only the aggregated values
    if (!aggregatedOnly) {
      toReturn.distribution = computeDistribution(
        getBalancesRes.map((r) => r.totalBalances),
        uniqueCurrencies,
        btcRates,
        rates.BTC.EUR,
        rates.BTC.USD,
        aggregated.btc,
        take
      );
    }
    toReturn.ignoredCurrencies = [];

    return toReturn;
  }

  private computeBtcConversion(balance: PartialBalances, rates: CurrencyRate<number>, btceur: number, btcusd: number): BtcAmount {
    // this.logger.debug(`computeBtcConversion for balnces ${JSON.stringify(balance)}`);
    // for all non zero balances convert all to btc then sum up
    const nonZeroAndNonIgnoredCurrencies = findNonZeroAndNonIgnoredCurrencies(balance);

    // sum all btc
    let totalBtc = 0;
    nonZeroAndNonIgnoredCurrencies.forEach((curr) => {
      const curBal = balance[curr.toLowerCase()] || balance[curr.toUpperCase()];
      // this.logger.debug(`computeBtcConversion curBal ${curr}: ${curBal}`);

      const curRate = rates[curr.toLowerCase()] || rates[curr.toUpperCase()];
      // this.logger.debug(`computeBtcConversion curRate ${curRate}`);

      if (curRate) {
        // ignore null rates (avoid null sum)
        const btcConverted = curBal * curRate;
        totalBtc += btcConverted;
      }
    });
    // convert btc to eur and usd
    const totalEur = totalBtc * btceur;
    const totalUsd = totalBtc * btcusd;

    return new BtcAmount({
      btc: totalBtc,
      eur: totalEur,
      usd: totalUsd,
    });
  }
}
