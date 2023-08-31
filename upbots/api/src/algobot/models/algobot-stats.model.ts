import { Document } from "mongoose";
import Timestampable from "../../types/timestampable";

export interface AlgoBotStatsModel extends Document, Timestampable {
  ownerId: string;
  name: string;
  botRef: string;
  totalUsers: number;
  totalRealisedUbxtGain: number;
  openedTradeAmount: number;
  lastTradeAmount: number;
  activatedAt?: Date;
}
