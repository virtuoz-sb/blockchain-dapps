import { Injectable, HttpService, HttpStatus, Logger } from "@nestjs/common";
import { CryptoPrice, CryptoDataOHLC, CryptoPriceService } from "../types/cryptoPrice";

@Injectable()
export default class CryptoWatchPriceService implements CryptoPriceService {
  private readonly logger = new Logger(CryptoWatchPriceService.name);

  constructor(private readonly httpService: HttpService) {}

  private lastCallCost = 0;

  private remaining = 1;

  private period = 86400;

  private fiats = ["EUR", "USD", "CHF"];

  // /**
  //  * Returns true when the price api should be called because price does not exist or is oudated (> 1 day).
  //  * Returns false when price is in cache and not outdated.
  //  * @param lastPrice
  //  */
  // isPriceOutdated(lastPrice: CryptoPrice): boolean {
  //   if (!lastPrice) {
  //     return true;
  //   }
  //   const difInMilisecs = Date.now() - lastPrice.Latest.time * 1000; // cryptowatch timestamp is in seconds
  //   const secondsBetweenDates = Math.abs(difInMilisecs / 1000);
  //   if (secondsBetweenDates > this.period) {
  //     return true;
  //   }
  //   return false; // you may hit the cache
  // }

  /*
  return OHLC array of array
  time
  open
  high
  low
  close
  volumeBase
  volumeQuote
  */
  async listCryptoPrices(baseCurrency: string, quoteCurrency: string, exchange?: string): Promise<CryptoPrice> {
    // In order to save some api call to cryptowatch we serve result from memory cache
    // beware that we could ask for another pair and that we should call the api if we don't have data in cache
    const asset = await this.findAsset(baseCurrency);
    const market = exchange || "kraken";

    if (asset) {
      if (this.fiats.includes(baseCurrency)) {
        return this.computeForFiats(baseCurrency, quoteCurrency, market);
      }
      return this.computeForCrypto(baseCurrency, quoteCurrency, market);
    }

    // If asset===false, will return empty crypto price which will be ignored
    const data: CryptoPrice = {
      Ignored: true,
      HasWarning: null,
      Message: null,
      RateLimit: null,
      Type: null,
      Response: null,
      Latest: null,
      LatestPreviousDay: null,
      Data: { Aggregated: null, DailyData: null, HourlyData: null, TimeFrom: null, TimeTo: null },
    };
    return data;
  }

  async computeForCrypto(baseCurrency: string, quoteCurrency: string, exchange: string): Promise<CryptoPrice> {
    const apiUrl = `${process.env.CRYPTOWATCH_API}/markets/${exchange}/${baseCurrency}${quoteCurrency}/ohlc?periods=${this.period}`;
    const headersRequest = {
      "X-CW-API-Key": `${process.env.CRYPTOWATCH_API_PUB}`,
    };
    let res: any;
    let replacedBtcByUsd = false;

    try {
      // Defensive approach, if any errors, ignores currency.
      this.logger.debug(`CRYPTOWATCH_API ${apiUrl}`);
      res = await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();
    } catch (err) {
      if (quoteCurrency.toUpperCase() === "BTC") {
        try {
          // Try to fetch prices for USD instead of BTC.
          const newUrl = `${process.env.CRYPTOWATCH_API}/markets/${exchange}/${baseCurrency}${"USD"}/ohlc?periods=${this.period}`;
          this.logger.debug(`CRYPTOWATCH_API ${newUrl}`);
          res = await this.httpService.get(newUrl, { headers: headersRequest }).toPromise();
          replacedBtcByUsd = true;
        } catch (error) {
          const data: CryptoPrice = {
            Ignored: true,
            HasWarning: null,
            Message: null,
            RateLimit: null,
            Type: null,
            Response: null,
            Latest: null,
            LatestPreviousDay: null,
            Data: { Aggregated: null, DailyData: null, HourlyData: null, TimeFrom: null, TimeTo: null },
          };
          return data;
        }
      }
    }

    this.lastCallCost = res.data.allowance.cost;
    this.remaining = res.data.allowance.remaining;
    this.logger.debug(`<-- CRYPTOWATCH_API ${apiUrl} cost:${this.lastCallCost} remaining:${this.remaining}`);
    const computedData = this.mapData(res.data.result[`${this.period}`], baseCurrency, quoteCurrency, exchange, false);

    if (replacedBtcByUsd) {
      // Convert results from USD into BTC in order to properly reply to the initial request
      const usdToBtc = await this.listCryptoPrices("USD", "BTC").then((r) => r.LatestPreviousDay.close);
      return {
        ...computedData,
        Latest: {
          ...computedData.Latest,
          open: computedData.Latest.open * usdToBtc,
          high: computedData.Latest.high * usdToBtc,
          low: computedData.Latest.low * usdToBtc,
          close: computedData.Latest.close * usdToBtc,
          conversionSymbol: "BTC",
        },
        LatestPreviousDay: {
          ...computedData.LatestPreviousDay,
          open: computedData.LatestPreviousDay.open * usdToBtc,
          high: computedData.LatestPreviousDay.high * usdToBtc,
          low: computedData.LatestPreviousDay.low * usdToBtc,
          close: computedData.LatestPreviousDay.close * usdToBtc,
          conversionSymbol: "BTC",
        },
        Data: {
          ...computedData.Data,
          DailyData: computedData.Data.DailyData.map((day) => {
            return {
              ...day,
              open: day.open * usdToBtc,
              high: day.high * usdToBtc,
              low: day.low * usdToBtc,
              close: day.close * usdToBtc,
            };
          }),
        },
      };
    }

    return computedData;
  }

