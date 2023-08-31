import { Injectable, Logger } from "@nestjs/common";
import CryptoCompareMultiPriceService from "./cryptocompare-multi-price.service";
import { ExchangeRates } from "../types";

@Injectable()
export default class ConversionRateService {
  private readonly logger = new Logger(ConversionRateService.name);

  constructor(private priceService: CryptoCompareMultiPriceService) {
    this.logger.warn(`DI settings: please use the cached version instead of this class`);
  }

  async getConversionRates(currencies: string[]): Promise<ExchangeRates> {
    this.logger.debug(`getConversionRates with cache disabled ${currencies}`);

    return this.priceService.listCryptoPrices(currencies, ["BTC", "EUR", "USD"]);
  }

  getSymbolsEstimatedPrices(bases: string[], quotes: string[]): Promise<ExchangeRates> {
    this.logger.debug(`getSymbolEstimatedPrice with cache disabled ${bases}/${quotes}`);

    return this.priceService.listCryptoPrices(bases, quotes);
  }
}
