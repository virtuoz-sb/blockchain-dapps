import * as mongoose from "mongoose";
import { ALGOBOT_STATS_COLLECTION } from "../../models/database-collection";

const AlgoBotStatsSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    botRef: {
      type: String,
      required: true,
      unique: true,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    totalRealisedUbxtGain: {
      type: Number,
      default: 0,
    },
    openedTradeAmount: {
      type: Number,
      default: 0,
    },
    lastTradeAmount: {
      type: Number,
      default: 0,
    },
    activatedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true, collection: ALGOBOT_STATS_COLLECTION } // ADD INDEX
);

export default AlgoBotStatsSchema;
