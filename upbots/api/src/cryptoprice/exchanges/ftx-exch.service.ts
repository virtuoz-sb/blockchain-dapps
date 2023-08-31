import { Injectable, HttpService, Logger } from "@nestjs/common";

@Injectable()
export default class FtxExchService {
  private readonly logger = new Logger(FtxExchService.name);

  private readonly apiBaseUrl = "https://ftx.com"; // `${process.env.FTX_EXCH_API_URL}`;

  constructor(private readonly httpService: HttpService) {}

  async getAllMarkets() {
    const exchange = "ftx";
    const apiUrl = `${this.apiBaseUrl}/api/markets`;
    try {
      const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();
      const { result } = resp.data;

      const summaries = result.map((item) => {
        return {
          result: {
            exchange,
            symbolForData: item.name.toLowerCase(),
            symbol: item.name,
            symbolLabel: item.name,
            price: {
              last: item.price,
              high: item.price,
              low: item.price,
              change: {
                percentage: item.change1h,
                absolute: 0,
              },
            },
            volume: 0,
            volumeQuote: 0,
          },
        };
      });
      return summaries;
    } catch (e) {
      return [];
    }
  }

  async getSingleMarket(symbol: string) {
    const market = symbol.replace("/", "_");
    const apiUrl = `${this.apiBaseUrl}/api/markets/${market}`;

    try {
      const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();
      const { result } = resp.data;
      return {
        result: {
          price: {
            last: result.price,
            high: result.price,
            low: result.price,
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
    const market = symbol.replace("/", "_").toUpperCase();
    const apiUrl = `${this.apiBaseUrl}/api/markets/${market}/orderbook?depth=50`;
    const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();

    const { result } = resp.data;
    return result;
  }

  async getOrderHistories(symbol: string) {
    const market = symbol.replace("/", "_").toUpperCase();
    const apiUrl = `${this.apiBaseUrl}/api/markets/${market}/trades`;
    const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();

    const { result } = resp.data;
    const trades = result.map((item: any) => {
      const time = new Date(item.time).getTime();
      const timenum = parseInt((time / 10 ** 3).toFixed(0), 10);
      return [0, timenum, item.price, item.size];
    });

    return { result: trades };
  }
}
