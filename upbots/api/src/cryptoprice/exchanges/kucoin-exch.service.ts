import { Injectable, HttpService, Logger } from "@nestjs/common";

@Injectable()
export default class KucoinExchService {
  private readonly logger = new Logger(KucoinExchService.name);

  private readonly apiBaseUrl = "https://api.kucoin.com"; // `${process.env.KUCOIN_EXCH_API_URL}`;

  constructor(private readonly httpService: HttpService) {}

  async getAllTicker() {
    const exchange = "kucoin";
    const apiUrl = `${this.apiBaseUrl}/api/v1/market/allTickers`;
    try {
      const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();
      const {
        data: { ticker },
      } = resp.data;
      const summaries = ticker.map((item) => {
        return {
          result: {
            exchange,
            symbolForData: item.symbol.toLowerCase(),
            symbol: item.symbol,
            symbolLabel: item.symbol,
            price: {
              last: parseFloat(item.last),
              high: parseFloat(item.high),
              low: parseFloat(item.low),
              change: {
                percentage: parseFloat(item.changeRate),
                absolute: parseFloat(item.changePrice),
              },
            },
            volume: parseFloat(item.vol),
            volumeQuote: parseFloat(item.volValue),
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

  async getOrderBook(symbol: string) {
    const apiUrl = `${this.apiBaseUrl}/api/v1/market/orderbook/level2_100?symbol=${symbol.toUpperCase()}`;
    const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();

    const { data } = resp.data;
    return data;
  }

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
