/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger, HttpService } from "@nestjs/common";
import * as moment from "moment";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UbxtBalance } from "../../performance/models/performance.models";
import PerformanceServiceData from "../../performance/services/performance.service.data";
import DepositAddressGenerationService from "../modules/deposit-address-generation/deposit-address-generation.service";
import UbxtDistributionContractService from "../../ubxt/ubxt-distribution-contract.service";
import ReferralService from "./referral.service";
import MailService from "../../shared/mail.service";

import { User, UserDto, UserIdentity } from "../../types/user";
import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";

import * as SharedTypes from "../models/shared.types";
import * as SharedModels from "../models/shared.models";
import * as UserWallet from "../models/user-wallet.model";
import * as UserWalletTracking from "../models/user-wallet-tracking.model";
import * as BotWallet from "../models/bot-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";
import * as FeeWallet from "../models/fee-wallet.model";
import * as FeeTransaction from "../models/fee-transaction.model";
import * as FeeTracking from "../models/fee-tracking.model";
import * as UserReferral from "../models/user-referral.model";

import { ReferralTransTypes, TransactionStatuses } from "../models/shared.types";

import * as UbxtCirculation from "../../ubxt/circulation/service";

@Injectable()
export default class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

  private readonly coingeckoApiUrl = `${process.env.COINGECKO_URL}/api/v3/simple/price`;

  private ubxtPrice: UbxtBalance;

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
    private depositAddressGenerationService: DepositAddressGenerationService,
    private readonly ubxtDistributionService: UbxtDistributionContractService, // private readonly mailService: MailService
    private readonly httpService: HttpService
  ) {}

  onModuleInit() {
    this.initFeeWallets();
    this.fetchUbxtPrice();
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: "perfees-fetch-ubxt-price",
  })
  async fetchUbxtPrice() {
    const ids = "upbots";
    const vsCurrencies = "btc,usd,eur";
    const url = `${this.coingeckoApiUrl}?ids=${ids}&vs_currencies=${vsCurrencies}`;
    try {
      const res = await this.httpService.get(url).toPromise();
      const ubxnPrice = await UbxtCirculation.getUbxnPrice();
      const rates: { btc?: number; usd?: number; eur?: number } = Object.values(res.data)[0];
      if (rates && rates.btc && rates.usd && rates.eur) {
        this.ubxtPrice = { ubxt: 1, ...rates };
        this.ubxtPrice.btc = (this.ubxtPrice.btc / this.ubxtPrice.usd) * ubxnPrice;
        this.ubxtPrice.eur = (this.ubxtPrice.eur / this.ubxtPrice.usd) * ubxnPrice;
        this.ubxtPrice.usd = ubxnPrice;
      }
    } catch (e) {
      console.log("---fetchUbxtPrice-err:", e.message);
      this.ubxtPrice = { ubxt: 1, usd: 1, btc: 1, eur: 1 };
    }
    return this.ubxtPrice;
  }

  async checkUBXTBalance() {
    // const pipline = [
    //   {
    //     $match: {
    //       operationType: { $in: ["update", "replace"] },
    //     },
    //   },
    // ];
    // const changeStream = this.UserWalletModel.watch(pipline);
    // changeStream.on("change", async (e: any) => {
    //   const user = await this.UserWalletModel.findOne({ _id: e.documentKey._id });
    //   if (e?.updateDescription?.updatedFields.hasOwnProperty("amount") && e.updateDescription.updatedFields.amount === 0) {
    //     this.mailService.sendUbxtBalanceZeroNotification(user.userId);
    //   }
    // });
  }

  async initFeeWallets() {
    const algoBots = await this.getAlgobots();
    const promises = algoBots.map(async (bot) => {
      if (this.isCommunityBot(bot)) {
        return false;
      }
      // await this.initFeeWalletByAlgoBot(bot, SharedTypes.FeeRecipientType.DEVELOPER);
      // await this.initFeeWalletByAlgoBot(bot, SharedTypes.FeeRecipientType.RESERVE);
      // await this.initFeeWalletByAlgoBot(bot, SharedTypes.FeeRecipientType.BURN);
      // await this.initFeeWalletByAlgoBot(bot, SharedTypes.FeeRecipientType.POOL);
      await this.initFeeWalletByAlgoBot(bot, SharedTypes.FeeRecipientType.GROUP);
      return true;
    });
    await Promise.all(promises);
  }

  async initFeeWalletByAlgoBot(bot: AlgoBotModel, type: SharedTypes.FeeRecipientType) {
    const feeWallet = await this.getFeeWallet(bot._id, type);
    feeWallet.botName = bot.name;
    if (type === SharedTypes.FeeRecipientType.DEVELOPER) {
      feeWallet.address = await this.getBotFeeDeveloperAddress(bot);
    } else if (type === SharedTypes.FeeRecipientType.RESERVE) {
      feeWallet.address = process.env.PFS_DISTRIBUTION_ADDRESS_RESERVE;
    } else if (type === SharedTypes.FeeRecipientType.BURN) {
      feeWallet.address = process.env.PFS_DISTRIBUTION_ADDRESS_BURN;
    } else if (type === SharedTypes.FeeRecipientType.POOL) {
      feeWallet.address = process.env.PFS_DISTRIBUTION_ADDRESS_POOL;
    } else if (type === SharedTypes.FeeRecipientType.GROUP) {
      feeWallet.group = {
        developer: { address: await this.getBotFeeDeveloperAddress(bot), amount: feeWallet.group?.developer?.amount || 0 },
        reserve: { address: process.env.PFS_DISTRIBUTION_ADDRESS_RESERVE, amount: feeWallet.group?.developer?.amount || 0 },
        pool: { address: process.env.PFS_DISTRIBUTION_ADDRESS_POOL, amount: feeWallet.group?.developer?.amount || 0 },
        burn: { address: process.env.PFS_DISTRIBUTION_ADDRESS_BURN, amount: feeWallet.group?.developer?.amount || 0 },
      };
    }
    await feeWallet.save();
  }

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
    if (!userWallet.depositAddressETH || userWallet.depositAddressETH === "") {
      const response = await this.depositAddressGenerationService.generateAddress(userId, "");
      if (response && response.status === "ok") {
        userWallet.depositAddressETH = response.eth.publicKey;
        await userWallet.save();
      }
    }

    if (!userWallet.totalEarned) {
      userWallet.totalEarned = {
        referral: 0,
      };
      await userWallet.save();
    }
    return userWallet;
  }

  async getUserTransactions(userId: string): Promise<UserTransaction.Model[]> {
    const userTransactions = await this.UserTransactionModel.find({ userId }, null, { sort: { createdAt: -1 } });

    const promises = userTransactions.map(async (userTransaction) => {
      if (userTransaction.type === SharedTypes.TransactionTypes.PERFORMANCE_FEE) {
        if (!userTransaction.extra) {
          userTransaction.extra = {};
        }
        if (!userTransaction.extra.performanceCycleid) {
          const feeTracking = await this.FeeTrackingModel.findOne({
            feeTransactionId: userTransaction.transactionId,
            type: userTransaction.subType as SharedTypes.FeeRecipientType,
          });
          if (feeTracking) {
            userTransaction.extra.performanceCycleId = feeTracking.performanceCycleId;
            userTransaction = await userTransaction.save();
          }
        }
      }
    });

    await Promise.all(promises);
    return userTransactions;
  }

  async getBotWallets(userId: string): Promise<BotWallet.Model[]> {
    const botWallets = await this.BotWalletModel.find({ userId }, null, { sort: { createdAt: -1 } });
    return botWallets;
  }

  async getBotWalletById(userId: string, botId: string): Promise<BotWallet.Model> {
    const algoBot: AlgoBotModel = await this.botModel.findOne({ _id: botId });
    if (!algoBot) {
      return null;
    }

    let botWallet = await this.BotWalletModel.findOne({ userId, botId });
    if (botWallet === null) {
      const dto: BotWallet.UpdateDto = {
        userId,
        botId,
        botSubId: "",
        amount: 0,
        allocatedAmount: 0,
        creditAmount: 0,
        debtAmount: 0,
        status: SharedTypes.WalletStatuses.ENABLED,
      };
      botWallet = new this.BotWalletModel(dto);
      botWallet = await botWallet.save();
    } else if (!algoBot.botFees || !botWallet.paidSubscription?.feesPlan) {
      botWallet.paidSubscription = null;
    }
    return botWallet;
  }

  async arrangeUserWallet(userId: string): Promise<boolean> {
    try {
      const userWallet = await this.getUserWallet(userId);
      const botWalletTotal = await this.BotWalletModel.aggregate([
        {
          $match: {
            status: { $eq: "ENABLED" },
            userId: { $eq: Types.ObjectId(userId) },
          },
        },
        { $group: { _id: null, amount: { $sum: "$amount" } } },
      ]);
      if (!userWallet || !botWalletTotal || !botWalletTotal.length) {
        return false;
      }
      const allocatedAmount = botWalletTotal[0].amount;
      userWallet.allocatedAmount = Math.min(userWallet.amount, allocatedAmount);
      userWallet.availableAmount = userWallet.amount - userWallet.allocatedAmount;
      const debtAmount = Math.min(userWallet.debtAmount, userWallet.availableAmount);
      userWallet.availableAmount -= debtAmount;
      userWallet.amount -= debtAmount;
      userWallet.debtAmount -= debtAmount;
      await userWallet.save();
      return true;
    } catch (e) {
      return false;
    }
  }

  async transferUserWallet(userId: string, transferDto: UserWallet.TransferDto): Promise<number> {
    let processedAmount = 0;
    let userWallet = await this.getUserWallet(userId);

    if (transferDto.transferType === SharedTypes.TransferType.DEPOSIT) {
      let depositAmount = Number(transferDto.amount);
      const isFirstDeposit =
        transferDto.transferType === SharedTypes.TransferType.DEPOSIT &&
        !userWallet.rewardCreditedForBots &&
        userWallet.amount === 0 &&
        userWallet.debtAmount === 0;

      // if transfer is first deposit, add bonus virtual credits to user wallet.
      if (isFirstDeposit) {
        userWallet.creditAmount = (userWallet.creditAmount ?? 0) + Math.min(depositAmount, 2500);
        userWallet.rewardCreditedForBots = true;
      }

      // if user has debt
      if (depositAmount >= userWallet.debtAmount) {
        depositAmount -= userWallet.debtAmount;
        userWallet.amount += depositAmount;
        userWallet.availableAmount += depositAmount;
        userWallet.debtAmount = 0;
      } else {
        userWallet.debtAmount -= depositAmount;
      }
      userWallet = await userWallet.save();
      await this.arrangeUserWallet(userId);

      processedAmount = depositAmount;
    } else if (transferDto.transferType === SharedTypes.TransferType.WITHDRAW) {
      const withdrawAmount = Math.min(userWallet.availableAmount, Number(transferDto.amount));

      const ubxnPrice = await UbxtCirculation.getUbxnPrice();
      let fee = 0;
      if (transferDto.isETH) {
        fee = 9.5 / ubxnPrice;
      } else {
        fee = 0.5 / ubxnPrice;
      }
      const realAmount = withdrawAmount - fee;

      if (realAmount > 0) {
        userWallet.amount -= withdrawAmount;
        userWallet.availableAmount -= withdrawAmount;
        userWallet = await userWallet.save();

        await this.arrangeUserWallet(userId);

        const userWalletTracking = await this.addUserWalletTracking({
          userId,
          type: SharedTypes.TransactionTypes.WITHDRAW,
          status: SharedTypes.TransactionStatuses.PENDING,
          address: transferDto.address,
          amount: realAmount,
          hash: "",
          explorer: "",
          walletType: transferDto.isETH ? "ERC20" : "BSC",
        });

        await this.addUserTransaction({
          transactionId: userWalletTracking._id,
          userId,
          botId: null,
          type: SharedTypes.TransactionTypes.WITHDRAW,
          subType: SharedTypes.TransferType.WITHDRAW,
          status: SharedTypes.TransactionStatuses.CONFIRMED,
          address: "",
          amount: realAmount,
        });

        await this.addUserTransaction({
          transactionId: userWalletTracking._id,
          userId,
          botId: null,
          type: SharedTypes.TransactionTypes.PERFORMANCE_FEE,
          subType: SharedTypes.TransferType.WITHDRAW,
          status: SharedTypes.TransactionStatuses.CONFIRMED,
          address: "",
          amount: fee,
        });
        // await this.addUserWalletTracking({
        //   userId,
        //   type: SharedTypes.TransactionTypes.PERFORMANCE_FEE,
        //   status: SharedTypes.TransactionStatuses.CONFIRMED,
        //   address: "",
        //   amount: fee,
        //   hash: "",
        //   explorer: "",
        //   walletType: transferDto.isETH ? "ERC20" : "BSC",
        // });

        processedAmount = withdrawAmount;
      } else {
        processedAmount = 0;
      }
    }
    return processedAmount;
  }

  async transferBotWallet0(
    userId: string,
    botId: string,
    botSubId: string,
    amount: number,
    transType: SharedTypes.TransferType,
    processLog = true
  ): Promise<BotWallet.Model> {
    const transDto: BotWallet.TransferDto = {
      botId,
      botSubId,
      amount,
      transType,
    };
    const botWallet = await this.transferBotWallet(userId, transDto, processLog);
    return botWallet;
  }

  async transferBotWallet(userId: string, transferDto: BotWallet.TransferDto, processLog = true): Promise<BotWallet.Model> {
    let userWallet = await this.getUserWallet(userId);
    let botWallet = await this.getBotWalletById(userId, transferDto.botId);

    if (!userWallet || !botWallet) {
      return null;
    }

    const botWalletAmount = botWallet.amount;
    let transferAmount = Number(transferDto.amount);

    // if user have virtual credit amount, procees
    if (transferDto.transType !== SharedTypes.TransferType.WITHDRAW && userWallet.creditAmount > 0) {
      const creditAmountToProceed = Math.min(transferAmount, Number(userWallet.creditAmount));
      userWallet.creditAmount = Math.max(0, userWallet.creditAmount - creditAmountToProceed);
      botWallet.creditAmount += creditAmountToProceed;

      transferAmount -= creditAmountToProceed;
      // const transaction = await this.referralService.addReferralTransaction({
      //   refererId: userId,
      //   refereeId: userId,
      //   type: ReferralTransTypes.DEPOSIT,
      //   status: TransactionStatuses.COMPLETED,
      //   amount: creditAmountToProceed,
      //   transactionHash: "",
      //   explorer: "",
      //   error: ""
      // });
    }

    // it should be done by transferDto.transferType (for now it is done by transferDto.transferType.SET)
    userWallet.allocatedAmount = Math.max(0, userWallet.allocatedAmount - botWallet.amount + transferAmount);
    userWallet.availableAmount = userWallet.amount - userWallet.allocatedAmount;
    botWallet.amount = transferAmount;

    // if user delete the bot, the transType is WITHDRAW
    if (transferDto.transType === SharedTypes.TransferType.WITHDRAW) {
      if (userWallet.amount >= botWallet.debtAmount && userWallet.availableAmount >= botWallet.debtAmount) {
        userWallet.amount -= botWallet.debtAmount;
        userWallet.availableAmount = userWallet.amount - userWallet.allocatedAmount;
      } else {
        userWallet.debtAmount += botWallet.debtAmount;
      }
      botWallet.debtAmount = 0;
      botWallet.creditAmount = 0;
      // botWallet.creditAmount = Math.max(0, botWallet.creditAmount);
      // if bot has debt
    } else if (botWallet.debtAmount > 0 && botWallet.amount > botWallet.debtAmount) {
      userWallet.amount -= botWallet.debtAmount;
      userWallet.allocatedAmount -= botWallet.debtAmount;
      userWallet.availableAmount = userWallet.amount - userWallet.allocatedAmount;

      botWallet.amount -= botWallet.debtAmount;
      botWallet.debtAmount = 0;
    }

    userWallet = await userWallet.save();
    botWallet = await botWallet.save();

    await this.arrangeUserWallet(userId);

    // save user transaction
    const botTransAmount = botWallet.amount - botWalletAmount;
    if (processLog && botTransAmount !== 0) {
      await this.addUserTransaction({
        userId,
        botId: transferDto.botId,
        type: SharedTypes.TransactionTypes.TRANSFER,
        subType: botTransAmount >= 0 ? SharedTypes.TransferType.DEPOSIT : SharedTypes.TransferType.WITHDRAW,
        status: SharedTypes.TransactionStatuses.COMPLETED,
        address: "",
        amount: botTransAmount,
      });
    }
    return botWallet;
  }

  async autoRefillBotWallet(userId: string, autoRefillDto: BotWallet.AutoRefillDto): Promise<BotWallet.Model> {
    let botWallet = await this.getBotWalletById(userId, autoRefillDto.botId);

    if (!botWallet) {
      return null;
    }

    botWallet.autoRefill = autoRefillDto.autoRefill;
    botWallet = await botWallet.save();
    return botWallet;
  }

  async setCreditsToBots(
    userId: string,
    botId: string,
    amount: number,
    transType: SharedTypes.TransferType = SharedTypes.TransferType.DEPOSIT
  ) {
    let algobots = [];

    if (botId === null) {
      algobots = await this.getAlgobots();
    } else {
      algobots = await this.botModel.find({ _id: botId, enabled: true });
    }

    if (!algobots) {
      return;
    }
    const promises = algobots.map(async (bot) => {
      // no process for the community bots
      if (!this.isCommunityBot(bot)) {
        let botWallet = await this.getBotWalletById(userId, bot.id);
        if (transType === SharedTypes.TransferType.SET) {
          botWallet.creditAmount = amount;
        } else if (transType === SharedTypes.TransferType.DEPOSIT) {
          botWallet.creditAmount += amount;
        } else if (transType === SharedTypes.TransferType.WITHDRAW) {
          botWallet.creditAmount = Math.max(0, botWallet.creditAmount - amount);
        }
        botWallet = await botWallet.save();
      }
    });

    await Promise.all(promises);
  }

  async addUserWalletTracking(tracking: any): Promise<UserWalletTracking.Model> {
    let userWalletTracking = new this.UserWalletTrackingModel(tracking);
    userWalletTracking = await userWalletTracking.save();
    return userWalletTracking;
  }

  async addUserTransaction(transaction: any): Promise<UserTransaction.Model> {
    if (transaction.botId && !transaction.botName) {
      const algoBot: AlgoBotModel = await this.botModel.findOne({ _id: transaction.botId });
      if (algoBot) {
        transaction.botName = algoBot.name;
      }
    }
    let userWallet: any = await this.getUserWallet(transaction.userId);
    if (!userWallet) {
      userWallet = {};
    }
    let userTransaction = new this.UserTransactionModel({ ...transaction, userWallet });
    userTransaction = await userTransaction.save();
    return userTransaction;
  }

  async addUserTransactionByFeeTracking(feeTracking: FeeTracking.Model): Promise<UserTransaction.Model> {
    let userTransaction = await this.UserTransactionModel.findOne({ _id: feeTracking.userId, transactionId: feeTracking.feeTransactionId });

    if (!userTransaction) {
      userTransaction = await this.addUserTransaction({
        transactionId: feeTracking.feeTransactionId,
        userId: feeTracking.userId,
        botId: feeTracking.botId,
        botName: feeTracking.botName,
        type: SharedTypes.TransactionTypes.PERFORMANCE_FEE,
        subType: feeTracking.type,
        completed: false,
        status: SharedTypes.TransactionStatuses.PENDING,
        amount: feeTracking.amount,
        extra: {
          performanceCycleId: feeTracking.performanceCycleId,
        },
      });
    }
    return userTransaction;
  }

  async updateUsersTransactionsByFeeTransaction(feeTransaction: FeeTransaction.Model): Promise<void> {
    const usersTransactions = await this.UserTransactionModel.find({ transactionId: feeTransaction._id });
    let completed = false;
    if (
      feeTransaction.status === SharedTypes.TransactionStatuses.COMPLETED ||
      feeTransaction.status === SharedTypes.TransactionStatuses.FAILED
    ) {
      completed = true;
    }

    const promises = usersTransactions.map(async (transaction) => {
      transaction.totalAmount = feeTransaction.amount;
      transaction.completed = completed;
      transaction.status = feeTransaction.status;
      transaction.hash = feeTransaction.hash;
      transaction.confirmations = feeTransaction.confirmations;
      transaction.confirmPercent = feeTransaction.confirmPercent;
      transaction.explorer = feeTransaction.explorer;
      transaction.error = feeTransaction.error;
      const userTransaction = await transaction.save();
      return true;
    });

    await Promise.all(promises);
  }

  async getFeeWallet(botId: string, type: SharedTypes.FeeRecipientType): Promise<FeeWallet.Model> {
    let feeWallet = await this.FeeWalletModel.findOne({ botId, type });

    if (!feeWallet) {
      feeWallet = new this.FeeWalletModel({
        botId,
        botName: "",
        type,
        amount: 0,
        paidAmount: 0,
      });
      feeWallet = await feeWallet.save();
    }
    return feeWallet;
  }

  async addFeeTracking(tracking: FeeTracking.AddDto): Promise<FeeTracking.Model> {
    const condition = {
      userId: tracking.userId,
      botId: tracking.botId,
      botSubId: tracking.botSubId,
      performanceCycleId: tracking.performanceCycleId,
      type: tracking.type,
    };
    const feeTracking = await this.FeeTrackingModel.findOneAndUpdate(condition, tracking, { upsert: true });
    return feeTracking;
  }

  async addFeeTransaction(transaction: FeeTransaction.AddDto): Promise<FeeTransaction.Model> {
    let feeTransaction = new this.FeeTransactionModel(transaction);
    feeTransaction = await feeTransaction.save();
    return feeTransaction;
  }

  async getFeeTransactionById(transactionId: string): Promise<FeeTransaction.Model> {
    const feeTransaction = await this.FeeTransactionModel.findOne({ _id: transactionId });
    return feeTransaction;
  }

  async getFeeTransactionsByStatus(status: SharedTypes.TransactionStatuses): Promise<FeeTransaction.Model[]> {
    const feeTransactions = await this.FeeTransactionModel.find({ status });
    return feeTransactions;
  }

  async getFeeTransactionByStatus(status: SharedTypes.TransactionStatuses): Promise<FeeTransaction.Model> {
    const feeTransaction = await this.FeeTransactionModel.findOne({ status });
    return feeTransaction;
  }

  async buildUserTransactions() {
    const userTransactions = await this.UserTransactionModel.find({ type: SharedTypes.TransactionTypes.PERFORMANCE_FEE, completed: false });
    const promises = userTransactions.map(async (userTransaction) => {
      if (
        userTransaction.status === SharedTypes.TransactionStatuses.COMPLETED ||
        userTransaction.status === SharedTypes.TransactionStatuses.FAILED
      ) {
        userTransaction.completed = true;
        await userTransaction.save();
        return false;
      }

      const feeTransaction = await this.getFeeTransactionById(userTransaction.transactionId);
      if (!feeTransaction) {
        return false;
      }
      userTransaction.status = feeTransaction.status;
      userTransaction.hash = feeTransaction.hash;
      userTransaction.confirmations = feeTransaction.confirmations;
      userTransaction.confirmPercent = feeTransaction.confirmPercent;
      userTransaction.explorer = feeTransaction.explorer;
      userTransaction.error = feeTransaction.error;

      if (
        feeTransaction.status === SharedTypes.TransactionStatuses.COMPLETED ||
        feeTransaction.status === SharedTypes.TransactionStatuses.FAILED
      ) {
        userTransaction.completed = true;
      }
      userTransaction = await userTransaction.save();
      return true;
    });
    await Promise.all(promises);
  }

  // should be updated with async processing
  async buildFeeWallets() {
    const feeTrackings = await this.FeeTrackingModel.find({ status: SharedTypes.TransactionStatuses.PENDING });
    const feeWallets = await this.FeeWalletModel.find({});

    const feeTrackingPromises = feeTrackings.map(async (feeTracking) => {
      let feeWallet = feeWallets.find((wallet) => String(wallet.botId) === String(feeTracking.botId) && wallet.type === feeTracking.type);
      if (!feeWallet) {
        feeWallet = await this.getFeeWallet(feeTracking.botId, feeTracking.type);
      }
      feeTracking.status = SharedTypes.TransactionStatuses.TRANSFERRING;
      feeTracking.feeCycleSequence = feeWallet.feeCycleSequence;
      await feeTracking.save();
      feeWallet.amount += feeTracking.amount;
      if (feeWallet.type === SharedTypes.FeeRecipientType.GROUP && feeTracking.type === SharedTypes.FeeRecipientType.GROUP) {
        feeWallet.group.developer.amount += feeTracking.group.developer.amount;
        feeWallet.group.reserve.amount += feeTracking.group.reserve.amount;
        feeWallet.group.pool.amount += feeTracking.group.pool.amount;
        feeWallet.group.burn.amount += feeTracking.group.burn.amount;
      }
      return true;
    });
    await Promise.all(feeTrackingPromises);

    const feeWalletPromises = feeWallets.map(async (wallet) => {
      if (wallet.amount > 0) {
        await wallet.save();
      }
      return true;
    });
    await Promise.all(feeWalletPromises);
  }

  async makeFeeTransactions() {
    const algoBots = await this.getAlgobots();
    const feeWallets = await this.FeeWalletModel.find({});

    const promises = feeWallets.map(async (feeWallet) => {
      const oneMinAgo = moment().subtract(30, "minutes");
      const isNotUpdating = moment(feeWallet.updatedAt).isBefore(oneMinAgo);
      if (feeWallet.amount > 0 && isNotUpdating) {
        const algoBot = algoBots.find((bot) => String(bot._id) === feeWallet.botId);
        const transaction: FeeTransaction.AddDto = {
          botId: feeWallet.botId,
          botName: feeWallet.botName,
          feeCycleSequence: feeWallet.feeCycleSequence,
          type: feeWallet.type,
          status: SharedTypes.TransactionStatuses.PENDING,
          address: feeWallet.address,
          amount: feeWallet.amount,
          group: { ...feeWallet.group },
        };

        // @TODO: apply new fee calculation by staking level logic

        if (algoBot && algoBot.perfFees && algoBot.perfFees.distribution) {
          transaction.group.developer.amount = (transaction.amount * algoBot.perfFees.distribution.developer) / algoBot.perfFees.percent;
          transaction.group.reserve.amount = (transaction.amount * algoBot.perfFees.distribution.reserve) / algoBot.perfFees.percent;
          transaction.group.pool.amount = (transaction.amount * algoBot.perfFees.distribution.pool) / algoBot.perfFees.percent;
          transaction.group.burn.amount = (transaction.amount * algoBot.perfFees.distribution.burn) / algoBot.perfFees.percent;
          console.log(`***--perfees-makeFeeTransactions-setting-amounts: ${JSON.stringify(transaction.group)}`);
        }

        const feeTransaction = await this.addFeeTransaction(transaction);
        const feeTrackings = await this.FeeTrackingModel.find({
          botId: feeWallet.botId,
          type: feeWallet.type,
          status: SharedTypes.TransactionStatuses.TRANSFERRING,
        });
        const feeTrackingsPromises = feeTrackings.map(async (tracking) => {
          tracking.status = SharedTypes.TransactionStatuses.COMPLETED;
          tracking.feeCycleSequence = feeWallet.feeCycleSequence;
          tracking.feeTransactionId = feeTransaction._id;
          const feeTracking = await tracking.save();
          await this.addUserTransactionByFeeTracking(feeTracking);
          return true;
        });
        await Promise.all(feeTrackingsPromises);

        // add current amount to paidAmount
        feeWallet.paidAmount += feeWallet.amount;
        // clean current amounts
        feeWallet.amount = 0;
        if (feeWallet.type === SharedTypes.FeeRecipientType.GROUP) {
          feeWallet.group.developer.amount = 0;
          feeWallet.group.reserve.amount = 0;
          feeWallet.group.pool.amount = 0;
          feeWallet.group.burn.amount = 0;
        }
        // increase fee cycle sequence
        feeWallet.feeCycleSequence += 1;
        await feeWallet.save();
      }
    });

    await Promise.all(promises);
  }

  async getEstimatedAnnualPerfees() {
    const oldSchemaData = await this.FeeTrackingModel.aggregate([
      { $match: { type: "POOL" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const oldFees = oldSchemaData.length > 0 ? oldSchemaData[0].totalAmount : 0;
    const newSchemaData = await this.FeeTrackingModel.aggregate([
      { $unwind: "$group" },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$group.pool" },
        },
      },
    ]);
    const newFees = newSchemaData.length > 0 ? newSchemaData[0].totalAmount : 0;

    const startData = await this.FeeTrackingModel.aggregate([
      {
        $group: {
          _id: null,
          startDate: { $min: "$createdAt" },
        },
      },
    ]);
    const startDate = startData.length > 0 ? new Date(startData[0].startDate).getTime() : new Date().getTime();
    const diffDays = Math.ceil((Date.now() - startDate) / 86400000);

    return (1.0 * (oldFees + newFees) * 365) / diffDays;
  }

  async makeFeeTransactionsFailedToPending() {
    const feeTransactions = await this.FeeTransactionModel.find({
      type: SharedTypes.FeeRecipientType.GROUP,
      status: SharedTypes.TransactionStatuses.FAILED,
    });
    if (!feeTransactions) {
      return false;
    }
    const fiveMinAgo = moment().subtract(30, "minutes");
    const feeTransactionsPromises = feeTransactions.map(async (feeTransaction) => {
      let txTransaction = null;

      if (feeTransaction.hash && feeTransaction.explorer) {
        try {
          txTransaction = await this.ubxtDistributionService.getTxTransaction(feeTransaction.hash);
        } catch (e) {
          txTransaction = null;
        }
      }
      if (feeTransaction.hash && feeTransaction.explorer && txTransaction) {
        feeTransaction.status = SharedTypes.TransactionStatuses.COMPLETED;
        feeTransaction.confirmPercent = 100;
        feeTransaction = await feeTransaction.save();
        this.updateUsersTransactionsByFeeTransaction(feeTransaction);
      } else if (moment(feeTransaction.updatedAt).isBefore(fiveMinAgo)) {
        feeTransaction.status = SharedTypes.TransactionStatuses.PENDING;
        feeTransaction = await feeTransaction.save();
      }
    });

    await Promise.all(feeTransactionsPromises);
    return true;
  }

  async getActiveBotSubscription(userId: string, botId: string) {
    const botSubscription = await this.botSubscriptionModel.findOne({ userId, botId, enabled: true });
    return botSubscription;
  }

  async pauseBotSubscription(botSubId: string, enabled: boolean) {
    const botSubscription = await this.botSubscriptionModel.findOne({ _id: botSubId });
    if (botSubscription) {
      botSubscription.enabled = enabled;
      await botSubscription.save();
    }
  }

  async isPerFeesBotById(botId: string): Promise<boolean> {
    const algoBot: AlgoBotModel = await this.botModel.findOne({ _id: botId });
    if (!algoBot) {
      return false;
    }
    const isCommunityBot = await this.isCommunityBot(algoBot);
    const bFlag = !isCommunityBot && algoBot.category !== "userbot";
    return bFlag;
  }

  async isCommunityBotById(botId: string): Promise<boolean> {
    const algoBot: AlgoBotModel = await this.botModel.findOne({ _id: botId });
    if (!algoBot) {
      return false;
    }
    return this.isCommunityBot(algoBot);
  }

  isCommunityBot(bot: AlgoBotModel): boolean {
    if (bot && (bot.botRef === "AVAXUSDT1" || bot.botRef === "TOMOLO1")) {
      return true;
    }
    return false;
  }

  isIRobotBot(bot: AlgoBotModel): boolean {
    const iRobotRefs = ["IROBOTBTC", "IROBOTETH", "IROBOTBNB"];
    if (bot && iRobotRefs.includes(bot.botRef)) {
      return true;
    }
    return false;
  }

  getBotFeePercent(bot: AlgoBotModel): number {
    if (bot && bot.perfFees && Number(bot.perfFees.percent) > 0) {
      return Number(bot.perfFees.percent);
    }
    // default value
    return 20;
  }

  getBotFeeDeveloperAddress(bot: AlgoBotModel): string {
    if (bot && bot.perfFees && bot.perfFees.address !== "") {
      return bot.perfFees.address;
    }
    // default value
    if (this.isIRobotBot(bot)) {
      return process.env.PFS_DISTRIBUTION_ADDRESS_DEVELOPER_IROBOT;
    }
    return process.env.PFS_DISTRIBUTION_ADDRESS_DEVELOPER;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async getStakers(): Promise<User[]> {
    const users = await this.userModel.find({ ubxtStakingAmount: { $gt: 0 } });
    return users;
  }

  async getAlgobots(): Promise<AlgoBotModel[]> {
    const algoBots = await this.botModel.find({ enabled: true });
    return algoBots;
  }

  async getAlgobotById(botId: string): Promise<AlgoBotModel> {
    const algoBot = await this.botModel.findOne({ _id: botId });
    return algoBot;
  }

  async getTotalTradedAmountPerBot(): Promise<any[]> {
    const res = await this.BotWalletModel.aggregate([
      {
        $match: {
          status: { $eq: "ENABLED" },
          $expr: { $gte: ["$amount", "$debtAmount"] },
        },
      },
      {
        $group: {
          _id: { botId: "$botId" },
          totalAmount: { $sum: "$amount" },
          totalDebitAmount: { $sum: "$debtAmount" },
        },
      },
      {
        $lookup: {
          from: "COL_ALGOBOTS",
          localField: "_id.botId",
          foreignField: "_id",
          as: "botDetail",
        },
      },
      {
        $project: {
          _id: false,
          botId: "$_id.botId",
          allocatedAmount: { $subtract: ["$totalAmount", "$totalDebitAmount"] },
          base: "$botDetail.market.base",
          quote: "$botDetail.market.quote",
          bot: "$botDetail.botRef",
          botName: "$botDetail.name",
          botVer: "$botDetail.botVer",
          botCreator: "$botDetail.creator",
        },
      },
      { $sort: { allocatedAmount: -1 } },
    ]);
    return res || [];
  }

  async getCreditAmountOfBothWallets(userId: string, botId: string): Promise<number> {
    let totalCredits = 0;

    // get credits amount in user wallet
    const userWallet = await this.getUserWallet(userId);
    totalCredits += userWallet?.creditAmount ?? 0;

    if (botId) {
      const botWallet = await this.getBotWalletById(userId, botId);
      totalCredits += botWallet?.creditAmount ?? 0;
    }

    return totalCredits;
  }

  async getBotPaidSubscriptionStatus(userId: string, data: BotWallet.PaidSubscriptionDto) {
    const { ubxtPrice } = this;

    const result = {
      payAmountInUBXT: 0,
      curAmountInUBXT: 0,
      status: SharedTypes.PaidSubscriptionStatus.PAID_NO_ALLOWED,
      payExpiredDate: new Date(),
    };
    const algobot = await this.botModel.findById(data.botId);
    const userWallet = await this.getUserWallet(userId);
    const botWallet = await this.getBotWalletById(userId, data.botId);

    data.feesPlan = data.feesPlan === undefined ? botWallet.paidSubscription?.feesPlan : data.feesPlan;
    data.feesToken = data.feesToken === undefined ? botWallet.paidSubscription?.feesToken : data.feesToken;
    data.autoRefill = data.autoRefill === undefined && botWallet.paidSubscription?.feesPlan ? botWallet.autoRefill : data.autoRefill;

    data.feesPlan = data.feesPlan === undefined ? "monthlyFees" : data.feesPlan;
    data.feesToken = data.feesToken === undefined ? "UBXT" : data.feesToken;
    data.autoRefill = data.autoRefill === undefined ? true : data.autoRefill;

    const tradableAmount = data.autoRefill
      ? userWallet.availableAmount + userWallet.creditAmount - userWallet.debtAmount
      : botWallet.amount + botWallet.creditAmount - botWallet.debtAmount;

    if (!algobot.botFees) {
      return {
        ...result,
        curAmountInUBXT: tradableAmount,
      };
    }

    let paidPrice = 0;
    let expiredDays = 0;
    if (data.feesPlan === "monthlyFees") {
      paidPrice = algobot.botFees.monthlyPrice;
      expiredDays = 30;
    } else if (data.feesPlan === "yearlyFees") {
      paidPrice = algobot.botFees.yearlyPrice;
      expiredDays = 360;
    }
    const payableAmount = paidPrice / ubxtPrice.usd;

    result.payAmountInUBXT = payableAmount;
    result.curAmountInUBXT = tradableAmount;

    if (botWallet.paidSubscription?.lastPaidAt) {
      let currentExpiredDays = 0;
      if (botWallet.paidSubscription?.feesPlan === "monthlyFees") {
        currentExpiredDays = 30;
      } else if (botWallet.paidSubscription?.feesPlan === "yearlyFees") {
        currentExpiredDays = 360;
      }
      const currentExpiredDate = moment(botWallet.paidSubscription?.lastPaidAt).add(currentExpiredDays, "day");
      const nextExpiredDate = moment(botWallet.paidSubscription?.lastPaidAt).add(expiredDays, "day");
      if (nextExpiredDate.isSameOrBefore(currentExpiredDate) && moment().isBefore(nextExpiredDate)) {
        return {
          ...result,
          status: SharedTypes.PaidSubscriptionStatus.PAID_OK,
          payExpiredDate: moment(botWallet.paidSubscription?.lastPaidAt).add(expiredDays, "day"),
        };
      }
    }

    // PAID_NO_ENOUGH
    if (tradableAmount < payableAmount) {
      return {
        ...result,
        status: SharedTypes.PaidSubscriptionStatus.PAID_NO_ENOUGH,
      };
    }

    if (!botWallet.paidSubscription || !botWallet.paidSubscription.lastPaidAt) {
      return {
        ...result,
        status: SharedTypes.PaidSubscriptionStatus.PAID_AVAILABLE,
      };
    }

    return {
      ...result,
      status: SharedTypes.PaidSubscriptionStatus.PAID_AVAILABLE,
      payExpiredDate: moment(botWallet.paidSubscription?.lastPaidAt).add(30, "day"),
    };
  }

  async stopBotPaidSubscription(userId: string, data: BotWallet.PaidSubscriptionDto) {
    const botWallet = await this.getBotWalletById(userId, data.botId);

    if (botWallet.paidSubscription) {
      botWallet.paidSubscription = {};
    }
    await botWallet.save();
    return botWallet;
  }

  async startBotPaidSubscription(userId: string, data: BotWallet.PaidSubscriptionDto) {
    const botWallet = await this.getBotWalletById(userId, data.botId);

    if (!botWallet.paidSubscription) {
      botWallet.paidSubscription = {};
    }
    botWallet.paidSubscription.feesPlan = data.feesPlan;
    botWallet.paidSubscription.feesToken = data.feesToken;
    botWallet.autoRefill = data.autoRefill;
    await botWallet.save();

    const result = await this.processBotPaidSubscription(userId, data.botId);
    return result;
  }

  async processBotPaidSubscription(userId: string, botId: string) {
    const { ubxtPrice } = this;
    const algobot = await this.botModel.findById(botId);
    const userWallet = await this.getUserWallet(userId);
    const botWallet = await this.getBotWalletById(userId, botId);
    const tradableAmount = botWallet.autoRefill
      ? userWallet.availableAmount + userWallet.creditAmount - userWallet.debtAmount
      : botWallet.amount + botWallet.creditAmount - botWallet.debtAmount;

    let paidPrice = 0;
    let expiredDays = 0;
    if (botWallet.paidSubscription.feesPlan === "monthlyFees") {
      paidPrice = algobot.botFees.monthlyPrice;
      expiredDays = 30;
    } else if (botWallet.paidSubscription.feesPlan === "yearlyFees") {
      paidPrice = algobot.botFees.yearlyPrice;
      expiredDays = 360;
    }
    const payableAmount = paidPrice / ubxtPrice.usd;
    let paymentAmount = payableAmount;

    // close the bot subscription
    if (tradableAmount < payableAmount) {
      const botSubscription = await this.getActiveBotSubscription(userId, botId);
      if (botSubscription) {
        await this.pauseBotSubscription(botSubscription._id, false);
      }
      return false;
    }

    // do the payment
    if (botWallet.paidSubscription.lastPaidAt) {
      const expiredDate = moment(botWallet.paidSubscription?.lastPaidAt).add(expiredDays, "day");
      if (moment().isBefore(expiredDate)) {
        return false;
      }
    }

    if (botWallet.autoRefill) {
      // Move payment amount from user wallet to bot wallet
      paymentAmount = payableAmount;
      const creditAmount = Math.min(paymentAmount, userWallet.creditAmount);
      userWallet.creditAmount -= creditAmount;
      botWallet.creditAmount += creditAmount;
      paymentAmount -= creditAmount;

      userWallet.availableAmount -= paymentAmount;
      userWallet.allocatedAmount += paymentAmount;
      botWallet.amount += paymentAmount;
    }
    // process in bot wallet
    paymentAmount = payableAmount;
    let deductionAmount = Math.min(botWallet.creditAmount, paymentAmount);
    botWallet.creditAmount -= deductionAmount;
    botWallet.paidAmount += deductionAmount;
    paymentAmount -= deductionAmount;

    deductionAmount = Math.min(botWallet.amount, paymentAmount);
    botWallet.amount -= deductionAmount;
    userWallet.amount -= deductionAmount;
    botWallet.paidAmount += deductionAmount;
    paymentAmount -= deductionAmount;

    botWallet.paidSubscription.lastPaidAt = new Date();

    await userWallet.save();
    await botWallet.save();
    await this.arrangeUserWallet(userId);
    await this.addUserTransaction({
      userId,
      botId,
      type: botWallet.paidSubscription.feesPlan,
      subType: SharedTypes.TransferType.DEPOSIT,
      status: SharedTypes.TransactionStatuses.COMPLETED,
      address: "",
      amount: payableAmount,
    });
    return true;
  }
}
