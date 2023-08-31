import {
  Stored, 
  IStoredUser, 
  IStoredWallet, 
  IStoredBlockchain, 
  IStoredNode, 
  IStoredDex, 
  IStoredBot, 
  IStoredCoin, 
  IStoredToken, 
  ETradingInitiator, 
  ETradingThread, 
  TransactionStatus, 
  IStoredLiquidatorBot, 
  EExchangeType,
  IStoredTokenCreator
} from "."

export interface ITransaction {
  user: string | IStoredUser;
  wallet: string | IStoredWallet;
  blockchain: string | IStoredBlockchain;
  node?: string | IStoredNode;
  dex?: string | IStoredDex;
  bot?: string | IStoredBot;
  coin?: string | IStoredCoin;
  token?: string | IStoredToken;
  initiator: ETradingInitiator;
  thread: ETradingThread;
  result: TransactionStatus;
  tryCount?: number;
  txHash?: string;
  gasFee?: number;
  coinAmount?: number;
  tokenAmount?: number;
  message?: string;
  created?: Date;
}
export type IStoredTransaction = Stored<ITransaction>

export interface ILiquidatorTransaction {
  uniqueNum?: number;
  token: string | IStoredToken;
  isDex: boolean;
  txHash: string;
  tokenAmount: number;
  fee: number;
  price: number;
  liquidator: string;
  currentPrice: number;
  soldPrice: number;
  created?: Date;
}
export type IStoredLiquidatorTransaction = Stored<ILiquidatorTransaction>

export interface IWasherTransaction {
  token: string | IStoredToken;
  washer: string;
  uniqueNum?: number;
  exchangeType: EExchangeType;
  txBuyHash: string;
  txSellHash: string;
  tokenAmount: number;
  fee: number;
  volume: number;
  loss: number;
  targetVolume: number;
  date: string;
  timeStamp: number;
  created: Date;
}
export type IStoredWasherTransaction = Stored<IWasherTransaction>

export interface ITokenMintBurnTransaction {
  tokenCreator: string | IStoredTokenCreator;
  date: Date;
  type: "MINT" | "BURN";
  amount: number;
  txHash: string;
  created: Date;
}
export type IStoredTokenMintBurnTransaction = Stored<ITokenMintBurnTransaction>

export interface ILiquidityPoolTransaction {
  tokenCreator: string | IStoredTokenCreator;
  date: Date;
  type: "ADD_LP" | "REMOVE_LP";
  dex: string | IStoredDex;
  baseCoin: {
    symbol: string;
    amount: string;
  },
  token: {
    symbol: string;
    amount: string;
  },
  txHash: string;
  created: Date;
}
export type IStoredLiquidityPoolTransaction = Stored<ILiquidityPoolTransaction>
