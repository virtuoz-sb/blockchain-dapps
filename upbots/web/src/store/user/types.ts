import { FavoriteCurrency } from "@/components/portfolio/types/portfolio.types";
import { ErrorResponse } from "../error-response";
import { ExchangePairSettings } from "../trade/types";

export interface UserState {
  loading: {
    [key: string]: boolean;
  };
  alerts: any[];
  portfolioBalance: any;
  portfolioDistribution: DistributionOverview;
  keys: any[];
  distribution: any;
  portfolioDistributionChart: any;
  favoriteCurrency: FavoriteCurrency;
  selectedQuantity: any;
  portfolioEvolution: any;
  exchanges: Array<Exchanges>;
  tradingSettings: Array<TradingSettings>;
  phone?: any; // removed if needed
  accounts: Array<Accounts>;
  selectedWallets: any[];
  pageSettings: PageSettings[];
  activeCoupons: Coupons[];
}

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
  conversionDate?: Date;
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

export interface ExchangeKeysState {
  // error: boolean;
  loading: boolean;
  error: ErrorResponse | null;
  keys: Array<ExchangeKey>;
  exchanges: any[];
}

export interface ExchangeKey {
  id: string;
  name: string;
  exchange: string;
  publicKey: string;
  created: Date;
  // updated: Date;
}
export interface AddExchangeKeyRequestPayload {
  name: string;
  exchange: string;
  publicKey: string;
  secretKey: string;
  password: string;
}

export interface EditExchangeKeyRequestPayload {
  id: string;
  name: string; // can only edit key name
}

export interface PageSettings {
  name: string;
  path: string;
  comingSoon: boolean;
}

export interface Coupons {
  code: string;
  promoName: string;
  description: string;
  couponType: "unique" | "global";
  activated: boolean;
}

export interface Accounts {
  exchange: string;
  id: string;
  name: string;
  total: BtcAmount;
}

export interface TradingSettings {
  enabled: boolean;
  label: string;
  name: string;
  pairs: Array<ExchangePairSettings>;
  soon: boolean;
}

export interface Summary {
  accounts: Array<Accounts>;
  aggregated: BtcAmount;
  distribution: any;
  ignoredCurrencies: Array<string>;
}

export interface Keys {
  created: string;
  error: string;
  exchange: string;
  id: string;
  lastHealthCheck: string;
  name: string;
  publicKey: string;
  updated: string;
  valid: boolean;
}
export interface KeyExtended extends Keys {
  img: any;
  displayName: string;
  tradingAllowed: boolean;
}

export interface Exchanges {
  label: string;
  name: string;
}
