import { Injectable, HttpService, HttpStatus, HttpException } from "@nestjs/common";

import { CryptoPrice, CryptoDataOHLC, CryptoPriceService } from "../types/cryptoPrice";

@Injectable()
export default class CryptoComparePriceService implements CryptoPriceService {
  constructor(private readonly httpService: HttpService) {}

  private lastCall: number = Date.now();

  private lastResults: { [pair: string]: CryptoPrice } = {};

  private durationBetweenCallInSeconds = 120;

  async listCryptoPrices(baseCurrency: string, quoteCurrency: string): Promise<CryptoPrice> {
    return Promise.reject(new Error("err 63: deprecated library. please use another price provider"));
    const dif = Date.now() - this.lastCall;
    const secondsBetweenDates = Math.abs(dif / 1000);
    // In order to save some api call to cryptocompare we serve result from memory cache
    // beware that we could ask for another pair and that we should call the api if we don't have data in cache
    if (secondsBetweenDates >= this.durationBetweenCallInSeconds || !this.lastResults[`${baseCurrency}/${quoteCurrency}`]) {
      const headersRequest = {
        Apikey: `${process.env.CRYPTO_COMPARE_API_KEY}`,
      };
      const apiUrl = `${process.env.CRYPTO_COMPARE_API}/data/v2/histohour?fsym=${baseCurrency}&tsym=${quoteCurrency}&limit=1000`;
      const res = await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();

      if (!res) {
        throw new HttpException("No CryptoPrices Found", HttpStatus.NO_CONTENT);
      }

      this.lastCall = Date.now();
      return this.mapData(res.data, baseCurrency, quoteCurrency);
    }
    return this.lastResults[`${baseCurrency}/${quoteCurrency}`];
  }

  mapData(resData: any, cryptoSymbol: string, fiat: string): CryptoPrice {
    // sort data
    const sortedHourlyAsc: CryptoDataOHLC[] = (resData.Data.Data as CryptoDataOHLC[]).sort((prev, cur) => prev.time - cur.time);
    // const latestTick = sortedHourlyAsc[sortedHourlyAsc.length - 1];
    const res = this.mapToDaily(sortedHourlyAsc);
    // this.getPercentVariation(sortedHourlyAsc, latestTick);
    const pairData: CryptoPrice = {
      HasWarning: resData.HasWarning,
      Message: resData.Message,
      RateLimit: resData.RateLimit,
      Type: resData.Type,
      Response: resData.Response,
      Latest: res.latest,
      LatestPreviousDay: res.latestPreviousDay,
      Data: {
        Aggregated: resData.Data.Aggregated,
        DailyData: res.dailyData,
        HourlyData: sortedHourlyAsc,
        TimeFrom: resData.Data.TimeFrom,
        TimeTo: resData.Data.TimeTo,
      },
    };
    this.lastResults[`${cryptoSymbol}/${fiat}`] = pairData;
    return pairData;
  }

  mapToDaily(
    orderedHourly: CryptoDataOHLC[]
    // begin: number
  ): {
    dailyData: CryptoDataOHLC[];
    latest: CryptoDataOHLC;
    latestPreviousDay: CryptoDataOHLC;
  } {
    // const currentDate = new Date(begin * 1000);
    // const counter = 0;
    const dailyTick: { [timestamp: number]: CryptoDataOHLC[] } = {};
    const days: number[] = [];
    let res: CryptoDataOHLC[] = [];
    const latestTick = orderedHourly[orderedHourly.length - 1];
    const latestTickDate = new Date(latestTick.time * 1000);
    let latestTickForPreviousDay: CryptoDataOHLC = orderedHourly[orderedHourly.length - 25];
    // order tick by day
    orderedHourly.forEach((curVal) => {
      const tickDate = new Date(curVal.time * 1000);
      const parsedUnixTime = +new Date(tickDate.toDateString()) / 1000;
      if (!days.includes(parsedUnixTime)) {
        days.push(parsedUnixTime);
      }

      if (dailyTick[parsedUnixTime]) {
        dailyTick[parsedUnixTime].push(curVal);
      } else {
        dailyTick[parsedUnixTime] = [curVal];
      }

      // calculate PercentVariation compare to previous day
      if (latestTick.time - curVal.time < 86400) {
        // here we could be in the previous day range
        if (latestTickDate.getDay() === tickDate.getDay() + 1) {
          // here we are one day before the latestTick
          // we have to find the latest tick for the previous day
          if (curVal.time > latestTickForPreviousDay.time) {
            latestTickForPreviousDay = curVal;
          }
        }
      }
    });

    // for each day sum it up
    days.forEach((uxTime) => {
      const average = dailyTick[uxTime].reduce((prev, cur, id, { length }) => {
        return {
          high: cur.high > prev.high ? cur.high : prev.high,
          low: cur.low < prev.low ? cur.low : prev.low,
          time: uxTime,
          volumefrom: prev.volumefrom + cur.volumefrom / length,
          volumeto: prev.volumeto + cur.volumeto / length,
          open: 0,
          close: 0,
          conversionSymbol: cur.conversionSymbol,
          conversionType: cur.conversionType,
        };
      });
      average.open = dailyTick[uxTime][0].open;
      average.close = dailyTick[uxTime][dailyTick[uxTime].length - 1].close;
      res.push(average);
    });
    res = res.sort((prev, cur) => prev.time - cur.time);
    return {
      dailyData: res,
      latest: latestTick,
      latestPreviousDay: latestTickForPreviousDay,
    };
  }
}
