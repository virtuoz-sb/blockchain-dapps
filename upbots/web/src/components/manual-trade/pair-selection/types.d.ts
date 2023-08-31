export interface PairsFilter {
  value: string;
  label: string;
  headerLabel?: boolean;
}

export interface TradingFilters {
  stableCoins: PairsFilter[];
  alts: PairsFilter[];
  fiats: PairsFilter[];
}
