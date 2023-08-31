import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ITokenMintBurnTransaction } from "../types";
import { TokenCreators } from '.';

const schema: SchemaOf<ITokenMintBurnTransaction> = {
  tokenCreator:  { type: ObjectId, ref: TokenCreators.modelName },
  date: { type: Date },
  txHash: { type: String },
  type: { type: String },
  amount: { type: Number },
  created: { type: Date, default: function(){return new Date()} },
};

export interface ITokenMintBurnTransactionDocument extends Document, ITokenMintBurnTransaction {}
export interface ITokenMintBurnTransactionModel extends ISafeModel<ITokenMintBurnTransaction> {}

const TokenMintBurnTransactionSchema: Schema = new Schema(schema);

TokenMintBurnTransactionSchema.statics = {
  populateModel(object: any): Promise<ITokenMintBurnTransactionDocument> {
    return object.populate('tokenCreator')
  },
  async safeCreate(initial: Partial<ITokenMintBurnTransaction>): Promise<ITokenMintBurnTransactionDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ITokenMintBurnTransaction>): Promise<ITokenMintBurnTransactionDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ITokenMintBurnTransactionDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const TokenMintBurnTransaction = model<ITokenMintBurnTransaction>("tokenMintBurnTransaction", TokenMintBurnTransactionSchema) as ITokenMintBurnTransactionModel;
