/* eslint-disable import/no-cycle */
import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import SharedModule from "../shared/shared.module";

import UserSchema from "../models/user.schema";
import ExchangeKeySchema from "../models/exchange-key.schema";

import * as Owner from "./models/owner.model";
import * as User from "./models/trader.model";

import ModelsService from "./services/models.service";
import HuobiproProxy from "./services/huobipro-proxy";

import AdminController from "./controllers/admin.controller";
import TraderController from "./controllers/trader.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "ExchangeKey", schema: ExchangeKeySchema },
      { name: Owner.ModelName, schema: Owner.Schema },
      { name: User.ModelName, schema: User.Schema },
    ]),
    HttpModule,
    SharedModule,
  ],
  controllers: [AdminController, TraderController],
  providers: [ModelsService, HuobiproProxy],
})
export default class BrokerTradingModule {}
