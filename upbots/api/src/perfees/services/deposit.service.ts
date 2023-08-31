import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";

import * as SharedTypes from "../models/shared.types";
import * as SharedModels from "../models/shared.models";
import * as UserWallet from "../models/user-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";

import ModelsService from "./models.service";
import NotificationService from "./notification.service";
import MarketingAutomationService from "../../marketing-automation/marketing-automation.service";
import MailService from "../../shared/mail.service";

@Injectable()
export default class DepositService {
  private readonly logger = new Logger(DepositService.name);

  constructor(
    @InjectModel(UserTransaction.ModelName) private userTransactionModel: Model<UserTransaction.Model>,
    private readonly modelsService: ModelsService,
    private readonly notificationService: NotificationService,
    private readonly automationService: MarketingAutomationService,
    private readonly mailService: MailService
  ) {}

  async deposit(payload) {
    const payloadJSON = payload;
    this.logger.debug(`[KAKFA-CONSUMER] DEPOSIT_TRANSACTION Print message after receiving ${payload}`, "ConsumerService");
    this.logger.debug(`[KAKFA-CONSUMER] DEPOSIT_TRANSACTION passed`, "ConsumerService");
    return;

    const data = {
      userId: payloadJSON.userId,
      hash: payloadJSON.txhash,
      type: SharedTypes.TransactionTypes.DEPOSIT,
      status: SharedTypes.TransactionStatuses.PENDING,
      confirmations: payloadJSON.confirmations,
      explorer: payloadJSON.explorer,
      to: payloadJSON.to,
      from: payloadJSON.from,
      amount: payloadJSON.value,
    };

    try {
      await this.userTransactionModel.findOneAndUpdate({ hash: data.hash }, { ...data }, { upsert: true });
      await this.notificationService.notifyForUserTransactionUpdated(payloadJSON.userId);
    } catch (e) {
      this.logger.debug(`[KAKFA-CONSUMER] DEPOSIT_TRANSACTION user transaction create failed ${e}`, "ConsumerService");
    }
  }

  async depositConfirm(payload) {
    const payloadJSON = payload;
    this.logger.debug(`****perfees-ubxt-deposit: ${JSON.stringify(payload)}`);

    const data = {
      userId: payloadJSON.userId,
      hash: payloadJSON.txHash,
      type: SharedTypes.TransactionTypes.DEPOSIT,
      status: SharedTypes.TransactionStatuses.COMPLETED,
      confirmations: 1, // payloadJSON.confirmations,
      confirmPercent: 100, // payloadJSON.confirmPercent,
      explorer: payloadJSON.explorer,
      to: payloadJSON.to,
      from: payloadJSON.from,
      amount: Number(payloadJSON.value),
    };

    try {
      let transaction = await this.userTransactionModel.findOne({ userId: data.userId, hash: data.hash });
      if (transaction) {
        this.logger.debug(`****perfees-ubxt-deposit-failed@transaction is already exist: ${data.userId}, ${data.hash}`);
        return {
          result: "OK",
          message: "transaction is already exist",
        };
      }
      // await this.userTransactionModel.findOneAndUpdate({ userId: data.userId, hash: data.hash }, { ...data, userWallet }, { upsert: true });
      if (data.confirmPercent >= 100) {
        await this.depositToUserWallet(data.userId, Number(data.amount));

        await this.modelsService.addUserTransaction({ ...data });
        transaction = await this.userTransactionModel.findOne({ userId: data.userId, hash: data.hash });
        transaction.confirmations = data.confirmations;
        transaction.confirmPercent = data.confirmPercent;
        transaction.status = SharedTypes.TransactionStatuses.COMPLETED;
        await transaction.save();

        this.logger.debug(`****perfees-ubxt-deposit@succcess`);
      } else {
        return {
          result: "OK",
        };
      }
      await this.notificationService.notifyForUserTransactionUpdated(payloadJSON.userId);

      // Enable Marketing Automation Flow
      this.automationService.handleUserAddDeposit(data.userId);

      // Notify User via Email
      this.mailService.sendNewDepositNotification(data.userId, data.amount);

      return {
        result: "OK",
      };
    } catch (e) {
      this.logger.debug(`****perfees-ubxt-deposit@update failed ${e}`, "ConsumerService");
      return {
        result: "ERROR",
        message: e.message,
      };
    }
  }

  async depositRemove(payload) {
    const payloadJSON = payload;
    this.logger.debug(`****perfees-ubxt-deposit@message after receiving ${payload}`);
    const data = {
      user: payloadJSON.userId,
      hash: payloadJSON.txhash,
      type: SharedTypes.TransactionTypes.DEPOSIT,
      status: SharedTypes.TransactionStatuses.COMPLETED,
      amount: Types.Decimal128.fromString(payloadJSON.value.toString()),
    };

    try {
      const transaction = await this.userTransactionModel.findOne({ hash: data.hash });
      await this.notificationService.notifyForUserTransactionUpdated(payloadJSON.userId);
    } catch (e) {
      this.logger.debug(`****perfees-ubxt-deposit@transaction create failed ${e}`);
    }
  }

  // ADD TO USER WALLET
  async depositToUserWallet(userId: string, amount: number) {
    const dto = {
      amount,
      address: "",
      transferType: SharedTypes.TransferType.DEPOSIT,
    };
    await this.modelsService.transferUserWallet(userId, dto);
    await this.notificationService.notifyForWalletUpdated(userId);
  }
}
