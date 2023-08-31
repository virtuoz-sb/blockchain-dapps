import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IBlockchain } from "../types";

const schema: SchemaOf<IBlockchain> = {
  name: { type: String, required: true },
  chainId: { type: Number, required: true },
  coinSymbol: { type: String, required: true },
  coinmarketcapNetworkId: { type: String, required: false },
  node: { type: ObjectId, ref: "nodes" },
  explorer: { type: String, required: false, default: '' },
  amountForFee: { type: Number, required: true, default: 1},
  gasPrice: { type: Number, required: true, default: 0},
  gasPriceLimit: { type: Number, required: true, default: 0},
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface IBlockchainDocument extends Document, IBlockchain {}
export interface IBlockchainModel extends ISafeModel<IBlockchain> {}

const BlockchainSchema: Schema = new Schema(schema);

BlockchainSchema.statics = {
  populateModel(object: any, unpopulatedFields: boolean=true): Promise<IBlockchainDocument> {
    return object
      .populate('node')
  },
  async safeCreate(initial: Partial<IBlockchain>): Promise<IBlockchainDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IBlockchain>): Promise<IBlockchainDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IBlockchainDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Blockchains = model<IBlockchain>("blockchains", BlockchainSchema) as IBlockchainModel;
