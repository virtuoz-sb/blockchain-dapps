/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { STAKING_LEVEL_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true },
    amount: { type: Number, required: true, default: 0 },
    amountPeak: { type: Number, required: true, default: 0 },
    currentFeeOff: { type: Number, required: true, default: 20 },
    latestLevel: { type: Number, required: true, default: 0 },
    wallet: { type: String, default: null },
    level1: { type: Date, default: null },
    level2: { type: Date, default: null },
    level3: { type: Date, default: null },
    level4: { type: Date, default: null },
    level5: { type: Date, default: null },
    level6: { type: Date, default: null },
    level7: { type: Date, default: null },
  },
  { timestamps: true, collection: STAKING_LEVEL_COLLECTION }
);

// MODEL
export const ModelName = "StakingLevel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  amount: number; // current amount
  amountPeak: number; // max amount
  currentFeeOff: number;
  latestLevel: number;
  wallet: string;
  level1: Date; // awarded date, default: null
  level2: Date; // awarded date, default: null
  level3: Date; // awarded date, default: null
  level4: Date; // awarded date, default: null
  level5: Date; // awarded date, default: null
  level6: Date; // awarded date, default: null
  level7: Date; // awarded date, default: null
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  amountPeak: number;

  @ApiProperty()
  currentFeeOff: number;

  @ApiProperty()
  latestLevel: number;

  @ApiProperty()
  wallet: string;

  @ApiProperty()
  level1: Date;

  @ApiProperty()
  level2: Date;

  @ApiProperty()
  level3: Date;

  @ApiProperty()
  level4: Date;

  @ApiProperty()
  level5: Date;

  @ApiProperty()
  level6: Date;

  @ApiProperty()
  level7: Date;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    amount: model.amount,
    amountPeak: model.amountPeak,
    currentFeeOff: model.currentFeeOff,
    latestLevel: model.latestLevel,
    wallet: model.wallet,
    level1: model.level1,
    level2: model.level2,
    level3: model.level3,
    level4: model.level4,
    level5: model.level5,
    level6: model.level6,
    level7: model.level7,
  };
}

export interface UserStakingLevelInfo {
  currentFeeOff: number;
  latestLevel: number;
  accessCommunityBots: boolean;
  accessCreateBot: boolean;
  prizeNFT: string;
}

export class UserStakingLevelInfoDto {
  @ApiProperty()
  currentFeeOff: number;

  @ApiProperty()
  latestLevel: number;

  @ApiProperty()
  accessCommunityBots: boolean;

  @ApiProperty()
  accessCreateBot: boolean;

  @ApiProperty()
  prizeNFT: string;
}
