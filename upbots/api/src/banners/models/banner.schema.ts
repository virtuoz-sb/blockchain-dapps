import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from "mongoose";

@Schema()
export class Banner extends Document {
  @Prop({
    unique: true,
  })
  name: string;

  @Prop()
  href: string;

  @Prop()
  image: string;
}

export const BannerSchema = new mongoose.Schema({
  name: String,
  href: String,
  image: Buffer,
});
