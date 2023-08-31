/* eslint-disable max-classes-per-file */
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

// export type PriceStrategy = Document;

export class EntryDto {
  @ApiProperty()
  marketentry: boolean;

  @ApiProperty()
  limitentry: boolean;

  // @ApiProperty()
  // requested: boolean;

  // @ApiProperty()
  // confirmed: boolean;

  @ApiProperty()
  triggerprice: string;

  @ApiProperty()
  limitprice: string;

  @ApiProperty()
  quantity: string;
}
export class MarketDto {
  @ApiProperty()
  exchange: string;

  @ApiProperty()
  symbol: string;
}

export class TakeProfitDto {
  @ApiProperty()
  quantity: string;

  @ApiProperty()
  trigger: string;
}

export class AccountDto {
  @ApiProperty()
  userID: string;

  @ApiProperty()
  apiKeyID: string;
}
/**
 * Mongoose model decorated with swagger decorator for auto-documentation.
 */
export class PriceStrategy extends Document {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [EntryDto] })
  entries: EntryDto[];

  @ApiProperty()
  market: MarketDto;

  @ApiProperty()
  stopLoss: string;

  @ApiProperty()
  side: number;

  @ApiProperty()
  phase: number;

  @ApiProperty({ type: [TakeProfitDto] })
  takeProfits: TakeProfitDto[];

  @ApiProperty()
  account: AccountDto;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  phaseDescription: string;

  @ApiProperty()
  sideDescription: string;
}
