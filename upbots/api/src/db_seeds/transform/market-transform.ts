import { LoggerService } from "@nestjs/common";
import * as ccxt from "ccxt";
import { MarketPairSetting } from "../../settings/models/market-pair-settings.model";
import { DigitsCountingPrecisionMode } from "../precision-mode";

const toMarketDto = function toMarketDto(m: ccxt.Market, exchangeName: string, mode: DigitsCountingPrecisionMode): MarketPairSetting {
  if (!m) {
    return null;
  }
  const r = {} as MarketPairSetting;
  r.exchange = exchangeName;
  // r.marketId = m.id;
  r.market = m.id.toUpperCase();
  r.symbolLabel = m.symbol;
  r.symbol = m.id.toUpperCase();
  r.symbolForData = m.id?.toLowerCase(); // to get cryptocompare prices
  // TODO: for bitmex, it should be overriden symbolForData: "btcusd-perpetual-future-inverse",       symbolForData: "ethusd-perpetual-future-quanto",
  r.tradingAllowed = m.active; // m.active && m.info.isSpotTradingAllowed; isSpotTradingAllowed is undefined for FTX

  r.precisionMode = mode;
  r.quoteCurrency = m.quote;
  r.baseCurrency = m.base;
  r.type = m.type;
  r.spot = m.spot;
  r.margin = m.margin;
  r.swap = m.swap;
  r.future = m.future;
  r.contractSize = (m as any).contractSize;
  r.limits = {
    amount: { min: m.limits?.amount?.min, max: m.limits?.amount?.max },
    price: { min: m.limits?.price?.min, max: m.limits?.price?.max },
    cost: { min: m.limits?.cost?.min, max: m.limits?.cost?.max },
  };
  r.precision = m.precision;
  return r;
};

export default function mapMarkets(
  markets: ccxt.Dictionary<ccxt.Market>,
  exchangeName: string,
  mode: DigitsCountingPrecisionMode
): MarketPairSetting[] {
  if (!markets) {
    return null;
  }
  const results = Object.keys(markets).map((marketId) => toMarketDto(markets[marketId], exchangeName, mode));
  return results;
}
