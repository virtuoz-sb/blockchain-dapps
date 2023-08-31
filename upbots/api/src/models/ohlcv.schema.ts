import * as mongoose from "mongoose";
import { MARKET_PRICES_COLLECTION } from "./database-collection";

const OHLCVSchema = new mongoose.Schema(
  {
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
  },
  { collection: MARKET_PRICES_COLLECTION }
);
export default OHLCVSchema;
// set up composite indexing
// CurrencyQuoteSchema.index({ userId: 1, publicKey: 1 }, { unique: true });
