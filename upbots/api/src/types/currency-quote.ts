import { Document } from "mongoose";

export type DailyRate = CurrencyQuote;
/**
 * A Currency pair exchange rate in OHLCV
 */
export interface CurrencyQuote extends Document {
  timestamp: Date;
  /**
   * An uppercase string code representation of a particular trading pair or instrument.
   * This is usually written as BaseCurrency/QuoteCurrency with a slash as in BTC/USD
   */
  symbol: string;
  /* Left side of the currency pair.
   */
  baseCurrency: string;
  quoteCurrency: string;
  /**
   * The source of the quotation  (market identifier), i.e. Binance, Bitfinex..
   */
  source: string;
  ohlcv: OHLCV;
  created: Date;
}

export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
