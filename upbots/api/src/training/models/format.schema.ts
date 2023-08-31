/* eslint-disable max-classes-per-file */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Exclude, Expose } from "class-transformer";
import * as colNames from "../../models/database-collection";

@Schema({ collection: colNames.TRAINING_FORMAT_COLLECTION })
export class Format extends Document {
  @Prop()
  name: string;
}

export const FormatSchema = SchemaFactory.createForClass(Format);

@Exclude()
export class FormatDTO {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  constructor(partial: Partial<Format>) {
    Object.assign(this, partial);
  }
}
