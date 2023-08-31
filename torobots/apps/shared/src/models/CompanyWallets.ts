import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ICompanyWallet } from "../types";
import { Users } from './Users';
import { userUnpopulatedFields } from "./Users"

export const companyWalletBlockedFields: (keyof ICompanyWallet)[] = [
  'privateKey',
];
export const companyWalletUnpopulatedFields = '-' + companyWalletBlockedFields.join(' -');

const schema: SchemaOf<ICompanyWallet> = {
  privateKey: { type: String, required: true },
  publicKey: { type: String, required: true },
  uniqueNum: { type: Number, default: 0 },
  owner:  { type: ObjectId, ref: Users.modelName },
  cntInUse: { type: Number, default: 0 },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
  deleted: { type: Boolean, default: false },
};

export interface ICompanyWalletDocument extends Document, ICompanyWallet {}
export interface ICompanyWalletModel extends ISafeModel<ICompanyWallet> {}

const CompanyWalletSchema: Schema = new Schema(schema);

CompanyWalletSchema.statics = {
  populateModel(object: any): Promise<ICompanyWalletDocument> {
    return object
      .populate('owner', userUnpopulatedFields)
  },
  async safeCreate(initial: Partial<ICompanyWallet>): Promise<ICompanyWalletDocument> {
    return this.create(initial);
  },
  async safeRetrieve(id: string): Promise<ICompanyWalletDocument> {
    return this.findById(id);
  },
  async safeRetrieveAll(): Promise<ICompanyWalletDocument[]> {
    return this.find({});
  },
  async safeUpdate(id: string, updates: Partial<ICompanyWallet>): Promise<ICompanyWalletDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ICompanyWalletDocument> {
    return this.findByIdAndDelete(id);
  },
};

export const CompanyWallets = model<ICompanyWallet>("companyWallets", CompanyWalletSchema) as ICompanyWalletModel;
