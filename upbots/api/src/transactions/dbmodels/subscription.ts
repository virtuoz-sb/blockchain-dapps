import { Document } from "mongoose";
import { IsString, IsMongoId, IsNumber, IsArray } from "class-validator"; // validation decorators

export default class Subscription extends Document {
  @IsString() // check isf well a string
  @IsMongoId() // a string which is also the MongoId
  _id: string;

  @IsString() item_name: string;

  @IsString() item_number: string;

  @IsString() currency1: string;

  @IsNumber() amount: number;

  @IsNumber() net_amount: number;

  @IsNumber() vat: number;

  @IsNumber() salestax: number;

  @IsNumber() duration: number;

  @IsString() duration_unit: string;

  @IsNumber() billing_period: number;

  @IsString() billing_unit: string;

  @IsArray() characteritics: string[];
}
