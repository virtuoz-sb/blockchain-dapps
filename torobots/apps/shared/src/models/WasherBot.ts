import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IWasherBot, EWasherBotStatus, EExchangeType, EWasherBotActionResult } from '../types';
import { Users, Blockchains, Dexes, Nodes, Wallets, CexAccounts, Coins, Tokens } from '.';
import { userUnpopulatedFields, walletUnpopulatedFields, companyWalletUnpopulatedFields } from ".";
import { CompanyWallets } from "./CompanyWallets";

const schema: SchemaOf<IWasherBot> = {
  uniqueNum: { type: Number, required: false },
  blockchain: { type: ObjectId, ref: Blockchains.modelName, required: true },
  node: { type: ObjectId, ref: Nodes.modelName, required: true },
  exchangeType: { type: String, default: EExchangeType.DEX },

  wallet: { type: ObjectId, ref: Wallets.modelName, required: false },
  dex: { type: ObjectId, ref: Dexes.modelName, required: false },
  subWallets: [{ type: ObjectId, ref: CompanyWallets.modelName }],
  coin: { type: ObjectId, ref: Coins.modelName, required: false },
  coinmarketcapId: {type: String, required: false},
  depositMainCoin: { type: Number, default: 0 },
  depositBaseCoin: { type: Number, default: 0 },
  slippageLimit: { type: Number, default: 0 },

  cexAccount: { type: ObjectId, ref: CexAccounts.modelName, required: false },
  accountId: { type: String, required: false },
  cex: { type: String, required: false },

  token: { type: ObjectId, ref: Tokens.modelName, required: true },
  start: { type: String, required: false },
  end: { type: String, required: false },
  targetVolume: { type: Number, default: 0 },
  minTradingAmount: { type: Number, default: 0 },
  dailyLossLimit: { type: Number, default: 0 },
  cntWallet: { type: Number, default: 0 },
  owner: { type: ObjectId, ref: Users.modelName, required: true },
  state: {
    status: { type: String, default: EWasherBotStatus.DRAFT },
    result: { type: String, default: EWasherBotActionResult.DRAFT }
  },
  stateNum: { type: Number, default: 0 },
  isProcessing: { type: Boolean, default: false },
  isReady: { type: Boolean, default: false },
  created: { type: Date, default: function() {return new Date()}},
  updated: { type: Date, default: function() {return new Date()}},
}

export interface IWasherBotDocument extends Document, IWasherBot {}
export interface IWasherBotModel extends ISafeModel<IWasherBot> {}

const WasherBotSchema: Schema = new Schema(
  schema, 
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "updated"
    }
  }
);

WasherBotSchema.statics = {
  async populateModel(object: any, unpopulatedFields: boolean=true): Promise<IWasherBotDocument> {
    return object
    .populate('owner', unpopulatedFields ? userUnpopulatedFields: '')
    .populate('wallet', unpopulatedFields ? walletUnpopulatedFields: '')
    .populate('blockchain')
    .populate('dex')
    .populate('node')
    .populate('coin')
    .populate('token')
    .populate('cexAccount')
    .populate('subWallets', unpopulatedFields ? companyWalletUnpopulatedFields: '')
  },
  async safeCreate(initial: Partial<IWasherBot>): Promise<IWasherBotDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<IWasherBot>): Promise<IWasherBotDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IWasherBotDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const WasherBots = model<IWasherBot>("washerBots", WasherBotSchema) as IWasherBotModel;