import { IsNumber, IsNotEmpty, IsString, IsEthereumAddress, IsOptional } from 'class-validator';

export class BlockchainDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  chainId: number;

  @IsNotEmpty()
  @IsString()
  coinSymbol: string;

  @IsOptional()
  @IsNumber()
  gasPrice: number;

  @IsOptional()
  @IsNumber()
  gasPriceLimit: number;
}
