import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IAutoBot, ERunningStatus, ETradingThread } from "../types";
import { Users, Blockchains, Dexes, Nodes, Wallets, Coins, Tokens } from '.';
import { userUnpopulatedFields, walletUnpopulatedFields } from "."

const schema: SchemaOf<IAutoBot> = {
  uniqueNum: { type: Number, required: false },
  mainWallet: { type: ObjectId, ref: Wallets.modelName, required: true },
  blockchain: { type: ObjectId, ref: Blockchains.modelName, required: true },
  dex: { type: ObjectId, ref: Dexes.modelName, required: true },
  node: { type: ObjectId, ref: Nodes.modelName, required: true },
  coin: { type: ObjectId, ref: Coins.modelName, required: false },
  token: { type: ObjectId, ref: Tokens.modelName, required: true },
  buyAmount: { type: Number, required: true },
  walletAddress: { type: String, required: false },
  walletKey: { type: String, required: false },
  statistics: {
    buy: { type: Object, default: {coinAmount: 0, tokenAmount: 0, fee: 0} },
    sell: { type: Object, default: {coinAmount: 0, tokenAmount: 0, fee: 0} },
  },
  step: { type: String, default: ETradingThread.AUTO_SENDING_COIN_TO_NEW_WALLET},
  state: {
    active: { type: Boolean, default: false },
    status: { type: String, default: ERunningStatus.DRAFT },
    thread: { type: String, required: false },
  },
  owner: { type: ObjectId, ref: Users.modelName, required: true },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface IAutoBotDocument extends Document, IAutoBot {}
export interface IAutoBotModel extends ISafeModel<IAutoBot> {}

const AutoBotSchema: Schema = new Schema(schema);

AutoBotSchema.statics = {
  async populateModel(object: any, unpopulatedFields: boolean=true): Promise<IAutoBotDocument> {
    return object
    .populate('owner', unpopulatedFields ? userUnpopulatedFields : '')
    .populate('mainWallet', unpopulatedFields ? walletUnpopulatedFields: '')
    .populate('blockchain')
    .populate('dex')
    .populate('node')
    .populate('coin')
    .populate('token')
  },
  async safeCreate(initial: Partial<IAutoBot>): Promise<IAutoBotDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IAutoBot>): Promise<IAutoBotDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IAutoBotDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const AutoBots = model<IAutoBot>("autoBots", AutoBotSchema) as IAutoBotModel;