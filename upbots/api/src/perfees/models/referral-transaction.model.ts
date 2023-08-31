/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_REFERRALS_TRANSACTIONS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { ReferralTransTypes, TransactionStatuses } from "./shared.types";

// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    refererId: { type: mongoose.Types.ObjectId, ref: "Users", required: false },
    refereeId: { type: mongoose.Types.ObjectId, ref: "Users", required: false },
    refererName: { type: String, required: false },
    refereeName: { type: String, required: false },
    level: { type: Number, required: true },
    type: { type: ReferralTransTypes, required: true },
    status: { type: TransactionStatuses, required: true },
    amount: { type: Number, required: true },
    transactionHash: { type: String, required: false },
    explorer: { type: String, required: false },
    error: { type: String, required: false },
  },
  { timestamps: true, collection: PERFEES_REFERRALS_TRANSACTIONS_COLLECTION }
);

// MODEL
export const ModelName = "ReferralTransactionModel";
export interface Model extends mongoose.Document, Timestampable {
  refererId: string;
  refereeId: string;
  refererName: string;
  refereeName: string;
  level: number;
  type: ReferralTransTypes;
  status: TransactionStatuses;
  amount: number;
  transactionHash?: string;
  explorer?: string;
  error?: string;
}

export class Dto {
  @ApiProperty()
  refererId: string;

  @ApiProperty()
  refereeId: string;

  @ApiProperty()
  refererName: string;

  @ApiProperty()
  refereeName: string;

  @ApiProperty()
  level: number;

  @ApiProperty()
  type: ReferralTransTypes;

  @ApiProperty()
  status: TransactionStatuses;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  explorer: string;

  @ApiProperty()
  error: string;
}

export class RefereeDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  userCount: number;

  @ApiProperty()
  level: number;

  @ApiProperty()
  totalEarned: number;

  @ApiProperty()
  createdAt: Date;
}
