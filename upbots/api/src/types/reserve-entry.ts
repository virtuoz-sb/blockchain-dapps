/* eslint-disable max-classes-per-file */
import { Document, Types as DbTypes } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength, IsOptional, IsArray, IsObject } from "class-validator";

/**
 * Reserve Entry mongoose Model Document object.
 * @see: src/models/reserve_entry.schema.ts
 * DO NOT EXPOSE this model publicly TO THE WEB
 */
export interface ReserveEntry extends Document {
  fund: DbTypes.ObjectId;
  amount: DbTypes.Decimal128;
  performanceCycle: DbTypes.ObjectId;
  description: string;
  userRelease: boolean;
  adminRelease: boolean;
}
