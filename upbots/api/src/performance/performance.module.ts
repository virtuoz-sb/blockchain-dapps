/* eslint-disable import/no-cycle */
import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import CacheConfigModule from "../cache-config/cache-config.module";
import CryptoPriceModule from "../cryptoprice/cryptoPrice.module";
import AlgoBotSubscriptionSchema from "../algobot/models/algobot-subscription.schema";
import AlgoBotSchema from "../algobot/models/algobot.schema";
import { SignalTrackingModelName, SignalTrackingSchema } from "../algobot/models/signal-tracking.schema";
import AlgoBotModule from "../algobot/algobot.module";
import PerformanceController from "./controller/performance.controller";
import PerformanceTestController from "./controller/performance-test.controller";
import PerformanceSnapshotSchema from "./models/performance-snapshot.schema";
import PerformanceCyclesSchema, { PerformanceCycleSchemaFactory } from "./models/performance-cycles.schema";

import PerformanceService from "./services/performance.service";
import PerformanceServiceData from "./services/performance.service.data";
import AdminPerformanceCycleSchema from "./models/admin-performance.schema";
import AlgobotPerfAggregateService from "./services/algobots-perf-aggregate-service";
import { OrderTrackingModelName, OrderTrackingSchema } from "../trade/model/order-tracking.schema";
import AlgoBotStatsSchema from "../algobot/models/algobot-stats.schema";
import * as FeeTracking from "../perfees/models/fee-tracking.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "PerformanceSnapshotModel", schema: PerformanceSnapshotSchema },
      { name: "AdminPerformanceCycleModel", schema: AdminPerformanceCycleSchema },
      { name: "AlgoBotSubscription", schema: AlgoBotSubscriptionSchema },
      { name: "AlgoBot", schema: AlgoBotSchema },
      { name: "AlgoBotStats", schema: AlgoBotStatsSchema },
      { name: SignalTrackingModelName, schema: SignalTrackingSchema },
      { name: OrderTrackingModelName, schema: OrderTrackingSchema },
      { name: FeeTracking.ModelName, schema: FeeTracking.Schema },
    ]),
    MongooseModule.forFeatureAsync([PerformanceCycleSchemaFactory]),
    AlgoBotModule,
    CryptoPriceModule,
    CacheConfigModule,
    HttpModule,
  ],
  providers: [PerformanceService, PerformanceServiceData, AlgobotPerfAggregateService],
  controllers: [PerformanceController, PerformanceTestController],
  exports: [PerformanceService, PerformanceServiceData],
})
export default class PerformanceModule {}
