import { Document } from "mongoose";
import { IsString, IsBoolean, IsMongoId, IsNumber } from "class-validator"; // validation decorators

// import * as mongoose from 'mongoose'
// import { TransactionsSchema } from '../rest-api/src/transactions/schemas/transactions.schema';

export class Transaction extends Document {
  @IsString() // check isf well a string
  @IsMongoId() // a string which is also the MongoId
  _id: string;

  @IsString() txn_id: string;

  @IsString() currency1: string;

  @IsString() currency2: string;

  @IsNumber() amount: number;

  @IsString() buyer_email: string;

  @IsString() address: string;

  @IsString() buyer_name: string;

  @IsString() item_name: string;

  @IsString() item_number: string;

  @IsString() invoice: string;

  @IsString() custom: string; // contains the subscription id

  @IsString() ipn_url: string;

  @IsString() success_url: string;

  @IsString() cancel_url: string;

  @IsString() status: string;

  @IsBoolean() fraud: boolean;

  @IsString() date: string;

  @IsString() response: string;

  @IsString() checkout_url: string;

  @IsString() status_url: string;

  @IsNumber() cp_status: number;

  @IsString() cp_status_text: string;

  @IsString() logtime: string;
}

export function compareTransactions(t1: Transaction, t2: Transaction) {
  if (t1.date < t2.date) {
    return -1;
  }
  if (t1.date > t2.date) {
    return 1;
  }
  return 0;
}
