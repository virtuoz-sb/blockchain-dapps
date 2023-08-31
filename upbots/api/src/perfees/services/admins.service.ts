/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import * as moment from "moment";

import DepositAddressGenerationService from "../modules/deposit-address-generation/deposit-address-generation.service";

import { User, UserDto, UserIdentity } from "../../types/user";
import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import { AlgoBotSubscriptionAuditModelName, AlgoBotSubscriptionAuditModel } from "../../algobot/models/algobot-subscription-audit.model";
import { SignalTrackingModelName } from "../../algobot/models/signal-tracking.schema";
import { SignalTrackingModel } from "../../algobot/models/signal-tracking.dto";
import {
  SignalTrackingAuditSchema,
  SignalTrackingAuditsModelName,
  SignalTrackingAuditModel,
} from "../../algobot/models/signal-tracking-audit";
import { OrderTrackingModelName, OrderTrackingModel } from "../../trade/model/order-tracking.schema";

import ModelsService from "./models.service";

import * as SharedTypes from "../models/shared.types";
import * as SharedModels from "../models/shared.models";
import * as UserWallet from "../models/user-wallet.model";
import * as UserWalletTracking from "../models/user-wallet-tracking.model";
import * as BotWallet from "../models/bot-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";
import * as FeeWallet from "../models/fee-wallet.model";
import * as FeeTransaction from "../models/fee-transaction.model";
import * as FeeTracking from "../models/fee-tracking.model";
import { TransactionStatuses, TransactionTypes } from "../models/shared.types";

