/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { BROKERTRADING_OWNERS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    exchKeyId: { type: mongoose.Types.ObjectId, ref: "ExchangeKey", required: true },
  },
  { timestamps: true, collection: BROKERTRADING_OWNERS_COLLECTION }
);

// MODEL
export const ModelName = "BrokerTradingOwnerModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  exchKeyId: string;
}

// DTO
export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  exchKeyId: string;

  @ApiProperty()
  createdAt: Date;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    exchKeyId: model.exchKeyId,
    createdAt: model.createdAt,
  };
}
