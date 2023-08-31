/* eslint-disable consistent-return */

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import allowedExchanges from "../../db_seeds/seeds/exchange-allowed.seed";
import { AllowedExchange } from "../models/exchange-settings.dto";
import { MarketPairSetting, MarketPairSettingModel } from "../models/market-pair-settings.model";
import PageSettings from "../models/page/page-settings";
import PageSettingsModel from "../models/page/page-settings.model";
import VarSettings from "../models/variable/var-settings";
import VarSettingsModel from "../models/variable/var-settings.model";

@Injectable()
export default class SettingsDataService {
  private readonly logger = new Logger(SettingsDataService.name);

  constructor(
    @InjectModel(MarketPairSettingModel.name) private marketPairModel: Model<MarketPairSettingModel>,
    @InjectModel(PageSettingsModel.name) private pageSettingsModel: Model<PageSettingsModel>,
    @InjectModel(VarSettingsModel.name) private varSettingsModel: Model<VarSettingsModel>,
    private configService: ConfigService
  ) {}

  async getMarketSettings(isFiltering = true): Promise<MarketPairSetting[]> {
    const r = await this.marketPairModel.find({}, null, { lean: true, sort: { exchange: 1, market: 1 } }); // use lean() for performance (skip model tracking)

    // if (!isFiltering) {
    //   return r;
    // }

    // remove mongoose auto-added props
    return this.filterTradablePairs(
      r.map((actualDoc: MarketPairSetting & { __v: number; _id: any }) => {
        const { _id, __v, ...cleanedResult } = actualDoc; // not necessary to expose technical _id
        return cleanedResult;
      })
    );
  }

  async getExchangeMarket(exchange: string, symbol: string): Promise<any> {
    const r = (await this.marketPairModel.findOne({ exchange, symbol }).lean()) as any; // use lean() for performance (skip model tracking)
    return r;
  }

  async getPairsContractSize(exchange: string, base: string, quote: string): Promise<number> {
    const r = (await this.marketPairModel.findOne({ exchange, baseCurrency: base, quoteCurrency: quote }).lean()) as any; // use lean() for performance (skip model tracking)
    return r && r.contractSize ? r.contractSize : 0;
  }

  async getPageSettings(): Promise<PageSettings[]> {
    const r = await this.pageSettingsModel.find({}, null, { lean: true, sort: { name: 1 } }); // use lean() for performance (skip model tracking)

    // remove mongoose auto-added props
    return r.map((actualDoc: PageSettings & { __v: number; _id: any }) => {
      const { _id, __v, ...cleanedResult } = actualDoc; // not necessary to expose technical _id
      return cleanedResult;
    });
  }

  getCompatibleExchanges(): Promise<AllowedExchange[]> {
    return Promise.resolve(allowedExchanges);
  }

  /**
   * avoid exposing all pairs to the front (tempoary solution)
   * @param pairs
   */
  private filterTradablePairs(pairs: MarketPairSetting[]): MarketPairSetting[] {
    if (!pairs) {
      return null;
    }
    if (pairs.length === 0) {
      return pairs;
    }
    const raw = this.configService.get<string>("TRADE_PAIR_FILTER");
    if (!raw || raw.length === 0) {
      // this.logger.debug(`no symbol trade pair filtering TRADE_PAIR_FILTER : ${raw}`); //too verbous log since it's called very often
      return pairs;
    }
    const symbolFilter = raw.split(" ");
    this.logger.log(`symbol trade pair filtering TRADE_PAIR_FILTER : ${symbolFilter}`);
    const result = pairs.filter((x) => symbolFilter.includes(x.market));
    return result ?? [];
  }

  // Set variable
  async setVariable(name: string, value: string) {
    const variable = {
      name,
      value,
    };

    const variableModel = await this.varSettingsModel.findOneAndUpdate({ name }, variable, { upsert: true });
    return variableModel;
  }

  // Get variable
  async getVariable(name: string) {
    const variableModel = await this.varSettingsModel.findOne({ name });
    return variableModel;
  }
}
