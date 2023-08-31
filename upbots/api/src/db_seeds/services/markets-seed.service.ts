import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cron } from "@nestjs/schedule";
import allowedExchanges from "../seeds/exchange-allowed.seed";
import { Result, seedHandler } from "./seed-handler";
import MarketsFetchingService from "./market-fetching.service";
import FetchMarketResponse from "../fetch-market-result";
import { MarketPairSetting, MarketPairSettingModel } from "../../settings/models/market-pair-settings.model";
import mapMarkets from "../transform/market-transform";

@Injectable()
export default class MarketsSeedService implements OnModuleInit {
  private readonly logger = new Logger(MarketsSeedService.name);

  constructor(
    @InjectModel(MarketPairSettingModel.name) private modelSvc: Model<MarketPairSettingModel>,
    private marketFetcherService: MarketsFetchingService
  ) {}

  async onModuleInit() {
    // @TODO: enable this in a separate first run setup task
    await this.seedData();
  }

  @Cron("0 1 * * *") // every day at 1 am
  async seedData(): Promise<void> {
    let doSeed = process.env.MONGO_SEED_DB && process.env.MONGO_SEED_DB === "true";
    const doSkip = process.env.MONGO_SEED_SKIP_MARKET_SEED && process.env.MONGO_SEED_SKIP_MARKET_SEED === "true";
    doSeed = doSeed && !doSkip;
    await seedHandler(this.createMarketSeedData.bind(this), doSeed, this.logger); // bind(this) so that handler may use this class context
  }

  async createMarketSeedData(): Promise<Result<MarketPairSetting>[]> {
    const filteredExchanges = allowedExchanges.filter((x) => x.enabled);

    const exchangeInfo = await Promise.all(
      filteredExchanges.map((ex) =>
        this.marketFetcherService
          .fetchMarketForExchange(ex.key, ex.name)
          .then((x) => ({ data: x } as Result<FetchMarketResponse>))
          .catch((e) => ({ error: e } as Result<FetchMarketResponse>))
      )
    );
    if (!exchangeInfo || exchangeInfo.length === 0) {
      return Promise.reject(new Error("no data when fetching all fetchMarketForExchanges, please check allowed exhanges."));
    }
    exchangeInfo
      .filter((x) => x.error) // log errors
      .forEach((r) => {
        this.logger.error(`Failed to fetchMarketForExchange ${r.error}`);
      });

    const marketsSettings = exchangeInfo
      .filter((x) => !x.error)
      .map((r) => {
        return mapMarkets(r.data.markets, r.data.exchange, r.data.precisionMode);
      })
      .reduce((arr, current) => arr.concat(...current), []);

    const results = await Promise.all(
      marketsSettings.map((p) => {
        return this.modelSvc
          .findOneAndUpdate({ exchange: p.exchange, market: p.market }, p, { upsert: true })
          .then((x) => ({ data: x as MarketPairSetting } as Result<MarketPairSetting>))
          .catch((e) => ({ error: e } as Result<MarketPairSetting>)); // catch partial failure
      })
    );
    return results;
  }
}
