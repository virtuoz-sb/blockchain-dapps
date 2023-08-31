import * as mongoose from "mongoose";
import { DigitsCountingPrecisionMode } from "src/db_seeds/precision-mode";
import { SETTINGS_MARKETS } from "../../models/database-collection";

const MinMaxSchema = new mongoose.Schema(
  {
    min: Number,
    max: Number,
  },
  { _id: false }
);
const limitSchema = new mongoose.Schema(
  {
    amount: MinMaxSchema,
    price: MinMaxSchema,
    cost: MinMaxSchema,
  },
  { _id: false }
);
const precisionSchema = new mongoose.Schema(
  {
    amount: Number,
    price: Number,
    base: Number,
    quote: Number,
  },
  { _id: false }
);
/*
 * market pair settings (see frontend ExchangePairSettings)
 */
const MarketPairSettingSchema = new mongoose.Schema(
  {
    exchange: {
      type: String,
    },
    market: {
      // 'BTCUSDT'
      type: String,
    },
    symbolLabel: {
      // 'BTC/USDT'
      type: String,
    },
    symbol: {
      // info.symbol
      type: String,
    },
    symbolForData: { type: String },
    baseCurrency: { type: String },
    quoteCurrency: { type: String },
    tradingAllowed: { type: Boolean }, // active &&info.isSpotTradingAllowed
    perpetualContract: { type: Boolean }, // for future bitmex
    inverse: { type: Boolean }, // for future bitmex

    type: { type: String }, // spot|swap
    future: { type: Boolean },
    spot: { type: Boolean },
    swap: { type: Boolean },
    precisionMode: { type: String, enum: Object.values(DigitsCountingPrecisionMode), default: DigitsCountingPrecisionMode.DECIMAL_PLACES },
    limits: limitSchema,
    precision: precisionSchema,
    contractSize: { type: Number },
    // name: { type: String }, //not returned by ccxt
  },
  {
    timestamps: true, // auto incremented createdAt updatedAt
    collection: SETTINGS_MARKETS,
    toJSON: {
      // virtuals: true,
      transform(doc, ret) {
        // delete ret._id;
        // delete ret.__v;
      },
    },
  }
)
  .index(
    {
      exchange: 1,
      market: 1,
    },
    { unique: true }
  )
  .index({ exchange: 1 });
export default MarketPairSettingSchema;
