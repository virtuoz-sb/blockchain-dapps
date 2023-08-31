import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from "mongoose";
import { DEXMONITORING_COLLECTION } from "src/models/database-collection";

@Schema()
export class DexWallet extends Document {
  @Prop()
  user: string;

  @Prop()
  label: string;

  @Prop()
  address: string;
}

export const DexWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: DEXMONITORING_COLLECTION }
).index(
  {
    user: 1,
    address: 1,
  },
  { unique: true }
);
