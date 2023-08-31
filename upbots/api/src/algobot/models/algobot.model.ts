import { Document, Types } from "mongoose";
import Timestampable from "../../types/timestampable";
import { BotFeesTokens, BotFeesPlans } from "./algobot-subscription.model";

export interface AlgoMarket {
  base: string;
  quote: string;
}

export interface AlgoAllocated {
  maxamount: number;
  currency: string;
}
export interface AlgoReview {
  username: string;
  userimg: string;
  botrating: number;
}

export interface AlgobotFees {
  feesTokens: BotFeesTokens[];
  feesPlans: BotFeesPlans[];
  ubxtDiscount: number;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
}

export interface PerfFees {
  percent: number;
  distribution: {
    developer: number;
    reserve: number;
    pool: number;
    burn: number;
  };
  address: string;
}

export interface AlgoBotModel extends Document, Timestampable {
  name: string;
  botRef: string;
  botVer: string;
  description: string;
  stratDesc?: string;
  stratType: string;
  category: string;
  market: AlgoMarket;
  enabled: boolean; // indicates whether exposed by the api or not
  owner: Types.ObjectId;
  creator: string;
  picture: {
    mimetype: string;
    data: string;
  };
  avgtrades: number;
  lastMonthTrades: number;
  allocated: AlgoAllocated;
  ratings: number;
  raters?: { id: string; user: string; vote: number; comment: string; reviewedAt: Date }[];
  reviews: AlgoReview;
  botFees: AlgobotFees;
  perfFees: PerfFees;
  realOwnerId?: string;
  exchangesType: string[];
  priceDecimal: number;
  webhook: {
    exitTrigger: boolean;
  };
  // param:Object : this contains userbot strategy parameters
}
