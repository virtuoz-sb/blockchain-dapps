import { Injectable, HttpService, Logger, CACHE_MANAGER, Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { PriceHistoryResponse } from "../types";

@Injectable()
export default class CoinGeckoPriceService {
  private readonly logger = new Logger(CoinGeckoPriceService.name);

  constructor(private readonly httpService: HttpService, @Inject(CACHE_MANAGER) private cache: Cache) {}

  async fetchExchangesSummaries(exchange: string) {
    const apiUrl = `${process.env.COINGECKO_URL}/api/v3/exchanges/${exchange}/tickers`;

    this.logger.debug(`COINGECKO_API ${apiUrl}`);

    const resp = await this.httpService.get<any>(apiUrl, {}).toPromise();

    const { tickers } = resp.data;
    const summaries = tickers.map((item) => {
      return {
        result: {
          exchange,
          symbolForData: `${item.base}-${item.target}`.toLowerCase(),
          symbol: `${item.base}-${item.target}`.toUpperCase(),
          symbolLabel: `${item.base}-${item.target}`.toUpperCase(),
          price: {
            last: item.last,
            high: null,
            low: null,
            change: {
              percentage: null,
              absolute: null,
            },
          },
          volume: item.volume,
          volumeQuote: null,
        },
      };
    });
    return summaries;
  }

  async getCryptoPriceHistory(crypto: string, fiat: string): Promise<PriceHistoryResponse> {
    const cacheKey = `get_gecko_coin_history_${crypto}_${fiat}`;
    const primaryResult = await this.cache.get(cacheKey);

    if (primaryResult) {
      return JSON.parse(primaryResult) as PriceHistoryResponse;
    }
    const apiUrl = `${process.env.COINGECKO_URL}/api/v3/coins/${crypto}/market_chart?vs_currency=${fiat}&days=1&interval=hourly`;
    const res = await this.httpService.get(apiUrl).toPromise();
    this.cache.set(cacheKey, JSON.stringify(res.data), { ttl: 60 });
    return res.data;
  }
}
