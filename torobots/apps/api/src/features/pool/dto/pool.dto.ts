import { IPool, IToken } from "@torobot/shared";

export class PoolDto implements IPool {
  amount1: number;
  amount2: number;
  blockchain:  string;
  dex: string;
  token1: IToken;
  token2: IToken;
  pairAddress: string;
  blockNumber?: number;
  count?: number;
  transactionHash?: string;
  createdTime?: Date;
}
