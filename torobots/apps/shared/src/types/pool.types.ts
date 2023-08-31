import { Stored, IStoredBlockchain, IStoredDex, IToken, IStoredAutoBot } from "."

export interface IPool {
  uniqueNum?: number;
  size?: number;
  amount1: number;
  amount2: number;
  blockchain?: string | IStoredBlockchain;
  dex: string | IStoredDex;
  token1: IToken;
  token2: IToken;
  pairAddress: string;
  blockNumber?: number;
  count?: number;
  transactionHash?: string;
  createdTime?: Date;
  autoBot?: string | IStoredAutoBot;
  created?: Date;
  updated?: Date;
}

export type IStoredPool = Stored<IPool>

export interface PoolFilter {
  isRunning?: boolean;
  size?: number;
  page?: number;
  pageLength?: number;
  sort: {
    field: string;
    order: number;
  };
  chain?: string;
  dex?: string;
  token?: string;
  startDate?: string;
  endDate?: string;
}
