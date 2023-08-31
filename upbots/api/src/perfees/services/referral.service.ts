/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import * as moment from "moment";
import * as referralCodeGenerator from "referral-code-generator";

import { User, UserDto, UserIdentity } from "../../types/user";
import * as SharedTypes from "../models/shared.types";
import * as SharedModels from "../models/shared.models";
import * as UserWallet from "../models/user-wallet.model";
import * as UserReferral from "../models/user-referral.model";
import * as ReferralTransaction from "../models/referral-transaction.model";
import * as ReferralTracking from "../models/referral-tracking.model";
import { ReferralTransTypes, TransactionStatuses } from "../models/shared.types";

@Injectable()
export default class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  private REWARD1_CREDIT_AMOUNT = 200;

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel(UserWallet.ModelName) private UserWalletModel: Model<UserWallet.Model>,
    @InjectModel(UserReferral.ModelName) private UserReferralModel: Model<UserReferral.Model>,
    @InjectModel(ReferralTracking.ModelName) private ReferralTrackingModel: Model<ReferralTracking.Model>,
    @InjectModel(ReferralTransaction.ModelName) private ReferralTransactionModel: Model<ReferralTransaction.Model>
  ) {}

  onModuleInit() {}

  async getUserWallet(userId: string): Promise<UserWallet.Model> {
    let userWallet = await this.UserWalletModel.findOne({ userId });
    if (!userWallet) {
      userWallet = new this.UserWalletModel({
        userId,
        amount: 0,
        allocatedAmount: 0,
        availableAmount: 0,
        creditAmount: 0,
        debtAmount: 0,
        rewardCreditedForBots: false,
        depositAddressETH: "",
        depositAddressBSC: "",
        totalEarned: {},
      });
      userWallet = await userWallet.save();
    }

    if (!userWallet.totalEarned) {
      userWallet.totalEarned = {
        referral: 0,
      };
      await userWallet.save();
    }
    return userWallet;
  }

  async checkUserReferral(userId: string): Promise<boolean> {
    const userReferral = await this.UserReferralModel.findOne({ userId });
    return !!userReferral;
  }

  async getUserReferral(userId: string): Promise<any> {
    let userReferral = await this.UserReferralModel.findOne({ userId });
    if (!userReferral) {
      const referralCode = referralCodeGenerator.alphaNumeric("uppercase", 4, 1);
      userReferral = new this.UserReferralModel({
        userId,
        referralCode,
        invitorCodes: [],
      });
      userReferral = await userReferral.save();
    }
    return userReferral;
  }

  async getUserReferralByReferralCode(referralCode: string): Promise<UserReferral.Model> {
    const userReferral = await this.UserReferralModel.findOne({ referralCode });
    return userReferral;
  }

  async getUserReferees(userId: string) {
    const isExistUserReferral = await this.checkUserReferral(userId);
    if (!isExistUserReferral) {
      return {
        invitor: null,
        invitees: [],
      };
    }

    // Process referral tracfking
    await this.processReferralTracking(userId);

    const invitorReferral = await this.getUserReferral(userId);
    const invitorWallet = await this.getUserWallet(userId);
    const invitorCode = invitorReferral.referralCode;

    const inviteeReferrals = await this.UserReferralModel.find({ invitorCodes: invitorCode });
    const promises = inviteeReferrals.map(async (referral) => {
      const user = await this.userModel.findOne({ _id: referral.userId });
      const userWallet = await this.UserWalletModel.findOne({ userId: referral.userId });
      const childReferrals = await this.UserReferralModel.find({ invitorCodes: referral.referralCode });
      const level = referral.invitorCodes.indexOf(invitorCode);

      return {
        userId: referral.userId,
        userName: user?.firstname,
        userCount: childReferrals.length,
        level,
        totalEarned: userWallet.totalEarned.referral,
        createdAt: user?.created,
      };
    });
    const invitees = await Promise.all(promises);
    return {
      invitor: {
        _id: invitorReferral._id,
        referralCode: invitorCode,
        totalEarned: invitorWallet.totalEarned.referral,
      },
      invitees,
    };
  }

  async getUserReferers(userId: string) {
    const inviteeReferral = await this.getUserReferral(userId);
    const { invitorCodes } = inviteeReferral;
    const invitorReferrals = await this.UserReferralModel.find({
      referralCode: { $in: invitorCodes },
    });

    return invitorReferrals;
  }

  async reqUserReferral(userId: string, refCode: string): Promise<boolean> {
    const isReferralExist = await this.checkUserReferral(userId);
    if (isReferralExist) {
      return false;
    }

    try {
      const invitorReferral = await this.getUserReferralByReferralCode(refCode);
      if (!invitorReferral) {
        return false;
      }
      const invitorUser = await this.userModel.findOne({ _id: invitorReferral.userId });
      if (!invitorUser) {
        return false;
      }
      const invitorWallet = await this.getUserWallet(invitorReferral.userId);
      if (!invitorWallet) {
        return false;
      }

      const inviteeUser = await this.userModel.findOne({ _id: userId });
      if (!inviteeUser) {
        return false;
      }
      const inviteeReferral = await this.getUserReferral(userId);
      const inviteeWallet = await this.getUserWallet(userId);
      if (!inviteeReferral || !inviteeWallet) {
        return false;
      }
      await this.addReferralTracking({
        refererId: invitorReferral.userId,
        refereeId: userId,
        status: TransactionStatuses.PENDING,
      });
      await this.processReferralTracking(userId);
      return true;
    } catch (e) {
      return false;
    }
  }

  async processReferralTracking(userId: string) {
    const trackings = await this.ReferralTrackingModel.find({
      $and: [
        {
          $or: [{ refererId: userId }, { refereeId: userId }],
        },
        {
          status: TransactionStatuses.PENDING,
        },
      ],
    });
    const promises = trackings.map(async (tracking) => {
      const bRes = await this.handleReferralTracking(tracking);
      return bRes;
    });

    await Promise.all(promises);
  }

  isUserVerified(user: User) {
    if (user.authProvider === "GOOGLE" || user.authProvider === "FACEBOOK") {
      return true;
    }
    return user.verification.emailVerified;
  }

  async handleReferralTracking(tracking: ReferralTracking.Model): Promise<boolean> {
    const invitorUser = await this.userModel.findOne({ _id: tracking.refererId });
    const inviteeUser = await this.userModel.findOne({ _id: tracking.refereeId });
    if (!invitorUser || !inviteeUser) {
      return false;
    }

    if (!this.isUserVerified(invitorUser) || !this.isUserVerified(inviteeUser)) {
      return false;
    }

    const invitorReferral = await this.getUserReferral(tracking.refererId);
    const invitorWallet = await this.getUserWallet(tracking.refererId);

    const inviteeReferral = await this.getUserReferral(tracking.refereeId);
    const inviteeWallet = await this.getUserWallet(tracking.refereeId);

    inviteeReferral.invitorCodes.push(invitorReferral.referralCode, ...invitorReferral.invitorCodes);
    await inviteeReferral.save();

    invitorWallet.creditAmount += this.REWARD1_CREDIT_AMOUNT;
    inviteeWallet.creditAmount += this.REWARD1_CREDIT_AMOUNT;
    invitorWallet.totalEarned.referral += this.REWARD1_CREDIT_AMOUNT;
    inviteeWallet.totalEarned.referral += this.REWARD1_CREDIT_AMOUNT;

    await invitorWallet.save();
    await inviteeWallet.save();

    const referralLevel = inviteeReferral.invitorCodes.indexOf(invitorReferral.referralCode);

    const transaction = await this.addReferralTransaction({
      refererId: tracking.refererId,
      refereeId: tracking.refereeId,
      refererName: invitorUser.firstname,
      refereeName: inviteeUser.firstname,
      level: referralLevel,
      type: ReferralTransTypes.CREDIT,
      status: TransactionStatuses.COMPLETED,
      amount: this.REWARD1_CREDIT_AMOUNT,
      transactionHash: "",
      explorer: "",
      error: "",
    });

    tracking.status = TransactionStatuses.COMPLETED;
    await tracking.save();
    return true;
  }

  async addReferralTracking(transaction: any): Promise<ReferralTracking.Model> {
    let referralTracking = new this.ReferralTrackingModel(transaction);
    referralTracking = await referralTracking.save();
    return referralTracking;
  }

  async addReferralTransaction(transaction: any): Promise<ReferralTransaction.Model> {
    let referralTransaction = new this.ReferralTransactionModel(transaction);
    referralTransaction = await referralTransaction.save();
    return referralTransaction;
  }

  async getReferralTransactions(userId: string): Promise<ReferralTransaction.Model[]> {
    const referralTransactions = await this.ReferralTransactionModel.find(
      {
        $or: [{ refererId: userId }, { refereeId: userId }],
      },
      null,
      { sort: { createdAt: -1 } }
    );
    const result = referralTransactions.filter((transaction) => transaction.amount !== 0);
    return result;
  }
}
