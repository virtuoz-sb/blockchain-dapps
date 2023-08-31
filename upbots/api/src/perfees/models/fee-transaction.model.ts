/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_FEES_TRANSACTIONS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { FeeRecipientsSchema, FeeRecipients } from "./shared.models";
import { FeeRecipientType, TransactionStatuses } from "./shared.types";

// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    botId: { type: mongoose.Types.ObjectId, ref: "AlgoBot", required: false },
    botName: { type: String, required: false },
    feeCycleSequence: { type: Number, required: false },
    type: { type: FeeRecipientType, required: true },
    status: { type: TransactionStatuses, required: true },
    address: { type: String, required: false },
    amount: { type: Number, required: true },
    hash: { type: String, required: false },
    group: { type: FeeRecipientsSchema, required: false },
    confirmations: { type: Number, required: false },
    confirmPercent: { type: Number, required: false },
    explorer: { type: String, required: false },
    error: { type: String, required: false },
  },
  { timestamps: true, collection: PERFEES_FEES_TRANSACTIONS_COLLECTION }
);

// MODEL
export const ModelName = "FeeTransactionModel";
export interface Model extends mongoose.Document, Timestampable {
  botId: string;
  botName?: string;
  feeCycleSequence?: number;
  type: FeeRecipientType;
  status: TransactionStatuses;
  address?: string;
  amount?: number;
  hash?: string;
  group: FeeRecipients;
  confirmations?: number;
  confirmPercent?: number;
  explorer?: string;
  error?: string;
}

export class AddDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  botName: string;

  @ApiProperty()
  feeCycleSequence: number;

  @ApiProperty()
  type: FeeRecipientType;

  @ApiProperty()
  status: TransactionStatuses;

  @ApiProperty()
  address: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  group?: FeeRecipients;
}
