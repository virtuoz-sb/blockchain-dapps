import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import SharedModule from "../shared/shared.module";

// import DepositKafkaConsumerModule from "./modules/deposit-kafka-consumer/deposit-kafka-consumer.module";
import PerfeesSharedModule from "./perfees-shared.module";
import PerfeesReferralsModule from "./perfees-referrals.module";
import PerfeesPerformanceModule from "./perfees-performance.module";

import PerfeesController from "./controller/perfees.controller";
import PerfeesAdminController from "./controller/perfees-admin.controller";
import PerfeesChainBackendController from "./controller/perfees-chain-backend.controller";
import PerfeesReferralController from "./controller/perfees-referral.controller";

@Module({
  imports: [SharedModule, PerfeesSharedModule, PerfeesReferralsModule, PerfeesPerformanceModule], // DepositKafkaConsumerModule
  controllers: [PerfeesController, PerfeesAdminController, PerfeesChainBackendController, PerfeesReferralController],
})
export default class PerfeesModule {}
