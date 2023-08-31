import { Document } from "mongoose";
import Timestampable from "../../types/timestampable";

export interface SignalPayload {
  order: SignalOrderPayload;
}
export interface SignalPayloadTrace {
  order: SignalOrderPayloadTrace;
}
export interface SignalOrderPayloadTrace extends SignalOrderPayload {
  webReqId: string;
  estimatedPrice: number;
  ip: string[];
}

export interface SignalOrderPayload {
  botId: string;
  position: "open" | "close";
  secret: string;
  stratType?: "LONG" | "SHORT";
  userFilter?: string[];
  botType?: string; // algobot, copybot
  params?: {
    side?: string; // buy, sell
    base?: string; // BTC, ETH, ....
    quote?: string; // USDT, USD, BUSD ...
    openPercent?: number; // ratio of whole trading amount percent (0.1, 0.5, 1)
    // leverage?: number;    // leverage
  };
}

export interface AlgobotExecutionResult {
  followers: number;
  successes: number;
  failures: number;
  execTime: number;
}
export interface SignalTrackingDto {
  /** algobot web request signal identifier */
  signalCorrelation: string;
  botId: string;
  botRef: string;
  botVer: string;
  stratType: string;
  position: string;
  estimatedPrice: number;
  sbl: string;
  quote: string; // comes from bot.market.quote
  signalDateTime: Date;
  botCycle: number;
  createdAt: Date;
}

export interface SignalTrackingModel extends Document, Timestampable {
  /** algobot web request signal identifier */
  signalCorrelation: string;
  botId: string;
  botRef: string;
  botVer: string;
  stratType: string;
  position: string;
  estimatedPrice: number;
  sbl: string;
  base: string;
  quote: string;
  signalDateTime: Date;
  botCycle: number;
}
