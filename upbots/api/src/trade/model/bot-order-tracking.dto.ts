/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class SeedDetailDto {
  @ApiProperty()
  at: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  exOrderId: string;

  @ApiProperty()
  side: string;

  @ApiProperty()
  sbl: string;

  @ApiProperty()
  exch: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  qOrig: string;

  @ApiProperty()
  qExec: string;

  @ApiProperty()
  qRem: string;

  delayUntilUpdater: number;

  delayOrderSubmit: number;

  @ApiProperty()
  profit: number;

  @ApiProperty()
  closePrice: number;
}
// TODO: remove this

/*
 * a read-only model on order trackings for a given price-driven strategy or algobot order.
 */
export class BotOrderTrackingDto extends Document {
  @ApiProperty()
  id: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  exchKeyId: string;

  @ApiProperty()
  botSubId: string;

  @ApiProperty()
  ctxBot?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  side: string;

  @ApiProperty()
  orderType: string;

  @ApiProperty()
  priceAsked: string;

  @ApiProperty()
  qtyAsked: string;

  @ApiProperty()
  sbl: string;

  @ApiProperty()
  exch: string;

  @ApiProperty({ type: [SeedDetailDto] })
  details: SeedDetailDto[];

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  botOrderRef: string;

  @ApiProperty()
  botRef: string;
}
