import * as mongoose from "mongoose";
import { IPNS_COLLECTION } from "../../models/database-collection";

const IpnsSchema = new mongoose.Schema(
  {
    ipn_mode: String,
    merchant: String,
    ipn_type: String,
    txn_id: String,
    status: Number,
    status_text: String,
    currency1: String,
    currency2: String,
    amount1: Number,
    amount2: Number,
    fee: Number,
    buyer_name: String,
    email: String,
    item_name: String,
    item_number: String,
    invoice: String,
    custom: String,
    send_tx: String,
    received_amount: Number,
    received_confirms: Number,
    http_hmac: String,
    verifyer_hmac: String,
    logtime: String,
  },
  { collection: IPNS_COLLECTION }
);

// schema validation //implicit cast

export default IpnsSchema;
