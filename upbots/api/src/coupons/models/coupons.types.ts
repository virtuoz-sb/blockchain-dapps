import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, Min } from "class-validator";
import { Document } from "mongoose";

export enum CouponTypes {
  UNIQUE = "unique",
  GLOBAL = "global",
}

export interface Coupons extends Document {
  code: string;
  promoName: string;
  description: string;
  couponType: CouponTypes;
  activated: boolean;
  activationDate: Date;
  validFrom?: Date;
  validTo?: Date;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetCoupons {
  code: string;
  promoName: string;
  description: string;
  couponType: CouponTypes;
  activationDate: Date;
  activated: boolean;
  validFrom?: Date;
  validTo?: Date;
  user: string;
}

export class CouponsCreationDto {
  @ApiProperty()
  promoName: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: CouponTypes })
  couponType: CouponTypes;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1577836800000, { message: "[validTo] min value should be a Unix timestamps milliseconds (in 2020 at least)" })
  validFrom?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1577836800000, { message: "[validTo] min value should be a Unix timestamps milliseconds (in 2020 at least)" })
  validTo?: number;
}
