/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_USERS_TRANSACTIONS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { FeeRecipientsSchema, FeeRecipients } from "./shared.models";
import { FeeRecipientType, TransactionStatuses, TransactionTypes } from "./shared.types";

// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Types.ObjectId, required: false },
    userId: { type: mongoose.Types.ObjectId, required: false },
    botId: { type: mongoose.Types.ObjectId, ref: "AlgoBot", required: false },
    botName: { type: String, required: false },
    type: { type: TransactionTypes, required: true },
    subType: { type: String, required: false },
    completed: { type: Boolean, required: true, default: true },
    status: { type: TransactionStatuses, required: true },
    address: { type: String, required: false },
    amount: { type: Number, required: true },
    totalAmount: { type: Number, required: false },
    group: { type: FeeRecipientsSchema, required: false },
    hash: { type: String, default: "" },
    confirmations: { type: Number, required: false },
    confirmPercent: { type: Number, required: false },
    explorer: { type: String, required: false },
    error: { type: String, required: false },
    extra: { type: Object, required: false },
    userWallet: {
      amount: Number,
      allocatedAmount: Number,
      availableAmount: Number,
      creditAmount: Number,
      debtAmount: Number,
    },
  },
  { timestamps: true, collection: PERFEES_USERS_TRANSACTIONS_COLLECTION }
);

// MODEL
export const ModelName = "UserTransactionModel";
export interface Model extends mongoose.Document, Timestampable {
  transactionId?: string;
  userId?: string;
  botId: string;
  botName?: string;
  type: TransactionTypes;
  subType?: string;
  completed?: boolean;
  status: TransactionStatuses;
  address?: string;
  amount: number;
  totalAmount?: number;
  hash?: string;
  group?: FeeRecipients;
  confirmations?: number;
  confirmPercent?: number;
  explorer?: string;
  error?: string;
  extra?: any;
  userWallet: {
    amount: number;
    allocatedAmount: number;
    availableAmount: number;
    creditAmount: number;
    debtAmount: number;
  };
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  type: TransactionTypes;

  @ApiProperty()
  subType: string;

  @ApiProperty()
  status: TransactionStatuses;

  @ApiProperty()
  botName: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  hash: string;

  @ApiProperty()
  group?: FeeRecipients;

  @ApiProperty()
  confirmations: number;

  @ApiProperty()
  confirmPercent: number;

  @ApiProperty()
  explorer: string;

  @ApiProperty()
  error: string;

  @ApiProperty()
  extra: any;

  @ApiProperty()
  userWallet: {
    amount: number;
    allocatedAmount: number;
    availableAmount: number;
    creditAmount: number;
    debtAmount: number;
  };

  @ApiProperty()
  createdAt: Date;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    botId: model.botId,
    botName: model.botName,
    type: model.type,
    subType: model.subType,
    status: model.status,
    address: model.address,
    amount: model.amount,
    totalAmount: model.totalAmount,
    hash: model.hash,
    group: model.group,
    confirmations: model.confirmations,
    confirmPercent: model.confirmPercent,
    explorer: model.explorer,
    error: model.error,
    extra: model.extra,
    userWallet: model.userWallet,
    createdAt: model.createdAt,
  };
}
