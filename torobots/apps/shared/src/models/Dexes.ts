import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IDex, EDexType } from "../types";
import { Blockchains } from './Blockchains';

const schema: SchemaOf<IDex> = {
  name: { type: String, required: true },
  type:  { type: String, ref: Blockchains.modelName, default: EDexType.UNISWAP },
  blockchain:  { type: ObjectId, ref: Blockchains.modelName },
  factoryAddress: { type: String, required: true },
  routerAddress: { type: String, required: true },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface IDexDocument extends Document, IDex {}
export interface IDexModel extends ISafeModel<IDex> {}

const DexSchema: Schema = new Schema(schema);

DexSchema.statics = {
  populateModel(object: any): Promise<IDexDocument> {
    return object
      .populate('blockchain')
  },
  async safeCreate(initial: Partial<IDex>): Promise<IDexDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IDex>): Promise<IDexDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IDexDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Dexes = model<IDex>("dexes", DexSchema) as IDexModel;
