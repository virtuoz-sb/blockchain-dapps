import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from "cache-manager";
import { ExchangeRates } from "../types";
import CryptoCompareMultiPriceService from "./cryptocompare-multi-price.service";

/**
 * implements ConversionRateService with caching.
 */
@Injectable()
export default class ConversionRateCacheService {
  private readonly logger = new Logger(ConversionRateCacheService.name);

  private key = "_getConversionRates";

  private outputRates = ["BTC", "EUR", "USD"];

  private ttlSeconds: number;

  private defaultTtlSeconds = 3600;

  constructor(
    private priceService: CryptoCompareMultiPriceService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private configService: ConfigService
  ) {
    this.ttlSeconds = this.configService.get<number>("CACHE_TTL") || this.defaultTtlSeconds;
    this.logger.debug(`ConversionRateCacheDecoratorService ctor, cache duration ttl ${this.ttlSeconds} secs`);
  }

  async getConversionRates(currencies: string[]): Promise<ExchangeRates> {
    const cached = await this.cache.get(this.key);
    this.logger.debug(`cached? ${cached}`);
    if (!cached) {
      const uniques = this.uniqueSorted(currencies);
      const freshValue = await this.priceService.listCryptoPrices(uniques, this.outputRates);
      await this.cache.set(
        this.key,
        {
          currencies: uniques,
          value: freshValue,
        },
        this.ttlSeconds
      );
      return freshValue;
    }
    // make sure all elements are in cache
    // maxlenght for fsyms reachable here -> adaptation needed
    // tsyms are limited to this outputRates = ["BTC", "EUR", "USD"]; therefore no immediate modifications
    const difference = currencies.filter((x) => !cached.currencies.includes(x));
    if (difference && difference.length > 0) {
      this.logger.debug(`cache hit: but requires new currencies ${difference}`);
      const extended = [...new Set([...difference, ...cached.currencies])];
      const freshValue = await this.priceService.listCryptoPrices(extended, this.outputRates);
      await this.cache.set<CachedRate>(
        this.key,
        {
          currencies: this.uniqueSorted(extended),
          value: freshValue,
        },
        this.ttlSeconds
      );
      return this.filterRates(freshValue, currencies);
    }
    this.logger.debug(`cache hit: (no new currency) ${difference}`);
    return this.filterRates(cached.value, currencies);
  }

  async getSymbolsEstimatedPrices(bases: string[], quotes: string[]): Promise<ExchangeRates> {
    return this.priceService.listCryptoPrices(bases, quotes);
  }

  // Retuns only the exchange rates for the provided filter
  private filterRates(rates: ExchangeRates, filter: string[]): ExchangeRates {
    let x = {};
    Object.keys(rates).forEach((coin) => {
      if (filter.includes(coin)) {
        x = {
          ...x,
          [coin]: rates[coin],
        };
      }
    });
    this.logger.debug(`filterRates ${JSON.stringify(x)}`);

    return x;
  }

  private uniqueSorted(currencies: string[]): string[] {
    const sorted = currencies.sort();
    const x = [...new Set([...sorted])];
    return x;
  }
}

type CachedRate = {
  currencies: string[];
  value: ExchangeRates;
};
