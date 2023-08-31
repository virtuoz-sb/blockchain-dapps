export interface DistributionTable {
  coin: string;
  amount: number;
  btcValue: number;
  usdValue: number;
  eurValue: number;
  blockchain?: "eth" | "bsc";
}

export interface PortfolioPercentage {
  x: string;
  labels: string;
  value: string;
  valueEur: string;
  currencyAmount: string;
}

export interface FavoriteCurrency {
  value: "usd" | "eur";
  label: string;
}

export interface PortfolioEvolution {
  labels: string[];
  datasets: DataSets[];
}

export interface DataSets {
  id: number;
  borderColor: string;
  backgroundColor: string;
  pointBackgroundColor: string;
  pointBorderColor: string;
  label: string;
  value: string;
  yAxisID: string;
  data: string[];
  lineTension: number;
  borderWidth: number;
  pointBorderWidth: number;
  pointHoverRadius: number;
  pointHoverBorderWidth: number;
  pointRadius: number;
  pointHitRadius: number;
}

export interface Keys {
  id: string;
  name: string;
  created: string;
  exchange: string;
  publicKey: string;
  valid: boolean;
  lastHealthCheck: string;
  error: string;
  updated: string;
}
