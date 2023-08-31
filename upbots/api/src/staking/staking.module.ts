import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import StakingSharedModule from "./staking-shared.module";

import StakingController from "./controller/staking.controller";
import StakingAdminController from "./controller/staking-admin.controller";

@Module({
  imports: [StakingSharedModule],
  controllers: [StakingController, StakingAdminController],
})
export default class StakingModule {}
