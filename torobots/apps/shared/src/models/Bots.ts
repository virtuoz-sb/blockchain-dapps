import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IBot, EBotType, ETradingThread, ERunningStatus } from "../types";
import { Users, Blockchains, Dexes, Nodes, Wallets, Coins, Tokens } from '.';
import { userUnpopulatedFields, walletUnpopulatedFields } from "."

const schema: SchemaOf<IBot> = {
  uniqueNum: { type: Number, required: false },
  wallet: { type: ObjectId, ref: Wallets.modelName, required: true },
  blockchain: { type: ObjectId, ref: Blockchains.modelName, required: true },
  dex: { type: ObjectId, ref: Dexes.modelName, required: true },
  node: { type: ObjectId, ref: Nodes.modelName, required: true },
  coin: { type: ObjectId, ref: Coins.modelName, required: false },
  token: { type: ObjectId, ref: Tokens.modelName, required: true },
  initiator: { type: String, required: false },
  type: { type: String, required: false, default: EBotType.BUY },
  buy: { type: Object, required: false },
  sell: { type: Object, required: false },
  config: {
    stopLoss: { type: Boolean, default: false },
    stopLimit: { type: Number, default: 50 },
    savings: { type: Boolean, default: false },
    saveLimit: { type: Number, default: 10 },
    rugpool: { type: Boolean, default: false },
    antiSell: { type: Boolean, default: false },
    buyLimitDetected: { type: Boolean, default: false },
    sellLimitDetected: { type: Boolean, default: false },
    autoBuyAmount: { type: Boolean, default: false },
    buyAnyCost: { type: Boolean, default: false }
  },
  statistics: {
    buy: { type: Object, default: {coinAmount: 0, tokenAmount: 0, fee: 0} },
    sell: { type: Object, default: {coinAmount: 0, tokenAmount: 0, fee: 0} },
  },
  rugpool: {
    lastBlock: { type: Number, default: 0 },
    firstMintedCoin: { type: Number, default: 0 },
    firstMintedToken: { type: Number, default: 0 },
    maxAccumulatedCoin: { type: Number, default: 0 },
    maxAccumulatedToken: { type: Number, default: 0 },
    currentAccumulatedCoin: { type: Number, default: 0 },
    currentAccumulatedToken: { type: Number, default: 0 },
  },
  state: {
    active: { type: Boolean, default: false },
    status: { type: String, default: ERunningStatus.DRAFT },
    thread: { type: String, default: ETradingThread.NONE },
    result: { type: String, default: "" },
    extends: {
      instant: {
        active: { type: Boolean, default: false },
        status: { type: String, default: ERunningStatus.DRAFT },
        thread: { type: String, default: ETradingThread.NONE },
        result: { type: String, default: "" }
      }
     },
  },
  owner: { type: ObjectId, ref: Users.modelName, required: true },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface IBotDocument extends Document, IBot {}
export interface IBotModel extends ISafeModel<IBot> {}

const BotSchema: Schema = new Schema(
  schema, 
  {
      timestamps: {
          createdAt: "created",
          updatedAt: "updated"
      }
  }
);

BotSchema.statics = {
  async populateModel(object: any, unpopulatedFields: boolean=true): Promise<IBotDocument> {
    return object
    .populate('owner', unpopulatedFields ? userUnpopulatedFields : '')
    .populate('wallet', unpopulatedFields ? walletUnpopulatedFields: '')
    .populate('blockchain')
    .populate('dex')
    .populate('node')
    .populate('coin')
    .populate('token')
  },
  async safeCreate(initial: Partial<IBot>): Promise<IBotDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IBot>): Promise<IBotDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IBotDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const Bots = model<IBot>("bots", BotSchema) as IBotModel;