/* eslint-disable max-classes-per-file */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Exclude, Expose } from "class-transformer";
import * as colNames from "../../models/database-collection";

@Schema({ collection: colNames.TRAINING_LANGUAGE_COLLECTION })
export class Language extends Document {
  @Prop()
  name: string;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);

@Exclude()
export class LanguageDTO {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  constructor(partial: Partial<Language>) {
    Object.assign(this, partial);
  }
}
