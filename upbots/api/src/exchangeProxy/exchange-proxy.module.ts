import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import CacheConfigModule from "../cache-config/cache-config.module";
import ExchangeKeySchema from "../models/exchange-key.schema";
import ExchangeKeyDataService from "../exchange-key/services/exchange-key.data.service";
import BinanceProxy from "./services/binance-proxy";
import BinanceUsProxy from "./services/binanceus-proxy";
import BinanceFutureProxy from "./services/binance-future-proxy";
import BitmexProxy from "./services/bitmex-proxy";
import BitmexTestProxy from "./services/bitmex_test-proxy";
import FtxProxy from "./services/ftx-proxy";
import FtxFutureProxy from "./services/ftx-future-proxy";
import HuobiproProxy from "./services/huobipro-proxy";
import KucoinProxy from "./services/kucoin-proxy";
import KucoinFutureProxy from "./services/kucoin-future-proxy";
import OkexProxy from "./services/okex-proxy";
import CoinbaseProProxy from "./services/coinbasepro-proxy";
import ProxyFactoryService from "./services/proxy-factory.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: "ExchangeKey", schema: ExchangeKeySchema }]), CacheConfigModule],
  providers: [
    ProxyFactoryService,
    BinanceProxy,
    BinanceUsProxy,
    BinanceFutureProxy,
    BitmexProxy,
    FtxProxy,
    FtxFutureProxy,
    BitmexTestProxy,
    HuobiproProxy,
    KucoinProxy,
    KucoinFutureProxy,
    OkexProxy,
    CoinbaseProProxy,
    ExchangeKeyDataService,
  ],
  exports: [ProxyFactoryService],
})
export default class ExchangeProxyModule {}
