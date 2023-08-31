import * as mongoose from "mongoose";
import OHLCVSchema from "./ohlcv.schema";
import { CURRENCY_COLLECTION } from "./database-collection";

const CurrencyQuoteSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      min: 6,
      max: 40,
    },
    baseCurrency: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    quoteCurrency: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    source: {
      type: String,
    },
    ohlcv: OHLCVSchema,
    created: { type: Date, required: true },
  },
  { collection: CURRENCY_COLLECTION }
);

// set up composite indexing
CurrencyQuoteSchema.index({ timestamp: 1, baseCurrency: 1, quoteCurrency: 1 }, { unique: true });
export default CurrencyQuoteSchema;
