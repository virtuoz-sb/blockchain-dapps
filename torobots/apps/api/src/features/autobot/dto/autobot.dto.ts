import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class AutoBotDto 
{
  @IsOptional()
  uniqueNum: number;

  @IsOptional()
  @IsMongoId()
  blockchain: string;

  @IsOptional()
  @IsMongoId()
  dex: string;

  @IsOptional()
  @IsMongoId()
  node: string;

  @IsOptional()
  @IsMongoId()
  mainWallet: string;

  @IsOptional()
  @IsMongoId()
  pool: string;

  @IsOptional()
  @IsString()
  coin: string;

  @IsOptional()
  @IsString()
  tokenAddress: string;

  @IsOptional()
  @IsString()
  walletAddress: string;

  @IsOptional()
  @IsString()
  walletKey: string;

  @IsOptional()
  buyAmount: number;
}
