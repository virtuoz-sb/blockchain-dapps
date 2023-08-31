/* eslint-disable import/no-cycle */
import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import UserSchema from "../models/user.schema";
import * as UserWallet from "./models/user-wallet.model";
import * as UserReferral from "./models/user-referral.model";
import * as ReferralTracking from "./models/referral-tracking.model";
import * as ReferralTransaction from "./models/referral-transaction.model";

import ReferralService from "./services/referral.service";
import ModelsService from "./services/models.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: UserWallet.ModelName, schema: UserWallet.Schema },
      { name: UserReferral.ModelName, schema: UserReferral.Schema },
      { name: ReferralTracking.ModelName, schema: ReferralTracking.Schema },
      { name: ReferralTransaction.ModelName, schema: ReferralTransaction.Schema },
    ]),
  ],
  providers: [ReferralService],
  exports: [ReferralService],
})
export default class PerfeesReferralsModule {}
