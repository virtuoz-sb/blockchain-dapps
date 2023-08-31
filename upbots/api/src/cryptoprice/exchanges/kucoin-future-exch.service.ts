import { Injectable, HttpService, Logger } from "@nestjs/common";

@Injectable()
export default class KucoinFutureExchService {
  private readonly logger = new Logger(KucoinFutureExchService.name);

  private readonly apiBaseUrl = "https://api-futures.kucoin.com"; // `${process.env.KUCOIN_EXCH_API_URL}`;

  constructor(private readonly httpService: HttpService) {}

  async getAllTicker() {
    const exchange = "kucoin-future";
    const apiUrl = `${this.apiBaseUrl}/api/v1/contracts/active`;
    try {
      const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();
      const { data } = resp.data;
      const summaries = data.map((item) => {
        return {
          result: {
            exchange,
            baseCurrency: item.baseCurrency,
            quoteCurrency: item.quoteCurrency,
            symbolForData: item.symbol.toLowerCase(),
            symbol: item.symbol,
            symbolLabel: item.symbol,
            price: {
              last: parseFloat(item.lastTradePrice),
              high: parseFloat(item.highPrice),
              low: parseFloat(item.lowPrice),
              change: {
                percentage: parseFloat(item.priceChgPct),
                absolute: parseFloat(item.priceChg),
              },
            },
            volume: parseFloat(item.volumeOf24h),
            volumeQuote: parseFloat(item.turnoverOf24h),
          },
        };
      });
      return summaries;
    } catch (e) {
      return [];
    }
  }

  async getTicker(symbol: string) {
    const apiUrl = `${this.apiBaseUrl}/api/v1/market/orderbook/level1?symbol=${symbol.toUpperCase()}`;

    try {
      const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();
      const { data } = resp.data;
      return {
        result: {
          price: {
            last: parseFloat(data.price),
            high: parseFloat(data.price),
            low: parseFloat(data.price),
            change: {
              percentage: 0,
              absolute: 0,
            },
          },
          volume: 0,
          volumeQuote: 0,
        },
      };
    } catch (e) {
      return {
        result: {
          price: {
            last: 0,
            high: 0,
            low: 0,
            change: {
              percentage: 0,
              absolute: 0,
            },
          },
          volume: 0,
          volumeQuote: 0,
        },
      };
    }
  }

  // should be updated
  async getOrderBook(symbol: string) {
    const apiUrl = `${this.apiBaseUrl}/api/v1/market/orderbook/level2_100?symbol=${symbol.toUpperCase()}`;
    const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();

    const { data } = resp.data;
    return data;
  }

  // should be updated
  async getOrderHistories(symbol: string) {
    const apiUrl = `${this.apiBaseUrl}/api/v1/market/histories?symbol=${symbol.toUpperCase()}`;
    const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();

    const { data } = resp.data;
    const result = data.map((item: any) => {
      const time = parseInt((item.time / 10 ** 9).toFixed(0), 10);
      return [0, time, parseFloat(item.price), parseFloat(item.size)];
    });

    return { result };
  }
}
