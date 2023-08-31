/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_USERS_WALLETS_TRACKINGS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { WalletStatuses, TransferType, TransactionTypes, TransactionStatuses } from "./shared.types";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, default: 0 },
    address: { type: String, required: false },
    type: { type: TransactionTypes, required: true },
    status: { type: TransactionStatuses, required: true },
    hash: { type: String, default: "" },
    explorer: { type: String, required: false },
    walletType: { type: String, required: false },
  },
  { timestamps: true, collection: PERFEES_USERS_WALLETS_TRACKINGS_COLLECTION }
);

// MODEL
export const ModelName = "UserWalletTrackingModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  amount: number;
  address?: string;
  type: TransactionTypes;
  status: TransactionStatuses;
  hash?: string;
  explorer?: string;
  walletType?: string;
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  type: TransactionTypes;

  @ApiProperty()
  status: TransactionStatuses;

  @ApiProperty()
  hash?: string;

  @ApiProperty()
  explorer?: string;

  @ApiProperty()
  walletType?: string;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    amount: model.amount,
    address: model.address,
    type: model.type,
    status: model.status,
    hash: model.hash,
    explorer: model.explorer,
    walletType: model.walletType,
  };
}
