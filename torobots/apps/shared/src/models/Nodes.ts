import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { INode } from "../types";
import { Blockchains } from './Blockchains';

const schema: SchemaOf<INode> = {
  name: { type: String, required: true },
  blockchain:  { type: ObjectId, ref: Blockchains.modelName },
  wsProviderURL: { type: String, required: true },
  rpcProviderURL: { type: String, required: true },
  ipAddress: { type: String },
  checkUrl: { type: String },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface INodeDocument extends Document, INode {}
export interface INodeModel extends ISafeModel<INode> {}

const NodeSchema: Schema = new Schema(schema);

NodeSchema.statics = {
  populateModel(object: any): Promise<INodeDocument> {
    return object
      .populate('blockchain')
  },
  async safeCreate(initial: Partial<INode>): Promise<INodeDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<INode>): Promise<INodeDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<INodeDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Nodes = model<INode>("nodes", NodeSchema) as INodeModel;
