/* eslint-disable import/no-cycle */
import * as mongoose from "mongoose";
import { PERFORMANCE_SNAPSHOTS_COLLECTION } from "../../models/database-collection";
import CyclesShema from "./performance-cycles.schema";
import { Sizes, MeasuredObjects } from "./performance.models";

const PerformanceSnapshotSchema = new mongoose.Schema(
  {
    botId: { type: mongoose.Types.ObjectId, ref: "AlgoBot", required: false },
    subBotId: { type: mongoose.Types.ObjectId, ref: "AlgoBotSubscription", required: false },
    stratType: { type: String, required: true },
    measuredObject: { type: MeasuredObjects, required: true },
    snapshotDate: { type: Date, required: true },
    size: { type: Sizes, required: true },
    cyclesData: [{ type: CyclesShema }],
    allmonths: { type: Number },
    month12: { type: Number },
    month6: { type: Number },
    month3: { type: Number },
    month1: { type: Number },
    day7: { type: Number },
    allmonthsUC: { type: Number },
    month12UC: { type: Number },
    month6UC: { type: Number },
    month3UC: { type: Number },
    month1UC: { type: Number },
    day7UC: { type: Number },
    fees: { type: Number },
    charts: {
      monthlyChart: {
        data: [{ type: Number }],
        labels: [{ type: String }],
      },
      weeklyChart: {
        data: [{ type: Number }],
        labels: [{ type: String }],
      },
      daylyChart: {
        data: [{ type: Number }],
        labels: [{ type: String }],
      },
    },
  },
  { timestamps: true, collection: PERFORMANCE_SNAPSHOTS_COLLECTION }
);

export default PerformanceSnapshotSchema;
