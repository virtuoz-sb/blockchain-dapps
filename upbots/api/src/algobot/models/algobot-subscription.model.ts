import { Document, Types } from "mongoose";
import Timestampable from "../../types/timestampable";

export type BotFeesTokens = "UBXT" | "USD";
export type BotFeesPlans = "perfFees" | "monthlyFees" | "yearlyFees";
export type BotStratType = "LONG" | "SHORT";
export type BotAccountType = "spot" | "future" | "future";

export interface AlgobotSubOrderItem {
  status: number;
  marketSymbol: string;
  positionType: string;
  positionAmount: number;
  openedQuantity: number;
  cycleSequence: number;
}
export interface AlgoBotSubscriptionModel extends Document, Timestampable {
  userId: string;
  botId: Types.ObjectId;
  apiKeyRef: string;
  enabled: boolean;
  isOwner: boolean;
  botRunning: boolean;
  feesToken: BotFeesTokens;
  feesPlan: BotFeesPlans;
  accountType: BotAccountType;
  stratType: BotStratType;
  cycleSequence: number;
  status: number; // 0 notset 1: pendingOpen, 2 pendingClose 3: Open 4:Close 5 OnError
  accountPercent: number;
  positionType?: string;
  positionAmount?: number;
  accountLeverage?: number;
  contractSize?: number;
  baseAmount?: number;
  openedQuantity?: number;
  quote?: string;
  accountAllocated: {
    maxamount: number;
    currency: string;
  };
  orderItems?: AlgobotSubOrderItem[];
  deletedAt?: Date;
  deleted: boolean;
  error?: string;
  errorAt?: Date;
  errorReason?: string;
}
