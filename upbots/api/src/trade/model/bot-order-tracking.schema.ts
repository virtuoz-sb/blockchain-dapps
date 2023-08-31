/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import * as mongoose from "mongoose";
import { BOT_SEEDORDER_TRACKINGS_COLLECTION } from "../../models/database-collection";

export const BotOrderTrackingModelName = "BotOrderTrackingModel";

const SeedDetailSchema = new mongoose.Schema(
  {
    at: { type: Date },
    status: { type: String },
    exOrderId: { type: String },
    side: { type: String },
    sbl: { type: String },
    exch: { type: String },
    type: { type: String },
    price: { type: String },
    qOrig: { type: String },
    qExec: { type: String },
    qRem: { type: String },
    delayUntilUpdater: { type: Number },
    delayOrderSubmit: { type: Number },
    profit: { type: Number },
    closePrice: { type: Number },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.id;
        delete ret.delayUntilUpdater; // remove unnecessary field
        delete ret.delayOrderSubmit;
      },
    },
  }
);
export const BotOrderTrackingSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: { type: mongoose.Schema.Types.ObjectId },
    exchKeyId: { type: mongoose.Schema.Types.ObjectId },
    botSubId: { type: mongoose.Schema.Types.ObjectId },
    ctxBot: { type: String },
    created_at: {
      type: Date,
    },
    side: { type: String },
    orderType: { type: String },
    priceAsked: { type: String },
    qtyAsked: { type: String },
    sbl: { type: String },
    exch: { type: String },
    details: [SeedDetailSchema],
    updated_at: {
      type: Date,
    },
    botOrderRef: { type: String },
    botRef: { type: String },
  },
  {
    collection: BOT_SEEDORDER_TRACKINGS_COLLECTION,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        if (!ret.ctxBot || ret.ctxBot === "") {
          delete ret.ctxBot;
        }
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
