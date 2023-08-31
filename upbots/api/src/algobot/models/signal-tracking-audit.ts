import * as mongoose from "mongoose";
import Timestampable from "../../types/timestampable";
import { BOT_SIGNAL_TRACKING_AUDITS_COLLECTION } from "../../models/database-collection";
import { AlgobotExecutionResult } from "./signal-tracking.dto";

export interface SignalTrackingAuditModel extends mongoose.Document, Timestampable, AlgobotExecutionResult {
  botId: string;
  position: string;
  signalCorrelation: string;
  error?: string;
  errorReason?: string;
  privateSignal: boolean;
  engineSuccess: boolean;
  engineStatusCode: number;
  ipAddresses: string[];
  botCycle: number;
  // AlgobotExecutionResult
}

export const SignalTrackingAuditsModelName = "SignalTrackingAuditsModel";

export const SignalTrackingAuditSchema = new mongoose.Schema(
  {
    botId: { type: mongoose.Schema.Types.ObjectId, ref: "AlgobotModel" },
    position: { type: String },
    signalCorrelation: { type: String },
    error: { type: String },
    errorReason: { type: String },
    followers: { type: Number },
    successes: { type: Number },
    failures: { type: Number },
    execTime: { type: Number },
    privateSignal: { type: Boolean, default: false },
    engineSuccess: { type: Boolean, default: false },
    engineStatusCode: { type: Number, default: 0 },
    ipAddresses: [{ type: String }],
    botCycle: { type: Number },
  },
  {
    collection: BOT_SIGNAL_TRACKING_AUDITS_COLLECTION,
    timestamps: true,
  }
)
  .index({
    botId: 1,
  })
  .index({
    botCycle: 1,
  })
  .index({
    signalCorrelation: 1,
  });
