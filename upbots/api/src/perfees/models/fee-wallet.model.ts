/* eslint-disable max-classes-per-file */
import * as mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { PERFEES_FEES_WALLETS_COLLECTION } from "../../models/database-collection";
import Timestampable from "../../types/timestampable";
import { FeeRecipientsSchema, FeeRecipients } from "./shared.models";
import { FeeRecipientType, TransactionStatuses } from "./shared.types";

// TYPES

// SCHEMA
export const Schema = new mongoose.Schema(
  {
    botId: { type: mongoose.Types.ObjectId, ref: "AlgoBot", required: false },
    botName: { type: String, required: false },
    feeCycleSequence: { type: Number, required: true, default: 0 },
    type: { type: FeeRecipientType, required: true },
    address: { type: String, required: false },
    amount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: false, default: 0 },
    group: { type: FeeRecipientsSchema, required: false },
  },
  { timestamps: true, collection: PERFEES_FEES_WALLETS_COLLECTION }
);

// MODEL
export const ModelName = "FeeWalletModel";
export interface Model extends mongoose.Document, Timestampable {
  botId: string;
  botName?: string;
  feeCycleSequence?: number;
  type: FeeRecipientType;
  address?: string;
  amount?: number;
  paidAmount: number;
  group?: FeeRecipients;
}
