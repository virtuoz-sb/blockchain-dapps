/* eslint-disable consistent-return */

import { Injectable, Logger } from "@nestjs/common";
import SettingsDataService from "./settings.data.service";
import { AllowedExchangeWithPairsDto, ExchangeSettingsReponse, TradeFormatsDto } from "../models/exchange-settings.dto";
import { PageSettingsDto } from "../models/page/page-settings";

@Injectable()
export default class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private settingsDataService: SettingsDataService) {}

  async getCompatibleExchanges(): Promise<string[]> {
    return this.settingsDataService.getCompatibleExchanges().then((res) => res.map((exchange) => exchange.name));
  }

  async getPagesSettings(): Promise<PageSettingsDto[]> {
    const settings = await this.settingsDataService.getPageSettings();
    return settings.map((page) => {
      const { name, path, comingSoon } = page;
      return { name, path, comingSoon };
    });
  }

  async getExchangesSettings(): Promise<ExchangeSettingsReponse> {
    const compatibleExchanges = await this.settingsDataService.getCompatibleExchanges();
    const settings = await this.settingsDataService.getMarketSettings();

    const tradingSettings = compatibleExchanges.map(
      (x) => ({ ...x, pairs: settings.filter((s) => s.exchange === x.name) } as AllowedExchangeWithPairsDto)
    );

    return {
      compatibleExchanges,
      tradingSettings,
    };
  }

  async getContractSize(exchange: string, base: string, quote: string): Promise<number> {
    return this.settingsDataService.getPairsContractSize(exchange, base.toUpperCase(), quote.toUpperCase());
  }

  async getOrderFormats(exchange: string, marketsFilter?: string[], symbolsFilter?: string[]): Promise<TradeFormatsDto> {
    const settings = await this.settingsDataService.getMarketSettings(false);

    const filteredOnExchange = settings.filter((s) => s.exchange === exchange);
    if (!filteredOnExchange || filteredOnExchange.length === 0) {
      return {} as TradeFormatsDto;
    }

    let pairs = filteredOnExchange;

    if (marketsFilter && marketsFilter.length > 0) {
      pairs = pairs.filter((pair) => marketsFilter.includes(pair.market));
    }
    if (symbolsFilter && symbolsFilter.length > 0) {
      pairs = pairs.filter((pair) => symbolsFilter.includes(pair.symbol));
    }

    const formatRules = pairs.reduce((acc, current) => {
      const { symbol, limits, precisionMode, precision } = current;
      return { ...acc, [current.market]: { symbol, limits, precisionMode, precision } };
    }, {}); // nested structure for backward compatibility with frontend logic on trade formats

    return { exchange, formatRules };
  }

  async getOrderFormatByCurrency(exchange: string, baseCurrency?: string, quoteCurrency?: string): Promise<TradeFormatsDto> {
    const settings = await this.settingsDataService.getMarketSettings(false);
    const filteredOnExchange = settings.filter((s) => s.exchange === exchange);
    if (!filteredOnExchange || filteredOnExchange.length === 0) {
      return {} as TradeFormatsDto;
    }

    let pairs = filteredOnExchange;

    if (baseCurrency && quoteCurrency) {
      pairs = pairs.filter((pair) => pair.baseCurrency === baseCurrency && pair.quoteCurrency === quoteCurrency);
    }

    const formatRules = pairs.reduce((acc, current) => {
      const { symbol, limits, precisionMode, precision } = current;
      return { ...acc, [current.market]: { symbol, limits, precisionMode, precision } };
    }, {}); // nested structure for backward compatibility with frontend logic on trade formats

    return { exchange, formatRules };
  }
}
