import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";

import PerformanceServiceData from "../../performance/services/performance.service.data";
import { MeasuredObjects, PerformanceFee, PerformanceFeeSteps, PerformanceCycleModel } from "../../performance/models/performance.models";

import ModelsService from "./models.service";
import TradingService from "./trading.service";

import * as SharedTypes from "../models/shared.types";
import * as SharedModels from "../models/shared.models";
import * as UserWallet from "../models/user-wallet.model";
import * as BotWallet from "../models/bot-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";

@Injectable()
export default class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    private readonly modelsService: ModelsService,
    private readonly tradingService: TradingService,
    private readonly performanceServiceData: PerformanceServiceData
  ) {}

  async calcCurrentPerfee(userId: string, data: SharedModels.BotSubscriptionCycleDto): Promise<number> {
    let cycle = await this.performanceServiceData.getLastPerformanceSubscriptionCycle(data.botSubId);
    if (cycle && cycle.open && cycle.performanceFee && cycle.performanceFee.performedStep === PerformanceFeeSteps.OPENED) {
      cycle = await this.performanceServiceData.calcCurrentSubscriptionCycle(cycle);
      const feeAmount = Number(cycle.realisedGain.ubxt) * 0.2;
      const perfee = Math.max(feeAmount, 0);
      return perfee;
    }
    return 0;
  }

  async closePerformanceCycle(userId: string, data: SharedModels.BotSubscriptionCycleDto): Promise<boolean> {
    if (process.env.ENABLE_PERF_FEES_FEATURE !== "1") {
      return false;
    }
    // if bot is community, perf-fee doesn't work
    const isPerFeesBotById = await this.modelsService.isPerFeesBotById(data.botId);
    if (!isPerFeesBotById) {
      return false;
    }

    let cycle = await this.performanceServiceData.getLastPerformanceSubscriptionCycle(data.botSubId);

    if (cycle && cycle.open && cycle.performanceFee && cycle.performanceFee.performedStep === PerformanceFeeSteps.OPENED) {
      cycle = await this.performanceServiceData.calcCurrentSubscriptionCycle(cycle);

      const performanceFee: PerformanceFee = await this.tradingService.processPerformanceCycle(cycle, false);
      performanceFee.performedStep = PerformanceFeeSteps.PERFORMED;
      cycle.performanceFee = performanceFee;
      const cycles = this.performanceServiceData.mapSubscriptionCycles([cycle]);
      cycle = await this.performanceServiceData.updatePerformanceSubscriptionCycle(cycles[0]);
    }

    // withdraw bot wallet to user wallet
    const transDto: BotWallet.TransferDto = {
      botId: data.botId,
      botSubId: data.botSubId,
      amount: 0,
      transType: SharedTypes.TransferType.WITHDRAW,
    };
    await this.modelsService.transferBotWallet(userId, transDto);
    return true;
  }
}
