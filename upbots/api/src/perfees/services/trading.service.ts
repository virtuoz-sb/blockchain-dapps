/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as moment from "moment";

import PerformanceServiceData from "../../performance/services/performance.service.data";
import {
  MeasuredObjects,
  PerformanceFeeSteps,
  PerformanceFee,
  PerformanceCycleDto,
  PerformanceCycleModel,
} from "../../performance/models/performance.models";

import PerfeesConfig from "../perfees.config";
import ModelsService from "./models.service";
import NotificationService from "./notification.service";
import UbxtContractService from "../../ubxt/ubxt-contract.service";
import UbxtDistributionContractService from "../../ubxt/ubxt-distribution-contract.service";
import ReferralService from "./referral.service";
import StakingLevelService from "../../staking-level/services/staking-level.service";

import * as SharedTypes from "../models/shared.types";
import * as SharedModels from "../models/shared.models";
import * as UserWallet from "../models/user-wallet.model";
import * as BotWallet from "../models/bot-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";
import * as FeeTracking from "../models/fee-tracking.model";
import * as FeeTransaction from "../models/fee-transaction.model";
import { ReferralTransTypes, TransactionStatuses } from "../models/shared.types";

@Injectable()
export default class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(
    @InjectModel(UserTransaction.ModelName) private UserTransactionModel: Model<UserTransaction.Model>,
    private readonly modelsService: ModelsService,
    private readonly notificationService: NotificationService,
    private readonly ubxtDistributionContractService: UbxtDistributionContractService,
    private stakingLevelService: StakingLevelService,
    private referralService: ReferralService
  ) {}

  async processPerformanceCycle(performanceCycle: PerformanceCycleDto, bIsOpen: boolean): Promise<PerformanceFee> {
    const minWalletAmount = 1;
    const deltaAmount = 0.000000001;
    const perfee: PerformanceFee = {
      performedStep: PerformanceFeeSteps.READY,
      paidAmount: 0,
      remainedAmount: 0,
    };

    let userWallet = await this.modelsService.getUserWallet(performanceCycle.userId);
    let botWallet = await this.modelsService.getBotWalletById(performanceCycle.userId, performanceCycle.botId);
    const algoBot = await this.modelsService.getAlgobotById(performanceCycle.botId);

    if (!userWallet || !botWallet || !algoBot) {
      await this.notificationService.notifyForPerformanceCyclesUpdated(performanceCycle.userId);
      this.logger.debug(`***--perfees-processPerformanceCycle-error: userWallet or botWallet is null`);
      return perfee;
    }

    // amount is low than 1 (This process was for demo version)
    // if (Number(botWallet.amount) < minWalletAmount && Number(botWallet.creditAmount) < minWalletAmount) {
    //   await this.notificationService.notifyForPerformanceCyclesUpdated(performanceCycle.userId);
    //   this.logger.debug(`***--perfees-processPerformanceCycle-error: botWallet amount is less than 1 ubxt`);
    //   return perfee;
    // }

    if (bIsOpen) {
      await this.notificationService.notifyForPerformanceCyclesUpdated(performanceCycle.userId);
      return perfee;
    }

    // calc the performance fee amount
    const perfFee = await this.modelsService.getBotFeePercent(algoBot);
    let feeAmount = (Number(performanceCycle.realisedGain.ubxt) * perfFee) / 100.0;

    // additional fee off by staking level
    const stakingLevelData = await this.stakingLevelService.getCurrentStakingLevelAndFee(performanceCycle.userId);
    if (stakingLevelData) {
      const bonusFeeOff = stakingLevelData ? stakingLevelData.currentFeeOff : 0;
      feeAmount *= 1 - Math.min(100, Math.abs(bonusFeeOff)) / 100.0;
    }

    let remainingFeeAmount = feeAmount;
    let perfeesAmount = 0;

    // if trading is positive
    if (feeAmount > 0) {
      // if bot has credit amount
      if (botWallet.creditAmount > 0) {
        let { creditAmount } = botWallet;
        if (creditAmount > remainingFeeAmount) {
          creditAmount = remainingFeeAmount;
        }
        remainingFeeAmount -= creditAmount;
        botWallet.creditAmount -= creditAmount;
      }

      // if fee amount to process is remained
      if (remainingFeeAmount > 0) {
        // if bot doesn't have enough ubxt, refill from userWallet to botWallet
        if (botWallet.autoRefill && botWallet.amount + botWallet.creditAmount < minWalletAmount + remainingFeeAmount) {
          const refillAmount = minWalletAmount + remainingFeeAmount;
          const botTransAmount = refillAmount - botWallet.amount;

          if (userWallet.availableAmount + userWallet.creditAmount > botTransAmount) {
            botWallet = await this.modelsService.transferBotWallet0(
              performanceCycle.userId,
              performanceCycle.botId,
              performanceCycle.subBotId,
              refillAmount,
              SharedTypes.TransferType.SET
            );
            userWallet = await this.modelsService.getUserWallet(performanceCycle.userId);
            botWallet = await this.modelsService.getBotWalletById(performanceCycle.userId, performanceCycle.botId);
            if (!userWallet || !botWallet) {
              await this.notificationService.notifyForPerformanceCyclesUpdated(performanceCycle.userId);
              this.logger.debug(`***--perfees-processPerformanceCycle-refill-error: userWallet or botWallet is null`);
              return perfee;
            }
          }
        }

        // if bot has credit amount
        if (botWallet.creditAmount > 0) {
          let { creditAmount } = botWallet;
          if (creditAmount > remainingFeeAmount) {
            creditAmount = remainingFeeAmount;
          }
          remainingFeeAmount -= creditAmount;
          botWallet.creditAmount -= creditAmount;
        }

        // perfees amount = profit amount - virtual credit amount
        perfeesAmount = remainingFeeAmount;

        // if bot doesn't have enough ubxt
        if (botWallet.amount + deltaAmount < remainingFeeAmount) {
          botWallet.debtAmount = remainingFeeAmount;
          // stop the bot to trading
          await this.modelsService.pauseBotSubscription(performanceCycle.subBotId, false);
          await this.notificationService.notifyForWalletNoAmount(performanceCycle.userId);
          this.logger.debug(
            `***--perfees-stopping bot because of no ubxt - user: ${performanceCycle.userId}, bot: ${performanceCycle.botId}`
          );
          // normal trading case
        } else {
          userWallet.amount -= remainingFeeAmount;
          userWallet.allocatedAmount -= remainingFeeAmount;
          userWallet.availableAmount = userWallet.amount - userWallet.allocatedAmount;
          botWallet.amount -= remainingFeeAmount;

          // if bot has amount less than minWalletAmount, refill from userWallet to botWallet with minWalletAmount
          if (botWallet.amount < minWalletAmount) {
            const botTransAmount = minWalletAmount - botWallet.amount;
            if (userWallet.availableAmount > botTransAmount) {
              this.modelsService.transferBotWallet0(
                performanceCycle.userId,
                performanceCycle.botId,
                performanceCycle.subBotId,
                minWalletAmount,
                SharedTypes.TransferType.SET
              );
            }
          }
        }
      }

      // distribute performance fee
      const performanceCycleModel: any = performanceCycle;
      if (perfeesAmount > 0) {
        await this.distributePerfee(
          performanceCycle.userId,
          performanceCycle.botId,
          algoBot.name,
          performanceCycle.subBotId,
          performanceCycleModel._id,
          perfeesAmount
        );
        botWallet.paidAmount += perfeesAmount;
      }
      // if trading is negative
    } else {
      botWallet.creditAmount -= feeAmount;
    }

    await userWallet.save();
    await botWallet.save();

    await this.notificationService.notifyForPerformanceCyclesUpdated(performanceCycle.userId);
    await this.notificationService.notifyForWalletUpdated(performanceCycle.userId);

    perfee.paidAmount = feeAmount;
    if (botWallet.autoRefill) {
      perfee.remainedAmount = userWallet.availableAmount + userWallet.creditAmount;
    } else {
      perfee.remainedAmount = botWallet.amount + botWallet.creditAmount;
    }

    this.modelsService.arrangeUserWallet(performanceCycle.userId);
    return perfee;
  }

  async distributePerfee(userId: string, botId: string, botName: string, botSubId: string, performanceCycleId: string, feeAmount: number) {
    const algoBot = await this.modelsService.getAlgobotById(botId);
    const { perfFees } = algoBot;

    const referralFeeAmount = await this.distributePerfeeToReferrals(userId, botId, botName, botSubId, performanceCycleId, feeAmount);
    const perfeeAmount = feeAmount - referralFeeAmount;

    if (PerfeesConfig.distribution.isGrouping) {
      const feeTracking: FeeTracking.AddDto = {
        userId,
        botId,
        botName,
        botSubId,
        performanceCycleId,
        type: SharedTypes.FeeRecipientType.GROUP,
        amount: perfeeAmount,
        group: {
          developer: { amount: (perfeeAmount / perfFees.percent) * perfFees.distribution.developer },
          reserve: { amount: (perfeeAmount / perfFees.percent) * perfFees.distribution.reserve },
          pool: { amount: (perfeeAmount / perfFees.percent) * perfFees.distribution.pool },
          burn: { amount: (perfeeAmount / perfFees.percent) * perfFees.distribution.burn },
        },
        status: SharedTypes.TransactionStatuses.PENDING,
      };
      await this.modelsService.addFeeTracking(feeTracking);
    } else {
      const perfFee = await this.modelsService.getBotFeePercent(algoBot);
      const feeRecipients = [
        { type: SharedTypes.FeeRecipientType.DEVELOPER, amount: algoBot.perfFees.distribution.developer },
        { type: SharedTypes.FeeRecipientType.RESERVE, amount: algoBot.perfFees.distribution.reserve },
        { type: SharedTypes.FeeRecipientType.POOL, amount: algoBot.perfFees.distribution.pool },
        { type: SharedTypes.FeeRecipientType.BURN, amount: algoBot.perfFees.distribution.burn },
      ];

      const transactions = feeRecipients.map(async (feeRecipient) => {
        const feeTracking: FeeTracking.AddDto = {
          userId,
          botId,
          botName,
          botSubId,
          performanceCycleId,
          type: feeRecipient.type,
          amount: (feeAmount / 100.0) * feeRecipient.amount,
          status: SharedTypes.TransactionStatuses.PENDING,
        };
        await this.modelsService.addFeeTracking(feeTracking);
        return true;
      });
      await Promise.all(transactions);
    }
  }

  async distributePerfeeToReferrals(
    userId: string,
    botId: string,
    botName: string,
    botSubId: string,
    performanceCycleId: string,
    feeAmount: number
  ) {
    const referralInfo = await this.referralService.getUserReferees(userId);
    const nInviteesCount = referralInfo.invitees.length;

    if (nInviteesCount === 0) {
      return 0;
    }

    let referFeePercent = 0;
    if (nInviteesCount >= 1 && nInviteesCount <= 10) {
      referFeePercent = 2;
    } else if (nInviteesCount >= 11 && nInviteesCount <= 50) {
      referFeePercent = 3.5;
    } else if (nInviteesCount >= 51 && nInviteesCount <= 200) {
      referFeePercent = 5;
    } else if (nInviteesCount >= 201 && nInviteesCount <= 500) {
      referFeePercent = 7.5;
    } else if (nInviteesCount >= 500) {
      referFeePercent = 10;
    }

    // additional fee off by staking level
    const stakingLevelData = await this.stakingLevelService.getCurrentStakingLevelAndFee(userId);
    const bonusFeeOff = stakingLevelData ? stakingLevelData.currentFeeOff : 0;

    const referFeeAmount = (feeAmount * referFeePercent) / 100.0;
    if (referFeeAmount === 0) {
      return 0;
    }

    const invitorUser = await this.modelsService.getUserById(userId);
    try {
      await this.referralService.addReferralTransaction({
        refereeId: userId,
        refereeName: invitorUser.firstname,
        level: 0,
        type: ReferralTransTypes.PERFORMANCE_FEE,
        status: TransactionStatuses.COMPLETED,
        amount: referFeeAmount,
        transactionHash: "",
        explorer: "",
        error: "",
      });
      return referFeeAmount;
    } catch (e) {
      return 0;
    }
  }

  async onCompleteFeeTransaction(transaction: FeeTransaction.Model, message: string) {
    let feeTransaction = transaction;
    let txTransaction = null;

    if (feeTransaction.hash && feeTransaction.explorer) {
      try {
        txTransaction = await this.ubxtDistributionContractService.getTxTransaction(feeTransaction.hash);
      } catch (e) {
        txTransaction = null;
      }
    }
    if (feeTransaction.hash && feeTransaction.explorer && txTransaction) {
      feeTransaction.status = SharedTypes.TransactionStatuses.COMPLETED;
      feeTransaction.confirmPercent = 100;
      await this.modelsService.updateUsersTransactionsByFeeTransaction(feeTransaction);
      await this.notificationService.notifyForUserTransactionUpdated("");
    } else {
      feeTransaction.status = SharedTypes.TransactionStatuses.PENDING;
      feeTransaction.error = message;
    }

    feeTransaction = await feeTransaction.save();
  }

  async onFailFeeTransaction(transaction: FeeTransaction.Model, message: string) {
    let feeTransaction = transaction;
    feeTransaction.status = SharedTypes.TransactionStatuses.FAILED;
    feeTransaction.error = message;
    feeTransaction = await feeTransaction.save();
  }

  private onHashOfDistribution(feeTransactionId: string): Function {
    const onHash = async (hash, explorer) => {
      let feeTransaction = await this.modelsService.getFeeTransactionById(feeTransactionId);

      if (!feeTransaction) {
        return false;
      }

      feeTransaction.confirmPercent = 0;
      feeTransaction.hash = hash;
      feeTransaction.explorer = explorer;
      feeTransaction = await feeTransaction.save();
      await this.modelsService.updateUsersTransactionsByFeeTransaction(feeTransaction);
      await this.notificationService.notifyForUserTransactionUpdated("");
      return true;
    };

    return onHash;
  }

  private onReceiptOfDistribution(feeTransactionId: string): Function {
    const onReceipt = async (status, message) => {
      const feeTransaction = await this.modelsService.getFeeTransactionById(feeTransactionId);

      if (!feeTransaction) {
        return false;
      }

      await this.onCompleteFeeTransaction(feeTransaction, message);
      return true;
    };

    return onReceipt;
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: "perfees-transactions",
  }) // Cron every 10 minutes
  async handleFeeTransactions() {
    // process pending user transactions
    await this.modelsService.buildUserTransactions();

    // get transferring fee transaction
    let feeTransaction = await this.modelsService.getFeeTransactionByStatus(SharedTypes.TransactionStatuses.TRANSFERRING);
    if (feeTransaction) {
      const fiveMinAgo = moment().subtract(15, "minutes");
      try {
        const trx = await this.ubxtDistributionContractService.getTxTransaction(feeTransaction.hash);
        if (trx && trx.blockNumber) {
          await this.onCompleteFeeTransaction(feeTransaction, "");
        } else if (moment(feeTransaction.updatedAt).isBefore(fiveMinAgo)) {
          console.log("***--perfees-handleUserTransactions-15minutesPast-Failed");
          await this.onCompleteFeeTransaction(feeTransaction, "transaction timeout error");
        }
      } catch (e) {
        if (moment(feeTransaction.updatedAt).isBefore(fiveMinAgo)) {
          console.log("***--perfees-handleUserTransactions-error");
          await this.onCompleteFeeTransaction(feeTransaction, "transaction timeout error");
        }
      }
      return true;
    }

    // get pending fee transaction
    feeTransaction = await this.modelsService.getFeeTransactionByStatus(SharedTypes.TransactionStatuses.PENDING);
    if (!feeTransaction) {
      try {
        await this.modelsService.buildFeeWallets();
        await this.modelsService.makeFeeTransactions();
        await this.modelsService.makeFeeTransactionsFailedToPending();
      } catch (e) {
        console.log(`***--perfees-makeFeeTransactions-error: ${e.message}`);
      }
      feeTransaction = await this.modelsService.getFeeTransactionByStatus(SharedTypes.TransactionStatuses.PENDING);
      if (!feeTransaction) {
        return false;
      }
    }

    try {
      let isTransing = false;
      if (feeTransaction.type === SharedTypes.FeeRecipientType.GROUP) {
        const algobot = await this.modelsService.getAlgobotById(feeTransaction.botId);
        if (!algobot) {
          await this.onFailFeeTransaction(feeTransaction, "no algobot");
          return false;
        }

        // @TODO: apply new fee calculation by staking level logic

        feeTransaction.group.developer.amount =
          (feeTransaction.amount * algobot.perfFees.distribution.developer) / algobot.perfFees.percent;
        feeTransaction.group.reserve.amount = (feeTransaction.amount * algobot.perfFees.distribution.reserve) / algobot.perfFees.percent;
        feeTransaction.group.pool.amount = (feeTransaction.amount * algobot.perfFees.distribution.pool) / algobot.perfFees.percent;
        feeTransaction.group.burn.amount = (feeTransaction.amount * algobot.perfFees.distribution.burn) / algobot.perfFees.percent;
        await feeTransaction.save();
        // console.log("****---ubxt-distrubte:", JSON.stringify(feeTransaction));

        isTransing = await this.ubxtDistributionContractService.distributeToken(
          feeTransaction.group.developer.address,
          feeTransaction.group.developer.amount,
          feeTransaction.group.reserve.address,
          feeTransaction.group.reserve.amount,
          feeTransaction.group.pool.address,
          feeTransaction.group.pool.amount,
          feeTransaction.group.burn.address,
          feeTransaction.group.burn.amount,
          this.onHashOfDistribution(feeTransaction._id),
          this.onReceiptOfDistribution(feeTransaction._id)
        );
      } else {
        console.log("****---ubxt-distrubte-not-group:", JSON.stringify(feeTransaction));
        // isTransing = await this.ubxtContractService.sendUBXT(
        //   feeTransaction.address,
        //   feeTransaction.amount,
        //   this.onHashOfDistribution(feeTransaction._id),
        //   this.onReceiptOfDistribution(feeTransaction._id)
        // );
      }
      // if (isTransing)
      feeTransaction.status = SharedTypes.TransactionStatuses.TRANSFERRING;
      feeTransaction = await feeTransaction.save();
      await this.modelsService.updateUsersTransactionsByFeeTransaction(feeTransaction);
    } catch (err) {
      await this.onCompleteFeeTransaction(feeTransaction, err.message);
      console.log(`***--perfees-handleUserTransactions-err:, ${err.message}`);
      return false;
    }
    return true;
  }
}
