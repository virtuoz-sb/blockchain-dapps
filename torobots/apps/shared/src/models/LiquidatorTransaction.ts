import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ILiquidatorTransaction } from "../types";
import { Wallets, LiquidatorBots, Tokens } from '.';

const schema: SchemaOf<ILiquidatorTransaction> = {
  uniqueNum: {type: Number, required: false},
  liquidator:  { type: String },
  token:  { type: ObjectId, ref: Tokens.modelName },
  txHash: { type: String },
  isDex: { type: Boolean, default: true },
  tokenAmount: { type: Number, default: 0 },  // sold amount
  fee: { type: Number, default: 0 }, // $
  price: { type: Number, default: 0 },   // $ it means total tokenAmount convert USD unit
  currentPrice: {type: Number, default: 0}, // $ got current price
  soldPrice: { type: Number },
  created: { type: Date, default: function(){return new Date()} },
};

export interface ILiquidatorTransactionDocument extends Document, ILiquidatorTransaction {}
export interface ILiquidatorTransactionModel extends ISafeModel<ILiquidatorTransaction> {}

const LiquidatorTransactionSchema: Schema = new Schema(schema);

LiquidatorTransactionSchema.statics = {
  populateModel(object: any): Promise<ILiquidatorTransactionDocument> {
    return object.populate('token')
  },
  async safeCreate(initial: Partial<ILiquidatorTransaction>): Promise<ILiquidatorTransactionDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ILiquidatorTransaction>): Promise<ILiquidatorTransactionDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ILiquidatorTransactionDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const LiquidatorTransactions = model<ILiquidatorTransaction>("liquidatorTransactions", LiquidatorTransactionSchema) as ILiquidatorTransactionModel;
