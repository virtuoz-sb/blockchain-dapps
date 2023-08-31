import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import UserSchema from "../models/user.schema";
import * as StakingLevelModel from "./models/staking-level.model";
import StakingLevelController from "./controllers/staking-level.controller";
import StakingLevelService from "./services/staking-level.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: StakingLevelModel.ModelName, schema: StakingLevelModel.Schema },
    ]),
  ],
  controllers: [StakingLevelController],
  providers: [StakingLevelService],
  exports: [StakingLevelService],
})
export default class StakingLevelModule {}
