import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import ExchangeProxyModule from "../exchangeProxy/exchange-proxy.module";
import StrategyOrderTradeController from "./strategy-order.controller";
import StrategyRequestService from "./services/strategy-request.service";
import { GrpcConnectionOptionProvider } from "../shared/grpc-connection-option.provider";
import TradeStrategyDataService from "./services/trade-strategy-data-service";
import PriceStrategySchema from "./model/price-strategy-schema";
import { OrderTrackingSchema, OrderTrackingModelName } from "./model/order-tracking.schema";
import TradeOrdersDataService from "./services/trade-orders-data-service";
import TradeFormatValidity from "./services/trade-format-validity.service";
import DirectOrderService from "./services/direct-order.sevice";
import { DirectOrderGrpcClientFactory, StrategeGrpcClientFactory } from "./grpc-client";
import DirectOrderTradeController from "./direct-order.controller";
import TradeHealthController from "./trade-health.controller";
import DirectOrderDataService from "./services/direct-order-data.sevice";
import SettingsModule from "../settings/settings.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "PriceStrategyModel", schema: PriceStrategySchema },
      { name: OrderTrackingModelName, schema: OrderTrackingSchema },
    ]),
    ExchangeProxyModule,
    SettingsModule, // needs trade settings info about market pairs
  ],
  controllers: [StrategyOrderTradeController, DirectOrderTradeController, TradeHealthController],
  providers: [
    StrategyRequestService,
    TradeStrategyDataService,
    DirectOrderService,
    DirectOrderDataService,
    TradeOrdersDataService,
    StrategeGrpcClientFactory,
    DirectOrderGrpcClientFactory,
    GrpcConnectionOptionProvider,
    TradeFormatValidity,
  ],
  exports: [TradeFormatValidity],
})
export default class TradeModule {}
