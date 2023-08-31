/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import Timestampable from "../../types/timestampable";

export enum Sizes {
  MONTH6 = "MONTH6",
  MONTH12 = "MONTH12",
  ALLMONTH = "ALLMONTH",
}

export enum MeasuredObjects {
  BOT = "BOT",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export enum PerformanceFeeSteps {
  READY = "READY",
  OPENED = "OPENED",
  PERFORMED = "PERFORMED",
}

export interface PerformanceSnapshotModel extends Document, Timestampable {
  botId: string;
  stratType: string;
  subBotId?: string;
  userId?: string;
  size: Sizes;
  cyclesData: PerformanceCycleDto[];
  measuredObject: MeasuredObjects;
  snapshotDate: string;
  allmonths: number;
  month12: number;
  month6: number;
  month3: number;
  month1: number;
  day7: number;
  allmonthsUC?: number;
  month12UC?: number;
  month6UC?: number;
  month3UC?: number;
  month1UC?: number;
  day7UC?: number;
  fees: number;
  charts: Charts;
}

export class Period {
  @ApiProperty()
  year: number;

  @ApiProperty()
  month: string;

  @ApiProperty()
  week: number;

  @ApiProperty()
  day: string;
}

export class UbxtBalance {
  @ApiProperty()
  ubxt?: number;

  @ApiProperty()
  btc?: number;

  @ApiProperty()
  usd?: number;

  @ApiProperty()
  eur?: number;
}

export class PerformanceFee {
  @ApiProperty()
  performedStep?: PerformanceFeeSteps;

  @ApiProperty()
  paidAmount?: number;

  @ApiProperty()
  remainedAmount?: number;
}

export class PerformanceCycleDto {
  @ApiProperty()
  openAt: Date;

  @ApiProperty()
  botId?: string;

  @ApiProperty()
  botVer?: string;

  @ApiProperty()
  subBotId?: string;

  @ApiProperty()
  userId?: string;

  @ApiProperty()
  measuredObject: MeasuredObjects;

  @ApiProperty({ type: Period })
  openPeriod: Period;

  @ApiProperty()
  closeAt?: Date;

  @ApiProperty({ type: Period })
  closePeriod: Period;

  @ApiProperty()
  stratType: string;

  @ApiProperty()
  result: string;

  @ApiProperty()
  cycleSequence: number;

  @ApiProperty()
  open: boolean;

  @ApiProperty({ description: "base + quote" })
  sbl: string;

  @ApiProperty()
  exch: string;

  @ApiProperty()
  realisedGain?: UbxtBalance;

  @ApiProperty()
  performanceFee?: PerformanceFee;

  @ApiProperty()
  profitPercentage?: number;

  @ApiProperty()
  profitPercentageUC?: number;

  @ApiProperty()
  entryPrice: number;

  @ApiProperty()
  closePrice?: number;

  @ApiProperty()
  qExec?: number;

  @ApiProperty()
  createdAt?: Date;
}

export interface PerformanceCycleModel extends Document, Timestampable {
  openAt: Date;
  openPeriod: Period;
  closeAt?: Date;
  closePeriod: Period;
  stratType: string;
  result: string;
  subBotId?: string;
  userId?: string;
  botId?: string;
  botVer?: string;
  measuredObject: MeasuredObjects;
  cycleSequence: number;
  open: boolean;
  sbl: string;
  base?: string;
  quote?: string;
  exch: string;
  realisedGain?: UbxtBalance;
  performanceFee?: PerformanceFee;
  profitPercentage?: number;
  profitPercentageUC?: number;
  entryPrice: number;
  closePrice?: number;
  qExec?: number;
}

export class ChartData {
  @ApiProperty()
  labels: string[];

  @ApiProperty()
  data: number[];
}

export class Charts {
  @ApiProperty({ type: ChartData })
  monthlyChart: ChartData;

  @ApiProperty({ type: ChartData })
  weeklyChart: ChartData;

  @ApiProperty({ type: ChartData })
  daylyChart: ChartData;
}

export class PerformanceSnapshotDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  stratType: string;

  @ApiProperty()
  subBotId?: string;

  @ApiProperty()
  size: Sizes;

  @ApiProperty({ type: PerformanceCycleDto, isArray: true })
  cyclesData?: PerformanceCycleDto[];

  @ApiProperty()
  measuredObject: MeasuredObjects;

  @ApiProperty()
  snapshotDate: string;

  @ApiProperty()
  allmonths: number;

  @ApiProperty()
  month12: number;

  @ApiProperty()
  month6: number;

  @ApiProperty()
  month3: number;

  @ApiProperty()
  month1: number;

  @ApiProperty()
  day7: number;

  @ApiProperty()
  month12UC?: number;

  @ApiProperty()
  month6UC?: number;

  @ApiProperty()
  allmonthsUC?: number;

  @ApiProperty()
  month3UC?: number;

  @ApiProperty()
  month1UC?: number;

  @ApiProperty()
  day7UC?: number;

  @ApiProperty()
  fees: number;

  @ApiProperty({ type: Charts })
  charts: Charts;

  @ApiProperty()
  maxDrawdown: number;
}

export class PublicAlgobotPerformanceDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  creator: string;

  @ApiProperty()
  base: string;

  @ApiProperty()
  quote: string;

  @ApiProperty()
  allmonths: string;

  @ApiProperty()
  month12: string;

  @ApiProperty()
  month6: string;

  @ApiProperty()
  month3: string;

  @ApiProperty()
  month1: string;

  @ApiProperty()
  day7: string;
}
