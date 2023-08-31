import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ILiquidityPoolTransaction } from "../types";
import { TokenCreators } from '.';
import { Dexes } from "./Dexes";

const schema: SchemaOf<ILiquidityPoolTransaction> = {
  tokenCreator:  { type: ObjectId, ref: TokenCreators.modelName },
  date: { type: Date },
  txHash: { type: String },
  type: { type: String },
  dex: { type: ObjectId, ref: Dexes.modelName },
  baseCoin: {
    symbol: { type: String },
    amount: { type: String },
  },
  token: {
    symbol: { type: String },
    amount: { type: String },
  },
  created: { type: Date, default: function(){return new Date()} },
};

export interface ILiquidityPoolTransactionDocument extends Document, ILiquidityPoolTransaction {}
export interface ILiquidityPoolTransactionModel extends ISafeModel<ILiquidityPoolTransaction> {}

const LiquidityPoolTransactionSchema: Schema = new Schema(schema);

LiquidityPoolTransactionSchema.statics = {
  populateModel(object: any): Promise<ILiquidityPoolTransactionDocument> {
    return object
      .populate('tokenCreator')
      .populate('dex')
  },
  async safeCreate(initial: Partial<ILiquidityPoolTransaction>): Promise<ILiquidityPoolTransactionDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ILiquidityPoolTransaction>): Promise<ILiquidityPoolTransactionDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ILiquidityPoolTransactionDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const LiquidityPoolTransaction = model<ILiquidityPoolTransaction>("liquidityPoolTransaction", LiquidityPoolTransactionSchema) as ILiquidityPoolTransactionModel;