  async computeForFiats(baseCurrency: string, quoteCurrency: string, exchange: string): Promise<CryptoPrice> {
    // Switch the pair combination for fiats (fiats rates are only availble quote/base instead of base/quote)
    const apiUrl = `${process.env.CRYPTOWATCH_API}/markets/${exchange}/${quoteCurrency}${baseCurrency}/ohlc?periods=${this.period}`;
    let res: any;

    try {
      // Defensive approach, if any errors, ignores currency.
      this.logger.debug(`CRYPTOWATCH_API ${apiUrl}`);
      const headersRequest = {
        "X-CW-API-Key": `${process.env.CRYPTOWATCH_API_PUB}`,
      };
      res = await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();
    } catch (err) {
      const data: CryptoPrice = {
        Ignored: true,
        HasWarning: null,
        Message: null,
        RateLimit: null,
        Type: null,
        Response: null,
        Latest: null,
        LatestPreviousDay: null,
        Data: { Aggregated: null, DailyData: null, HourlyData: null, TimeFrom: null, TimeTo: null },
      };
      return data;
    }

    this.lastCallCost = res.data.allowance.cost;
    this.remaining = res.data.allowance.remaining;
    this.logger.debug(`<-- CRYPTOWATCH_API ${apiUrl} cost:${this.lastCallCost} remaining:${this.remaining}`);
    return this.mapData(res.data.result[`${this.period}`], baseCurrency, quoteCurrency, exchange, true);
  }

  mapData(resData: any[], cryptoSymbol: string, fiat: string, exchange: string, inverseRate: boolean): CryptoPrice {
    // sort data
    // Inverts the pair combination for fiats (fiats rates are only availble quote/base) => inverse rate = 1/rate
    const sortedDailyAsc: CryptoDataOHLC[] = resData.map((r) => {
      return {
        time: r[0],
        open: inverseRate ? 1 / r[1] : r[1],
        high: inverseRate ? 1 / r[2] : r[2],
        low: inverseRate ? 1 / r[3] : r[3],
        close: inverseRate ? 1 / r[4] : r[4],
        volumefrom: r[5],
        volumeto: r[6],
        conversionType: cryptoSymbol,
        conversionSymbol: fiat,
      };
    });

    const latestTick = sortedDailyAsc[sortedDailyAsc.length - 1];

    const pairData: CryptoPrice = {
      HasWarning: null,
      Message: null,
      RateLimit: this.remaining,
      Type: null,
      Response: null,
      Latest: latestTick,
      LatestPreviousDay: sortedDailyAsc[sortedDailyAsc.length - 2],
      Data: {
        Aggregated: null,
        DailyData: sortedDailyAsc,
        HourlyData: null,
        TimeFrom: sortedDailyAsc[0].time,
        TimeTo: latestTick.time,
      },
    };
    return pairData;
  }

  async findAsset(baseCurrency: string): Promise<boolean> {
    const headersRequest = {
      "X-CW-API-Key": `${process.env.CRYPTOWATCH_API_PUB}`,
    };
    const apiUrl = `${process.env.CRYPTOWATCH_API}/assets/${baseCurrency}`;
    this.logger.debug(`CRYPTOWATCH_API ${apiUrl}`);

    try {
      await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();
      return true;
    } catch (err) {
      if (err.response.status === HttpStatus.NOT_FOUND) {
        return false;
      }
      throw new Error(err.response.data.error);
    }
  }
}
