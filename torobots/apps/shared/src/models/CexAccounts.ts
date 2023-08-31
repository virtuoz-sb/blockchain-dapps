import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ICexAccount } from "../types";
import { Users } from './Users';
import { userUnpopulatedFields } from "./Users"

export const cexAccountBlockedFields: (keyof ICexAccount)[] = [
  'updated'
];
export const cexAccountUnpopulatedFields = '-' + cexAccountBlockedFields.join(' -');

const schema: SchemaOf<ICexAccount> = {
  name: { type: String, required: true },
  cex: { type: String, required: true },
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  apiPassword: { type: String, required: false },
  owner:  { type: ObjectId, ref: Users.modelName },
  users: [{ type: ObjectId, ref: Users.modelName }],
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface ICexAccountDocument extends Document, ICexAccount {}
export interface ICexAccountModel extends ISafeModel<ICexAccount> {}

const CexAccountSchema: Schema = new Schema(schema);

CexAccountSchema.statics = {
  populateModel(object: any): Promise<ICexAccountDocument> {
    return object
      .populate('owner', userUnpopulatedFields)
      .populate('users', userUnpopulatedFields);
  },
  async safeCreate(initial: Partial<ICexAccount>): Promise<ICexAccountDocument> {
    return this.create(initial);
  },
  async safeRetrieve(id: string): Promise<ICexAccountDocument> {
    return this.findById(id);
  },
  async safeRetrieveAll(): Promise<ICexAccountDocument[]> {
    return this.find({});
  },
  async safeUpdate(id: string, updates: Partial<ICexAccount>): Promise<ICexAccountDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ICexAccountDocument> {
    return this.findByIdAndDelete(id);
  },
};

export const CexAccounts = model<ICexAccount>("cexAccounts", CexAccountSchema) as ICexAccountModel;
