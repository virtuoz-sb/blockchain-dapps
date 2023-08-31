export class PriceChange {
  percentage: number;

  absolute: number;
}

export class CurrentPrice {
  last: number;

  high: number;

  low: number;

  change: PriceChange;
}

/**
 * cryptowatch price summary data structure
 */
export class CurrentPriceSummary {
  price: CurrentPrice;

  volume: number;

  volumeQuote: number;
}

export class CurrentPriceSummaryResult {
  result: CurrentPriceSummary;
}
