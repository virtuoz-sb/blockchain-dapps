import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ITransaction } from "../types";
import { Users, Wallets, Blockchains, Nodes, Dexes, Bots, Coins, Tokens } from '.';
import { userUnpopulatedFields, walletUnpopulatedFields } from "."

const schema: SchemaOf<ITransaction> = {
  user:  { type: ObjectId, ref: Users.modelName },
  wallet:  { type: ObjectId, ref: Wallets.modelName },
  blockchain:  { type: ObjectId, ref: Blockchains.modelName },
  node:  { type: ObjectId, ref: Nodes.modelName },
  dex:  { type: ObjectId, ref: Dexes.modelName },
  bot:  { type: ObjectId, ref: Bots.modelName },
  coin:  { type: ObjectId, ref: Coins.modelName },
  token:  { type: ObjectId, ref: Tokens.modelName },
  initiator: { type: String, required: true },
  thread: { type: String, required: true },
  result: { type: String, required: true },
  tryCount: { type: Number },  
  txHash: { type: String },
  gasFee: { type: Number },
  coinAmount: { type: Number },
  tokenAmount: { type: Number },
  message: { type: String },
  created: { type: Date, default: function(){return new Date()} },
};

export interface ITransactionDocument extends Document, ITransaction {}
export interface ITransactionModel extends ISafeModel<ITransaction> {}

const TransactionSchema: Schema = new Schema(schema);

TransactionSchema.statics = {
  populateModel(object: any): Promise<ITransactionDocument> {
    return object
    .populate('user', userUnpopulatedFields)
    .populate('wallet', walletUnpopulatedFields)
    .populate('blockchain')
    .populate('node')
    .populate('dex')
    .populate('bot')
    .populate('coin')
    .populate('token')
  },
  async safeCreate(initial: Partial<ITransaction>): Promise<ITransactionDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ITransaction>): Promise<ITransactionDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ITransactionDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Transactions = model<ITransaction>("transactions", TransactionSchema) as ITransactionModel;
