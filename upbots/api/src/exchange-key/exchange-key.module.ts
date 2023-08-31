import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import MarketingAutomationModule from "src/marketing-automation/marketing-automation.module";
import ExchangeKeySchema from "../models/exchange-key.schema";
import ExchangeKeyService from "./services/exchange-key.service";
import ExchangeKeyController from "./controller/exchange-key.controller";
import CipherService from "../shared/encryption.service";
import ExchangeKeyDataService from "./services/exchange-key.data.service";
import ExchangeKeyStatisticsService from "./services/exchange-key.statistics.service";
import ExchangeProxyModule from "../exchangeProxy/exchange-proxy.module";
import AlgoBotSubscriptionSchema from "../algobot/models/algobot-subscription.schema";
import { OrderTrackingModelName, OrderTrackingSchema } from "../trade/model/order-tracking.schema";
import SharedModule from "../shared/shared.module";

@Module({
  imports: [
    SharedModule,
    CipherService,
    MongooseModule.forFeature([
      { name: "ExchangeKey", schema: ExchangeKeySchema },
      { name: "AlgoBotSubscriptionModel", schema: AlgoBotSubscriptionSchema },
      { name: OrderTrackingModelName, schema: OrderTrackingSchema },
    ]),
    ExchangeProxyModule,
    MarketingAutomationModule,
  ],
  providers: [ExchangeKeyService, CipherService, ExchangeKeyDataService, ExchangeKeyStatisticsService],
  controllers: [ExchangeKeyController],
  exports: [ExchangeKeyService, ExchangeKeyDataService],
})
export default class ExchangeKeyModule {}
