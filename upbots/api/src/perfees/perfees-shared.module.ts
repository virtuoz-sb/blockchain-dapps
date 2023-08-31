/* eslint-disable import/no-cycle */
import { Module, forwardRef, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import MarketingAutomationModule from "src/marketing-automation/marketing-automation.module";
import SharedModule from "../shared/shared.module";
import NotificationModule from "../notif/notif.module";
import UbxtModule from "../ubxt/ubxt.module";
import DepositAddressGenerationModule from "./modules/deposit-address-generation/deposit-address-generation.module";
import StakingLevelModule from "../staking-level/staking-level.module";

import AdminsService from "./services/admins.service";
import ModelsService from "./services/models.service";
import NotificationService from "./services/notification.service";
import DepositService from "./services/deposit.service";
import TradingService from "./services/trading.service";
import ReferralService from "./services/referral.service";
import StakingLevelService from "../staking-level/services/staking-level.service";
import PaidSubscriptionService from "./services/paid-subscription.service";

import UserSchema from "../models/user.schema";
import * as UserWallet from "./models/user-wallet.model";
import * as UserWalletTracking from "./models/user-wallet-tracking.model";
import * as BotWallet from "./models/bot-wallet.model";
import * as UserTransaction from "./models/user-transaction.model";
import * as FeeWallet from "./models/fee-wallet.model";
import * as FeeTransaction from "./models/fee-transaction.model";
import * as FeeTracking from "./models/fee-tracking.model";
import * as StakingLevelModel from "../staking-level/models/staking-level.model";

import AlgoBotSchema from "../algobot/models/algobot.schema";
import AlgoBotSubscriptionSchema from "../algobot/models/algobot-subscription.schema";
import { AlgoBotSubscriptionAuditModelName, AlgoBotSubscriptionAuditSchema } from "../algobot/models/algobot-subscription-audit.model";
import { SignalTrackingModelName, SignalTrackingSchema } from "../algobot/models/signal-tracking.schema";
import { SignalTrackingAuditSchema, SignalTrackingAuditsModelName } from "../algobot/models/signal-tracking-audit";
import { OrderTrackingModelName, OrderTrackingSchema } from "../trade/model/order-tracking.schema";

import * as UserReferral from "./models/user-referral.model";
import * as ReferralTracking from "./models/referral-tracking.model";
import * as ReferralTransaction from "./models/referral-transaction.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: StakingLevelModel.ModelName, schema: StakingLevelModel.Schema },
      { name: UserWallet.ModelName, schema: UserWallet.Schema },
      { name: UserWalletTracking.ModelName, schema: UserWalletTracking.Schema },
      { name: BotWallet.ModelName, schema: BotWallet.Schema },
      { name: UserTransaction.ModelName, schema: UserTransaction.Schema },
      { name: FeeWallet.ModelName, schema: FeeWallet.Schema },
      { name: FeeTransaction.ModelName, schema: FeeTransaction.Schema },
      { name: FeeTracking.ModelName, schema: FeeTracking.Schema },
      { name: "AlgobotModel", schema: AlgoBotSchema },
      { name: "AlgoBotSubscriptionModel", schema: AlgoBotSubscriptionSchema },
      { name: AlgoBotSubscriptionAuditModelName, schema: AlgoBotSubscriptionAuditSchema },
      { name: SignalTrackingModelName, schema: SignalTrackingSchema },
      { name: SignalTrackingAuditsModelName, schema: SignalTrackingAuditSchema },
      { name: OrderTrackingModelName, schema: OrderTrackingSchema },
      { name: UserReferral.ModelName, schema: UserReferral.Schema },
      { name: ReferralTracking.ModelName, schema: ReferralTracking.Schema },
      { name: ReferralTransaction.ModelName, schema: ReferralTransaction.Schema },
    ]),
    forwardRef(() => NotificationModule),
    DepositAddressGenerationModule,
    UbxtModule,
    StakingLevelModule,
    MarketingAutomationModule,
    SharedModule,
    HttpModule,
  ],
  providers: [
    AdminsService,
    ModelsService,
    NotificationService,
    DepositService,
    TradingService,
    ReferralService,
    StakingLevelService,
    PaidSubscriptionService,
  ],
  exports: [AdminsService, ModelsService, NotificationService, DepositService, TradingService, ReferralService, StakingLevelService],
})
export default class PerfeesSharedModule {}
