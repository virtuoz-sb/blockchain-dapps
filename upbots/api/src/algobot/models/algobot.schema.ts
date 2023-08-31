import * as mongoose from "mongoose";
import { ALGOBOT_COLLECTION } from "../../models/database-collection";

const RelativeTakeProfitSchema = new mongoose.Schema({
  triggerPercent: { type: Number },
  volumePercent: { type: Number },
});

const AlgobotFeesSchema = new mongoose.Schema(
  {
    feesTokens: { type: Array },
    feesPlans: { type: Array },
    ubxtDiscount: { type: Number },
    monthlyPrice: { type: Number },
    yearlyPrice: { type: Number },
    yearlyDiscount: { type: Number },
  },
  {
    _id: false,
  }
);

const PerfFeesSchema = new mongoose.Schema(
  {
    percent: { type: Number },
    address: { type: String },
    distribution: {
      developer: { type: Number },
      reserve: { type: Number },
      pool: { type: Number },
      burn: { type: Number },
    },
  },
  {
    _id: false,
  }
);

const BotParameterSchema = new mongoose.Schema({
  stopLossPercent: { type: Number },
  takeProfits: [RelativeTakeProfitSchema],
});

const marketSchema = new mongoose.Schema(
  {
    symbol: { type: String },
    base: { type: String }, // needed by engine to fetch the appropriate balance (algobots)
    quote: { type: String },
  },
  {
    _id: false,
  }
);

const AlgoAllocatedSchema = new mongoose.Schema({
  maxamount: { type: Number },
  currency: { type: String },
});

const AlgoReviewSchema = new mongoose.Schema({
  username: { type: String },
  userimg: { type: String },
  botrating: { type: Number },
});

const AlgoBotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    botRef: {
      type: String,
      required: true,
    },
    botVer: {
      type: String,
    },
    description: {
      type: String,
    },
    stratDesc: {
      type: String,
      required: false,
    },
    stratType: {
      type: String, // LONG or SHORT
      enum: ["LONG", "SHORT", "LONG_SHORT"],
    },
    category: {
      type: String, // algobot, copybot or userbot (BotCategoryEnum)
      enum: ["algobot", "copybot", "userbot"],
    },
    market: marketSchema,
    enabled: {
      type: Boolean,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    creator: {
      type: String,
    },
    picture: {
      mimetype: String,
      data: String,
    },
    avgtrades: {
      type: Number,
    },
    lastMonthTrades: {
      type: Number,
    },
    allocated: AlgoAllocatedSchema,
    ratings: {
      type: Number, // = sum(raters[i].vote) / raters.length
    },
    raters: {
      type: Array,
      required: false,
      default: [],
    }, // [{ "user": <user_id>, "vote": 5, "comment": "blahblah" }, ...]
    reviews: AlgoReviewSchema,
    botFees: AlgobotFeesSchema,
    perfFees: PerfFeesSchema,
    param: BotParameterSchema, // for user-bot only (not for algo-bot)
    realOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    exchangesType: {
      type: Array,
    },
    priceDecimal: {
      type: Number,
    },
    webhook: {
      exitTrigger: Boolean,
    },
  },
  { timestamps: true, collection: ALGOBOT_COLLECTION } // ADD INDEX
);

// TODO: create indexes

export default AlgoBotSchema;
