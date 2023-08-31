import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ILiquidatorBot, ELiquidatorBotStatus, ELiquidatorBotType } from '../types';
import { Users, Blockchains, Dexes, Nodes, Wallets, CexAccounts, Coins, Tokens } from '.';
import { userUnpopulatedFields, walletUnpopulatedFields } from ".";

const schema: SchemaOf<ILiquidatorBot> = {
    uniqueNum: { type: Number, required: false },
    blockchain: { type: ObjectId, ref: Blockchains.modelName, required: true },
    node: { type: ObjectId, ref: Nodes.modelName, required: true },
    type: { type: String, default: ELiquidatorBotType.DEX },

    wallet: { type: ObjectId, ref: Wallets.modelName, required: false },
    dex: { type: ObjectId, ref: Dexes.modelName, required: false },
    coin: { type: ObjectId, ref: Coins.modelName, required: false },

    cexAccount: { type: ObjectId, ref: CexAccounts.modelName, required: false },
    accountId: { type: String, required: false },
    cex: { type: String, required: false },
    orderType: { type: String },
    timeInterval: { type: Number },
    rate: { type: Number },

    tokenAmount: { type: Number, required: false },
    tokenSold: { type: Number, default: 0 },
    tokenUsdSold: { type: Number, default: 0 },
    token: { type: ObjectId, ref: Tokens.modelName, required: true },
    lowerPrice: {type: Number, required: true},
    presetAmount: {type: Number, required: false},
    bigSellPercentage: {type: Number, required: false},
    smallSellPercentage: {type: Number, required: false},
    owner: { type: ObjectId, ref: Users.modelName, required: true },
    state: { type: String, default: ELiquidatorBotStatus.NONE },
    stateNum: { type: Number, default: 0 },
    created: { type: Date, default: function() {return new Date()}},
    updated: { type: Date, default: function() {return new Date()}},
}

export interface ILiquidatorBotDocument extends Document, ILiquidatorBot {}
export interface ILiquidatorBotModel extends ISafeModel<ILiquidatorBot> {}

const LiquidatorBotSchema: Schema = new Schema(
    schema, 
    {
        timestamps: {
            createdAt: "created",
            updatedAt: "updated"
        }
    }
);

LiquidatorBotSchema.statics = {
    async populateModel(object: any, unpopulatedFields: boolean=true): Promise<ILiquidatorBotDocument> {
        return object
        .populate('owner', unpopulatedFields ? userUnpopulatedFields: '')
        .populate('wallet', unpopulatedFields ? walletUnpopulatedFields: '')
        .populate('blockchain')
        .populate('dex')
        .populate('node')
        .populate('coin')
        .populate('token')
        .populate('cexAccount')
    },
    async safeCreate(initial: Partial<ILiquidatorBot>): Promise<ILiquidatorBotDocument> {
        return this.create(initial);
    },
    async safeUpdate(id: string, updates: Partial<ILiquidatorBot>): Promise<ILiquidatorBotDocument> {
        return this.findByIdAndUpdate(id, updates);
    },
    async safeDelete(id: string): Promise<ILiquidatorBotDocument> {
        return this.findByIdAndDelete(id);
    }
};

export const LiquidatorBots = model<ILiquidatorBot>("liquidatorBots", LiquidatorBotSchema) as ILiquidatorBotModel;