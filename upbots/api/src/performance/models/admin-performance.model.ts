import { Document } from "mongoose";
import Timestampable from "../../types/timestampable";
import { MeasuredObjects, Period } from "./performance.models";

export interface AdminPerformanceCycleModel extends Document, Timestampable {
  openAt: Date;
  openPeriod: Period;
  closeAt?: Date;
  closePeriod: Period;
  stratType: string;
  result: string;
  subBotId?: string;
  userId?: string;
  measuredObject: MeasuredObjects;
  cycleSequence: number;
  open: boolean;
  sbl: string;
  base?: string;
  quote?: string;
  exch: string;
  profitPercentage?: number;
  entryPrice: number;
  closePrice?: number;
}
