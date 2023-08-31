/* eslint-disable max-classes-per-file */

import { Prop, Schema } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Exclude, Expose } from "class-transformer";
import * as colNames from "../../models/database-collection";

@Schema()
export class Training extends mongoose.Document {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  coverImage: string;

  @Prop()
  topic: mongoose.Schema.Types.ObjectId;

  @Prop()
  lang: mongoose.Schema.Types.ObjectId;

  @Prop()
  level: mongoose.Schema.Types.ObjectId;

  @Prop()
  format: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  keywords: string[];

  @Prop()
  price: number;
}

export const TrainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    topic: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    lang: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    level: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    format: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    keywords: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    autoIndex: true,
    collection: colNames.TRAINING_COLLECTION,
  }
).index({
  title: "text",
  description: "text",
  keywords: "text",
});

@Exclude()
export class TrainingDTO {
  @Expose()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  coverImage: string;

  @Expose()
  topic: string;

  @Expose()
  lang: string;

  @Expose()
  level: string;

  @Expose()
  format: string;

  @Expose()
  createdAt: Date;

  @Expose()
  keywords: string[];

  @Expose()
  ratings: number;

  @Expose()
  rating: number;

  constructor(partial: Partial<Training>) {
    Object.assign(this, partial);
  }
}
