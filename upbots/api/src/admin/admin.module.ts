/* eslint-disable import/no-cycle */
import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import UserSchema from "../models/user.schema";
import AlgoBotSubscriptionSchema from "../algobot/models/algobot-subscription.schema";
import AlgoBotSchema from "../algobot/models/algobot.schema";
import { SignalTrackingModelName, SignalTrackingSchema } from "../algobot/models/signal-tracking.schema";
import ExchangeKeySchema from "../models/exchange-key.schema";

import SharedModule from "../shared/shared.module";
import PortfolioModule from "../portfolio/portfolio.module";
import ExchangeKeyModule from "../exchange-key/exchange-key.module";
import CryptoPriceModule from "../cryptoprice/cryptoPrice.module";
import DbUpdatingService from "./services/db-updating.service";
import AdminService from "./services/admin.service";
import AdminController from "./controllers/admin.controller";
import { OrderTrackingModelName, OrderTrackingSchema } from "../trade/model/order-tracking.schema";

import * as UserWallet from "../perfees/models/user-wallet.model";
import * as UserWalletTracking from "../perfees/models/user-wallet-tracking.model";
import * as BotWallet from "../perfees/models/bot-wallet.model";
import * as UserTransaction from "../perfees/models/user-transaction.model";
import * as FeeWallet from "../perfees/models/fee-wallet.model";
import * as FeeTransaction from "../perfees/models/fee-transaction.model";
import * as FeeTracking from "../perfees/models/fee-tracking.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "AlgoBotSubscription", schema: AlgoBotSubscriptionSchema },
      { name: "AlgoBot", schema: AlgoBotSchema },
      { name: SignalTrackingModelName, schema: SignalTrackingSchema },
      { name: "ExchangeKey", schema: ExchangeKeySchema },
      { name: OrderTrackingModelName, schema: OrderTrackingSchema },
      { name: UserWallet.ModelName, schema: UserWallet.Schema },
      { name: UserWalletTracking.ModelName, schema: UserWalletTracking.Schema },
      { name: BotWallet.ModelName, schema: BotWallet.Schema },
      { name: UserTransaction.ModelName, schema: UserTransaction.Schema },
      { name: FeeWallet.ModelName, schema: FeeWallet.Schema },
      { name: FeeTransaction.ModelName, schema: FeeTransaction.Schema },
      { name: FeeTracking.ModelName, schema: FeeTracking.Schema },
    ]),
    SharedModule,
    HttpModule,
    PortfolioModule,
    ExchangeKeyModule,
    CryptoPriceModule,
  ],
  providers: [DbUpdatingService, AdminService],
  controllers: [AdminController],
})
export default class AdminModule {}
