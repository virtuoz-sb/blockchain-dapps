import { Document, Schema, Types } from "mongoose";
import { OrderTrackingModelName } from "../../trade/model/order-tracking.schema";
import { ALGOBOT_SUBSCRIPTION_AUDIT_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";

export const AlgoBotSubscriptionAuditModelName = "AlgoBotSubscriptionAuditModel";

export interface AlgoBotSubscriptionAuditModel extends Document, Timestampable {
  botId: Types.ObjectId;
  botSubId: Types.ObjectId;
  userId: Types.ObjectId;
  oTrackId: Types.ObjectId;
  accountPercent: number;
  positionType?: string;
  positionAmount?: number;
  status: number;
  position: string;
  followed: boolean;
  cycleSequence: number;
  createdAt: Date;
  updatedAt: Date;
  errorReason: string;
  error: string; // do not expose technical error to the public
  errorAt: Date;
  signalId: string;
  currency: string;
  exchange: string;
  balance: number;
}

export const AlgoBotSubscriptionAuditSchema = new Schema(
  {
    botId: { type: Types.ObjectId },
    botSubId: { type: Types.ObjectId },
    userId: { type: Types.ObjectId },
    oTrackId: { type: Types.ObjectId, ref: OrderTrackingModelName },
    accountPercent: { type: Number },
    positionType: { type: String, required: false },
    positionAmount: { type: Number, required: false },
    status: { type: Number },
    position: { type: String },
    followed: { type: Boolean },
    cycleSequence: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    errorReason: { type: String },
    error: { type: String }, // do not expose technical error to the public
    errorAt: { type: Date },
    signalId: { type: String },
    currency: { type: String },
    exchange: { type: String },
    balance: { type: Number },
  },
  { timestamps: true, collection: ALGOBOT_SUBSCRIPTION_AUDIT_COLLECTION }
)
  .index({
    botId: 1,
  })
  .index({
    botSubId: 1,
  })
  .index({
    userId: 1,
  })
  .index({
    signalId: 1,
  });
