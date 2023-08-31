import { IsNotEmpty, IsMongoId, IsNumber, IsString, IsObject, IsBoolean, IsOptional } from 'class-validator';
import { IBotBuy, IBotSell, EBotType, IBotConfig } from '@torobot/shared';

export class BotDto 
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
  wallet: string;

  @IsOptional()
  @IsMongoId()
  coin: string;

  @IsOptional()
  @IsString()
  tokenAddress: string;

  @IsOptional()
  @IsString()
  type: EBotType;

  @IsOptional()
  @IsObject()
  buy: IBotBuy;

  @IsOptional()
  @IsObject()
  sell: IBotSell;

  @IsOptional()
  @IsObject()
  config: IBotConfig;
}
