import { 
  Stored, IStoredUser, IStoredBlockchain, IStoredDex, IStoredNode, IStoredWallet, IStoredToken, IStoredCoin, 
  ERunningStatus, ETradingThread, ETradingInitiator, IStoredCexAccount, IStoredCompanyWallet, ECEXType } from "."

export enum EBotType {
  NONE = "NONE",
  BUY = "BUY",
  SELL = "SELL",
  BUY_SELL = "BUY_SELL",

  DEX_LIQUIDATOR = "DEX_LIQUIDATOR",
  CEX_LIQUIDATOR = "CEX_LIQUIDATOR",
  DEX_WASHER = "DEX_WASHER",
  CEX_WASHER = "CEX_WASHER",
}

export enum EBotBuyType {
  ONCE = "ONCE",
  SPAM = "SPAM",
  EVENT = "EVENT"
}

export enum EBotSellType {
  ONCE = "ONCE",
  SPAM = "SPAM",
  TIMER = "TIMER"
}

export interface IBotBuy {
  active: boolean;
  type: EBotBuyType;
  amount: number;
  slippage: number;
  estTime: Date;
  startTime: Date;
  period: number;
  gasPrice: number;
}

export interface IBotSellItem {
  amount: number;
  deltaTime: number;
}
export interface IBotSell {
  active: boolean;
  type: EBotSellType;
  amount?: string;
  count: number;
  step: number;
  items: IBotSellItem[];
  interval: number;
  gasPrice: number;
}

export interface IBotConfig {
  stopLimit: number;
  stopLoss: boolean;
  saveLimit: number;
  savings: boolean;
  rugpool: boolean;
  antiSell: boolean;
  buyLimitDetected: boolean;
  sellLimitDetected: boolean;
  autoBuyAmount: boolean;
  buyAnyCost: boolean;
}

export interface IBotState {
  active?: boolean;
  status?: ERunningStatus;
  thread?: ETradingThread;
  result?: string;
  extends?: {
    stopLoss?: IBotState;
    instant?: IBotState;
  }
}

export interface IBotStatisticsItem {
  coinAmount: number;
  tokenAmount: number;
  fee: number;
}
export interface IBotStatistics {
  buy?: IBotStatisticsItem;
  sell?: IBotStatisticsItem;
}

export interface IBotRugpool {
  lastBlock: number;
  firstMintedCoin: number;
  firstMintedToken: number;
  maxAccumulatedCoin: number;
  maxAccumulatedToken: number;
  currentAccumulatedCoin: number;
  currentAccumulatedToken: number;
}
export interface IBot {
  uniqueNum?: number;
  wallet: string | IStoredWallet;
  blockchain: string | IStoredBlockchain;
  dex: string | IStoredDex;
  node: string | IStoredNode;
  coin: string | IStoredCoin;
  token: string | IStoredToken;
  initiator?: ETradingInitiator;
  type?: EBotType;
  buy?: IBotBuy;
  sell?: IBotSell;
  config?: IBotConfig;
  statistics?: IBotStatistics;
  rugpool?: IBotRugpool;
  state: IBotState;  
  owner: string | IStoredUser;
  created?: Date;
  updated?: Date;  
}
export type IStoredBot = Stored<IBot>

