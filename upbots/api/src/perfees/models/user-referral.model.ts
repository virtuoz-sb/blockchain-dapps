/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_USERS_REFERRALS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";

// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
    referralCode: { type: String, required: true },
    invitorCodes: [{ type: String, required: false }],
  },
  { timestamps: true, collection: PERFEES_USERS_REFERRALS_COLLECTION }
);

// MODEL
export const ModelName = "UserReferralModel";
export interface Model extends mongoose.Document, Timestampable {
  userId: string;
  referralCode: string;
  invitorCodes: string[];
}

export class Dto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  referralCode: string;

  @ApiProperty()
  invitorCodes: string[];
}
