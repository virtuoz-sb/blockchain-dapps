import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import PerformanceService from "./performance.service";
import { AlgoBotsWithSnapShotPerformanceDto, AlgoBotsWithPerformanceDto } from "../models/algobot-with-performance.dto";
import AlgobotDataService from "../../algobot/services/algobot.data-service";
import SignalTrackingService from "../../algobot/services/signal-tracking.service";
import {
  MeasuredObjects,
  PerformanceCycleDto,
  PerformanceSnapshotDto,
  PerformanceCycleModel,
  PublicAlgobotPerformanceDto,
  Sizes,
} from "../models/performance.models";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import { SignalTrackingModelName } from "../../algobot/models/signal-tracking.schema";
import { SignalTrackingDto, SignalTrackingModel } from "../../algobot/models/signal-tracking.dto";

@Injectable()
/**
 * Combines algobots with 6 month performance (cycle).
 */
export default class AlgobotPerfAggregateService {
  private readonly logger = new Logger(AlgobotPerfAggregateService.name);

  constructor(
    private dataSvc: AlgobotDataService,
    private performanceSvc: PerformanceService,
    private signalTrackingService: SignalTrackingService,
    @InjectModel("AlgoBotSubscription") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>,
    @InjectModel("PerformanceCyclesModel") private performanceCyclesModel: Model<PerformanceCycleModel>
  ) {}

  async getAllBotsWithPerformance6MonthsCycle(): Promise<AlgoBotsWithPerformanceDto[]> {
    const algobots = await this.dataSvc.getAllActiveWebhookBots();
    if (!algobots) {
      return new Array<AlgoBotsWithPerformanceDto>();
    }
    const perfRequests = algobots.map((b) =>
      this.performanceSvc.getSixPastMonthsBotCycles(b.id).catch((err) => {
        this.logger.error(`Error on getSixPastMonthsBotCycles for bot ${b.id}, error: ${err}`);
        return new Array<PerformanceCycleDto>();
      })
    );
    const perfResults = await Promise.all(perfRequests);

    const results = algobots.map((b, i) => {
      const r = b as AlgoBotsWithPerformanceDto;
      r.perfs = perfResults[i];
      // this.logger.debug(`r ${r}`);
      return r;
    });
    return results;
  }

  async getAllBotsWithSnapshot6Months(): Promise<AlgoBotsWithSnapShotPerformanceDto[]> {
    const algobots = await this.dataSvc.getAllActiveWebhookBots();
    if (!algobots) {
      return new Array<AlgoBotsWithSnapShotPerformanceDto>();
    }
    const perfRequests = algobots.map((b) =>
      this.performanceSvc.getSixPastMonthsBotSnapshot(b.id).catch((err) => {
        this.logger.error(`Error1 on getSixPastMonthsBotSnapshot for bot ${b.id}, error: ${err}`);
        return new PerformanceSnapshotDto();
      })
    );
    const perfResults = await Promise.all(perfRequests);

    const resultsPromise = algobots.map(async (b, i) => {
      const r = b as AlgoBotsWithSnapShotPerformanceDto;
      r.perfSnapshots = perfResults[i];
      r.followers = await this.botSubscriptionModel.count({ botId: r.id, enabled: true, deleted: false });

      const lastSignalTracking = await this.signalTrackingModel
        .findOne({ botId: r.id })
        .sort({ signalDateTime: -1, botCycle: -1, botVer: -1, position: 1 });

      r.position = lastSignalTracking ? lastSignalTracking.position : "close";

      const lastCycle = await this.performanceCyclesModel
        .findOne({ botId: r.id, measuredObject: MeasuredObjects.BOT })
        .sort({ _id: -1, cycleSequence: -1 });

      if (!lastCycle) {
        r.profitPercentage = 0;
        r.profitPercentageUC = 0;
      } else if (lastCycle.open) {
        const latestPrice = await this.signalTrackingService.estimateSignalPrice(r.id);
        r.profitPercentage =
          (lastCycle.stratType === "SHORT" ? -1 : 1) * ((latestPrice - lastCycle.entryPrice) / lastCycle.entryPrice) * 100;
        r.profitPercentageUC = 0;
      } else {
        r.profitPercentage = lastCycle.profitPercentage;
        r.profitPercentageUC = 0;
      }

      return r;
    });
    const results = await Promise.all(resultsPromise);
    return results;
  }

