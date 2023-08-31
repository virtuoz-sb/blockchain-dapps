import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class WalletDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  privateKey: string;

  @IsString()
  publicKey: string;

  @IsArray()
  users: string[];
}

export class GetBalanceByCoinDto {
  @IsString()
  blockchain: string;

  @IsString()
  walletAddress: string;

  @IsString()
  coinAddress: string;
}
