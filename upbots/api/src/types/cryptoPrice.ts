export interface CryptoPrice {
  Response: string;
  Message: string;
  HasWarning: boolean;
  Type: number;
  Ignored?: boolean;
  RateLimit: any;
  // latest tick on an hourly base
  Latest: CryptoDataOHLC;
  // latest tick on the previous day based on CEST time
  LatestPreviousDay: CryptoDataOHLC;
  Data: {
    Aggregated: boolean;
    TimeFrom: number;
    TimeTo: number;
    HourlyData: CryptoDataOHLC[];
    DailyData: CryptoDataOHLC[];
  };
}
export interface CryptoDataOHLC {
  time: number;
  high: number;
  low: number;
  open: number;
  volumefrom: number; // volumeBase
  volumeto: number; // volumeQuote
  close: number;
  conversionType: string;
  conversionSymbol: string;
}

export interface CryptoPriceService {
  listCryptoPrices(cryptoSymbol: string, fiat: string): Promise<CryptoPrice>;
}

export interface ExchangeRates {
  [fromSymbol: string]: Rate;
}

export interface Rate {
  [toSymbol: string]: number;
}

export interface ExchangeRatesError {
  Response: string;
  Message: string;
  Type: number;
  RateLimit: any;
  HasWarning: boolean;
  Warning?: string;
  // Data: {}
}

export interface PriceHistoryResponse {
  market_caps: [number, number][];
  prices: [number, number][];
  total_volumes: [number, number][];
}

// CryptoCompare response type differs wether is a success or an error
export type ExchangeRatesResponse = ExchangeRates | ExchangeRatesError;
