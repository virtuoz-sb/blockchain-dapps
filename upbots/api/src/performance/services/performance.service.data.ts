/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */

import { HttpService, Inject, Injectable, Logger, CACHE_MANAGER } from "@nestjs/common";
import { Model } from "mongoose";
import { Cache } from "cache-manager";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as dayjs from "dayjs";
import {
  PerformanceSnapshotDto,
  PerformanceCycleDto,
  PerformanceSnapshotModel,
  MeasuredObjects,
  PerformanceCycleModel,
  UbxtBalance,
} from "../models/performance.models";
import { AdminPerformanceCycleModel } from "../models/admin-performance.model";
import AdminPerformanceCycleDto from "../models/admin-performance.dto";
import CurrentPriceService from "../../cryptoprice/price-summary.service";
import maxDrawdown from "../../utilities/max-drawdown.util";
import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import { AlgoBotStatsModel } from "../../algobot/models/algobot-stats.model";
import { SignalTrackingModelName } from "../../algobot/models/signal-tracking.schema";
import { SignalTrackingDto, SignalTrackingModel } from "../../algobot/models/signal-tracking.dto";
import AlgoBotStatsDto from "../../algobot/models/algobot-stats.dto";
import * as FeeTracking from "../../perfees/models/fee-tracking.model";
import { OrderTrackingModelName, OrderTrackingModel } from "../../trade/model/order-tracking.schema";
import { FeeRecipientType } from "../../perfees/models/shared.types";
import { MyTradeDto } from "../models/algobot-with-performance.dto";
import * as UbxtCirculation from "../../ubxt/circulation/service";

@Injectable()
export default class PerformanceServiceData {
  private readonly logger = new Logger(PerformanceServiceData.name);

  private ubxtPrice: UbxtBalance;

  private readonly coingeckoApiUrl = `${process.env.COINGECKO_URL}/api/v3/simple/price`;

  constructor(
    @InjectModel("PerformanceSnapshotModel") private performanceSnapshotModel: Model<PerformanceSnapshotModel>,
    @InjectModel("PerformanceCyclesModel") private performanceCyclesModel: Model<PerformanceCycleModel>,
    @InjectModel("AdminPerformanceCycleModel") private adminPerformanceCycleModel: Model<AdminPerformanceCycleModel>,
    @InjectModel("AlgoBot") private botModel: Model<AlgoBotModel>,
    @InjectModel("AlgoBotSubscription") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel("AlgoBotStats") private algoBotStatsModel: Model<AlgoBotStatsModel>,
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>,
    @InjectModel(OrderTrackingModelName) private orderTrackModel: Model<OrderTrackingModel>,
    @InjectModel(FeeTracking.ModelName) private feeTrackingModel: Model<FeeTracking.Model>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private priceSvc: CurrentPriceService,
    private readonly httpService: HttpService
  ) {}

  getUbxtPrice() {
    return this.ubxtPrice;
  }

  async getLastPerformanceSubscriptionCycle(subBotId): Promise<PerformanceCycleDto> {
    return this.performanceCyclesModel
      .findOne({ subBotId, measuredObject: MeasuredObjects.SUBSCRIPTION }, {})
      .sort({ createdAt: -1 })
      .lean();
  }

  async updatePerformanceSubscriptionCycle(cycle: PerformanceCycleDto): Promise<PerformanceCycleDto> {
    return this.performanceCyclesModel.findOneAndUpdate(
      { cycleSequence: cycle.cycleSequence, subBotId: cycle.subBotId, measuredObject: MeasuredObjects.SUBSCRIPTION },
      { ...cycle },
      { upsert: true }
    );
  }

  async updatePerformanceBotCycle(cycle: PerformanceCycleDto): Promise<PerformanceCycleDto> {
    let condition: any = { cycleSequence: cycle.cycleSequence, botId: cycle.botId, measuredObject: MeasuredObjects.BOT };
    if (cycle.botVer === "1") {
      condition = { ...condition, $or: [{ botVer: { $exists: false } }, { botVer: "1" }] };
    } else {
      condition = { ...condition, botVer: cycle.botVer };
    }

    return this.performanceCyclesModel.findOneAndUpdate(condition, { ...cycle }, { upsert: true });
  }

