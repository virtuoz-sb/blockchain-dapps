import { ErrorResponse } from "../error-response";

export interface ExchangeKeysState {
  // error: boolean;
  loading: boolean;
  error: ErrorResponse | null;
  keys: Array<ExchangeKey>;
  exchanges: any[];
}

export interface ExchangeKey {
  id: string;
  name: string;
  exchange: string;
  publicKey: string;
  created: Date;
  // updated: Date;
}

export interface AddExchangeKeyRequestPayload {
  name: string;
  exchange: string;
  publicKey: string;
  secretKey: string;
  password?: string;
  subAccountName?: string;
}

export interface EditExchangeKeyRequestPayload {
  id: string;
  name: string; // can only edit key name
}
