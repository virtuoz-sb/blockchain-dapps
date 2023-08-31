/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_FEES_TRACKINGS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { FeeRecipientsSchema, FeeRecipients } from "./shared.models";
import { FeeRecipientType, TransactionStatuses } from "./shared.types";

// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    botId: { type: mongoose.Types.ObjectId, ref: "AlgoBot", required: true },
    botName: { type: String, required: false },
    botSubId: { type: mongoose.Types.ObjectId, ref: "AlgoBotSubscription", required: false },
    performanceCycleId: { type: mongoose.Types.ObjectId, required: false },
    feeTransactionId: { type: mongoose.Types.ObjectId, required: false },
    feeCycleSequence: { type: Number, required: false },
    type: { type: FeeRecipientType, required: true },
    amount: { type: Number, required: true },
    group: { type: FeeRecipientsSchema, required: false },
    status: { type: TransactionStatuses, required: true },
  },
  { timestamps: true, collection: PERFEES_FEES_TRACKINGS_COLLECTION }
);

// MODEL
export const ModelName = "FeeTrackingModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  botId: string;
  botName?: string;
  botSubId: string;
  performanceCycleId?: string;
  feeTransactionId?: string;
  feeCycleSequence?: number;
  type: FeeRecipientType;
  amount: number;
  group: FeeRecipients;
  status: TransactionStatuses;
}

// DTOS
export class AddDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  botName: string;

  @ApiProperty()
  botSubId: string;

  @ApiProperty()
  performanceCycleId: string;

  @ApiProperty()
  feeTransactionId?: string;

  @ApiProperty()
  feeCycleSequence?: number;

  @ApiProperty()
  type: FeeRecipientType;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  group?: FeeRecipients;

  @ApiProperty()
  status: TransactionStatuses;
}
