import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IWasherTransaction } from "../types";
import { Tokens } from '.';

const schema: SchemaOf<IWasherTransaction> = {
  uniqueNum: {type: Number, required: false},
  washer:  { type: String },
  token:  { type: ObjectId, ref: Tokens.modelName },
  txBuyHash: { type: String },
  txSellHash: { type: String },
  exchangeType: { type: String },
  tokenAmount: { type: Number, default: 0 },  // sold amount
  fee: { type: Number, default: 0 }, // $
  volume: { type: Number, default: 0 },   // $ it means total tokenAmount convert USD unit
  loss: { type: Number, default: 0 }, // $
  targetVolume: { type: Number, default: 0 },
  date: { type: String },
  timeStamp: { type: Number, default: 0 },
  created: { type: Date, default: function(){return new Date()} },
};

export interface IWasherTransactionDocument extends Document, IWasherTransaction {}
export interface IWasherTransactionModel extends ISafeModel<IWasherTransaction> {}

const WasherTransactionSchema: Schema = new Schema(schema);

WasherTransactionSchema.statics = {
  populateModel(object: any): Promise<IWasherTransactionDocument> {
    return object.populate('token')
  },
  async safeCreate(initial: Partial<IWasherTransaction>): Promise<IWasherTransactionDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IWasherTransaction>): Promise<IWasherTransactionDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IWasherTransactionDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const WasherTransactions = model<IWasherTransaction>("washerTransactions", WasherTransactionSchema) as IWasherTransactionModel;
