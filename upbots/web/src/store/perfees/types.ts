import { ErrorResponse } from "../error-response";
export const PERFEES_EVENT_ACTION = "socket_wsPerfeesEvent";
export interface PerfeesState {
  loading: boolean;
  error: ErrorResponse | null;
  userWallet: UserWallet;
  botWallets: BotWallet[];
  userTransactions: UserTransaction[];
  estimatedAnnualPerfees: number;
}

export enum WalletStatuses {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
  LOCKED = "LOCKED",
}

export enum TransferType {
  SET = "SET",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
}

export enum TransactionTypes {
  TRANSFER = "TRANSFER",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  PERFORMANCE_FEE = "PERFORMANCE_FEE",
}

export enum TransactionStatuses {
  PENDING = "PENDING",
  TRANSFERRING = "TRANSFERRING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CONFIRMED = "CONFIRMED",
}

export enum DistributorType {
  DEVELOPER = "DEVELOPER",
  BURN = "BURN",
  POOL = "POOL",
  RESERVE = "RESERVE",
  GROUP = "GROUP",
}
export interface UserWallet {
  userId: string;
  amount: number;
  allocatedAmount: number;
  availableAmount: number;
  depositAddressETH: string;
  depositAddressBSC: string;
  createdAt: Date;
}

export interface BotWallet {
  userId: string;
  botId: string;
  botSubId: string;
  amount: number;
  allocatedAmount: number;
  creditAmount: number;
  debtAmount: number;
  paidAmount: number;
  status: WalletStatuses;
  autoRefill: boolean;
}
export interface UserTransaction {
  userId: string;
  botId?: string;
  botName?: string;
  type: TransactionTypes;
  subType?: string;
  status: TransactionStatuses;
  address?: string;
  amount: number;
  hash: string;
  group?: FeeRecipients;
  confirmations: number;
  confirmPercent: number;
  explorer: string;
  error: string;
  createdAt: Date;
  extra?: any;
  details?: any[];
}

export interface FeeRecipient {
  address?: string;
  amount?: number;
  hash?: string;
}

export interface FeeRecipients {
  developer?: FeeRecipient;
  reserve?: FeeRecipient;
  pool?: FeeRecipient;
  burn?: FeeRecipient;
}