  async getSnapshot6MonthsForSpecificBot(botId: string): Promise<AlgoBotsWithSnapShotPerformanceDto> {
    const algobot = await this.dataSvc.getBotById(botId);
    if (!algobot) {
      return null;
    }
    let perf = await this.performanceSvc.getSixPastMonthsBotSnapshot(botId);
    if (!perf) {
      await this.performanceSvc.createAndSavePerformanceBotSnapshot(Sizes.MONTH6, algobot);
      perf = await this.performanceSvc.getSixPastMonthsBotSnapshot(botId);
    }
    const result = algobot as AlgoBotsWithSnapShotPerformanceDto;
    result.perfSnapshots = perf;

    const r = result;
    r.followers = await this.botSubscriptionModel.count({ botId: r.id, enabled: true, deleted: false });

    const lastSignalTracking = await this.signalTrackingModel
      .findOne({ botId: r.id })
      .sort({ signalDateTime: -1, botCycle: -1, botVer: -1, position: 1 });

    r.position = lastSignalTracking ? lastSignalTracking.position : "close";

    const lastCycle = await this.performanceCyclesModel
      .findOne({ botId: r.id, measuredObject: MeasuredObjects.BOT })
      .sort({ _id: -1, cycleSequence: -1 });

    if (!lastCycle) {
      r.profitPercentage = 0;
      r.profitPercentageUC = 0;
    } else if (lastCycle.open) {
      const latestPrice = await this.signalTrackingService.estimateSignalPrice(r.id);
      r.profitPercentage = (lastCycle.stratType === "SHORT" ? -1 : 1) * ((latestPrice - lastCycle.entryPrice) / lastCycle.entryPrice) * 100;
      r.profitPercentageUC = 0;
    } else {
      r.profitPercentage = lastCycle.profitPercentage;
      r.profitPercentageUC = 0;
    }

    return result;
  }

  //* PUBLIC ENDPOINT FOR UPBOTS WORDPRESS WEBSITE *//
  async getPublicAlgobotPerformanceData(): Promise<PublicAlgobotPerformanceDto[]> {
    const algobots = await this.dataSvc.getAllActiveWebhookBots();

    if (!algobots) return new Array<PublicAlgobotPerformanceDto>();

    const perfRequests = algobots.map((b) =>
      this.performanceSvc.getSixPastMonthsBotSnapshot(b.id).catch((err) => {
        this.logger.error(`Error on getSixPastMonthsBotSnapshot for bot ${b.id}, error: ${err}`);
        return new PerformanceSnapshotDto();
      })
    );

    const perfResults = await Promise.all(perfRequests);

    const results = algobots.map((b, i) => {
      return {
        name: b.name,
        botId: b.id,
        creator: b.creator,
        base: b.base,
        quote: b.quote,
        allmonths: perfResults[i]?.allmonths ? perfResults[i].allmonths.toFixed(2) : "0",
        month12: perfResults[i]?.month12 ? perfResults[i].month12.toFixed(2) : "0",
        month6: perfResults[i]?.month6 ? perfResults[i].month6.toFixed(2) : "0",
        month3: perfResults[i]?.month3 ? perfResults[i].month3.toFixed(2) : "0",
        month1: perfResults[i]?.month1 ? perfResults[i].month1.toFixed(2) : "0",
        day7: perfResults[i]?.day7 ? perfResults[i].day7.toFixed(2) : "0",
      };
    });

    return results;
  }
}
