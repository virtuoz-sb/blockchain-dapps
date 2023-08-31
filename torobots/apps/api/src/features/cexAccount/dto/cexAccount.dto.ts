import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CexAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  cex: string;

  @IsOptional()
  @IsString()
  apiKey: string;

  @IsOptional()
  @IsString()
  apiSecret: string;

  @IsOptional()
  @IsString()
  apiPassword: string;

  @IsArray()
  users: string[];
}
