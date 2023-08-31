import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { IToken } from "@torobot/shared";

export class TokenDto implements IToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: number;
  createdAt?: Date;
  blockchain?: string;
}

export class NetCoinDto {
  symbol: string;
  balance: number;
}
export class TokenLiquidityDto {
  address: string;
  wCoinBalance: number;
  tokenBalance: number;
}
export class TokenDetailDto {
  netCoin?: NetCoinDto;
  coin?: IToken;
  token?: IToken;
  liquidity?: TokenLiquidityDto;
}

export class TokenDetailReqDto {
  blockchainId: string;
  nodeId?: string;
  dexId?: string;
  walletId?: string;
  netCoin?: boolean;
  coinAddress?: string;
  tokenAddress?: string;
}
