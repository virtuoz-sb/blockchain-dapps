/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_USERS_WALLETS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { WalletStatuses, TransferType } from "./shared.types";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, default: 0 },
    allocatedAmount: { type: Number, default: 0 },
    availableAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, required: true, default: 0 },
    debtAmount: { type: Number, default: 0 },
    rewardCreditedForBots: { type: Boolean, default: false },
    depositAddressETH: { type: String, default: "" },
    depositAddressBSC: { type: String, default: "" },
    totalEarned: {
      referral: { type: Number, default: 0 },
    },
  },
  { timestamps: true, collection: PERFEES_USERS_WALLETS_COLLECTION }
);

// MODEL
export const ModelName = "UserWalletModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  amount: number;
  allocatedAmount: number;
  availableAmount: number;
  creditAmount: number;
  debtAmount: number;
  rewardCreditedForBots: boolean;
  depositAddressETH: string;
  depositAddressBSC: string;
  totalEarned: {
    referral: number;
  };
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  allocatedAmount: number;

  @ApiProperty()
  availableAmount: number;

  @ApiProperty()
  creditAmount: number;

  @ApiProperty()
  debtAmount: number;

  @ApiProperty()
  depositAddressETH: string;

  @ApiProperty()
  depositAddressBSC: string;

  @ApiProperty()
  totalEarned: {
    referral: number;
  };

  @ApiProperty()
  createdAt: Date;
}

export class TransferDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  transferType: TransferType;

  @ApiProperty()
  isETH?: boolean;
}

export class UpdateDto {
  userId: string;

  amount: number;

  allocatedAmount: number;

  availableAmount: number;

  depositAddressETH: string;

  depositAddressBSC: string;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    amount: model.amount,
    allocatedAmount: model.allocatedAmount,
    availableAmount: model.availableAmount,
    creditAmount: model.creditAmount,
    debtAmount: model.debtAmount,
    depositAddressETH: model.depositAddressETH,
    depositAddressBSC: model.depositAddressBSC,
    totalEarned: model.totalEarned,
    createdAt: model.createdAt,
  };
}
