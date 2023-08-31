import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ICoin } from "../types";
import { Blockchains } from './Blockchains';

const schema: SchemaOf<ICoin> = {
  address: { type: String, required: true },
  name: { type: String },
  symbol: { type: String },
  decimals: { type: Number },
  totalSupply: { type: Number },
  blockchain:  { type: ObjectId, ref: Blockchains.modelName },
  createdAt: { type: Date, default: function(){return new Date()} },
  price: { type: Number, default: 0, required: false },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface ICoinDocument extends Document, ICoin {}
export interface ICoinModel extends ISafeModel<ICoin> {}

const CoinSchema: Schema = new Schema(schema);

CoinSchema.statics = {
  populateModel(object: any): Promise<ICoinDocument> {
    return object
      .populate('blockchain')
  },
  async safeCreate(initial: Partial<ICoin>): Promise<ICoinDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ICoin>): Promise<ICoinDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ICoinDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Coins = model<ICoin>("coins", CoinSchema) as ICoinModel;
