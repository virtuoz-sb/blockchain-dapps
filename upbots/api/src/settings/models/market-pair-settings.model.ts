import { Document } from "mongoose";
import { DigitsCountingPrecisionMode } from "src/db_seeds/precision-mode";

export interface MinMax {
  min: number;
  max: number;
}
export interface Limits {
  amount: MinMax;
  price: MinMax;
  cost: MinMax;
}
export interface Precision {
  amount: number;
  price: number;
  base: number;
  quote: number;
}

export interface MarketPairSetting {
  exchange: string;
  // marketId: string;
  symbolLabel: string;
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  tradingAllowed: boolean;
  type?: string;
  spot?: boolean;
  margin?: boolean;
  swap?: boolean;
  future?: boolean;
  precisionMode: DigitsCountingPrecisionMode;
  limits: Limits;
  precision: Precision;
  /** additional config (does not exist in ccxt) used by frontend to get prices from crypto compare api */
  symbolForData: string;
  /** pair.id or market identifier */
  market: string;
  contractSize?: number;
}
/*
 * market pair settings (see frontend ExchangePairSettings)
 */
export class MarketPairSettingModel extends Document implements MarketPairSetting {
  // we use the class to be able to injectModel using class.name

  exchange: string;

  market: string;

  symbolLabel: string;

  symbol: string;

  symbolForData: string;

  baseCurrency: string;

  quoteCurrency: string;

  tradingAllowed: boolean; // active &&info.isSpotTradingAllowed
  // perpetualContract: boolean; // for future bitmex
  // inverse: boolean; // for future bitmex //FIXME: Frontend impact

  type?: string;

  spot?: boolean;

  margin?: boolean;

  swap?: boolean;

  future?: boolean;

  precisionMode: DigitsCountingPrecisionMode;

  limits: Limits;

  precision: Precision;
  // name: { type: String }, //not returned by ccxt: //FIXME: Frontend impact
}