@Injectable()
export default class AdminsService {
  private readonly logger = new Logger(AdminsService.name);

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel(UserWallet.ModelName) private UserWalletModel: Model<UserWallet.Model>,
    @InjectModel(UserWalletTracking.ModelName) private UserWalletTrackingModel: Model<UserWalletTracking.Model>,
    @InjectModel(BotWallet.ModelName) private BotWalletModel: Model<BotWallet.Model>,
    @InjectModel(UserTransaction.ModelName) private UserTransactionModel: Model<UserTransaction.Model>,
    @InjectModel(FeeWallet.ModelName) private FeeWalletModel: Model<FeeWallet.Model>,
    @InjectModel(FeeTransaction.ModelName) private FeeTransactionModel: Model<FeeTransaction.Model>,
    @InjectModel(FeeTracking.ModelName) private FeeTrackingModel: Model<FeeTracking.Model>,
    @InjectModel("AlgobotModel") private botModel: Model<AlgoBotModel>,
    @InjectModel("AlgoBotSubscriptionModel") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel(AlgoBotSubscriptionAuditModelName) private botSubscriptionAuditModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>,
    @InjectModel(SignalTrackingAuditsModelName) private signalAuditModel: Model<SignalTrackingAuditModel>,
    @InjectModel(OrderTrackingModelName) private orderTrackingModel: Model<OrderTrackingModel>,
    private modelsService: ModelsService,
    private depositAddressGenerationService: DepositAddressGenerationService
  ) {}

  onModuleInit() {}

  async getDepositAddress(data: any): Promise<any> {
    try {
      let { userId } = data;
      const { email, botId } = data;
      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }
      const response = await this.depositAddressGenerationService.generateAddress(userId, "");
      return response;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getWallets(data: any): Promise<any> {
    try {
      let { userId } = data;
      const { email, botId } = data;
      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }

      const userWallet = await this.modelsService.getUserWallet(userId);
      let botWallets = {};
      let feeWallets = {};

      if (botId) {
        botWallets = await this.BotWalletModel.find({ userId, botId });
        feeWallets = await this.FeeWalletModel.find({ botId });
      } else {
        botWallets = await this.modelsService.getBotWallets(userId);
        feeWallets = await this.FeeWalletModel.find({});
      }
      return {
        userWallet,
        botWallets,
        feeWallets,
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getUser(data: any): Promise<any> {
    try {
      const { email, userId } = data;
      // const transfers = await this.depositAddressGenerationService.getTransfers();
      let user = null;

      if (email) {
        user = await this.userModel.findOne({ email });
      } else {
        user = await this.userModel.findOne({ _id: userId });
      }
      return {
        user,
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getLogs(data: any): Promise<any> {
    try {
      let { userId } = data;
      const { email, botId } = data;
      const limitCount = 4;

      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }

      // signal tracking
      const signalTrackings = await this.signalTrackingModel.find({ botId }).sort({ signalDateTime: -1 }).limit(limitCount);
      // signal tracking audit
      const signalTrackingAuditss = await this.signalAuditModel.find({ botId }).sort({ createdAt: -1 }).limit(limitCount);

      // Subscriptions
      let botSubscriptions = {};
      const botSubscriptionActive = await this.botSubscriptionModel.findOne({ userId, botId, enabled: true, deleted: false });
      const botSubId = botSubscriptionActive ? botSubscriptionActive.id : null;
      // botSubscriptions
      if (data.botSubscriptions === "all") {
        botSubscriptions = await this.botSubscriptionModel.find({ userId, botId }).sort({ updatedAt: -1 });
      } else {
        botSubscriptions = botSubscriptionActive;
      }

      // botSubscriptionAudits
      let botSubscriptionAudits = {};
      if (data.botSubscriptionAudits === "all") {
        botSubscriptionAudits = await this.botSubscriptionAuditModel.find({ userId, botId }).sort({ updatedAt: -1 }).limit(limitCount);
      } else if (botSubId) {
        botSubscriptionAudits = await this.botSubscriptionAuditModel
          .find({ userId, botId, botSubId })
          .sort({ updatedAt: -1 })
          .limit(limitCount);
      }

      // OrdersTrackings
      const orderTrackings = await this.orderTrackingModel.find({ userId, botId, botSubId }).sort({ updated_at: -1 }).limit(limitCount);

      // FeeTransactions
      const feeTransactions = await this.FeeTransactionModel.find({ botId }).sort({ updated_at: -1 }).limit(12);

      return {
        botSubscriptions,
        botSubscriptionAudits,
        orderTrackings,
        signalTrackings,
        signalTrackingAuditss,
        feeTransactions,
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async transferUserWallet(data: any): Promise<any> {
    try {
      let { userId } = data;
      const { email, amount, transferType } = data;
      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }

      const transfer = {
        amount,
        transferType,
        address: "",
      };

      await this.modelsService.transferUserWallet(userId, transfer);
      return {
        error: false,
        message: "user wallet is successfully updated",
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async setCreditToBot(data: BotWallet.AdminSetCreditDto): Promise<any> {
    try {
      let { userId } = data;
      const { email, botId } = data;
      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }

      await this.modelsService.setCreditsToBots(userId, botId, data.amount, data.transType);
      return {
        error: false,
        message: "bots credits are successfully updated",
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getBotPaidSubscription(data: any): Promise<any> {
    try {
      const { userId, botId } = data;
      const botWallet = await this.modelsService.getBotWalletById(userId, botId);
      return botWallet.paidSubscription;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async updateBotPaidSubscription(data: any): Promise<any> {
    try {
      const { userId, botId, recalc, update } = data;
      const botWallet = await this.modelsService.getBotWalletById(userId, botId);
      botWallet.paidSubscription = update;
      await botWallet.save();
      if (recalc) {
        const ret = await this.modelsService.processBotPaidSubscription(userId, botId);
        return ret;
      }
      return true;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getUserWalletWithdraws(status: TransactionStatuses): Promise<any> {
    try {
      const trackings = await this.UserWalletTrackingModel.find({ status }).populate(
        "userId",
        "-_id email firstname lastname username phone country homeAddress"
      );
      const mappedTrackings = trackings.map((tracking: any) => ({
        id: tracking._id,
        amount: tracking.amount,
        type: tracking.type,
        status: tracking.status,
        address: tracking.address,
        hash: tracking.hash,
        explorer: tracking.explorer,
        walletType: tracking.walletType,
        user: tracking.userId,
        createdAt: tracking.createdAt,
      }));
      return mappedTrackings;
    } catch (e) {
      return [];
    }
  }

  async confirmUserWalletWithdraw(trackingId: string, data: any): Promise<any> {
    try {
      const payload: any = { status: TransactionStatuses.CONFIRMED };
      if (data?.hash) {
        const explorer = `${process.env.BSCSCAN_URL}${data.hash}`;
        payload.hash = data.hash;
        payload.explorer = explorer;
      }

      await this.UserWalletTrackingModel.findOneAndUpdate({ _id: trackingId }, payload);
      return {
        result: true,
      };
    } catch (e) {
      return {
        result: false,
      };
    }
  }

  async cancelUserWalletWithdraw(trackingId: string): Promise<any> {
    try {
      await this.UserWalletTrackingModel.findOneAndUpdate({ _id: trackingId }, { status: TransactionStatuses.CANCELED });
      return {
        result: true,
      };
    } catch (e) {
      return {
        result: false,
      };
    }
  }

  async getUserWallet(email: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email });
      const userWallet = await this.modelsService.getUserWallet(user._id);
      return userWallet;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async addUserWalletCredit(payload: any): Promise<any> {
    try {
      const userWallet = await this.modelsService.getUserWallet(payload.userId);
      userWallet.creditAmount += Number(payload.amount);
      await userWallet.save();
      return userWallet;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getUserTransactions(email: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email });
      const userId = user._id;
      return this.UserTransactionModel.find({ userId, type: { $in: [TransactionTypes.DEPOSIT, TransactionTypes.WITHDRAW] } }, null, {
        sort: { createdAt: -1 },
      });
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }
}
