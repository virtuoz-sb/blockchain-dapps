/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import * as moment from "moment";

import { User, UserDto, UserIdentity } from "../../types/user";

import * as ModelTypes from "../models/types";
import * as UserWallet from "../models/user-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";

@Injectable()
export default class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel(UserWallet.ModelName) private UserWalletModel: Model<UserWallet.Model>,
    @InjectModel(UserTransaction.ModelName) private UserTransactionModel: Model<UserTransaction.Model>
  ) {}

  onModuleInit() {}

  async getUserWallet(userId: string): Promise<UserWallet.Model> {
    let userWallet = await this.UserWalletModel.findOne({ userId });
    if (!userWallet) {
      userWallet = new this.UserWalletModel({
        userId,
        amountETH: 0,
        amountBSC: 0,
        walletAddressETH: "",
        walletAddressBSC: "",
      });
      userWallet = await userWallet.save();
    }
    return userWallet;
  }

  async getUserTransactions(userId: string): Promise<UserTransaction.Model[]> {
    const userTransactions = await this.UserTransactionModel.find({ userId }, null, { sort: { createdAt: -1 } });
    return userTransactions;
  }

  async addUserTransaction(userId: string, transaction: UserTransaction.Dto): Promise<UserTransaction.Model> {
    transaction.userId = userId;
    let userTransaction = new this.UserTransactionModel(transaction);
    userTransaction = await userTransaction.save();
    return userTransaction;
  }
}