  async updatePerformanceSubscriptionSnapshot(snapshot: PerformanceSnapshotDto): Promise<void> {
    this.performanceSnapshotModel
      .findOneAndUpdate(
        {
          botId: snapshot.botId,
          subBotId: snapshot.subBotId,
          measuredObject: MeasuredObjects.SUBSCRIPTION,
        },
        { ...snapshot },
        { upsert: true }
      )
      .then(() => {
        this.logger.debug(`createAndSavePerformanceSnapshot: upsert SUBSCRIPTION perf. for sub ${snapshot.subBotId} bot ${snapshot.botId}`);
      })
      .catch((err) => this.logger.error(`createAndSavePerformanceSnapshot: ERROR: ${err}`));
  }

  async updatePerformanceBotSnapshot(snapshot: PerformanceSnapshotDto): Promise<void> {
    await this.performanceSnapshotModel
      .findOneAndUpdate(
        {
          botId: snapshot.botId,
          measuredObject: MeasuredObjects.BOT,
        },
        { ...snapshot },
        { upsert: true }
      )
      .then(() => {
        this.logger.debug(`createAndSavePerformanceSnapshot: upsert BOT perf. bot ${snapshot.botId}`);
      })
      .catch((err) => this.logger.error(`createAndSavePerformanceSnapshot: ERROR: ${err}`));
  }

