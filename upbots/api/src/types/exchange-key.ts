/* eslint-disable max-classes-per-file */
import { Document } from "mongoose";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Represents an exchange API key.
 * A user may have several exchange keys.
 * @see '../models/exchange-key.schema.ts'
 */
export interface ExchangeKey extends Document {
  userId: string;
  name: string;
  exchange: string;
  type: string;
  quoteCurrency: string;
  publicKey: string;
  secretKey: string;
  password?: string;
  subAccountName?: string;
  valid: boolean;
  lastHealthCheck: Date;
  error: string;
  created: Date;
  updated: Date;
}

export interface ExchangeKeyValidityStatus {
  valid: boolean;
  error: string;
}

export class ExchangeKeyCreationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  exchange: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  publicKey: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  secretKey: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  password: string; // PASSPHRASE (optional)

  @IsString()
  @IsOptional()
  @ApiProperty()
  subAccountName: string; // FTX subAccount
}

// tslint:disable-next-line:max-classes-per-file
export class ExchangeKeyEditDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}

export class ExchangeKeyValidityCheckDto {
  @ApiProperty()
  id: string;
}

/**
 * Publicly exposed structure.
 */
// tslint:disable-next-line:max-classes-per-file
export class ExchangeKeyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  exchange: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  quoteCurrency: string;

  @ApiProperty()
  publicKey: string;

  @ApiProperty()
  valid: boolean;

  @ApiProperty()
  lastHealthCheck: Date;

  // secretKey: string;
  @ApiProperty()
  created: Date;

  @ApiProperty()
  updated: Date;
}
