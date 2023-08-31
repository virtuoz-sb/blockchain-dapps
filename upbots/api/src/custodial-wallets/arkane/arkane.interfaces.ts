/* eslint-disable max-classes-per-file */

import * as BN from "bn.js";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export interface GetBearerTokenDto {
  grant_type: "client_credentials";

  client_id: string;

  client_secret: string;
}

export interface BearerTokenResponse {
  access_token: string;

  expires_in: number;
}

export type Balance<T> = {
  available: boolean;

  secretType: T;

  balance: number;

  gasBalance: number;

  rawBalance: string;

  rawGasBalance: string;

  decimals: number;
};

export type Chain = "ETHEREUM" | "BSC";

export interface Wallet<T> {
  id: string;

  address: string;

  createdAt: Array<number>[6];

  archived: boolean;

  primary: boolean;

  hasCustomPin: boolean;

  alias: string;

  balance: Balance<T>;

  secretType: Chain;

  walletType: "WHITE_LABEL";

  decription: string;
}

export type ArkaneWallet = Wallet<Chain>;

export class WalletDto implements Partial<Wallet<Chain>> {
  @ApiProperty()
  identifier: string;

  @ApiProperty()
  secretType: Chain;

  @ApiProperty()
  pincode: string;

  @ApiProperty()
  walletType: "WHITE_LABEL";

  @ApiProperty()
  @IsOptional()
  decription?: string;

  @ApiProperty()
  @IsOptional()
  alias?: string;
}

export type WalletsResponse = [Wallet<"ETHEREUM"> | null, Wallet<"BSC"> | null];

export interface ErcToken {
  logo?: string;

  type?: string;

  symbol?: string;

  balance: number;

  decimals?: number;

  rawBalance: string;

  tokenAddress: string;

  transferable?: boolean;
}

export type UbxtInfo<T> = {
  token: ErcToken;

  wallet: Wallet<T>;
};

export type UbxtPairResponse = [UbxtInfo<"ETHEREUM">, UbxtInfo<"BSC">];

export type Network = {
  name: string;

  nodeUrl: string;

  chainId: number | null;
};

export interface CallInput {
  type: string;

  value: string;
}

export type TransactionType = "TRANSFER" | "GAS_TRANSFER" | "TOKEN_TRANSFER" | "NFT_TRANSFER" | "CONTRACT_EXECUTION";

export interface TransactionRequest {
  to: string;

  type: TransactionType;

  walletId: string;

  secretType: Chain;

  value?: string | number;

  network?: Network;

  functionName?: string;

  tokenAddress?: string;

  inputs?: Array<CallInput>;
}

export type TransactionStatus = "UNKNOWN" | "PENDING" | "FAILED" | "SUCCEEDED";

export interface TransactionResponse {
  transactionHash: string;
}

export interface ActionParams {
  action?: string;

  to?: string;

  ubx: UbxtInfo<Chain>;

  pincode: string;

  amount: string;

  nonce?: string;

  signature?: string;
}

export interface GasReserveConfig {
  pincode: string;

  chain: Record<Chain, { walletId: string; gasPrice: string; txEta?: number; multiplier: number }>;
}

type Fee = { native: BN; ubxt: BN; gasPrice: BN };

export interface GasFees {
  eth: Fee;

  bsc: Fee;

  totalUbxt: BN;
}
