import { Document } from "mongoose";
import { IsString, IsMongoId, IsNumber } from "class-validator"; // validation decorators

// import { IsEmail, IsNotEmpty } from "class-validator";

// import * as mongoose from "mongoose";
// import { IpnsSchema } from "../rest-api/src/transactions/schemas/ipns.schema";

export default class Ipn extends Document {
  @IsString() // check isf well a string
  @IsMongoId() // a string which is also the MongoId
  _id: string;

  @IsString() ipn_mode: string;

  @IsString() merchant: string;

  @IsString() ipn_type: string;

  @IsString() txn_id: string;

  @IsNumber() status: number;

  @IsString() status_text: string;

  @IsString() currency1: string;

  @IsString() currency2: string;

  @IsNumber() amount1: number;

  @IsNumber() amount2: number;

  @IsNumber() fee: number;

  @IsString() buyer_name: string;

  @IsString() email: string;

  @IsString() item_name: string;

  @IsString() item_number: string;

  @IsString() invoice: string;

  @IsString() custom: string;

  @IsString() send_tx: string;

  @IsNumber() received_amount: number;

  @IsNumber() received_confirms: number;

  @IsString() http_hmac: string;

  @IsString() verifyer_hmac: string;

  @IsString() logtime: string;
}
