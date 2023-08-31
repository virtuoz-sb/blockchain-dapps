import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from "mongoose";
import { DEXASSETS_COLLECTION } from "src/models/database-collection";

export interface AssetsEvolution {
  usd: number;

  eur: number;

  btc: number;

  date: Date;
}

@Schema()
export class DexAssets extends Document {
  @Prop()
  user: string;

  @Prop()
  address: string;

  @Prop()
  evolution: AssetsEvolution[];

  @Prop()
  updatedAt?: Date;
}

export const DexAssetsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    evolution: {
      type: [
        {
          usd: {
            type: Number,
            required: true,
          },
          eur: {
            type: Number,
            required: true,
          },
          btc: {
            type: Number,
            required: true,
          },
          date: {
            type: Date,
            required: true,
          },
        },
      ],
    },
  },
  { timestamps: true, collection: DEXASSETS_COLLECTION }
).index(
  {
    user: 1,
    address: 1,
  },
  { unique: true }
);
