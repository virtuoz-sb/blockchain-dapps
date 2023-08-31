import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf } from "./model.utils";
import { IMsglog } from '../types';

const schema: SchemaOf<IMsglog> = {
    msgType: {type: String, required: false},
    msgFrom: {type: String, required: false},
    msgTo: {type: String, required: false},
    msgContent: {type: String, required: false},
    created: { type: Date, default: function() {return new Date()}},
    updated: { type: Date, default: function() {return new Date()}},
}

export interface IMsglogDocument extends Document, IMsglog {}
export interface IMsglogModel extends ISafeModel<IMsglog> {}

const MsglogSchema: Schema = new Schema(schema);

MsglogSchema.statics = {
    async safeCreate(initial: Partial<IMsglog>): Promise<IMsglogDocument> {
        return this.create(initial);
    },
    async safeUpdate(id: string, updates: Partial<IMsglog>): Promise<IMsglogDocument> {
        return this.findByIdAndUpdate(id, updates);
    },
    async safeDelete(id: string): Promise<IMsglogDocument> {
        return this.findByIdAndDelete(id);
    }
};

export const Msglogs = model<IMsglog>("msglogs", MsglogSchema) as IMsglogModel;