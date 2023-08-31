/* eslint-disable max-classes-per-file */
import { Document } from "mongoose";
import { IsString, IsMongoId, IsObject, IsBoolean } from "class-validator";

export class LoginTrackingDto extends Document {
  @IsString()
  @IsMongoId()
  _id: string;

  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  firstname: string;

  @IsString()
  login: Date;

  @IsString()
  pending: string;

  @IsBoolean()
  success: boolean;

  @IsObject()
  userAccess: Record<string, any>;
}

export class LoginTrackingPublicDto {
  @IsString()
  email: string;

  @IsString()
  firstname: string;

  @IsString()
  login: Date;

  @IsBoolean()
  success: boolean;

  @IsObject()
  userAccess: Record<string, any>;
}
