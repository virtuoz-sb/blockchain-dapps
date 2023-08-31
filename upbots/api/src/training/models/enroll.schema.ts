/* eslint-disable max-classes-per-file */

import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from "mongoose";
import * as colNames from "../../models/database-collection";

@Schema()
export class Enroll extends Document {
  @Prop()
  user: string;

  @Prop()
  training: string;

  @Prop()
  createdAt: Date;

  @Prop()
  rating: number;

  @Prop()
  comment: string;
}

export const EnrollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training",
      required: true,
    },
    createdAt: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    comment: {
      type: String,
      default: null,
    },
  },
  {
    autoIndex: true,
    collection: colNames.TRAINING_ENROLL_COLLECTION,
  }
).index(
  {
    user: 1,
    training: 1,
    name: 1,
  },
  { unique: true }
);
