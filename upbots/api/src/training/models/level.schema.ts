/* eslint-disable max-classes-per-file */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Exclude, Expose } from "class-transformer";
import * as colNames from "../../models/database-collection";

@Schema({ collection: colNames.TRAINING_LEVEL_COLLECTION })
export class Level extends Document {
  @Prop()
  name: string;
}

export const LevelSchema = SchemaFactory.createForClass(Level);

@Exclude()
export class LevelDTO {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  constructor(partial: Partial<Level>) {
    Object.assign(this, partial);
  }
}
