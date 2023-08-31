import { Stored } from "."

export interface IBlockchain {
  name: string;
  chainId: number;
  coinSymbol: string;
  coinmarketcapNetworkId?: string;
  node: string | INode;
  explorer?: string;
  amountForFee?: number;
  gasPrice?: number;
  gasPriceLimit?: number;
  created?: Date;
  updated?: Date;
}
export type IStoredBlockchain = Stored<IBlockchain>

export interface INode {
  name: string;
  blockchain: string | IStoredBlockchain;
  wsProviderURL: string;
  rpcProviderURL: string;
  ipAddress: string;
  checkUrl: string;
  created?: Date;
  updated?: Date;
}
export type IStoredNode = Stored<INode>

export enum EDexType {
  UNISWAP = "UNISWAP",
}

export interface IDex {
  name: string;
  type: EDexType;
  blockchain: string | IStoredBlockchain;
  factoryAddress: string;
  routerAddress: string;
  created?: Date;
  updated?: Date;
}
export type IStoredDex = Stored<IDex>

export interface ICoin {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: number;
  blockchain?: string | IStoredBlockchain;
  createdAt?: Date;
  balance?: number;
  price?: number;
  created?: Date;
  updated?: Date;
}
export type IStoredCoin = Stored<ICoin>