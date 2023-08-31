/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { STAKING_USERS_WALLETS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    amountETH: { type: Number, required: true, default: 0 },
    amountBSC: { type: Number, required: true, default: 0 },
    walletAddressETH: { type: String, default: "" },
    walletAddressBSC: { type: String, default: "" },
  },
  { timestamps: true, collection: STAKING_USERS_WALLETS_COLLECTION }
);

// MODEL
export const ModelName = "StakingUserWalletModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  amountETH: number;
  amountBSC: number;
  walletAddressETH: string;
  walletAddressBSC: string;
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  amountETH: number;

  @ApiProperty()
  amountBSC: number;

  @ApiProperty()
  walletAddressETH: string;

  @ApiProperty()
  walletAddressBSC: string;

  @ApiProperty()
  createdAt: Date;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    amountETH: model.amountETH,
    amountBSC: model.amountBSC,
    walletAddressETH: model.walletAddressETH,
    walletAddressBSC: model.walletAddressBSC,
    createdAt: model.createdAt,
  };
}
