/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_FEES_TRANSACTIONS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { FeeRecipientType, TransactionStatuses } from "./shared.types";

// TYPES

// SCHEMA
export const FeeRecipientSchema = new mongoose.Schema(
  {
    address: { type: String, required: false },
    amount: { type: Number, required: false, default: 0 },
    hash: { type: String, required: false },
  },
  {
    _id: false,
  }
);

export const FeeRecipientsSchema = new mongoose.Schema(
  {
    developer: FeeRecipientSchema,
    reserve: FeeRecipientSchema,
    pool: FeeRecipientSchema,
    burn: FeeRecipientSchema,
  },
  {
    _id: false,
  }
);

export interface FeeRecipient {
  address?: string;
  amount?: number;
  hash?: string;
}

export interface FeeRecipients {
  developer?: FeeRecipient;
  reserve?: FeeRecipient;
  pool?: FeeRecipient;
  burn?: FeeRecipient;
}

// DTOS
export class BotSubscriptionCycleDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  botSubId: string;

  @ApiProperty()
  performanceCycleId: string;
}
