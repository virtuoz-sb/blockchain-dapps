import { Injectable, Logger } from "@nestjs/common";
import { allowedExchangeNames } from "../../db_seeds/seeds/exchange-allowed.seed";
import BinanceProxy from "./binance-proxy";
import BinanceUsProxy from "./binanceus-proxy";
import BinanceFutureProxy from "./binance-future-proxy";
import BitmexProxy from "./bitmex-proxy";
import BitmexTestProxy from "./bitmex_test-proxy";
import FtxProxy from "./ftx-proxy";
import FtxFutureProxy from "./ftx-future-proxy";
import HuobiproProxy from "./huobipro-proxy";
import KucoinProxy from "./kucoin-proxy";
import KucoinFutureProxy from "./kucoin-future-proxy";
import OkexProxy from "./okex-proxy";
import CoinbaseProProxy from "./coinbasepro-proxy";

@Injectable()
export default class ProxyFactoryService {
  constructor(
    private binanceProxy: BinanceProxy,
    private binanceUsProxy: BinanceUsProxy,
    private binanceFutureProxy: BinanceFutureProxy,
    private bitmexProxy: BitmexProxy,
    private bitmexTestProxy: BitmexTestProxy,
    private huobiproProxy: HuobiproProxy,
    private kucoinProxy: KucoinProxy,
    private kucoinFutureProxy: KucoinFutureProxy,
    private okexProxy: OkexProxy,
    private ftxProxy: FtxProxy,
    private ftxFutureProxy: FtxFutureProxy,
    private coinbaseProProxy: CoinbaseProProxy
  ) {}

  private readonly logger = new Logger(ProxyFactoryService.name);

  /**
   * creates an exchange proxy from provided exchange name
   * @param exchange
   */
  setExchangeProxy(
    exchange: string
  ):
    | BinanceProxy
    | BinanceUsProxy
    | BinanceFutureProxy
    | HuobiproProxy
    | BitmexProxy
    | FtxProxy
    | FtxFutureProxy
    | BitmexTestProxy
    | KucoinProxy
    | KucoinFutureProxy
    | OkexProxy
    | CoinbaseProProxy {
    // TODO: ???? refactor: this should be a proxy factory class
    const compatibleExchange = allowedExchangeNames(); // implicit dependency to seed module
    if (!compatibleExchange.includes(exchange)) {
      throw new Error(`${exchange} is not handled by the api, please update app settings and check if Proxy is existing.`);
    }
    if (exchange === "binance") {
      return this.binanceProxy;
    }
    if (exchange === "binance-us") {
      return this.binanceUsProxy;
    }
    if (exchange === "binance-future") {
      return this.binanceFutureProxy;
    }
    if (exchange === "bitmex") {
      return this.bitmexProxy;
    }
    if (exchange === "bitmex_test") {
      return this.bitmexTestProxy;
    }
    if (exchange === "ftx") {
      return this.ftxProxy;
    }
    if (exchange === "ftx-future") {
      return this.ftxFutureProxy;
    }
    if (exchange === "huobi") {
      return this.huobiproProxy;
    }
    if (exchange === "kucoin") {
      return this.kucoinProxy;
    }
    if (exchange === "kucoin-future") {
      return this.kucoinFutureProxy;
    }
    if (exchange === "okex") {
      return this.okexProxy;
    }
    if (exchange === "coinbasepro") {
      return this.coinbaseProProxy;
    }

    throw new Error(`There is no proxy call to ccxt for ${exchange}. Create a new one.`);
  }

  getFtxProxy(): FtxProxy {
    return this.ftxProxy;
  }
}
