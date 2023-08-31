import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IToken } from "../types";
import { Blockchains } from './Blockchains';
import { Wallets } from './Wallets';

const schema: SchemaOf<IToken> = {
  address: { type: String, required: true },
  name: { type: String },
  symbol: { type: String },
  decimals: { type: Number },
  totalSupply: { type: Number },
  blockchain:  { type: ObjectId, ref: Blockchains.modelName },
  createdAt: { type: Date, default: function(){return new Date()} },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface ITokenDocument extends Document, IToken {}
export interface ITokenModel extends ISafeModel<IToken> {}

const TokenSchema: Schema = new Schema(schema);

TokenSchema.statics = {
  populateModel(object: any): Promise<ITokenDocument> {
    return object
      .populate('blockchain')
  },
  async safeCreate(initial: Partial<IToken>): Promise<ITokenDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IToken>): Promise<ITokenDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ITokenDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Tokens = model<IToken>("tokens", TokenSchema) as ITokenModel;
