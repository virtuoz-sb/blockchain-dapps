import * as mongoose from "mongoose";
import { CRYPTOCOMPARE_COLLECTION } from "./database-collection";

const CryptoCompareSchema = new mongoose.Schema(
  {
    fromLists: {
      type: String,
      required: false,
    },
    toLists: {
      type: String,
      required: false,
    },
    data: {
      type: Object,
      required: false,
    },
  },
  { timestamps: true, collection: CRYPTOCOMPARE_COLLECTION }
);

export default CryptoCompareSchema;
