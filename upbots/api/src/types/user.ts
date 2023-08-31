/* eslint-disable max-classes-per-file */
import { Document, Types as DbTypes } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength, IsOptional, IsArray, IsObject } from "class-validator";

export enum Roles {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  SUPPORT = "SUPPORT",
  MTRADE = "MTRADE",
  DEVELOPER = "DEVELOPER",
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
}

/**
 * User mongoose Model Document object.
 * @see: src/models/user.schema.ts
 * DO NOT EXPOSE this model publicly TO THE WEB
 */
export interface User extends Document {
  // username: string;
  email: string;
  firstname: string;
  lastname: string;
  telegram: string;
  tgChatId: string;
  tgChatIdDraft: string;
  tgConfirmCode: string;
  phone: string;
  roles: Roles[];
  picture: {
    mimetype: string;
    data: string;
  };
  homeAddress: string;
  country: string;
  city: string;
  aboutMe: string;
  password: string;
  passwordModified: Date;
  passwordModifiedCount: number;
  // seller: boolean;
  // address: Address;
  created: Date;
  /**
   * 2FA has been asked (temporary) set when this field is set and twoFactorSecret not set yet.
   */
  twoFactorTempSecret: string;
  /**
   * 2FA activated when this field is set.
   */
  twoFactorSecret: string;
  /**
   * this user requires 2FA for login (default to false).
   */
  totpRequired: boolean;
  /**
   * reset 2fa code
   */
  reset2faCode: string;
  is2faDisabled: boolean;
  verification: {
    code: string;
    codeExpiration: Date;
    emailVerified: boolean;
  };
  passwordReset: {
    code: string;
    codeExpiration: Date;
  };
  custodialWallets: {
    identifier: string;
    pincode: string;
    ubxtDeposit: string;
    ubxtDebt: string;
    withdrawExpiry: Date;
    ethAddress: string;
    bscAddress: string;
  };

  // ubxt staking amount
  ubxtStakingAmount: number;
  botsAccess: boolean;

  // auth provider, local strategy by default
  authProvider: AuthProvider;
}

/**
 * Publicly exposed user properties
 */
export class UserDto {
  _id: string;

  email: string;

  firstname: string;

  lastname: string;

  telegram: string;

  tgChatId: string;

  tgChatIdDraft: string;

  tgConfirmCode: string;

  phone: string;

  homeAddress: string;

  country: string;

  city: string;

  aboutMe: string;

  roles: Roles[];

  picture: {
    mimetype: string;
    data: string;
  };

  created: Date;

  emailVerified: boolean;

  /**
   * 2FA enabled for the user
   */
  totpRequired: boolean;

  reset2faCode?: string;

  is2faDisabled?: boolean;

  custodialWallets: {
    identifier: string;
    ubxtDeposit: string;
    ubxtDebt: string;
    withdrawExpiry: Date;
    ethAddress: string;
    bscAddress: string;
  };

  authProvider: AuthProvider;
}
export class UserForUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  password: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(64)
  firstname: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(64)
  lastname: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(6)
  @MaxLength(64)
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  roles: Roles[];

  @ApiProperty()
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  telegram: string;

  @ApiProperty()
  @IsOptional()
  tgChatId: string;

  @ApiProperty()
  @IsOptional()
  tgChatIdDraft: string;

  @ApiProperty()
  @IsOptional()
  tgConfirmCode: string;

  @ApiProperty()
  @IsOptional()
  homeAddress: string;

  @ApiProperty()
  @IsOptional()
  country: string;

  @ApiProperty()
  @IsOptional()
  city: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(1024)
  aboutMe: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  custodialWallets: {
    identifier?: string;
    pincode?: string;
    ubxtDeposit?: string;
    ubxtDebt?: string;
    withdrawExpiry?: Date;
    ethAddress?: string;
    bscAddress?: string;
  };
}

export class UserIdentity extends UserDto {
  id: string;

  idFromDb: DbTypes.ObjectId;
}

export class DepositAddressDto {
  @ApiProperty()
  eth: string;

  @ApiProperty()
  bsc: string;
}
