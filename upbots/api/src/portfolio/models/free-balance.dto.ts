/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";

export class FreeBalances {
  [currency: string]: number;
}

export class TradableBalanceOverview {
  @ApiProperty()
  exchange: string;

  @ApiProperty()
  freeBalances: FreeBalances;
}
