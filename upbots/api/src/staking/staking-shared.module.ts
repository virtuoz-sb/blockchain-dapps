/* eslint-disable import/no-cycle */
import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import AdminsService from "./services/admins.service";
import ModelsService from "./services/models.service";

import UserSchema from "../models/user.schema";
import * as UserWallet from "./models/user-wallet.model";
import * as UserTransaction from "./models/user-transaction.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: UserWallet.ModelName, schema: UserWallet.Schema },
      { name: UserTransaction.ModelName, schema: UserTransaction.Schema },
    ]),
  ],
  providers: [AdminsService, ModelsService],
  exports: [AdminsService, ModelsService],
})
export default class StakingSharedModule {}
