import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import MarketingAutomationModule from "src/marketing-automation/marketing-automation.module";
import { BotOrderTrackingModelName, BotOrderTrackingSchema } from "../trade/model/bot-order-tracking.schema";
import { OrderTrackingModelName, OrderTrackingSchema } from "../trade/model/order-tracking.schema";
import { GrpcConnectionOptionProvider } from "../shared/grpc-connection-option.provider";
import AlgobotController from "./algobot.controller";
import UserBotController from "./userbot.controller";
import AlgoBotSubscriptionSchema from "./models/algobot-subscription.schema";
import AlgoBotSchema from "./models/algobot.schema";
import { AlgobotGrpcClientFactory } from "./provider/algobot-grpc-client-factory";
import AlgobotService from "./services/algobot-service";
import AlgobotDataService from "./services/algobot.data-service";
import SharedModule from "../shared/shared.module";
import TradeModule from "../trade/trade.module";
import ExchangeKeyModule from "../exchange-key/exchange-key.module";
import SignalTrackingService from "./services/signal-tracking.service";
import { SignalTrackingModelName, SignalTrackingSchema } from "./models/signal-tracking.schema";
import CryptoPriceModule from "../cryptoprice/cryptoPrice.module";
import AdminAlgoBotSubscriptionSchema from "./models/admin-algobot-subscription.schema";
import CacheConfigModule from "../cache-config/cache-config.module";
import { SignalTrackingAuditSchema, SignalTrackingAuditsModelName } from "./models/signal-tracking-audit";
import AlgobotAuditController from "./algobot-audit.controller";
import AlgobotAuditDataService from "./services/algobot-audit.data-service";
import { AlgoBotSubscriptionAuditModelName, AlgoBotSubscriptionAuditSchema } from "./models/algobot-subscription-audit.model";
import AlgoBotStatsSchema from "./models/algobot-stats.schema";
import * as PerfeesBotWallet from "../perfees/models/bot-wallet.model";
import * as PerfeesUserWallet from "../perfees/models/user-wallet.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "AlgobotModel", schema: AlgoBotSchema },
      { name: SignalTrackingModelName, schema: SignalTrackingSchema },
      { name: SignalTrackingAuditsModelName, schema: SignalTrackingAuditSchema },
      { name: OrderTrackingModelName, schema: OrderTrackingSchema },
      { name: "AlgoBotSubscriptionModel", schema: AlgoBotSubscriptionSchema },
      { name: AlgoBotSubscriptionAuditModelName, schema: AlgoBotSubscriptionAuditSchema },
      { name: BotOrderTrackingModelName, schema: BotOrderTrackingSchema },
      { name: "AdminAlgoBotSubscriptionModel", schema: AdminAlgoBotSubscriptionSchema },
      { name: "AlgoBotStatsModel", schema: AlgoBotStatsSchema },
      { name: PerfeesBotWallet.ModelName, schema: PerfeesBotWallet.Schema },
      { name: PerfeesUserWallet.ModelName, schema: PerfeesUserWallet.Schema },
    ]),
    HttpModule,
    SharedModule,
    TradeModule,
    CryptoPriceModule,
    CacheConfigModule,
    MarketingAutomationModule,
    ExchangeKeyModule,
  ],
  controllers: [AlgobotController, AlgobotAuditController, UserBotController],
  providers: [
    AlgobotDataService,
    GrpcConnectionOptionProvider,
    AlgobotGrpcClientFactory,
    AlgobotService,
    SignalTrackingService,
    AlgobotAuditDataService,
  ],
  exports: [AlgobotService, AlgobotDataService, SignalTrackingService],
})
export default class AlgoBotModule {}
