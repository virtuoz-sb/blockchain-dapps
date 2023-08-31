import * as mongoose from "mongoose";
import { PERFORMANCE_CYCLES_COLLECTION } from "../../models/database-collection";
import { MeasuredObjects } from "./performance.models";

const AdminPerformanceCycleSchema = new mongoose.Schema(
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
    stratType: { type: String, required: true },
    result: { type: String, required: true },
    open: { type: Boolean, required: true },
    sbl: { type: String, required: true },
    base: { type: String, required: false },
    quote: { type: String, required: false },
    exch: { type: String, required: true },
    qOrig: { type: Number, required: true },
    qExec: { type: Number, required: true },
    qRem: { type: Number, required: true },
    profitPercentage: { type: Number, required: false },
    entryPrice: { type: Number, required: true },
    closePrice: { type: Number, required: false },
  },
  { timestamps: true, collection: PERFORMANCE_CYCLES_COLLECTION }
);

export default AdminPerformanceCycleSchema;
