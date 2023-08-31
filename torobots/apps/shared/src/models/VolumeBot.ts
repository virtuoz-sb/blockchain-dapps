import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IVolumeBot, EVolumeBotStatus } from '../types';
import { Users, Blockchains, Dexes, Nodes, Wallets, Coins, Tokens } from '.';
import { userUnpopulatedFields, walletUnpopulatedFields } from ".";

const schema: SchemaOf<IVolumeBot> = {
    uniqueNum: { type: Number, required: false },
    mainWallet: { type: ObjectId, ref: Wallets.modelName, required: true },
    blockchain: { type: ObjectId, ref: Blockchains.modelName, required: true },
    dex: { type: ObjectId, ref: Dexes.modelName, required: true },
    node: { type: ObjectId, ref: Nodes.modelName, required: true },
    coin: { type: ObjectId, ref: Coins.modelName, required: true },
    token: { type: ObjectId, ref: Tokens.modelName, required: true },
    walletAddress: { type: String, required: false },
    walletKey: {type: String, required: false},
    addLiquiditySchedule: [{type: Object, required: false}],
    sellingSchedule: [{type: Object, required: false}],
    owner: { type: ObjectId, ref: Users.modelName, required: true },
    state: { type: String, default: EVolumeBotStatus.NONE },
    stateNum: { type: Number, default: 0 },
    created: { type: Date, default: function() {return new Date()}},
    updated: { type: Date, default: function() {return new Date()}},
}

export interface IVolumeBotDocument extends Document, IVolumeBot {}
export interface IVolumeBotModel extends ISafeModel<IVolumeBot> {}

const VolumeBotSchema: Schema = new Schema(
    schema,
    {
        timestamps: {
            createdAt: "created",
            updatedAt: "updated"
        }
    }
);

VolumeBotSchema.statics = {
    async populateModel(object: any, unpopulatedFields: boolean=true): Promise<IVolumeBotDocument> {
        return object
        .populate('owner', unpopulatedFields ? userUnpopulatedFields: '')
        .populate('mainWallet', unpopulatedFields ? walletUnpopulatedFields: '')
        .populate('blockchain')
        .populate('dex')
        .populate('node')
        .populate('coin')
        .populate('token')
    },
    async safeCreate(initial: Partial<IVolumeBot>): Promise<IVolumeBotDocument> {
        return this.create(initial);
    },
    async safeUpdate(id: string, updates: Partial<IVolumeBot>): Promise<IVolumeBotDocument> {
        return this.findByIdAndUpdate(id, updates);
    },
    async safeDelete(id: string): Promise<IVolumeBotDocument> {
        return this.findByIdAndDelete(id);
    }
};

export const VolumeBots = model<IVolumeBot>("volumeBots", VolumeBotSchema) as IVolumeBotModel;