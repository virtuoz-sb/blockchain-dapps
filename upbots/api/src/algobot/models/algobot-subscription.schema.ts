import * as mongoose from "mongoose";
import { ALGOBOT_SUBSCRIPTION_COLLECTION } from "../../models/database-collection";

const AccountAllocatedSchema = new mongoose.Schema(
  {
    maxamount: { type: Number, default: 2500 },
    currency: { type: String },
  },
  {
    _id: false,
  }
);

const AlgoBotSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      // TODO: migrate this to objectID
      type: String,
      required: true,
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    apiKeyRef: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      required: true,
    },
    isOwner: {
      type: Boolean,
      required: true,
    },
    // TODO: delete this botRunning (confusing)
    botRunning: {
      type: Boolean,
      required: true,
    },
    feesToken: {
      type: String,
      required: true,
      enum: ["UBXT", "USD"],
      default: "UBXT",
    },
    feesPlan: {
      type: String,
      required: true,
      enum: ["perfFees", "monthlyFees", "yearlyFees"],
      default: "perfFees",
    },
    accountType: {
      type: String,
      required: true,
      enum: ["spot", "future", "margin"],
      default: "spot",
    },
    stratType: {
      type: String,
      required: true,
      enum: ["LONG", "SHORT", "LONG_SHORT"],
    },
    cycleSequence: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    }, // 0 notset 1: pendingOpen, 2 pendingClose 3: Open 4:Close 5 OnError
    accountPercent: {
      type: Number,
      required: true,
    },
    positionType: {
      type: String,
      required: false,
      default: "percent",
    },
    positionAmount: {
      type: Number,
      required: false,
    },
    accountLeverage: {
      type: Number,
      required: true,
      default: 1.0,
    },
    contractSize: {
      type: Number,
      required: false,
      default: 0,
    },
    baseAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    openedQuantity: {
      type: Number,
      required: false,
    },
    quote: {
      type: String,
      required: false,
    },
    accountAllocated: AccountAllocatedSchema,
    deleted: {
      type: Boolean,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    error: {
      type: String,
      required: false,
    },
    errorAt: {
      type: Date,
      required: false,
    },
    errorReason: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, collection: ALGOBOT_SUBSCRIPTION_COLLECTION } // ADD INDEX
);

// TODO: create indexes

export default AlgoBotSubscriptionSchema;
