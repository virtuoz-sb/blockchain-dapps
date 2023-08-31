import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import CacheConfigModule from "../cache-config/cache-config.module";
import SettingsController from "./settings.controller";
import SettingsService from "./services/settings.service";
import ExchangeProxyModule from "../exchangeProxy/exchange-proxy.module";
import SettingsDataService from "./services/settings.data.service";
import { MarketPairSettingModel } from "./models/market-pair-settings.model";
import MarketPairSettingSchema from "./models/market-pair-settings.schema";
import PageSettingsSchema from "./models/page/page-settings.schema";
import PageSettingsModel from "./models/page/page-settings.model";
import VarSettingsSchema from "./models/variable/var-settings.schema";
import VarSettingsModel from "./models/variable/var-settings.model";

@Module({
  imports: [
    CacheConfigModule, // exports the CacheModule
    MongooseModule.forFeature([{ name: VarSettingsModel.name, schema: VarSettingsSchema }]),
    MongooseModule.forFeature([{ name: PageSettingsModel.name, schema: PageSettingsSchema }]),
    MongooseModule.forFeature([{ name: MarketPairSettingModel.name, schema: MarketPairSettingSchema }]),
    ExchangeProxyModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsDataService],
  exports: [SettingsService, SettingsDataService],
})
export default class SettingsModule {}
