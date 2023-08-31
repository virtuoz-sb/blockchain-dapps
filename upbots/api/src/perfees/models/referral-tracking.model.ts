/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_REFERRALS_TRACKINGS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { TransactionStatuses } from "./shared.types";

// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    refererId: { type: mongoose.Types.ObjectId, ref: "Users", required: false },
    refereeId: { type: mongoose.Types.ObjectId, ref: "Users", required: false },
    status: { type: TransactionStatuses, required: true },
  },
  { timestamps: true, collection: PERFEES_REFERRALS_TRACKINGS_COLLECTION }
);

// MODEL
export const ModelName = "ReferralTrackingModel";
export interface Model extends mongoose.Document, Timestampable {
  refererId: string;
  refereeId: string;
  status: TransactionStatuses;
}

export class Dto {
  @ApiProperty()
  refererId: string;

  @ApiProperty()
  refereeId: string;

  @ApiProperty()
  status: TransactionStatuses;
}
