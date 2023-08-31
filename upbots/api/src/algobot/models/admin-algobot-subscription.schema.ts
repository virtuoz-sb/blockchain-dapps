import * as mongoose from "mongoose";
import { ALGOBOT_SUBSCRIPTION_COLLECTION } from "../../models/database-collection";

const AdminAlgoBotSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    stratType: {
      type: String,
      required: true,
      enum: ["LONG", "SHORT"],
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

export default AdminAlgoBotSubscriptionSchema;
