/* Data Structure (Crypto Watch)
export interface CryptoPriceState {
 error: boolean;
 loaded: { [pair: string]: boolean };
 data: { [pair: string]: CryptoPriceData };
}
 Data Structure (Crypto Watch)
export interface CryptoPriceData {
 Response: string;
 Message: string;
 HasWarning: boolean;
 Type: number;
 RateLimit: any;
 Latest: CryptoCompareData;
 LatestPreviousDay: CryptoCompareData;
 Data: {
   Aggregated: boolean;
   TimeFrom: Date;
   TimeTo: Date;
   HourlyData: CryptoCompareData[];
   DailyData: CryptoCompareData[];
 };
}
*/
//*Data Structure (CoinGecko)*//
export interface CryptoPriceState {
  loaded: { [pair: string]: boolean };
  data: { [pair: string]: CryptoPriceData };
}
export interface CryptoPriceData {
  market_caps: any[];
  prices: any[];
  total_volumes: any[];
}
export interface CryptoItem {
  title: string;
  name: string;
  symbol: string;
  srcCoin: string;
}
export interface CryptoItems extends Array<CryptoItem> {}

//----------------------------------//
export interface CryptoCompareData {
  time: Date;
  high: number;
  low: number;
  open: number;
  volumefrom: number;
  volumeto: number;
  close: number;
  conversionType: string;
  conversionSymbol: string;
}

export interface CryptoPriceRequestPayload {
  cryptoSymbol: string;
  fiatSymbol: string;
}

export interface CryptoPriceResultResponse {
  cryptoSymbol: string;
  fiatSymbol: string;
  data: CryptoPriceData;
}

export interface CryptoPriceResultErrorResponse {
  pair: string;
}
