/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { BROKERTRADING_TRADERS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    ownerExchKeyId: { type: mongoose.Types.ObjectId, ref: "ExchangeKey", required: true },
    exchKeyId: { type: mongoose.Types.ObjectId, ref: "ExchangeKey" },
    subAccount: {
      uid: { type: String },
      name: { type: String },
      publicKey: { type: String },
      secretKey: { type: String },
    },
  },
  { timestamps: true, collection: BROKERTRADING_TRADERS_COLLECTION }
);

// MODEL
export const ModelName = "BrokerTradingTraderModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  ownerExchKeyId: string;
  exchKeyId: string;
  subAccount: {
    uid: { type: string };
    name: { type: string };
    publicKey: { type: string };
    secretKey: { type: string };
  };
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  ownerExchKeyId: string;

  @ApiProperty()
  exchKeyId: string;

  @ApiProperty()
  subAccount: {
    uid: { type: string };
    name: { type: string };
    publicKey: { type: string };
    secretKey: { type: string };
  };

  @ApiProperty()
  createdAt: Date;
}

// CreateExchangeDTO
export class CreateExchangeDto {
  @ApiProperty()
  name: string;
}

// WithdrawDTO
export class WithdrawDto {
  @ApiProperty()
  network: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: number;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    ownerExchKeyId: model.ownerExchKeyId,
    exchKeyId: model.exchKeyId,
    subAccount: model.subAccount,
    createdAt: model.createdAt,
  };
}
