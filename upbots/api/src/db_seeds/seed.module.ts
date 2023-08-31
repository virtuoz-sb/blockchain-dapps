import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { BotOrderTrackingSchema } from "../trade/model/bot-order-tracking.schema";
import ExchangeProxyModule from "../exchangeProxy/exchange-proxy.module";
import SettingsDataService from "../settings/services/settings.data.service";
import AlgoBotSubscriptionSchema from "../algobot/models/algobot-subscription.schema";
import AlgoBotSchema from "../algobot/models/algobot.schema";
import SettingsService from "../settings/services/settings.service";
import AlgobotSeedService from "./services/algobot-seed.service";
import SignalTrackingSeedService from "./services/signal-tracking-seed.service";
import { SignalTrackingModelName, SignalTrackingSchema } from "../algobot/models/signal-tracking.schema";
import UserSchema from "../models/user.schema";
import CustodialWalletsSeedService from "./services/custodial-wallets-seed.service";
import PageSettingsSeedService from "./services/page-settings-seed.service";
import PageSettingsSchema from "../settings/models/page/page-settings.schema";
import PageSettingsModel from "../settings/models/page/page-settings.model";
import VarSettingsSchema from "../settings/models/variable/var-settings.schema";
import VarSettingsModel from "../settings/models/variable/var-settings.model";
import MarketsFetchingService from "./services/market-fetching.service";
import { MarketPairSettingModel } from "../settings/models/market-pair-settings.model";
import MarketPairSettingSchema from "../settings/models/market-pair-settings.schema";
import MarketsSeedService from "./services/markets-seed.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "AlgobotModel", schema: AlgoBotSchema }]),
    MongooseModule.forFeature([{ name: "AlgobotSubscriptionModel", schema: AlgoBotSubscriptionSchema }]),
    MongooseModule.forFeature([{ name: "BotOrderTrackingModel", schema: BotOrderTrackingSchema }]),
    MongooseModule.forFeature([{ name: SignalTrackingModelName, schema: SignalTrackingSchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: VarSettingsModel.name, schema: VarSettingsSchema }]),
    MongooseModule.forFeature([{ name: PageSettingsModel.name, schema: PageSettingsSchema }]),
    MongooseModule.forFeature([{ name: MarketPairSettingModel.name, schema: MarketPairSettingSchema }]),
    ExchangeProxyModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    SettingsService,
    AlgobotSeedService,
    SettingsDataService,
    SignalTrackingSeedService,
    // CustodialWalletsSeedService,
    PageSettingsSeedService,
    MarketsFetchingService,
    MarketsSeedService,
  ],
})
export default class SeedModule {}
