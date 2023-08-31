export interface PerfFees {
  percent: number;
  address: string;
}
export interface AlgoBot {
  id: string;
  name: string;
  description: string;
  base: string;
  quote: string;
  // exchange: string; exchange is implicitly selected by the exchnage key when user subscribes to a bot
  // symbol: string;
  stratType: string; //LONG or SHORT
  category: string;
  ownerId: string;
  updatedAt: Date;
  creator: string;
  img: string;
  avgtrades: number;
  perfAllmonths: number;
  perfMonth6: number;
  perfMonth3: number;
  perfMonth1: number;
  perfFees: PerfFees;
  allocatedMaxAmount: number;
  allocatedCurrency: string;
  ratings: number;
  reviewerName: string;
  reviewerImg: string;
  reviewerBotRating: number;
  botRef?: string;
  botVer?: string;
  perfSnapshots: PerformanceSnapshotDto;
}
export interface PerformanceSnapshotDto {
  botId: string;
  stratType: string;
  subBotId?: string;
  size: Sizes;
  measuredObject: MeasuredObjects;
  snapshotDate: string;
  allmonths: number;
  month6: number;
  month3: number;
  month1: number;
  fees: number;
  charts: Charts;
}

export interface AlgoBotSubscription {
  id: string;
  botId: string;
  apiKeyRef: string;
  enabled: boolean;
  isOwner: boolean;
  botRunning: boolean;
  stratType: string;
  quantity: number;
  accountPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowBotRequest {
  botId: string;
  apiKeyRef: string;
  // quantity: number;
  //FIXME: only percentage should be sent (quantity is old specs)
  accountPercentage: number;
}

export interface FollowBotResponse {
  botId: string;
  subscriptionId: string;
}

export interface SubscriptionBotPause {
  botId?: string;
  subId: string;
}

export interface BotOrderDetail {
  at: Date;
  status: string;
  exOrderId: string;
  side: string;
  sbl: string;
  exch: string;
  price: string;
  qOrig: string;
  qExec: string;
  qRem: string;
  profit?: number;
  closePrice?: number;
}

export interface BotOrder {
  id: string;
  botId: string;
  userId: string;
  exchKeyId: string;
  botSubId: string;
  ctxBot?: string;
  side: string;
  orderType: string;
  priceAsked: string;
  qtyAsked: string;
  sbl: string;
  exch: string;
  details: BotOrderDetail[];
  created_at: Date;
  updated_at: Date;
  botOrderRef?: string;
  botRef?: string;
}

export interface ChartData {
  tag: string;
  borderColor: string;
  backgroundColor: string;
  data: number[];
  lineTension: number;
  borderWidth: number;
  pointBorderColor: string;
  pointBackgroundColor: string;
  pointBorderWidth: number;
  pointHoverRadius: number;
  pointHoverBackgroundColor: string;
  pointHoverBorderColor: string;
  pointHoverBorderWidth: number;
  pointRadius: number;
  pointHitRadius: number;
}

export interface AlgoBotChart {
  botRef: string;
  chartData: ChartData;
  lineChartLabels: string[];
}

export interface Period {
  year: number;
  month: string;
  week: number;
}

export class UbxtBalance {
  ubxt: number;
  btc: number;
  usd: number;
  eur: number;
}

export enum PerformanceFeeSteps {
  READY = "READY",
  OPENED = "OPENED",
  PERFORMED = "PERFORMED",
}
export class PerformanceFee {
  performedStep?: PerformanceFeeSteps;
  paidAmount?: number;
  remainedAmount?: number;
}

export interface BotSubscriptionCycle {
  openAt: Date;
  closeAt: Date;
  stratType: string;
  result: string;
  subBotId: string;
  cycleSequence: number;
  open: boolean;
  sbl: string;
  exch: string;
  profitPercentage: number;
  entryPrice: number;
  closePrice: number;
  openPeriod: Period;
  closePeriod: Period;
}

export enum Sizes {
  MONTH6 = "MONTH6",
}

export enum MeasuredObjects {
  BOT = "BOT",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export class ChartData {
  labels: string[];
  data: number[];
}

export class Charts {
  monthlyChart: ChartData;
  weeklyChart: ChartData;
  daylyChart: ChartData;
}

export class BotPerformanceSnapshotDto {
  botId: string;
  stratType: string;
  subBotId?: string;
  size: Sizes;
  cyclesData?: BotSubscriptionCycle[];
  measuredObject: MeasuredObjects;
  snapshotDate: string;
  allmonths: number;
  month6: number;
  month3: number;
  month1: number;
  allmonthsUC?: number;
  month6UC?: number;
  month3UC?: number;
  month1UC?: number;
  fees: number;
  charts: Charts;
}

export class BotPerformanceCycleDto {
  openAt: Date;
  botId?: string;
  botVer?: string;
  subBotId?: string;
  measuredObject: MeasuredObjects;
  openPeriod: Period;
  closeAt?: Date;
  closePeriod: Period;
  stratType: string;
  result: string;
  cycleSequence: number;
  open: boolean;
  sbl: string;
  exch: string;
  realisedGain?: UbxtBalance;
  performanceFee?: PerformanceFee;
  profitPercentage?: number;
  entryPrice: number;
  closePrice?: number;
}

export interface DataSet {
  borderColor: string;
  backgroundColor: string;
  data: number[];
}

export interface SubscribedBotChart {
  datasets: DataSet[];
  labels: string[];
}

export interface BotSubscriptionEventPayload {
  exOrderId: string;
  orderTrack: string;
  status: string;
  type: string;
  side: string;
  sbl: string;
  exch: string;
  qOrig: string;
  qExec: string;
  qRem: string;
  qExecCumul: string;
  exDelay: number;
  accountRef: string;
  userId: string;
  source: string;
  pAsk: string;
  pExec: string;
  cumulQuoteCost: string;
  initiator: string;
  // error: string; //do not expose technical error (only error reason)
  errorReason: string;
}
