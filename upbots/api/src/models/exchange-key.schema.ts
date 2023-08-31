import * as mongoose from "mongoose";
import { EXCHANGE_KEYS_COLLECTION } from "./database-collection";

/**
 * User mongoose schema for an exchange key.
 * @see src/types/exchange-key.ts
 */
const ExchangeKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
    },
    exchange: {
      type: String,
    },
    type: {
      type: String,
      default: "spot",
    },
    quoteCurrency: {
      type: String,
      default: "USDT",
    },
    publicKey: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 600,
    },
    secretKey: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 600,
    },
    // PASSPHRASE (optional)
    password: {
      type: String,
      required: false,
    },
    subAccountName: {
      type: String,
      required: false,
    },
    valid: {
      type: Boolean,
      default: true,
      required: true,
    },
    lastHealthCheck: Date,
    error: String,
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    // updated
  },
  { collection: EXCHANGE_KEYS_COLLECTION }
);
ExchangeKeySchema.index({ userId: 1, publicKey: 1 }, { unique: true });
ExchangeKeySchema.index({ userId: 1, name: 1 }, { unique: true }); // unique key name per user
export default ExchangeKeySchema;
// TODO: composite index on (userid name) Schema.index({ store_slug: 1, product_slug: 1 }, { unique: true });
