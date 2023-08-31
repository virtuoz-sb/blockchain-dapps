/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-await */
/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */

import { HttpService, Injectable, Logger } from "@nestjs/common";
import * as moment from "moment";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import SignalTrackingService from "src/algobot/services/signal-tracking.service";
import { AlgoBotsDto } from "src/algobot/models/algobot.dto";
import CurrentPriceService from "src/cryptoprice/price-summary.service";
import AlgobotDataService from "../../algobot/services/algobot.data-service";
import AlgobotsSubscriptionDto from "../../algobot/models/algobot-subscription.dto";
import {
  PerformanceSnapshotDto,
  PerformanceCycleDto,
  Sizes,
  MeasuredObjects,
  ChartData,
  UbxtBalance,
  PerformanceCycleModel,
} from "../models/performance.models";
import { SignalTrackingDto } from "../../algobot/models/signal-tracking.dto";
import PerformanceServiceData from "./performance.service.data";
import AdminPerformanceCycleDto from "../models/admin-performance.dto";
import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { OrderTrackingModelName, OrderTrackingModel } from "../../trade/model/order-tracking.schema";
import { OrderTrackingDto } from "../../trade/model/order-tracking.dto";
import maxDrawdown from "../../utilities/max-drawdown.util";

@Injectable()
export default class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  private thirtySixMonthAgo: Date; // aka, 3 years

  private twentyFourMonthAgo: Date; // aka, 2 years

  private twelveMonthAgo: Date;

  private sixMonthAgo: Date;

  private threeMonthAgo: Date;

  private oneMonthAgo: Date;

  private sevenDayAgo: Date;

  private uncompletedOrderTrackingIds: string[] = [];

  constructor(
    private algobotDataService: AlgobotDataService,
    private signalTrackingService: SignalTrackingService,
    private performanceServiceData: PerformanceServiceData,
    @InjectModel(OrderTrackingModelName) private orderTrackModel: Model<OrderTrackingModel>,
    @InjectModel("AlgoBot") private botModel: Model<AlgoBotModel>,
    @InjectModel("PerformanceCyclesModel") private performanceCyclesModel: Model<PerformanceCycleModel>
  ) {
    this.setDates();
    this.performanceServiceData.fetchUbxtPrice();
  }

  @Cron(CronExpression.EVERY_HOUR) // every 1 hour
  async buildPerformances() {
    this.setDates();
    this.logger.log(`CRON job: algobotDataService: buildPerformances start`);
    await this.computeAndSaveSixMonthOfCycles();
    this.logger.log(`CRON job: algobotDataService: buildPerformances-step1`);
    await this.createAndSavePerformanceSnapshotsForAllSubscriptions(Sizes.MONTH6);
    this.logger.log(`CRON job: algobotDataService: buildPerformances-step2`);
    await this.createAndSavePerformanceSnapshotsForAllBots(Sizes.MONTH6);
    this.logger.log(`CRON job: algobotDataService: buildPerformances end`);
  }

  @Cron("*/3 * * * * *", {
    name: "uncompleted-order-trackings",
  }) // every 3sec
  async processUncompletedOrderTrackings() {
    const performedIds = [];
    const updatingPromises = this.uncompletedOrderTrackingIds.map(async (id) => {
      const performed = await this.updateSubscriptionCyclesByOrderTracking(id);
      if (performed) {
        performedIds.push(id);
        return id;
      }
      return "";
    });
    await Promise.all(updatingPromises).then((updatedIds) => {
      this.uncompletedOrderTrackingIds = this.uncompletedOrderTrackingIds.filter((id) => !updatedIds.includes(id));
    });
  }

  async computeAndSaveSixMonthOfCycles() {
    this.logger.log(`CRON job: algobotDataService: computeAndSaveSixMonthOfCycles-step1`);
    await this.performanceServiceData.fetchUbxtPrice();
    this.logger.log(`CRON job: algobotDataService: computeAndSaveSixMonthOfCycles-step2`);
    await this.computeAndSaveSixMonthOfBotTheoricalCycles();
    this.logger.log(`CRON job: algobotDataService: computeAndSaveSixMonthOfCycles-step3`);
    await this.computeAndSaveSixMonthOfSubscriptionCycles();
    this.logger.log(`CRON job: algobotDataService: computeAndSaveSixMonthOfCycles-step4`);
  }

  async computeAndSaveSixMonthOfSubscriptionCycles() {
    const ids = await this.algobotDataService.getAllSubscriptionsIds();
    const toCreate = ids.map(async (id) => {
      await this.computeAndSaveSixMonthOfOneSubscriptionCycles(id);
    });
    await Promise.all(toCreate).then(() =>
      this.logger.log(`CRON job: algobotDataService: computeAndSaveSixMonthOfCycles: Performance cycles collection updated`)
    );
  }

  async computeAndSaveSixMonthOfOneSubscriptionCycles(subBotId: string) {
    return await this.getSixPastMonthsCompletedOrderTracks(subBotId).then((orders) => {
      const cycles = this.computeCyclesFromOrders(orders);
      cycles.forEach(async (cycle) => await this.performanceServiceData.updatePerformanceSubscriptionCycle(cycle));
    });
  }

  async computeAndSaveSixMonthOfBotTheoricalCycles() {
    const ids = await this.algobotDataService.getAllActiveWebhookBots().then((activeBots) => activeBots.map((bot) => bot.id));
    const toCreate = ids.map(async (id) => {
      await this.computeAndSaveSixMonthOfOneBotTheoricalCycles(id);
      await this.computeAndSaveLastMonthTrades(id);
    });
    await Promise.all(toCreate).then(() => Logger.log(`Performance cycles collection updated`));
  }

  async computeAndSaveSixMonthOfOneBotTheoricalCycles(subBotId: string) {
    return await this.getSixPastMonthsSignalTracks(subBotId).then((signals) => {
      const cycles = this.computeCyclesFromSignals(signals);
      cycles.forEach(async (cycle) => await this.performanceServiceData.updatePerformanceBotCycle(cycle));
    });
  }

  async computeAndSaveLastMonthTrades(subBotId: string) {
    return await this.getLastMonthTrades(subBotId).then((numberOfTrades) => {
      this.botModel
        .findOneAndUpdate({ _id: subBotId }, { lastMonthTrades: numberOfTrades }, { upsert: true })
        .then((res) => this.logger.debug(`Updated lastMonthTrades of Bot ${subBotId}: ${numberOfTrades}`))
        .catch((err) => this.logger.error(err));
    });
  }

  async createAndSavePerformanceSnapshotsForAllSubscriptions(size: Sizes.MONTH6) {
    this.logger.log(`CRON job: createAndSavePerformanceSnapshotsForAllSubscriptions: start`);
    const subscriptions = await this.getAllSubscriptions();
    if (subscriptions.length === 0) {
      return;
    }
    const allCycles = await this.getAllCycles();
    this.logger.log(`CRON job: Cycles: ${allCycles.length} and Subscriptions: ${subscriptions.length}`);

    const promise = subscriptions.map(async (subscription) => {
      const cyclesBySub = allCycles
        .filter((c) => c.subBotId && c.subBotId.toString() === subscription.id)
        .sort((a, b) => b.cycleSequence - a.cycleSequence);
      // check if the last cycle created today
      if (cyclesBySub && cyclesBySub.length > 0) {
        const islastCycleToday = moment().diff(moment(cyclesBySub[0].createdAt), "day") <= 180;

        if (islastCycleToday) {
          await this.createAndSavePerformanceSubscriptionSnapshot(size, subscription, cyclesBySub);
        }
      }
    });
    await Promise.all(promise);
  }

  async createAndSavePerformanceSnapshotsForAllBots(size: Sizes.MONTH6) {
    this.logger.log(`CRON job: createAndSavePerformanceSnapshotsForAllBots: start`);
    const bots = await this.algobotDataService.getAllActiveWebhookBots();
    if (bots.length === 0) {
      return;
    }
    const promise = bots.map(async (bot) => {
      await this.createAndSavePerformanceBotSnapshot(size, bot);
    });
    await Promise.all(promise);
  }

  getFinalProfitPercentage(cycles: PerformanceCycleDto[]): number {
    const sortedCycles = cycles.sort((a, b) => a.cycleSequence - b.cycleSequence);
    let compTotal = 1.0;
    for (const cycle of sortedCycles) {
      if (cycle.entryPrice && cycle.closePrice) {
        const buyPrice = cycle.stratType === "SHORT" ? cycle.closePrice : cycle.entryPrice;
        const sellPrice = cycle.stratType === "SHORT" ? cycle.entryPrice : cycle.closePrice;

        const percentageGainUncomp = sellPrice / buyPrice - 1;
        compTotal *= 1 + percentageGainUncomp;
      }
    }

    return (compTotal - 1) * 100;
  }

  async createAndSavePerformanceSubscriptionSnapshot(size: Sizes, subscription: AlgobotsSubscriptionDto, allCycles: PerformanceCycleDto[]) {
    const { id, botId, stratType } = subscription;
    this.logger.log(`PerformanceSnapshotsForAllBots: subscription: ${id} start`);

    // const cyclesData = size === Sizes.MONTH6 ? allCycles.filter((cycle) => cycle.closeAt && cycle.closeAt < this.threeMonthAgo) : []; // REPLACE BY A REQUEST TO THE CYCLES DB
    const cyclesData = allCycles.filter((cycle) => cycle.closeAt);
    const displayMonth6: boolean = cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt < this.threeMonthAgo).length > 0;
    const displayMonth3: boolean = cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt < this.oneMonthAgo).length > 0;

    // const allmonths =
    //   displayMonth6 &&
    //   this.sumPerf(
    //     cyclesData.filter((cycle) => cycle.measuredObject === MeasuredObjects.SUBSCRIPTION).map((cycle) => cycle.profitPercentage)
    //   );
    const allmonths = displayMonth6 && this.getFinalProfitPercentage(allCycles);
    const allmonthsUC = displayMonth6 && this.sumPerf(allCycles.map((cycle) => cycle.profitPercentageUC));

    // const month6 =
    //   displayMonth6 &&
    //   this.sumPerf(
    //     cyclesData
    //       .filter((cycle) => cycle.measuredObject === MeasuredObjects.SUBSCRIPTION)
    //       .filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sixMonthAgo)
    //       .map((cycle) => cycle.profitPercentage)
    //   );
    const month6 =
      displayMonth6 && this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sixMonthAgo));
    const month6UC =
      displayMonth6 &&
      this.sumPerf(
        cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sixMonthAgo).map((cycle) => cycle.profitPercentageUC)
      );

    // const month3 =
    //   displayMonth3 &&
    //   this.sumPerf(
    //     cyclesData
    //       .filter((cycle) => cycle.measuredObject === MeasuredObjects.SUBSCRIPTION)
    //       .filter((cycle) => cycle.closeAt && cycle.closeAt >= this.threeMonthAgo)
    //       .map((cycle) => cycle.profitPercentage)
    //   );
    const month3 =
      displayMonth3 && this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.threeMonthAgo));
    const month3UC =
      displayMonth3 &&
      this.sumPerf(
        cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.threeMonthAgo).map((cycle) => cycle.profitPercentageUC)
      );

    // const month1 = this.sumPerf(
    //   cyclesData
    //     .filter((cycle) => cycle.measuredObject === MeasuredObjects.SUBSCRIPTION)
    //     .filter((cycle) => cycle.closeAt && cycle.closeAt >= this.oneMonthAgo)
    //     .map((cycle) => cycle.profitPercentage)
    // );
    const month1 = this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.oneMonthAgo));
    const month1UC = this.sumPerf(
      cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.oneMonthAgo).map((cycle) => cycle.profitPercentageUC)
    );

    const month12 = this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.twelveMonthAgo));
    const month12UC = this.sumPerf(
      cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.twelveMonthAgo).map((cycle) => cycle.profitPercentageUC)
    );

    const day7 = this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sevenDayAgo));
    const day7UC = this.sumPerf(
      cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sevenDayAgo).map((cycle) => cycle.profitPercentageUC)
    );

    const snapshot: PerformanceSnapshotDto = {
      botId,
      subBotId: id,
      size,
      stratType,
      cyclesData,
      measuredObject: MeasuredObjects.SUBSCRIPTION,
      snapshotDate: moment().format("YYYY-MM-DD"),
      allmonths,
      month12,
      month6,
      month3,
      month1,
      day7,
      allmonthsUC,
      month12UC,
      month6UC,
      month3UC,
      month1UC,
      day7UC,
      fees: 0,
      charts: {
        monthlyChart: this.buildPeriodicChart(cyclesData, "month"),
        weeklyChart: this.buildPeriodicChart(cyclesData, "week"),
        daylyChart: this.buildPeriodicChart(cyclesData, "day"),
      },
      maxDrawdown: maxDrawdown(cyclesData),
    };

    await this.performanceServiceData.updatePerformanceSubscriptionSnapshot(snapshot);
    this.logger.log(`PerformanceSnapshotsForAllBots: subscription: ${id} done`);
  }

  async createAndSavePerformanceBotSnapshot(size: Sizes, bot: AlgoBotsDto) {
    const { id, stratType } = bot;
    let cyclesData = size === Sizes.MONTH6 ? await this.getSixPastMonthsBotCycles(id) : []; // REPLACE BY A REQUEST TO THE CYCLES DB
    // let cyclesData = size === Sizes.MONTH6 ? await this.getTwelvePastMonthsBotCycles(id) : []; // REPLACE BY A REQUEST TO THE CYCLES DB

    const botVer = bot.botVer ? bot.botVer : "1";
    cyclesData = cyclesData.filter((cycle) => cycle.botVer === botVer && cycle.measuredObject === MeasuredObjects.BOT);

    const displayMonth6: boolean = cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt < this.threeMonthAgo).length > 0;
    const displayMonth3: boolean = cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt < this.oneMonthAgo).length > 0;

    // const allmonths =
    //   displayMonth6 &&
    //   this.sumPerf(cyclesData.filter((cycle) => cycle.measuredObject === MeasuredObjects.BOT).map((cycle) => cycle.profitPercentage));
    const allmonths = displayMonth6 && this.getFinalProfitPercentage(cyclesData);

    // const month6 =
    //   displayMonth6 &&
    //   this.sumPerf(
    //     cyclesData
    //       .filter((cycle) => cycle.measuredObject === MeasuredObjects.BOT)
    //       .filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sixMonthAgo)
    //       .map((cycle) => cycle.profitPercentage)
    //   );
    const month6 =
      displayMonth6 && this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sixMonthAgo));
    // const month3 =
    //   displayMonth3 &&
    //   this.sumPerf(
    //     cyclesData
    //       .filter((cycle) => cycle.measuredObject === MeasuredObjects.BOT)
    //       .filter((cycle) => cycle.closeAt && cycle.closeAt >= this.threeMonthAgo)
    //       .map((cycle) => cycle.profitPercentage)
    //   );
    const month3 =
      displayMonth3 && this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.threeMonthAgo));
    // const month1 = this.sumPerf(
    //   cyclesData
    //     .filter((cycle) => cycle.measuredObject === MeasuredObjects.BOT)
    //     .filter((cycle) => cycle.closeAt && cycle.closeAt >= this.oneMonthAgo)
    //     .map((cycle) => cycle.profitPercentage)
    // );
    const month1 = this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.oneMonthAgo));

    const month12 = this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.twelveMonthAgo));

    const day7 = this.getFinalProfitPercentage(cyclesData.filter((cycle) => cycle.closeAt && cycle.closeAt >= this.sevenDayAgo));

    const snapshot: PerformanceSnapshotDto = {
      botId: id,
      size,
      stratType,
      cyclesData,
      measuredObject: MeasuredObjects.BOT,
      snapshotDate: moment().format("YYYY-MM-DD"),
      allmonths,
      month12,
      month6,
      month3,
      month1,
      day7,
      fees: 0,
      charts: {
        monthlyChart: this.buildPeriodicChart(cyclesData, "month"),
        weeklyChart: this.buildPeriodicChart(cyclesData, "week"),
        daylyChart: this.buildPeriodicChart(cyclesData, "day"),
      },
      maxDrawdown: maxDrawdown(cyclesData),
    };

    await this.performanceServiceData.updatePerformanceBotSnapshot(snapshot);
  }

  async addToUncompletedOrderTrackings(orderTrackingId: string) {
    if (!this.uncompletedOrderTrackingIds.includes(orderTrackingId)) {
      this.uncompletedOrderTrackingIds.push(orderTrackingId);
    }
  }

  async getOrderTrackingById(orderTrackingId: string) {
    const orderModel = await this.orderTrackModel.findById(orderTrackingId);
    return orderModel;
  }

  async updateSubscriptionCyclesByOrderTracking(orderTrackingId: string): Promise<boolean> {
    const orderModel = await this.orderTrackModel.findById(orderTrackingId);
    if (orderModel && orderModel.completed) {
      const orderModels = await this.orderTrackModel.find({
        botSubId: orderModel.botSubId,
        completed: true,
        cycleSequence: orderModel.cycleSequence,
      });
      if (orderModels) {
        const orderDtos = orderModels.map((x) => x.toJSON());
        const cycleDtos = this.computeCyclesFromOrders(orderDtos);
        if (cycleDtos.length >= 0) {
          const cycleDto = cycleDtos[0];
          await this.performanceServiceData.updatePerformanceSubscriptionCycle(cycleDto);
          return true;
        }
        return false;
      }
    } else if (orderModel && !orderModel.aborted) {
      this.addToUncompletedOrderTrackings(orderTrackingId);
      return false;
    }
    return false;
  }

  async updateSubscriptionCycles(subBotId: string) {
    await this.computeAndSaveSixMonthOfOneSubscriptionCycles(subBotId);
    await this.computeAndSaveSixMonthOfOneBotTheoricalCycles(subBotId);
  }

  async getAllSubscriptionCycles(subBotId: string): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceServiceData.getTimerangeSubscriptionCycles(subBotId, this.thirtySixMonthAgo);
    return cycles;
  }

  async getAllCycles(): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceServiceData.getTimerangeCycles(this.thirtySixMonthAgo);
    return cycles;
  }

  async getSixPastMonthsSubscriptionCycles(subBotId: string): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceServiceData.getTimerangeSubscriptionCycles(subBotId, this.sixMonthAgo);
    return cycles;
  }

  async getAllSixPastMonthsSubscriptionCycles(): Promise<AdminPerformanceCycleDto[]> {
    const cycles = await this.performanceServiceData.getTimerangeAllSubscriptionCycles(this.sixMonthAgo);
    return cycles;
  }

  async getTwelvePastMonthsBotCycles(botId: string): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceServiceData.getTimerangeBotCycles(botId, this.twelveMonthAgo);
    return cycles;
  }

  async getSixPastMonthsBotCycles(botId: string): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceServiceData.getTimerangeBotCycles(botId, this.twentyFourMonthAgo);
    return cycles;
  }

  async getSixPastMonthsUserCycles(userId: string): Promise<PerformanceCycleDto[]> {
    const cycles = await this.performanceServiceData.getTimerangeUserCycles(userId, this.sixMonthAgo);
    return cycles;
  }

  async getSixPastMonthsSubscriptionSnapshot(subBotId: string): Promise<PerformanceSnapshotDto> {
    const snapshot = await this.performanceServiceData.getSixPastMonthsSubscriptionSnapshot(subBotId);
    return snapshot;
  }

  async getSixPastMonthsBotSnapshot(botId: string): Promise<PerformanceSnapshotDto> {
    const snapshot = await this.performanceServiceData.getSixPastMonthsBotSnapshot(botId);
    return snapshot;
  }

  async getAllSubscriptions(): Promise<AlgobotsSubscriptionDto[]> {
    const subs = await this.algobotDataService.getAllSubscriptions();
    return subs;
  }

  async getSixPastMonthsCompletedOrderTracks(subBotId: string): Promise<OrderTrackingDto[]> {
    const orders = await this.algobotDataService.getTimerangeCompletedSubscriptionOrderDetails(subBotId, this.sixMonthAgo);
    return orders;
  }

  async getSixPastMonthsSignalTracks(botId: string): Promise<SignalTrackingDto[]> {
    const signals = await this.signalTrackingService.getTimerangeSignalTrackings(botId, this.twentyFourMonthAgo);
    return signals;
  }

  async getTimeRangedPerformanceCycles(botId: string, start: Date): Promise<number> {
    const res = await this.performanceCyclesModel
      .find({ botId, measuredObject: MeasuredObjects.BOT, closeAt: { $gte: start }, open: false }, null, {})
      .lean();
    return res ? res.length : 0;
  }

  async getLastMonthTrades(botId: string): Promise<number> {
    const numberOfTrades = await this.getTimeRangedPerformanceCycles(botId, this.oneMonthAgo);
    return numberOfTrades;
  }

  computeCyclesFromOrders(orders: OrderTrackingDto[]): PerformanceCycleDto[] {
    const cycles = {};
    const ubxtPrice = this.performanceServiceData.getUbxtPrice();

    orders.forEach((order) => {
      if (order.completion) {
        const { cycleSequence, ctxBot, botId, botSubId, userId, stratType } = order;

        if (!cycles[cycleSequence]) {
          // Create cycle
          cycles[cycleSequence] = {
            cycleSequence,
            measuredObject: MeasuredObjects.SUBSCRIPTION,
            stratType: stratType || "LONG", // TO BE REPLACED BY A REQUEST ON BOTID
            sbl: order.sbl,
            exch: order.exch,
            botId,
            subBotId: botSubId,
            userId,
            transaction: {
              boughtQuoteCost: 0,
              soldQuoteCost: 0,
            },
          };
        }

        // Add open data
        if (ctxBot === "open") {
          cycles[cycleSequence] = {
            ...cycles[cycleSequence],
            openAt: order.created_at,
            openPeriod: {
              year: parseInt(moment(order.created_at).format("YYYY")),
              month: moment(order.created_at).format("MMMM"),
              week: moment(order.created_at).week(),
              day: moment(order.created_at).format("YYYY-MM-DD"),
            },
            entryPrice: order.completion.pExec,
            entryQuality: order.completion.qExec,
            qExec: order.completion.qExec,
          };
        }
        // Add close data
        if (ctxBot === "close") {
          cycles[cycleSequence] = {
            ...cycles[cycleSequence],
            closeAt: order.created_at,
            closePeriod: {
              year: parseInt(moment(order.created_at).format("YYYY")),
              month: moment(order.created_at).format("MMMM"),
              week: moment(order.created_at).week(),
              day: moment(order.created_at).format("YYYY-MM-DD"),
            },
            closePrice: order.completion.pExec,
            closeQuality: order.completion.qExec,
          };
        }

        // Add transaction
        cycles[cycleSequence] = {
          ...cycles[cycleSequence],
          transaction: {
            boughtQuoteCost:
              order.side.toUpperCase() === "BUY" ? order.completion.cumulQuoteCost : cycles[cycleSequence].transaction.boughtQuoteCost,
            soldQuoteCost:
              order.side.toUpperCase() === "SELL" ? order.completion.cumulQuoteCost : cycles[cycleSequence].transaction.soldQuoteCost,
          },
        };
      } else {
        this.logger.error(`--PFS-computeCyclesFromOrders-error-order-completion-false: ${order.id}`);
      }
    });

    let compTotal = 1.0;
    // Calculate profit
    const cyclesWithProfits = Object.keys(cycles)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => {
        const cycle = cycles[key];

        if (typeof cycle.entryPrice === "number" && typeof cycle.closePrice === "number") {
          const buyPrice = cycle.stratType === "SHORT" ? cycle.closePrice : cycle.entryPrice;
          const sellPrice = cycle.stratType === "SHORT" ? cycle.entryPrice : cycle.closePrice;
          const buyQuality = cycle.stratType === "SHORT" ? cycle.closeQuality : cycle.entryQuality;

          let percentageGainUncomp = sellPrice === 0 || buyPrice === 0 ? 0 : sellPrice / buyPrice - 1;
          compTotal *= 1 + percentageGainUncomp;
          let percentageCompTotal = (compTotal - 1) * 100;
          percentageGainUncomp *= 100;
          percentageCompTotal *= 100;

          const realisedQuoteGain = buyPrice === 0 || sellPrice === 0 ? 0 : (sellPrice - buyPrice) * buyQuality;
          const result = percentageGainUncomp > 0 ? "win" : "loss";
          const realisedGain = {
            ubxt: realisedQuoteGain / ubxtPrice.usd,
            btc: (realisedQuoteGain / ubxtPrice.usd) * ubxtPrice.btc,
            usd: realisedQuoteGain,
            eur: (realisedQuoteGain / ubxtPrice.usd) * ubxtPrice.eur,
          };
          return {
            ...cycle,
            open: false,
            realisedGain,
            profitPercentage: percentageGainUncomp,
            profitPercentageUC: percentageCompTotal,
            result,
          };
        }
        // If status is 'open', return empty values
        return {
          ...cycle,
          open: true,
          closeAt: null,
          closePrice: null,
          realisedGain: null,
          profitPercentage: null,
          profitPercentageUC: null,
          result: null,
        };
      });

    return cyclesWithProfits;
  }

  computeCyclesFromSignals(signals: SignalTrackingDto[]): PerformanceCycleDto[] {
    const cycles = {};
    signals.forEach((signal) => {
      let { botVer, botCycle, stratType, sbl, botId, position, signalDateTime, estimatedPrice } = signal;
      if (!botVer) {
        botVer = "1";
      }
      const cycleKey = `${botVer}-${botCycle}`;
      // if (!cycles[cycleKey]) {
      //   // Create cycle
      //   cycles[cycleKey] = {
      //     botVer,
      //     cycleSequence: botCycle,
      //     measuredObject: MeasuredObjects.BOT,
      //     stratType,
      //     sbl,
      //     exch: "theoretical", // bot has no exchange property
      //     botId,
      //   };
      // }

      // Add open data
      if (position === "open") {
        cycles[cycleKey] = {
          botVer,
          cycleSequence: botCycle,
          measuredObject: MeasuredObjects.BOT,
          stratType,
          sbl,
          exch: "theoretical", // bot has no exchange property
          botId,
        };

        cycles[cycleKey] = {
          ...cycles[cycleKey],
          openAt: signalDateTime,
          openPeriod: {
            year: parseInt(moment(signalDateTime).format("YYYY")),
            month: moment(signalDateTime).format("MMMM"),
            week: moment(signalDateTime).week(),
            day: moment(signalDateTime).format("YYYY-MM-DD"),
          },
          entryPrice: estimatedPrice,
        };
      }

      // Add close data
      if (position === "close" && cycles[cycleKey]) {
        cycles[cycleKey] = {
          ...cycles[cycleKey],
          closeAt: signalDateTime,
          closePeriod: {
            year: parseInt(moment(signalDateTime).format("YYYY")),
            month: moment(signalDateTime).format("MMMM"),
            week: moment(signalDateTime).week(),
            day: moment(signalDateTime).format("YYYY-MM-DD"),
          },
          closePrice: estimatedPrice,
        };
        cycles[cycleKey + signalDateTime.toString()] = cycles[cycleKey];
        delete cycles[cycleKey];
      }
    });

    let compTotal = 1.0;
    // Calculate profit
    const cyclesWithProfits = Object.keys(cycles).map((key) => {
      const cycle = cycles[key];

      if (cycle.entryPrice && cycle.closePrice) {
        let percentageGainUncomp =
          cycle.stratType === "SHORT" ? 1 - cycle.closePrice / cycle.entryPrice : cycle.closePrice / cycle.entryPrice - 1;

        compTotal *= 1 + percentageGainUncomp;
        let percentageCompTotal = (compTotal - 1) * 100;
        percentageGainUncomp *= 100;
        percentageCompTotal *= 100;

        // const profitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
        const profitPercentage = percentageGainUncomp;
        const result = profitPercentage > 0 ? "win" : "loss";
        return {
          ...cycle,
          open: false,
          profitPercentage,
          result,
        };
      }
      // If status is 'open', return empty values
      return {
        ...cycle,
        open: true,
        closeAt: null,
        closePrice: null,
        profitPercentage: null,
        result: null,
      };
    });

    return cyclesWithProfits;
  }

  buildPeriodicChart(data: PerformanceCycleDto[], period: "day" | "week" | "month"): ChartData {
    const displayedData = this.filterAndSortDataToDisplay(data);
    const periodicPerformances = {};
    // displayedData.forEach((cycle) => {
    //   const label = period === "week" ? `${cycle.closePeriod.month}-${cycle.closePeriod.week}` : cycle.closePeriod[period];
    //   if (periodicPerformances[label]) {
    //     periodicPerformances[label] += cycle.profitPercentage;
    //   }
    //   if (!periodicPerformances[label]) {
    //     periodicPerformances[label] = cycle.profitPercentage;
    //   }
    // });
    let compTotal = 1.0;
    for (const cycle of displayedData) {
      let label = cycle.closePeriod[period];
      switch (period) {
        case "day":
          label = cycle.closePeriod.day;
          break;
        case "week":
          label = `${cycle.closePeriod.year}-w${cycle.closePeriod.week}`;
          break;
        case "month":
          label = `${cycle.closePeriod.year}-${cycle.closePeriod.month.substr(0, 3)}`;
          break;
        default:
          label = "";
      }
      if (cycle.entryPrice && cycle.closePrice) {
        const buyPrice = cycle.stratType === "SHORT" ? cycle.closePrice : cycle.entryPrice;
        const sellPrice = cycle.stratType === "SHORT" ? cycle.entryPrice : cycle.closePrice;
        let percentageGainUncomp = sellPrice / buyPrice - 1;
        compTotal *= 1 + percentageGainUncomp;
        periodicPerformances[label] = (compTotal - 1) * 100;
      }
    }
    return {
      labels: Object.keys(periodicPerformances),
      data: this.computeIntermediatePerfs(Object.values(periodicPerformances)),
    };
  }

  filterAndSortDataToDisplay(data: PerformanceCycleDto[]): PerformanceCycleDto[] {
    // const closedCycles = data.filter((cycle) => !cycle.open);
    // const sortedData = closedCycles.sort((a, b) => {
    //   if (a.closeAt < b.closeAt) {
    //     return -1;
    //   }
    //   if (a.closeAt > b.closeAt) {
    //     return 1;
    //   }
    //   return 0;
    // });
    const sortedData = data.filter((cycle) => !cycle.open).sort((a, b) => a.cycleSequence - b.cycleSequence);
    return sortedData;
  }

  computeIntermediatePerfs(periodicPerfData: number[]): number[] {
    // let prevCumulPerf = 0;
    return periodicPerfData.map((currentPerf) => {
      // const currentCumulPerf = prevCumulPerf + currentPerf;
      // prevCumulPerf += currentPerf;
      return currentPerf; // currentCumulPerf;
    });
  }

  sumPerf(profitPercentages: number[]): number {
    return profitPercentages.reduce((a, b) => a + b, 0);
  }

  setDates() {
    this.thirtySixMonthAgo = moment().startOf("day").subtract(36, "months").toDate();
    this.thirtySixMonthAgo.setTime(this.thirtySixMonthAgo.getTime() - moment().toDate().getTimezoneOffset() * 60 * 1000);

    this.twentyFourMonthAgo = moment().startOf("day").subtract(24, "months").toDate();
    this.twentyFourMonthAgo.setTime(this.twentyFourMonthAgo.getTime() - moment().toDate().getTimezoneOffset() * 60 * 1000);

    this.twelveMonthAgo = moment().startOf("day").subtract(12, "months").toDate();
    this.twelveMonthAgo.setTime(this.twelveMonthAgo.getTime() - moment().toDate().getTimezoneOffset() * 60 * 1000);

    this.sixMonthAgo = moment().startOf("day").subtract(6, "months").toDate();
    this.sixMonthAgo.setTime(this.sixMonthAgo.getTime() - moment().toDate().getTimezoneOffset() * 60 * 1000);

    this.threeMonthAgo = moment().startOf("day").subtract(3, "months").toDate();
    this.threeMonthAgo.setTime(this.threeMonthAgo.getTime() - moment().toDate().getTimezoneOffset() * 60 * 1000);

    this.oneMonthAgo = moment().startOf("day").subtract(1, "months").toDate();
    this.oneMonthAgo.setTime(this.oneMonthAgo.getTime() - moment().toDate().getTimezoneOffset() * 60 * 1000);

    this.sevenDayAgo = moment().startOf("day").subtract(7, "days").toDate();
    this.sevenDayAgo.setTime(this.sevenDayAgo.getTime() - moment().toDate().getTimezoneOffset() * 60 * 1000);
  }
}
