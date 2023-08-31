import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf } from "./model.utils";
import { IUser, EUserRole, EUserStatus } from "../types";
import { randomString } from '../utils';
const bcrypt = require("bcrypt");

export const userBlockedFields: (keyof IUser)[] = [
  'password',
  'sessionToken',
];
export const userUnpopulatedFields = '-' + userBlockedFields.join(' -');

const schema: SchemaOf<IUser> = {
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true, default: EUserRole.TRADER},
  status: { type: String, required: true, default: EUserStatus.TBA },
  sessionToken: { type: String },
  online: { type: Boolean, default: false },
  password: { type: String, required: true },
  totpRequired: { type: Boolean, default: false },
  twoFactorSecret: { type: String, required: false },
  twoFactorTmpSecret: { type: String, required: false },
  created: { type: Date, default: function(){return new Date()} },
  updated: { type: Date, default: function(){return new Date()} },
};

export interface IUserDocument extends Document, IUser {}
export interface IUserModel extends ISafeModel<IUser> {
  generateSessionToken(doc: IUserDocument): Promise<IUserDocument>;
  validatePassword(doc: IUserDocument, password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(schema);

UserSchema.statics = {
  async safeCreate(initial: Partial<IUser>): Promise<IUserDocument> {
    return this.create(initial);
  },
  async safeRetrieve(id: string): Promise<IUserDocument> {
    return this.findById(id);
  },
  async safeUpdate(id: string, updates: Partial<IUser>): Promise<IUserDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<IUserDocument> {
    return this.findByIdAndDelete(id);
  },
  async generateSessionToken(doc: IUserDocument): Promise<IUserDocument> {
    doc.sessionToken = randomString(60);
    await doc.save();
    return this.findById(doc._id);
  },
  validatePassword(doc: IUserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, doc.password || '');
  }
};

// Update password into a hashed one.
UserSchema.pre('save', async function(next) {
  const user: IUserDocument = this as any;

  if (!user.password || user.password.startsWith('$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (e) {
    next(e);
  }
});

export const Users = model<IUser>("users", UserSchema) as IUserModel;