export interface BotFilter {
  initiator?: ETradingInitiator;
  page?: number;
  pageLength?: number;
  state?: ERunningStatus;
  chain?: string;
  tokenAddress?: string;
  uniqueNum?: number;
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
export class BotTradingDto {
  botId: string;
  active: boolean;
  type?: EBotType;
  cex?: ECEXType;
  thread?: ETradingThread;
  data?: IBotBuy | IBotSell;
}

export class AutoBotTradingDto {
  botId: string;
}

export interface IAutoBotState {
  active: boolean;
  status: ERunningStatus;
  thread?: string;
}

export interface IAutoBot {
  uniqueNum?: number;
  blockchain: string | IStoredBlockchain;
  dex: string | IStoredDex;
  node: string | IStoredNode;
  mainWallet: string | IStoredWallet;
  coin: string | IStoredCoin;
  token: string | IStoredToken;
  initiator?: ETradingInitiator;
  buyAmount: number;
  walletAddress: string;
  walletKey: string;
  statistics?: IBotStatistics;
  state: IAutoBotState;
  step: ETradingThread;
  owner: string | IStoredUser;
  created?: Date;
  updated?: Date;  
}

export type IStoredAutoBot = Stored<IAutoBot>

export interface IAddLiquiditySchedule {
  time: Date;
  baseCoin?: number;
  tokenAmount?: number;
  tokenPrice?: number;
  txHash?: string;
  status: string;
}

export interface ISellingSchedule {
  time: Date;
  tokenAmount: number;
  earnedCoin?: number;
  tokenPrice?: number;
  txHash?: string;
  status: string;
}

export interface ICEXSellingSchedule {
  time: Date;
  tokenAmount: number;
  sellId?: string;
  subtotal?: string;
  total?: string;
  fee?: string;
  status: string;
}

export enum EVolumeBotStatus {
  NONE = "-",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export interface VolumeBotFilter {
  page?: number;
  pageLength?: number;
}

export interface IVolumeBot {
  uniqueNum?: number;
  blockchain: string | IStoredBlockchain;
  dex: string | IStoredDex;
  node: string | IStoredNode;
  mainWallet: string | IStoredWallet;
  coin: string | IStoredCoin;
  token: string | IStoredToken;
  walletAddress: string;
  walletKey: string;
  addLiquiditySchedule?: IAddLiquiditySchedule[];
  sellingSchedule?: ISellingSchedule[];
  owner: string | IStoredUser;
  state: EVolumeBotStatus;
  stateNum: number;
  created?: Date;
  updated?: Date;
}

export type IStoredVolumeBot = Stored<IVolumeBot>

export enum ELiquidatorBotStatus {
  NONE = "-",
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  SUCCESS = "SUCCESS"
}

export enum ELiquidatorBotType {
  DEX = "DEX",
  CEX = "CEX",
}

export interface LiquidatorFilter {
  type: string;
  chain: string;
  tokenAddress: string;
  page?: number;
  pageLength?: number;
}

export enum SellingStrategy {
  CONST = "CONST",
  LINEAR = "LINEAR",
  QUADRATIC = "QUADRATIC"
}

export interface ILiquidatorBot {
  uniqueNum?: number;
  blockchain: string | IStoredBlockchain;
  node: string | IStoredNode;
  type: ELiquidatorBotType;

  dex?: string | IStoredDex;
  wallet?: string | IStoredWallet;
  coin?: string | IStoredCoin;

  cexAccount?: string | IStoredCexAccount;
  accountId?: string;
  cex?: string;
  orderType?: string,
  timeInterval?: number,
  rate?: number,

  tokenAmount?: number;
  tokenSold: number;
  tokenUsdSold: number;
  token: string | IStoredToken;
  lowerPrice: number;
  presetAmount?: number;
  bigSellPercentage?: number;
  smallSellPercentage?: number;
  owner: string | IStoredUser;
  state: ELiquidatorBotStatus;
  stateNum: number;
  created?: Date;
  updated?: Date;
}

export type IStoredLiquidatorBot = Stored<ILiquidatorBot>

export interface ILiquidatorDailyOrder {
  liquidator: string | IStoredLiquidatorBot;
  buy: number;
  sell: number;
  date: string;
  created?: Date;
}

export type IStoredLiquidatorDailyOrder = Stored<ILiquidatorDailyOrder>

// Washer Bot
export enum EExchangeType {
  DEX = "DEX",
  CEX = "CEX",
}

export enum EWasherBotStatus {
  DRAFT = "-",
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  WAITING = "WAITING"
};

export enum EWasherBotActionResult {
  DRAFT = "-",
  MIN_NATIVECOIN_LIMIT = "MIN_NATIVECOIN_LIMIT",
  MIN_BASECOIN_LIMIT = "MIN_BASECOIN_LIMIT",
  MAX_SLIPPAGE_LIMIT = "MAX_SLIPPAGE_LIMIT",
  DAILY_LOSS_LIMIT = "DAILY_LOSS_LIMIT",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  API_ERROR = "API_ERROR",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  UNKNOWN = "UNKNOWN"
};

export interface IWasherBotState {
  status: EWasherBotStatus,
  result: EWasherBotActionResult,
  message?: string;
}

export interface IWasherBot {
  uniqueNum?: number;
  blockchain: string | IStoredBlockchain;
  node: string | IStoredNode;
  exchangeType: EExchangeType;

  dex?: string | IStoredDex;
  wallet?: string | IStoredWallet;
  subWallets?: string[] | IStoredCompanyWallet[];
  coin?: string | IStoredCoin;

  coinmarketcapId?: string;
  
  depositMainCoin?: number;
  depositBaseCoin?: number;
  slippageLimit?: number;

  cexAccount?: string | IStoredCexAccount;
  accountId?: string;
  cex?: ECEXType;

  minTradingAmount: number;
  dailyLossLimit: number;
  token: string | IStoredToken;
  start: string;
  end: string;
  targetVolume: number;
  cntWallet: number;
  owner: string | IStoredUser;
  state: IWasherBotState;
  stateNum: number;
  isProcessing: boolean;
  isReady: boolean;
  created?: Date;
  updated?: Date;
}

export type IStoredWasherBot = Stored<IWasherBot>

export interface WasherFilter {
  exchangeType: string;
  chain: string;
  tokenAddress: string;
  page?: number;
  pageLength?: number;
}
