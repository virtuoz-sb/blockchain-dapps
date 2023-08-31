export interface PortfolioState {
  balance: BtcAmount;
  accounts: AccountTotal[];
  selectedWallets: string[];
}

export interface PortfolioRequestPayload {
  filter?: string[];
}

/**
 * Represents api/portfolio/summary response type.
 * see src/portfolio/models/portfolio.dto.ts
 */
export interface PortfolioSummaryResponse extends PortfolioFilteredResponse {
  accounts: AccountTotal[];
}
export interface PortfolioFilteredResponse {
  aggregated: BtcAmount;
  distribution: DistributionOverview;
}

export interface BtcAmount {
  btc: number;
  eur: number;
  usd: number;
  conversionDate: Date;
}

export interface AccountTotal {
  name: string;
  exchange: string;
  total: BtcAmount;
}

export interface DistributionOverview {
  other: DistributionAmount;
  [currency: string]: DistributionAmount;
}

export interface DistributionAmount extends BtcAmount {
  percentage: number;
  currency: string;
  currencyAmount: number;
}
export interface DistributionChartData {
  labels: string[];
  data: number[];
}
