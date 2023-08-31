/* eslint-disable max-classes-per-file */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Exclude, Expose } from "class-transformer";
import * as colNames from "../../models/database-collection";

@Schema({ collection: colNames.TRAINING_TOPIC_COLLECTION })
export class Topic extends Document {
  @Prop()
  name: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);

@Exclude()
export class TopicDTO {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  constructor(partial: Partial<Topic>) {
    Object.assign(this, partial);
  }
}
