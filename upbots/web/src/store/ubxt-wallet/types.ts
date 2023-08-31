import { ErrorResponse } from "../error-response";
export interface UBXTWalletState {
  loading: boolean;
  error: ErrorResponse | null;
  wallets: UbxtWallets;
}

export interface UbxtWallets {
  bsc: BSC;
  eth: ETH;
}

export interface BSC {
  token: Token;
  wallet: Wallet;
}

export interface Token {
  balance: 0;
  rawBalance: "0";
  tokenAddress: string;
}

type Chain = "ETHEREUM" | "BSC";

type Balance = {
  available: boolean;
  secretType: string;
  balance: number;
  gasBalance: number;
  rawBalance: string;
  rawGasBalance: string;
  decimals: number;
};

export interface Wallet {
  id: string;
  address: string;
  createdAt: Array<number>[6];
  archived: boolean;
  primary: boolean;
  hasCustomPin: boolean;
  alias: string;
  balance: Balance;
  secretType: Chain;
  walletType: "WHITE_LABEL";
  decription: string;
}

export interface ETH {
  token: Token;
  wallet: Wallet;
}
