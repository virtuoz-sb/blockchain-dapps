/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";

export class PriceChange {
  @ApiProperty()
  percentage: number;

  @ApiProperty()
  absolute: number;
}

export class CurrentPrice {
  @ApiProperty()
  last: number;

  @ApiProperty()
  high: number;

  @ApiProperty()
  low: number;

  @ApiProperty()
  change: PriceChange;
}

export class CurrentPriceResult {
  @ApiProperty()
  price: CurrentPrice;

  @ApiProperty()
  volume: number;

  @ApiProperty()
  volumeQuote: number;
}

/**
 * cryptowatch price summary data structure
 */
export class CurrentPriceSummary {
  @ApiProperty()
  result: CurrentPriceResult;
}
