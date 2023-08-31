import { Injectable, HttpService, Logger, CACHE_MANAGER, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import SettingsDataService from "src/settings/services/settings.data.service";
import { CurrentPriceSummary } from "./types";
import ExchManagerService from "./exchanges/exch-manager.service";

@Injectable()
export default class CurrentPriceService {
  private readonly logger = new Logger(CurrentPriceService.name);

  private ttlSeconds = 120000;

  static readonly key = "_getMultiplePriceSummaries";

  constructor(
    private readonly httpService: HttpService,
    private readonly settingsDataService: SettingsDataService,
    private readonly exchManagerService: ExchManagerService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  async getCurrentPriceSummary(exchange, symbol: string): Promise<CurrentPriceSummary> {
    let mappedExchange = exchange;
    let pairSymbol = symbol;
    if (exchange === "binance-future") {
      mappedExchange = "binance";
    } else if (exchange === "kucoin-future") {
      mappedExchange = "kucoin";
    } else if (exchange === "ftx-future") {
      mappedExchange = "ftx";
    } else if (exchange === "coinbasepro") {
      mappedExchange = "coinbase";
      pairSymbol = pairSymbol.replace("-", "");
    }

    if (mappedExchange === "kucoin" || mappedExchange === "ftx") {
      if (mappedExchange === "ftx") {
        pairSymbol = pairSymbol.replace("|", "/");
      }
      const price = await this.exchManagerService.getSingleMarket(mappedExchange, pairSymbol);
      return price;
    }

    const headersRequest = {
      "X-CW-API-Key": `${process.env.CRYPTOWATCH_API_PUB}`,
    };
    const apiUrl = `${process.env.CRYPTOWATCH_API}/markets/${mappedExchange}/${pairSymbol}/summary`;
    this.logger.debug(`CRYPTOWATCH_API ${apiUrl}`);

    const resp = await this.httpService
      .get<CurrentPriceSummary>(apiUrl, { headers: headersRequest })
      .toPromise();
    return resp.data;
  }

  @Cron(CronExpression.EVERY_MINUTE) // Cron every 5 seconds
  async fetchExchangesSummaries() {
    // this.logger.log(`fetchExchangesSummaries cron job..`); //too verbous log since it's called very often

    try {
      const symbols = await this.settingsDataService.getMarketSettings();
      const apiUrl = `${process.env.CRYPTOWATCH_API}/markets/summaries`;
      const res = await this.httpService
        .get(apiUrl, {
          headers: {
            "X-CW-API-Key": `${process.env.CRYPTOWATCH_API_PUB}`,
          },
        })
        .toPromise();
      const { result } = res.data;

      const summaries = symbols
        .filter(({ exchange, symbolForData, baseCurrency, quoteCurrency, tradingAllowed }) => {
          const marketSymbol = symbolForData;
          if (exchange === "ftx") {
            return false;
            // marketSymbol = `${baseCurrency}${quoteCurrency}`.toLowerCase();
          }
          const market = `${exchange}:${marketSymbol}`;
          return tradingAllowed && result[market];
        })
        .map(({ exchange, symbolForData, baseCurrency, quoteCurrency, symbol, symbolLabel }) => {
          const marketSymbol = symbolForData;
          // if (exchange === "ftx") {
          //   marketSymbol = `${baseCurrency}${quoteCurrency}`.toLowerCase();
          // }
          const market = `${exchange}:${marketSymbol}`;
          return {
            exchange,
            baseCurrency,
            quoteCurrency,
            symbolForData,
            symbol,
            symbolLabel,
            ...result[market],
          };
        });

      let kucoinSummaries = await this.exchManagerService.getAllMarkets("kucoin");
      kucoinSummaries = kucoinSummaries.map((item) => item.result);
      let kucoinFutureSummaries = await this.exchManagerService.getAllMarkets("kucoin-future");
      kucoinFutureSummaries = kucoinFutureSummaries.map((item) => item.result);
      let ftxSummaries = await this.exchManagerService.getAllMarkets("ftx");
      ftxSummaries = ftxSummaries.map((item) => item.result);

      summaries.push(...kucoinSummaries);
      summaries.push(...kucoinFutureSummaries);
      summaries.push(...ftxSummaries);

      this.cache.set(CurrentPriceService.key, summaries, this.ttlSeconds);
      // this.logger.log(`fetchExchangesSummaries cron job, cache was set`); //too verbous log since it's called very often

      return summaries;
    } catch (e) {
      this.logger.warn(`Fetching price summaries failed`);
      this.logger.error(e.message);
      return [];
    }
  }

  async getExchangeSummary(selectedExchange: string) {
    let updatedExchange = selectedExchange;
    if (updatedExchange === "binance-future") {
      updatedExchange = "binance";
    } else if (updatedExchange === "ftx-future") {
      updatedExchange = "ftx";
    }
    const cached = await this.cache.get(CurrentPriceService.key);
    const summaries = cached || (await this.fetchExchangesSummaries());

    const items = summaries.filter(({ exchange }) => updatedExchange === exchange);
    const mappedItems = items.map((item) => ({ ...item, exchange: selectedExchange }));
    return mappedItems;
  }
}
