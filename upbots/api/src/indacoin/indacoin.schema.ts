import * as mongoose from "mongoose";
import { INDACOIN_TRANSACTIONS_COLLECTION } from "../models/database-collection";

const IndacoinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    transactionId: String,
    requestId: String,
    status: String,
    extraStatus: String,
    curIn: String,
    curOut: String,
    blockchainHash: String,
    link: String,
    targetAddress: String,
    amountIn: Number,
    amountOut: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: INDACOIN_TRANSACTIONS_COLLECTION }
);

export default IndacoinSchema;
