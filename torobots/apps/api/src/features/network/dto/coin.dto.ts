import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ICoin } from "@torobot/shared";

export class CoinDto implements ICoin {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: number;
  createdAt?: Date;
  blockchain?: string;
}