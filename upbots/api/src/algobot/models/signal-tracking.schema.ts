/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import * as mongoose from "mongoose";
import { BOT_SIGNAL_TRACKING_COLLECTION } from "../../models/database-collection";

export const SignalTrackingModelName = "SignalTrackingModel";

export const SignalTrackingSchema = new mongoose.Schema(
  {
    botId: { type: mongoose.Schema.Types.ObjectId, required: true },
    botRef: { type: String, required: true },
    botVer: { type: String, required: true, default: "1" },
    stratType: { type: String, required: true },
    position: { type: String, required: true },
    estimatedPrice: { type: Number, required: true },
    sbl: { type: String, required: true },
    base: { type: String, required: true },
    quote: { type: String, required: true },
    signalDateTime: { type: Date, required: true },
    botCycle: { type: Number, required: true },
    signalCorrelation: { type: String },
  },
  {
    collection: BOT_SIGNAL_TRACKING_COLLECTION,
    timestamps: true,
  }
);
// FIXME: add db index so that SaveWebhookPayloadMiddlewareSignalTrackingService can query efficiently
