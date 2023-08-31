import { DistributionTable } from "@/components/portfolio/types/portfolio.types";
import { BtcAmount } from "../user/types";

export interface UniswapV2Data {
  tokens: {
    tickerSymbol: string;
    balance: number;
  }[];
  totalUsdValue: number;
}

export interface PancakeswapData {
  tokens: {
    tickerSymbol: string;
    balance: number;
  }[];
  totalUsdValue: number;
}

export interface BalancerData {
  tokens: {
    tickerSymbol: string;
    balance: number;
  }[];
  totalUsdValue: number;
}

export interface CurveData {
  tokens: {
    tickerSymbol: string;
    balance: number;
  }[];
  totalUsdValue: number;
}

export interface AaveData {
  supplied: {
    tickerSymbol: string;
    balance: number;
    usdValue: number;
  }[];
  borrowed: {
    tickerSymbol: string;
    balance: number;
    usdValue: number;
  }[];
}

export interface CompoundData {
  supplied: {
    tickerSymbol: string;
    balance: number;
    usdValue: number;
    apr: number;
  }[][];
  borrowed: {
    tickerSymbol: string;
    balance: number;
    usdValue: number;
    apr: number;
  }[][];
}

export interface SushiswapData {
  stake: {
    tickerSymbol: string;
    balance: number;
    usdValue: number;
  };
}

export interface ProjectsData {
  address?: string;
  uniswapV2?: UniswapV2Data[];
  pancakeswap?: PancakeswapData[];
  balancer?: BalancerData[];
  curve?: CurveData[];
  aave?: AaveData;
  compound?: CompoundData;
  sushiswap?: SushiswapData;
}

export interface TokenData {
  address: string;
  contractTickerSymbol: string;
  contractLogoUrl: string;
  balance: number;
  quote: number;
  blockchain: "eth" | "bsc";
}

export interface BalancesDto {
  addressList: string[];
  quoteCurrency: "usd";
  quoteCurrencyConversionRates: {
    btc: number;
    eur: number;
  };
  tokens: TokenData[];
  projects: ProjectsData[];
}

export interface DexWallet {
  label: string;
  address: string;
  allWallets?: boolean;
}

export interface UsdConversionRates {
  btc: number;
  eur: number;
}

export interface AssetsSummary {
  address: string;
  evolution: {
    btc: number;
    usd: number;
    eur: number;
    date: Date;
  }[];
}

export interface DexMonitoringState {
  wallets: DexWallet[];
  assetsEvolution: AssetsSummary[];
  usdConversionRates: UsdConversionRates;
  selectedWallet: DexWallet;
  tokensData: TokenData[];
  projectsDataList: ProjectsData[];
  projectsData: ProjectsData;
}

export interface MyWalletSortedData {
  sort: string;
  sortType: string;
  data: any[];
}
export interface AssetsEvolution {
  usd: number;
  eur: number;
  btc: number;
  date: Date;
}

export interface DexAssetsDto {
  address: string;
  evolution: AssetsEvolution[];
}
