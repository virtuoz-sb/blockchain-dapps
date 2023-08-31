import * as mongoose from "mongoose";
import { SUBSCRIPTIONS_COLLECTION } from "../../models/database-collection";

const SubscriptionsSchema = new mongoose.Schema(
  {
    item_name: String,
    item_number: String,
    currency1: String,
    amount: Number,
    net_amount: Number,
    vat: Number,
    salestax: Number,
    duration: Number,
    duration_unit: String,
    billing_period: Number,
    billing_unit: String,
    characteritics: [{ type: String }],
  },
  { collection: SUBSCRIPTIONS_COLLECTION }
);

// schema validation //implicit cast

export default SubscriptionsSchema;
