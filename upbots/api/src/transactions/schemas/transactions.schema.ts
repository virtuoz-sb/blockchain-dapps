import * as mongoose from "mongoose";
import { TRANSACTIONS_COLLECTION } from "../../models/database-collection";

const TransactionsSchema = new mongoose.Schema(
  {
    txn_id: String,
    currency1: String,
    currency2: String,
    amount: Number,
    buyer_email: String,
    address: String,
    buyer_name: String,
    item_name: String,
    item_number: String,
    invoice: String,
    custom: String,
    ipn_url: String,
    success_url: String,
    cancel_url: String,
    status: String,
    fraud: Boolean,
    date: String,
    response: String,
    checkout_url: String,
    status_url: String,
    cp_status: Number,
    cp_status_text: String,
    logtime: String,
  },
  { collection: TRANSACTIONS_COLLECTION }
);

// schema validation //implicit cast

export default TransactionsSchema;
