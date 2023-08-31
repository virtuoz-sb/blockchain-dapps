import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { IWallet } from "../types";
import { Users } from './Users';
import { userUnpopulatedFields } from "./Users"

export const walletBlockedFields: (keyof IWallet)[] = [
  'privateKey',
];
export const walletUnpopulatedFields = '-' + walletBlockedFields.join(' -');

const schema: SchemaOf<IWallet> = {
  name: { type: String, required: true },
  privateKey: { type: String, required: true },
  publicKey: { type: String, required: true },
  owner:  { type: ObjectId, ref: Users.modelName },
  users: [{ type: ObjectId, ref: Users.modelName }],
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface IWalletDocument extends Document, IWallet {}
export interface IWalletModel extends ISafeModel<IWallet> {}

const WalletSchema: Schema = new Schema(schema);

WalletSchema.statics = {
  populateModel(object: any): Promise<IWalletDocument> {
    return object
      .populate('owner', userUnpopulatedFields)
      .populate('users', userUnpopulatedFields);
  },
  async safeCreate(initial: Partial<IWallet>): Promise<IWalletDocument> {
    return this.create(initial);
  },
  async safeRetrieve(id: string): Promise<IWalletDocument> {
    return this.findById(id);
  },
  async safeRetrieveAll(): Promise<IWalletDocument[]> {
    return this.find({});
  },
  async safeUpdate(id: string, updates: Partial<IWallet>): Promise<IWalletDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IWalletDocument> {
    return this.findByIdAndDelete(id);
  },
};

export const Wallets = model<IWallet>("wallets", WalletSchema) as IWalletModel;
