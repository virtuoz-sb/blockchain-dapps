import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,

  STATUS_READY,
  STATUS_PROCESSING,
  STATUS_SUCCESS,
  STATUS_ERROR,
  STATUS_STOPPED,

  STATUS_LOADING,
  STATUS_LOADED,

  STATUS_CONNECTING,
  STATUS_NOT_CONNECTED,
  STATUS_CONNECTED,
  STATUS_WAITING,
} from "./consts";

export type GetterKey<T> = keyof T;
export type Serializer<T> = (data: any) => Partial<T>;
export type ValueOf<T> = T[keyof T];
export type AnyObject = { [key: string]: any };

export type StatusResult = typeof STATUS_SUCCESS | typeof STATUS_ERROR;
export type LoadingStatus = typeof STATUS_LOADING | typeof STATUS_LOADED;
export type ActivityStatus = typeof STATUS_ACTIVE | typeof STATUS_INACTIVE;

export type WalletStatus =
  | typeof STATUS_LOADING
  | typeof STATUS_CONNECTED
  | typeof STATUS_NOT_CONNECTED
  | typeof STATUS_CONNECTING;

export type TransactionStatus =
  | typeof STATUS_READY
  | typeof STATUS_PROCESSING
  | typeof STATUS_ERROR
  | typeof STATUS_SUCCESS
  | typeof STATUS_STOPPED;


export interface Response {
  status: StatusResult;
  data: any;
}

export type Stored<T> = T & {
  _id: string;
};