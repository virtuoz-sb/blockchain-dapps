import { AxiosResponse } from "axios";

export interface NotificationsState {
  pending: boolean;
  error: AxiosResponse;
  isConnected: boolean;
  clientId: string;
  reconnectAttempts: number;
  reconnectFailed: boolean;
  orderEvents: Array<OrderEventPayload>;
  notifications: Notification[];
  unreadnotifications: Notification[];
  // Sawi
  selectedNotifications: string[];
  sortKey: string;
}

export interface Notification {
  id: string;
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
  accountRef: string;
  userId: string;
  pAsk: string;
  pExec: string;
  cumulQuoteCost: string;
  initiator: string;
  errorReason: string;
  isRead: boolean;
  botName: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotifInitiator = "algobot" | "manual-trade-strat";

// this mirrors the same class at the api side
export interface OrderEventPayload {
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
