import { Document } from "mongoose";
import { IsString, IsMongoId } from "class-validator"; // validation decorators

export default class ComingSoon extends Document {
  @IsString() // check isf well a string
  @IsMongoId() // a string which is also the MongoId
  _id: string;

  @IsString() email: string;

  @IsString() feature: string;

  @IsString() logtime: string;
}
