/* eslint-disable import/no-cycle */
import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import SharedModule from "../shared/shared.module";

import UserSchema from "../models/user.schema";
import ExchangeKeySchema from "../models/exchange-key.schema";
import AlgoBotSchema from "../algobot/models/algobot.schema";
import AlgoBotSubscriptionSchema from "../algobot/models/algobot-subscription.schema";
import { SignalTrackingModelName, SignalTrackingSchema } from "../algobot/models/signal-tracking.schema";
import * as Trader from "./models/trader.model";

import ModelsService from "./services/models.service";
import ListenersService from "./services/listeners.service";
import ProxyFactoryService from "./services/listener-proxy/proxy-factory.service";

import KucoinProxy from "./services/listener-proxy/kucoin-proxy";
import BinanceProxy from "./services/listener-proxy/binance-proxy";
import BinanceFutureProxy from "./services/listener-proxy/binance-future-proxy";

import CopyTradingAdminController from "./controllers/admin.controller";
import CopyTradingMasterController from "./controllers/master.controller";

import SettingsModule from "../settings/settings.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "ExchangeKey", schema: ExchangeKeySchema },
      { name: "Algobot", schema: AlgoBotSchema },
      { name: "AlgoBotSubscription", schema: AlgoBotSubscriptionSchema },
      { name: SignalTrackingModelName, schema: SignalTrackingSchema },
      { name: Trader.ModelName, schema: Trader.Schema },
    ]),
    HttpModule,
    SharedModule,
    SettingsModule,
  ],
  providers: [ModelsService, ListenersService, ProxyFactoryService, KucoinProxy, BinanceProxy, BinanceFutureProxy],
  controllers: [CopyTradingAdminController, CopyTradingMasterController],
})
export default class CopyTradingModule {}
