import { IsMongoId, IsString, IsOptional } from "class-validator";

export class VolumeBotDto
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
    @IsString()
    coin: string;

    @IsOptional()
    @IsString()
    token: string;

    @IsOptional()
    @IsString()
    walletAddress: string;

    @IsOptional()
    @IsString()
    walletKey: string;
    
}