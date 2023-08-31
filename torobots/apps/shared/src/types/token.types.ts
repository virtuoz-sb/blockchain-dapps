import { Stored, IStoredBlockchain, IStoredWallet, IStoredNode } from "."

export interface IToken {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: number;
  blockchain?: string | IStoredBlockchain;
  wallet?: string | IStoredWallet;
  createdAt?: Date;
  balance?: number;
  created?: Date;
  updated?: Date;
}
export type IStoredToken = Stored<IToken>

export interface ITokenCreateRequest {
  blockchain: string | IStoredBlockchain;
  node: string | IStoredNode;
  wallet: string | IStoredWallet;
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: number;
}

export type TokenCreatorActionType = '' | 'Token Creating' | 'Minting' | 'Burning' | 'Adding LP' | 'Removing LP';
export type TokenCreatorActionResult = '' | 'Success' | 'Failed';

export interface ITokenCreatorState {
  action: TokenCreatorActionType,
  result: TokenCreatorActionResult
}

export interface ITokenCreator extends ITokenCreateRequest {
  uniqueNum?: number;
  token?: string | IStoredToken;
  totalSupply: number;
  state: ITokenCreatorState;
  created: Date;
  updated: Date;
}
export type IStoredTokenCreator = Stored<ITokenCreator>

export interface TokenCreatorFilter {
  page?: number;
  pageLength?: number;
}
