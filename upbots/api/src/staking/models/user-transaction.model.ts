/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { STAKING_USER_TRANSACTION_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { TransactionTypes, TransactionStatuses } from "./types";
// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: false },
    type: { type: TransactionTypes, required: true },
    status: { type: TransactionStatuses, required: true },
    networkType: { type: String, required: false },
    walletAddress: { type: String, required: false },
    requestedAmount: { type: Number, required: true },
    performedAmount: { type: Number, required: true },
    hash: { type: String, default: "" },
    explorer: { type: String, required: false },
    error: { type: String, required: false },
  },
  { timestamps: true, collection: STAKING_USER_TRANSACTION_COLLECTION }
);

// MODEL
export const ModelName = "StakingUserTransactionModel";
export interface Model extends mongoose.Document, Timestampable {
  userId?: string;
  type: TransactionTypes;
  status: TransactionStatuses;
  networkType: string;
  walletAddress?: string;
  requestedAmount?: number;
  performedAmount?: number;
  hash?: string;
  explorer?: string;
  error?: string;
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  type: TransactionTypes;

  @ApiProperty()
  status: TransactionStatuses;

  @ApiProperty()
  networkType: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  requestedAmount: number;

  @ApiProperty()
  performedAmount: number;

  @ApiProperty()
  hash: string;

  @ApiProperty()
  explorer: string;

  @ApiProperty()
  error: string;

  @ApiProperty()
  createdAt: Date;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    type: model.type,
    status: model.status,
    networkType: model.networkType,
    walletAddress: model.walletAddress,
    requestedAmount: model.requestedAmount,
    performedAmount: model.performedAmount,
    hash: model.hash,
    explorer: model.explorer,
    error: model.error,
    createdAt: model.createdAt,
  };
}
