/* eslint-disable no-param-reassign */
import { Injectable, Logger } from "@nestjs/common";
import * as ccxt from "ccxt";
import FetchMarketResponse from "../fetch-market-result";
import { DigitsCountingPrecisionMode } from "../precision-mode";

@Injectable()
export default class MarketsFetchingService {
  private readonly logger = new Logger(MarketsFetchingService.name);

  async fetchMarketForExchange(exchange: string, exchangeName: string): Promise<FetchMarketResponse> {
    // return this.fakeReponse(); // use fake reponse to avoid fetching 1.4MB per exchange each time API loads and module.init is triggered

    const CCXT = ccxt as any; // Hack!
    const ex = new CCXT[exchange]({ enableRateLimit: true }) as ccxt.Exchange;

    const markets = await ex.loadMarkets(); // load to exchanges (35000 lines of json !!)
    let filteredMarkets: any = markets;
    if (exchange === "binanceusdm") {
      filteredMarkets = Object.keys(markets)
        .filter((key) => key === `${markets[key].base}/${markets[key].quote}`)
        .reduce((obj, key) => {
          obj[key] = markets[key];
          return obj;
        }, {});
    } else if (exchangeName === "ftx-future") {
      filteredMarkets = Object.keys(markets)
        .filter((key) => markets[key].swap)
        .reduce((obj, key) => {
          obj[key] = markets[key];
          return obj;
        }, {});
    }
    return {
      markets: filteredMarkets,
      exchange: exchangeName,
      precisionMode: this.getPrecionMode(ex.precisionMode),
    };
  }

  private getPrecionMode(mode: number): DigitsCountingPrecisionMode {
    switch (mode) {
      case 0:
        return DigitsCountingPrecisionMode.DECIMAL_PLACES; // 99% of exchnages
      case 1:
        return DigitsCountingPrecisionMode.SIGNIFICANT_DIGITS;
      case 2:
        return DigitsCountingPrecisionMode.TICK_SIZE;
      default:
        throw new Error(`Precision mode '${mode}' is not handled by the system`);
    }
  }

  private fakeReponse(): Promise<FetchMarketResponse> {
    const fakeMarkets = {
      BTCUSDT: {
        id: "BTCUSDT",
        symbol: "BTC/USDT",
        base: "BTC",
        quote: "USDT",
        baseId: "BTC",
        quoteId: "USDT",
        active: true,
        limits: {
          amount: { min: 0.000001, max: 9000 },
          price: { min: 0.01, max: 1000000 },
          cost: { min: 10, max: undefined },
        },
        precision: { base: 8, quote: 8, amount: 6, price: 2 },
        info: { isSpotTradingAllowed: true },
      } as ccxt.Market,
      BNBUSDT: {
        active: true,
        limits: {
          amount: { min: 0.001, max: 900000 },
          price: { min: 0.0001, max: 100000 },
          cost: { min: 10, max: undefined },
        },
        precision: { base: 8, quote: 8, amount: 3, price: 4 },
        tierBased: false,
        percentage: true,
        taker: 0.001,
        maker: 0.001,
        id: "BNBUSDT",
        symbol: "BNB/USDT",
        base: "BNB",
        quote: "USDT",
        baseId: "BNB",
        quoteId: "USDT",
        info: { isSpotTradingAllowed: true },
      } as ccxt.Market,
    };
    return Promise.resolve({
      markets: fakeMarkets,
      exchange: "binance",
      precisionMode: this.getPrecionMode(0),
    });
  }
}

/*
Please read: https://ccxt.readthedocs.io/en/latest/manual.html#precision-and-limits


Each exchange has its own rounding, counting and padding modes.

Supported rounding modes are:

ROUND – will round the last decimal digits to precision
TRUNCATE– will cut off the digits after certain precision
The decimal precision counting mode is available in the exchange.precisionMode property.

Supported precision modes are:

DECIMAL_PLACES – counts all digits, 99% of exchanges use this counting mode. With this mode of precision, the numbers in market['precision'] designate the number of decimal digits after the dot for further rounding or truncation.
SIGNIFICANT_DIGITS – counts non-zero digits only, some exchanges (bitfinex and maybe a few other) implement this mode of counting decimals. With this mode of precision, the numbers in market['precision'] designate the Nth place of the last significant (non-zero) decimal digit after the dot.
TICK_SIZE – some exchanges only allow a multiple of a specific value (bitmex and ftx use this mode, for example). In this mode, the numbers in market['precision'] designate the minimal precision fractions (floats) for rounding or truncating.

const DECIMAL_PLACES     = 0        // digits counting mode
    , SIGNIFICANT_DIGITS = 1
    , TICK_SIZE = 2
*/
