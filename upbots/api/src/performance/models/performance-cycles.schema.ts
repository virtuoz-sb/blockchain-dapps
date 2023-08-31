/* eslint-disable import/no-cycle */
import { Module, forwardRef } from "@nestjs/common";
import * as mongoose from "mongoose";
import { PERFORMANCE_CYCLES_COLLECTION } from "../../models/database-collection";
import { MeasuredObjects, PerformanceFeeSteps, PerformanceFee, PerformanceCycleModel } from "./performance.models";

import PerfeesSharedModule from "../../perfees/perfees-shared.module";
import TradingService from "../../perfees/services/trading.service";
import ModelsService from "../../perfees/services/models.service";

const CyclesShema = new mongoose.Schema(
  {
    openAt: { type: Date, required: true },
    openPeriod: {
      year: Number,
      month: String,
      week: Number,
      day: String,
    },
    closeAt: { type: Date, required: false },
    closePeriod: {
      year: Number,
      month: String,
      week: Number,
      day: String,
    },
    cycleSequence: { type: Number, required: true },
    measuredObject: { type: MeasuredObjects, required: true },
    subBotId: { type: mongoose.Types.ObjectId, ref: "AlgoBotSubscription", required: false },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: false },
    botId: { type: mongoose.Types.ObjectId, ref: "AlgoBot", required: false },
    botVer: { type: String, required: false },
    stratType: { type: String, required: true },
    result: { type: String, required: true },
    open: { type: Boolean, required: true },
    sbl: { type: String, required: true },
    base: { type: String, required: false },
    quote: { type: String, required: false },
    exch: { type: String, required: true },
    qOrig: { type: Number, required: false },
    qExec: { type: Number, required: false },
    qRem: { type: Number, required: false },
    realisedGain: {
      ubxt: Number,
      btc: Number,
      usd: Number,
      eur: Number,
    },
    performanceFee: {
      performedStep: { type: PerformanceFeeSteps },
      paidAmount: Number,
      remainedAmount: Number,
    },
    profitPercentage: { type: Number, required: false },
    profitPercentageUC: { type: Number, required: false },
    entryPrice: { type: Number, required: true },
    closePrice: { type: Number, required: false },
  },
  { timestamps: true, collection: PERFORMANCE_CYCLES_COLLECTION }
);

export const PerformanceCycleSchemaFactory = {
  name: "PerformanceCyclesModel",
  imports: [PerfeesSharedModule],
  useFactory: (tradingService: TradingService, modelsService: ModelsService) => {
    const schema = CyclesShema;
    schema.post("findOneAndUpdate", async function () {
      if (process.env.ENABLE_PERF_FEES_FEATURE !== "1") {
        return;
      }

      const performanceCycle = await this.model.findOne(this.getQuery());
      if (!performanceCycle || performanceCycle.measuredObject !== MeasuredObjects.SUBSCRIPTION) {
        return;
      }
      // if bot is community, perf-fee doesn't work
      const isPerFeesBotById = await modelsService.isPerFeesBotById(performanceCycle.botId);
      if (!isPerFeesBotById) {
        return;
      }

      // open perfees
      if (performanceCycle.open && !performanceCycle.performanceFee.performedStep) {
        const performanceFee: PerformanceFee = await tradingService.processPerformanceCycle(performanceCycle, true);
        const condition = {
          cycleSequence: performanceCycle.cycleSequence,
          subBotId: performanceCycle.subBotId,
          measuredObject: MeasuredObjects.SUBSCRIPTION,
        };
        performanceFee.performedStep = PerformanceFeeSteps.OPENED;
        await this.updateOne(condition, { performanceFee });
      }

      // close perfees
      if (!performanceCycle.open && performanceCycle.performanceFee.performedStep === PerformanceFeeSteps.OPENED) {
        const performanceFee: PerformanceFee = await tradingService.processPerformanceCycle(performanceCycle, false);
        const condition = {
          cycleSequence: performanceCycle.cycleSequence,
          subBotId: performanceCycle.subBotId,
          measuredObject: MeasuredObjects.SUBSCRIPTION,
        };
        performanceFee.performedStep = PerformanceFeeSteps.PERFORMED;
        await this.updateOne(condition, { performanceFee });
      }
    });
    return schema;
  },
  inject: [TradingService, ModelsService],
};

export default CyclesShema;
