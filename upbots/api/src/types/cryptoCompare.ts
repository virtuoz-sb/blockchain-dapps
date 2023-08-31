import { Document } from "mongoose";

export interface CryptoCompare extends Document {
  fromLists: string;
  toLists: string;
  data?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
