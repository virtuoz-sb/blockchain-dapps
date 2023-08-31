/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
import { HttpService, Inject, Injectable, Logger, CACHE_MANAGER } from "@nestjs/common";
import { Model } from "mongoose";
import { Cache } from "cache-manager";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";

import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";

import TradeBalanceService from "../../portfolio/services/trade-balance.service";
import { SignalTrackingModelName } from "../../algobot/models/signal-tracking.schema";
import { SignalTrackingDto, SignalTrackingModel } from "../../algobot/models/signal-tracking.dto";
import { PerformanceCycleModel } from "../../performance/models/performance.models";

import { ExchangeKeyCreationDto, ExchangeKey, ExchangeKeyDto, ExchangeKeyEditDto } from "../../types/exchange-key";

@Injectable()
export default class DbUpdatingService {
  private readonly logger = new Logger(DbUpdatingService.name);

  constructor(
    @InjectModel("AlgoBot") private botModel: Model<AlgoBotModel>,
    @InjectModel("AlgoBotSubscription") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    private tradeBalanceService: TradeBalanceService,
    @InjectModel("ExchangeKey") private keyModel: Model<ExchangeKey>,
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>
  ) {}

  onModuleInit() {
    // this.updateAccountPercentages();
    // this.updateHuobiproToHuobi();
    // this.fixAlgobotSubscription();
  }

  async fixAlgobotSubscription() {
    const subscriptions = await this.botSubscriptionModel.find({ positionType: "percent", positionAmount: { $gt: 1 } });

    const promises = subscriptions.map(async (subscription) => {
      const sub = subscription;
      sub.positionAmount = subscription.accountPercent;

      await sub.save();
    });

    await Promise.all(promises);
  }

  // update key names
  async updateHuobiproToHuobi() {
    const q = await this.keyModel.update({ exchange: "huobipro" }, { exchange: "huobi" });
  }

  // @Cron("*/3 * * * *") // Cron every 3 minutes
  async updateAccountPercentages() {
    const algobots = await this.botModel.find({});
    const subscriptions = await this.botSubscriptionModel.find({ enabled: true, deleted: false });

    const promises = subscriptions.map(async (subscription) => {
      const algoSubscription = subscription;

      try {
        const { accountPercent } = algoSubscription;
        const accountBalances = await this.tradeBalanceService.getBalanceForTrading(algoSubscription.userId, algoSubscription.apiKeyRef);
        const usdtBalance = accountBalances.freeBalances && accountBalances.freeBalances.USDT;

        if (!accountPercent || accountPercent <= 0 || !usdtBalance) {
          return;
        }

        const algobot = algobots.find((bot) => String(bot._id) === algoSubscription.botId.toString());
        const algobotAllocated = algobot && algobot.allocated;
        if (!algobotAllocated) {
          return;
        }

        if (!algoSubscription.accountAllocated) {
          algoSubscription.accountAllocated = {
            maxamount: algobotAllocated.maxamount,
            currency: algobotAllocated.currency,
          };
        }
        const algoSubscriptionAllocated = algoSubscription.accountAllocated;
        if (
          algobotAllocated.maxamount === 0 ||
          algoSubscriptionAllocated.maxamount === 0 ||
          algobotAllocated.maxamount === algoSubscriptionAllocated.maxamount
        ) {
          return;
        }

        if (accountPercent * usdtBalance > algoSubscriptionAllocated.maxamount) {
          const newAccountPercent = accountPercent * (algoSubscriptionAllocated.maxamount / algobotAllocated.maxamount);
          console.log(
            "*****************update account percentage:",
            algoSubscription.id,
            algoSubscription.accountPercent,
            newAccountPercent
          );
          algoSubscription.accountPercent = newAccountPercent;
        }

        algoSubscription.accountAllocated = {
          maxamount: algobotAllocated.maxamount,
          currency: algobotAllocated.currency,
        };

        await algoSubscription.save();
      } catch (e) {
        console.log("*****-- updating-account-error:", subscription);
      }
      // if (!subscriptionModel.accountAllocated) {
      //   const bot = await this.botModel.findOne({ _id: subscription.botId });
      //   subscriptionModel.accountAllocated = bot && bot.allocated ? bot.allocated : { maxamount: 2500, currency: "USDT" };
      //   await subscriptionModel.save();
      // }
    });

    await Promise.all(promises);
  }
}
