import { IsMongoId, IsNumber, IsOptional, IsString, IsArray } from "class-validator";

export class WasherBotDto
{
    @IsOptional()
    uniqueNum: number;

    @IsOptional()
    @IsString()
    exchangeType: string;

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
    @IsArray()
    subWallets: string[];

    @IsOptional()
    @IsNumber()
    depositMainCoin: number;

    @IsOptional()
    @IsNumber()
    depositBaseCoin: number;

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
    @IsString()
    start: string;

    @IsOptional()
    @IsString()
    end: string;

    @IsOptional()
    @IsNumber()
    targetVolume: number;

    @IsOptional()
    @IsNumber()
    cntWallet: number;

    @IsOptional()
    @IsNumber()
    slippageLimit: number;

    @IsOptional()
    @IsNumber()
    minTradingAmount: number;

    @IsOptional()
    @IsNumber()
    dailyLossLimit: number;

    @IsOptional()
    @IsString()
    coinmarketcapId: string;
}