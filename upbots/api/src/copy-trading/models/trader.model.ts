/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { COPYTRADING_TRADERS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: false },
    botId: { type: mongoose.Types.ObjectId, ref: "Algobot", required: true },
    exchKeyId: { type: mongoose.Types.ObjectId, ref: "ExchangeKey", required: true },
  },
  { timestamps: true, collection: COPYTRADING_TRADERS_COLLECTION }
);

// MODEL
export const ModelName = "CopyTradingTraderModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  botId: string;
  exchKeyId: string;
}

// DTO
export class Dto {
  @ApiProperty()
  userId?: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  exchKeyId: string;

  @ApiProperty()
  createdAt?: Date;
}

// Model->DTO MAP
export function mapModelToDto(model: Model): Dto {
  return {
    userId: model.userId,
    botId: model.botId,
    exchKeyId: model.exchKeyId,
    createdAt: model.createdAt,
  };
}
