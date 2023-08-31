/* eslint-disable import/no-cycle */
import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import PerformanceModule from "../performance/performance.module";
import PerfeesSharedModule from "./perfees-shared.module";

import PerformanceService from "./services/performance.service";

import * as UserWallet from "./models/user-wallet.model";
import * as BotWallet from "./models/bot-wallet.model";
import * as UserTransaction from "./models/user-transaction.model";

// import PerformanceCyclesSchema from "../performance/models/performance-cycles.schema";
import { PerformanceCycleSchemaFactory } from "./models/performance-cycles.schema.factory";

@Module({
  imports: [PerfeesSharedModule, PerformanceModule],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export default class PerfeesPerformanceModule {}
