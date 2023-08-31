/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_BOTS_WALLETS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { WalletStatuses, TransferType } from "./shared.types";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    botId: { type: mongoose.Types.ObjectId, ref: "AlgoBot" },
    // botSubId: { type: mongoose.Types.ObjectId, ref: "AlgoBotSubscription", required: true },
    amount: { type: Number, required: true, default: 0 },
    allocatedAmount: { type: Number, required: true, default: 0 },
    creditAmount: { type: Number, required: true, default: 0 },
    debtAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    status: { type: WalletStatuses, required: true, default: "ENABLED" },
    autoRefill: { type: Boolean, required: false, default: false },
    paidSubscription: {
      feesPlan: String, // perfFees, monthlyFees, yearlyFees
      feesToken: String, // UBXT, USD
      lastPaidAt: Date,
    },
  },
  { timestamps: true, collection: PERFEES_BOTS_WALLETS_COLLECTION }
);

// MODEL
export const ModelName = "BotWalletModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  botId: string;
  botSubId: string;
  amount: number;
  allocatedAmount: number;
  creditAmount: number;
  debtAmount: number;
  paidAmount: number;
  status: WalletStatuses;
  autoRefill: boolean;
  paidSubscription?: {
    feesPlan?: string;
    feesToken?: string;
    lastPaidAt?: Date;
    expiredAt?: Date;
  };
}

// DTOS
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  botSubId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  allocatedAmount: number;

  @ApiProperty()
  creditAmount: number;

  @ApiProperty()
  debtAmount: number;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  status: WalletStatuses;

  @ApiProperty()
  autoRefill: boolean;

  paidSubscription?: {
    feesPlan?: string;
    feesToken?: string;
    lastPaidAt?: Date;
    expiredAt?: Date;
  };

  @ApiProperty()
  createdAt: Date;
}

export class TransferDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  botSubId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  transType: TransferType;
}

export class UpdateDto {
  userId: string;

  botId: string;

  botSubId: string;

  amount: number;

  allocatedAmount: number;

  creditAmount: number;

  debtAmount: number;

  status: WalletStatuses;
}

export class AutoRefillDto {
  userId: string;

  botId: string;

  autoRefill: boolean;
}

export class AdminSetCreditDto {
  email?: string;

  userId: string;

  botId: string;

  amount: number;

  transType: TransferType;

  secret: string;
}

export class PaidSubscriptionDto {
  botId: string;

  feesPlan?: string;

  feesToken?: string;

  autoRefill?: boolean;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    botId: model.botId,
    botSubId: model.botSubId,
    amount: model.amount,
    allocatedAmount: model.allocatedAmount,
    creditAmount: model.creditAmount,
    debtAmount: model.debtAmount,
    paidAmount: model.paidAmount,
    status: model.status,
    autoRefill: model.autoRefill,
    paidSubscription: model.paidSubscription,
    createdAt: model.createdAt,
  };
}
