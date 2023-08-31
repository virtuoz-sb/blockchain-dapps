import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class TransactionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  privateKey: string;

  @IsString()
  publicKey: string;

  @IsArray()
  users: string[];
}