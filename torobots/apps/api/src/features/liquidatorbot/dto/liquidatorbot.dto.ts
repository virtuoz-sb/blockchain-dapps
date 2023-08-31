import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class LiquidatorBotDto
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
    @IsString()
    coin: string;

    @IsOptional()
    @IsString()
    token: string;

    @IsOptional()
    @IsMongoId()
    wallet: string;

    @IsOptional()
    @IsString()
    cexAccount: string;

    @IsOptional()
    @IsString()
    accountId: string;

    @IsOptional()
    @IsString()
    cex: string;

    @IsOptional()
    @IsNumber()
    tokenAmount: number;

    @IsOptional()
    @IsNumber()
    tokenSold: number;

    @IsOptional()
    @IsNumber()
    timeInterval: number;

    @IsOptional()
    @IsString()
    orderType: string;
    
    @IsOptional()
    @IsNumber()
    rate: number;

    @IsOptional()
    @IsNumber()
    lowerPrice: number;

    @IsOptional()
    @IsNumber()
    presetAmount: number;

    @IsOptional()
    @IsNumber()
    bigSellPercentage: number;

    @IsOptional()
    @IsNumber()
    smallSellPercentage: number;
}