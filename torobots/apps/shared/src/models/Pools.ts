import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IPool } from "../types";
import { Blockchains } from './Blockchains';
import { Dexes } from "./Dexes";
import { AutoBots } from "./AutoBots";

const schema: SchemaOf<IPool> = {
  uniqueNum: { type: Number, required: false },
  size: { type: Number, required: false, default: 0 },
  amount1: { type: Number, required: true },
  amount2: { type: Number, required: true },
  blockchain: { type: ObjectId, ref: Blockchains.modelName },
  dex: { type: ObjectId, ref: Dexes.modelName },
  token1: {
    address: { type: String, required: true },
    name: { type: String },
    symbol: { type: String },
    decimals: { type: Number },
    totalSupply: { type: Number },
    createdAt: { type: Date, default: function () { return new Date() } },
  },
  token2: {
    address: { type: String, required: true },
    name: { type: String },
    symbol: { type: String },
    decimals: { type: Number },
    totalSupply: { type: Number },
    createdAt: { type: Date, default: function () { return new Date() } },
  },
  pairAddress: { type: String },
  blockNumber: { type: Number },
  count: { type: Number },
  transactionHash: { type: String },
  createdTime: { type: Date, default: function () { return new Date() } },
  autoBot: { type: ObjectId, ref: AutoBots.modelName, required: false },
  created: { type: Date, default: function () { return new Date() } },
  updated: { type: Date, default: function () { return new Date() } },
};

export interface IPoolDocument extends Document, IPool { }
export interface IPoolModel extends ISafeModel<IPool> { }

const PoolSchema: Schema = new Schema(schema);

PoolSchema.statics = {
  populateModel(object: any): Promise<IPoolDocument> {
    return object
      .populate('blockchain')
      .populate('dex')
      .populate('autoBot')
  },
  async safeCreate(initial: Partial<IPool>): Promise<IPoolDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IPool>): Promise<IPoolDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IPoolDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Pools = model<IPool>("pools", PoolSchema) as IPoolModel;