  async getTimerangeSubscriptionCycles(subBotId: string, start: Date): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceCyclesModel
      .find(
        { subBotId, measuredObject: MeasuredObjects.SUBSCRIPTION, $or: [{ closeAt: { $gte: start } }, { openAt: { $gte: start } }] },
        null,
        { sort: { cycleSequence: -1 } }
      )
      .lean();
    // only the last cycle had open trade. to avoid the loop
    if (cycles.length > 0) {
      const lastCycle = cycles[0];
      if (lastCycle.entryPrice && lastCycle.open) {
        const latestPrice = await this.getLatestPrice(lastCycle);
        cycles[0].profitPercentage =
          (lastCycle.stratType === "SHORT" ? -1 : 1) * ((latestPrice - lastCycle.entryPrice) / lastCycle.entryPrice) * 100;
        cycles[0].profitPercentageUC = 0;
      }
    }
    return this.mapSubscriptionCycles(cycles);
  }

  async getTimerangeCycles(start: Date): Promise<PerformanceCycleDto[]> {
    let cycles = await this.performanceCyclesModel
      .find({ measuredObject: MeasuredObjects.SUBSCRIPTION, $or: [{ closeAt: { $gte: start } }, { openAt: { $gte: start } }] })
      .lean();
    const priceSummaries = await this.priceSvc.fetchExchangesSummaries();
    cycles = await Promise.all(
      cycles.map(async (cycle) => {
        if (cycle.entryPrice && cycle.open) {
          const latestPrice = await this.getLatestPriceForCycles(cycle, priceSummaries);
          cycle.profitPercentage = (cycle.stratType === "SHORT" ? -1 : 1) * ((latestPrice - cycle.entryPrice) / cycle.entryPrice) * 100;
          cycle.profitPercentageUC = 0;
        }
        return cycle;
      })
    );
    return this.mapSubscriptionCycles(cycles);
  }

  async calcProfitAndRealisedGain(cycle: PerformanceCycleDto): Promise<PerformanceCycleDto> {
    const ubxtPrice = this.getUbxtPrice();

    cycle.profitPercentage = (cycle.stratType === "SHORT" ? -1 : 1) * ((cycle.closePrice - cycle.entryPrice) / cycle.entryPrice) * 100;
    cycle.profitPercentageUC = 0;
    const realisedQuoteGain = (cycle.stratType === "SHORT" ? -1 : 1) * (cycle.closePrice - cycle.entryPrice) * cycle.qExec;
    cycle.realisedGain = {
      ubxt: realisedQuoteGain / ubxtPrice.usd,
      btc: (realisedQuoteGain / ubxtPrice.usd) * ubxtPrice.btc,
      usd: realisedQuoteGain,
      eur: (realisedQuoteGain / ubxtPrice.usd) * ubxtPrice.eur,
    };

    return cycle;
  }

  async getLatestPrice(cycle: PerformanceCycleDto): Promise<number> {
    let { exch } = cycle;
    if (cycle.exch === "kucoin-future") {
      exch = "kucoin";
    } else if (cycle.exch === "binance-future") {
      exch = "binance";
    } else if (cycle.exch === "ftx-future") {
      exch = "ftx";
    }

    const cachedEstimate = await this.cache.get(CurrentPriceService.key);
    if (cachedEstimate) {
      const cachedPrice = cachedEstimate.find(({ exchange, symbol }) => exchange === exch && symbol === cycle.sbl);
      if (cachedPrice?.price?.last) {
        return cachedPrice.price?.last;
      }
    }
    const currentPrice = await this.priceSvc.getCurrentPriceSummary(exch, cycle.sbl);
    return currentPrice.result?.price?.last || 0;
  }

  async getLatestPriceForCycles(cycle: PerformanceCycleDto, cachedEstimate) {
    let { exch } = cycle;
    if (cycle.exch === "kucoin-future") {
      exch = "kucoin";
    } else if (cycle.exch === "binance-future") {
      exch = "binance";
    } else if (cycle.exch === "ftx-future") {
      exch = "ftx";
    }

    const cachedPrice = cachedEstimate.find(({ exchange, symbol }) => exchange === exch && symbol === cycle.sbl);
    if (cachedPrice?.price?.last) {
      return cachedPrice.price?.last;
    }
    return 0;
  }

  async calcCurrentSubscriptionCycle(cycle: PerformanceCycleDto): Promise<PerformanceCycleDto> {
    cycle.open = false;
    cycle.closePrice = await this.getLatestPrice(cycle);
    cycle = await this.calcProfitAndRealisedGain(cycle);
    return cycle;
  }

  async getPerformanceCycleByCondition(condition): Promise<PerformanceCycleModel> {
    return this.performanceCyclesModel.findOne(condition, {}).sort({ createdAt: -1 }).lean();
  }

  async removePerformanceCycleByCondition(condition) {
    return this.performanceCyclesModel.deleteMany(condition);
  }

  async getTimerangeAllSubscriptionCycles(start: Date): Promise<AdminPerformanceCycleDto[]> {
    const cycles = await this.adminPerformanceCycleModel
      .find({ measuredObject: MeasuredObjects.SUBSCRIPTION, $or: [{ closeAt: { $gte: start } }, { openAt: { $gte: start } }] }, null, {
        sort: { cycleSequence: -1 },
      })
      .populate("userId", "email")
      .populate("subBotId", "botId botRunning deleted deletedAt enabled updatedAt")
      .populate("botId", "botRef")
      .lean();
    return cycles ? cycles.map(this.mapAdminSubscriptionCycles) : new Array<AdminPerformanceCycleDto>();
  }

  async getTimerangeBotCycles(botId: string, start: Date): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceCyclesModel
      .find({ botId, measuredObject: MeasuredObjects.BOT, $or: [{ closeAt: { $gte: start } }, { openAt: { $gte: start } }] }, null, {
        sort: { cycleSequence: -1 },
      })
      .lean();
    return this.mapBotCycles(cycles);
  }

  async getTimerangeUserCycles(userId: string, start: Date): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceCyclesModel
      .find(
        { userId, measuredObject: MeasuredObjects.SUBSCRIPTION, $or: [{ closeAt: { $gte: start } }, { openAt: { $gte: start } }] },
        null,
        { sort: { cycleSequence: -1 } }
      )
      .lean();
    return this.mapSubscriptionCycles(cycles);
  }

  async getSixPastMonthsSubscriptionSnapshot(subBotId: string): Promise<PerformanceSnapshotDto> {
    const snapshot = await this.performanceSnapshotModel.findOne({ subBotId, measuredObject: MeasuredObjects.SUBSCRIPTION }).lean();
    if (snapshot) {
      return {
        botId: snapshot.botId,
        stratType: snapshot.stratType,
        subBotId,
        size: snapshot.size,
        measuredObject: MeasuredObjects.SUBSCRIPTION,
        snapshotDate: snapshot.snapshotDate,
        allmonths: snapshot.allmonths,
        month12: snapshot.month12,
        month6: snapshot.month6,
        month3: snapshot.month3,
        month1: snapshot.month1,
        day7: snapshot.day7,
        allmonthsUC: snapshot.allmonthsUC,
        month12UC: snapshot.month12UC,
        month6UC: snapshot.month6UC,
        month3UC: snapshot.month3UC,
        month1UC: snapshot.month1UC,
        day7UC: snapshot.day7UC,
        fees: snapshot.fees,
        charts: snapshot.charts,
        maxDrawdown: maxDrawdown(snapshot.cyclesData),
      };
    }
    return {} as PerformanceSnapshotDto;
  }

  async getSixPastMonthsBotSnapshot(botId: string): Promise<PerformanceSnapshotDto> {
    const snapshot = await this.performanceSnapshotModel.findOne({ botId, measuredObject: MeasuredObjects.BOT }).lean();
    if (!snapshot) {
      return null;
    }
    return {
      botId: snapshot.botId,
      stratType: snapshot.stratType,
      size: snapshot.size,
      measuredObject: MeasuredObjects.BOT,
      snapshotDate: snapshot.snapshotDate,
      allmonths: snapshot.allmonths,
      month12: snapshot.month12,
      month6: snapshot.month6,
      month3: snapshot.month3,
      month1: snapshot.month1,
      day7: snapshot.day7,
      allmonthsUC: snapshot.allmonthsUC,
      month12UC: snapshot.month12UC,
      month6UC: snapshot.month6UC,
      month3UC: snapshot.month3UC,
      month1UC: snapshot.month1UC,
      day7UC: snapshot.day7UC,
      fees: snapshot.fees,
      charts: snapshot.charts,
      maxDrawdown: maxDrawdown(snapshot.cyclesData),
    };
  }

  async getBotStatsByUser(userId): Promise<AlgoBotStatsDto[]> {
    const botsStats = await this.algoBotStatsModel.find({ ownerId: userId }).lean();
    return this.mapBotStats(botsStats);
  }

  mapBotStats(botsStats: AlgoBotStatsDto[]): AlgoBotStatsDto[] {
    return botsStats.map((stats) => ({
      ownerId: stats.ownerId,
      botRef: stats.botRef,
      name: stats.name,
      totalUsers: stats.totalUsers,
      totalRealisedUbxtGain: stats.totalRealisedUbxtGain,
      lastTradeAmount: stats.lastTradeAmount,
      openedTradeAmount: stats.openedTradeAmount,
      activatedAt: stats.activatedAt,
    }));
  }

  mapSubscriptionCycles(cycles: PerformanceCycleDto[]): PerformanceCycleDto[] {
    return cycles.map((cycle) => {
      return {
        openAt: cycle.openAt,
        openPeriod: cycle.openPeriod,
        closeAt: cycle.closeAt,
        closePeriod: cycle.closePeriod,
        stratType: cycle.stratType,
        result: cycle.result,
        subBotId: cycle.subBotId,
        userId: cycle.userId,
        measuredObject: cycle.measuredObject,
        cycleSequence: cycle.cycleSequence,
        open: cycle.open,
        sbl: cycle.sbl,
        exch: cycle.exch,
        realisedGain: cycle.realisedGain,
        performanceFee: cycle.performanceFee,
        profitPercentage: cycle.profitPercentage,
        profitPercentageUC: cycle.profitPercentageUC,
        entryPrice: cycle.entryPrice,
        closePrice: cycle.closePrice,
        qExec: cycle.qExec,
        createdAt: cycle.createdAt,
      };
    });
  }

  private mapAdminSubscriptionCycles(cycle: AdminPerformanceCycleDto): AdminPerformanceCycleDto {
    if (!cycle) return null;
    const {
      openAt,
      openPeriod,
      closeAt,
      closePeriod,
      stratType,
      result,
      measuredObject,
      cycleSequence,
      open,
      sbl,
      exch,
      profitPercentage,
      entryPrice,
      closePrice,
    } = cycle;
    return {
      openAt,
      openPeriod,
      closeAt,
      closePeriod,
      stratType,
      result,
      measuredObject,
      cycleSequence,
      open,
      sbl,
      exch,
      profitPercentage,
      entryPrice,
      closePrice,
      user: cycle.userId,
      subcription: cycle.subBotId,
      bot: cycle.botId,
    };
  }

  mapBotCycles(cycles: PerformanceCycleDto[]): PerformanceCycleDto[] {
    return cycles.map((cycle) => {
      return {
        botVer: cycle.botVer,
        openAt: cycle.openAt,
        openPeriod: cycle.openPeriod,
        closeAt: cycle.closeAt,
        closePeriod: cycle.closePeriod,
        stratType: cycle.stratType,
        result: cycle.result,
        measuredObject: cycle.measuredObject,
        cycleSequence: cycle.cycleSequence,
        open: cycle.open,
        sbl: cycle.sbl,
        exch: cycle.exch,
        profitPercentage: cycle.profitPercentage,
        profitPercentageUC: cycle.profitPercentageUC,
        realisedGain: cycle.realisedGain,
        performanceFee: cycle.performanceFee,
        entryPrice: cycle.entryPrice,
        closePrice: cycle.closePrice,
        qExec: cycle.qExec,
      };
    });
  }

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

  async getMyTradesData(userId: string): Promise<MyTradeDto[]> {
    this.logger.log(`Getting my trades, user id: ${userId}`);
    const res = await this.performanceCyclesModel.aggregate([
      {
        $match: {
          $and: [
            {
              $expr: {
                $eq: [
                  "$userId",
                  {
                    $convert: { input: userId, to: "objectId" },
                  },
                ],
              },
            },
            {
              $expr: {
                $eq: ["$measuredObject", "SUBSCRIPTION"],
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "COL_ALGOBOTS",
          localField: "botId",
          foreignField: "_id",
          as: "botDetail",
        },
      },
      {
        $project: {
          botId: "$botId",
          botName: "$botDetail.name",
          exch: "$exch",
          pair: "$botDetail.market",
          open: "$open",
          openAt: "$openAt",
          closeAt: "$closeAt",
          qExec: "$qExec",
          entryPrice: "$entryPrice",
          closePrice: "$closePrice",
          realisedGain: "$realisedGain",
          performanceFee: "$performanceFee",
          profitPercentage: "$profitPercentage",
          profitPercentageUC: "$profitPercentageUC",
          cycleSequence: "$cycleSequence",
        },
      },
      {
        $match: { botId: { $exists: true } },
      },
      {
        $sort: {
          openAt: -1,
        },
      },
    ]);
    return res || [];
  }

  /**
   * Algobot stats
   */
  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: "algobots-stats",
  }) // AlgobotsStats Cron every 10 minutes
  async algobotsStats() {
    try {
      const allBots = await this.botModel.find({ enabled: true });
      allBots.map(async (bot) => {
        const signalTracking = await this.signalTrackingModel
          .findOne({ botId: bot._id, position: "open" })
          .sort({ signalDateTime: -1, botCycle: -1, botVer: -1, position: 1 });
        if (!signalTracking) {
          return null;
        }
        const minSignalTrackingTime = dayjs(signalTracking.signalDateTime).subtract(1, "hour");

        // bot total users
        const subscriptions = await this.botSubscriptionModel.find({ botId: bot._id, deleted: { $ne: true } });
        let lastTradeAmount = 0;
        const orderTrackingPromise = subscriptions.map(async (subscription) => {
          const orderTrackings = await this.orderTrackModel.find({
            botSubId: subscription._id,
            cycleSequence: subscription.cycleSequence,
            ctxBot: "open",
            completed: true,
            created_at: {
              $gte: new Date(minSignalTrackingTime.toISOString()),
            },
          });
          orderTrackings.map((orderTracking) => {
            if (orderTracking.completed) {
              lastTradeAmount = lastTradeAmount + orderTracking?.completion?.cumulQuoteCost || 0;
            }
            return false;
          });
        });
        await Promise.all(orderTrackingPromise);
        // bot total ubxt gain
        const allUserAmountOldSchema = await this.feeTrackingModel.aggregate([
          { $match: { botId: bot._id, type: FeeRecipientType.DEVELOPER } },
          { $group: { _id: bot.owner, TotalAmount: { $sum: "$amount" } } },
        ]);
        const allUserAmount = await this.feeTrackingModel.aggregate([
          { $match: { botId: bot._id, type: FeeRecipientType.GROUP } },
          { $group: { _id: bot.owner, TotalAmount: { $sum: "$group.developer.amount" } } },
        ]);
        const totalRealisedUbxtGain = (allUserAmount[0]?.TotalAmount || 0) + (allUserAmountOldSchema[0]?.TotalAmount || 0);
        this.algoBotStatsModel.collection.updateOne(
          {
            botRef: bot._id,
          },
          {
            $set: {
              botRef: bot._id,
              ownerId: bot.realOwnerId,
              name: bot.name,
              totalUsers: subscriptions.length,
              activatedAt: bot.createdAt,
              totalRealisedUbxtGain: Number(totalRealisedUbxtGain) || 0,
              openedTradeAmount: lastTradeAmount,
              lastTradeAmount,
            },
          },
          { upsert: true }
        );
      });
    } catch (e) {
      console.log("---algobots-stats-cron-err:", e.message);
    }
  }
}
