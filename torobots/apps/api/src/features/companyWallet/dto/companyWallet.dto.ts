import { IsString, IsOptional } from 'class-validator';

export class CompanyWalletDto {
  @IsOptional()
  @IsString()
  privateKey: string;

  @IsString()
  publicKey: string;
}
