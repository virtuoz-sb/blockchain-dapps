import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ITokenCreator } from "../types";
import { Blockchains } from './Blockchains';
import { Wallets } from './Wallets';
import { Tokens } from './Tokens';
import { Nodes } from './Nodes';

const schema: SchemaOf<ITokenCreator> = {
  uniqueNum: { type: Number, default: 0 },
  name: { type: String },
  symbol: { type: String },
  decimals: { type: Number },
  blockchain:  { type: ObjectId, ref: Blockchains.modelName },
  node: { type: ObjectId, ref: Nodes.modelName },
  wallet:  { type: ObjectId, ref: Wallets.modelName},
  maxSupply: { type: Number, default: 0 },
  totalSupply: { type: Number, default: 0 },
  token: { type: ObjectId, ref: Tokens.modelName },
  state: {
    action: { type: String, default: "" },
    result: { type: String, default: "" }
  },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface ITokenCreatorDocument extends Document, ITokenCreator {}
export interface ITokenCreatorModel extends ISafeModel<ITokenCreator> {}

const TokenSchema: Schema = new Schema(schema);

TokenSchema.statics = {
  populateModel(object: any): Promise<ITokenCreatorDocument> {
    return object
      .populate('blockchain')
      .populate('node')
      .populate('wallet')
      .populate('token')
  },
  async safeCreate(initial: Partial<ITokenCreator>): Promise<ITokenCreatorDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ITokenCreator>): Promise<ITokenCreatorDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ITokenCreatorDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const TokenCreators = model<ITokenCreator>("tokenCreators", TokenSchema) as ITokenCreatorModel;
