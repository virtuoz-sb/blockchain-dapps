import { Document, Types } from "mongoose";
import Timestampable from "../../types/timestampable";

export type BotStratType = "LONG" | "SHORT" | "LONG_SHORT";

export interface AdminAlgoBotSubscriptionModel extends Document, Timestampable {
  userId: string;
  botId: Types.ObjectId;
  apiKeyRef: string;
  enabled: boolean;
  isOwner: boolean;
  botRunning: boolean;
  stratType: BotStratType;
  cycleSequence: number;
  status: number; // 0 notset 1: pendingOpen, 2 pendingClose 3: Open 4:Close 5 OnError
  accountPercent: number;
  deletedAt?: Date;
  deleted: boolean;
  error?: string;
  errorAt?: Date;
  errorReason?: string;
}
