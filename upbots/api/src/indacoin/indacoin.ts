import { Document } from "mongoose";

import { User } from "../types/user";

export interface Indacoin extends Document {
  user: User;
  transactionId: string;
  requestId: string;
  status: string;
  extraStatus: string;
  curIn: string;
  curOut: string;
  blockchainHash: string;
  link: string;
  targetAddress: string;
  amountIn: number;
  amountOut: number;
  createdAt: Date;
  confirmedAt: Date;
  finishedAt: Date;
}
