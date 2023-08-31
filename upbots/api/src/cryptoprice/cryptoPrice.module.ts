import { Module, HttpModule } from "@nestjs/common";
import SettingsModule from "src/settings/settings.module";
import { MongooseModule } from "@nestjs/mongoose";
import CryptoCompareSchema from "../models/cryptocompare.schema";
import SharedModule from "../shared/shared.module";
import CryptoWatchPriceService from "./cryptoWatchPrice.service";
import CryptoPriceController from "./cryptoPrice.controller";
import CryptoComparePriceService from "./cryptoComparePrice.service";
import PriceController from "./price.controller";
import CurrentPriceService from "./price-summary.service";
import CryptoCompareMultiPriceService from "./cryptocompare-multi-price.service";
import CoinGeckoPriceService from "./coinGeckoPrice.service";
import ExchManagerService from "./exchanges/exch-manager.service";
import KucoinExchService from "./exchanges/kucoin-exch.service";
import KucoinFutureExchService from "./exchanges/kucoin-future-exch.service";
import FtxExchService from "./exchanges/ftx-exch.service";
import ConversionRateService from "./conversion-rate.service";
import ConversionRateCacheService from "./conversion-rate-cache.service";
import CacheConfigModule from "../cache-config/cache-config.module";
import ExchangeProxyModule from "../exchangeProxy/exchange-proxy.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "CryptoCompare", schema: CryptoCompareSchema }]),
    SharedModule,
    HttpModule,
    CacheConfigModule,
    SettingsModule,
    ExchangeProxyModule,
  ],
  controllers: [CryptoPriceController, PriceController],
  providers: [
    CryptoWatchPriceService,
    CryptoComparePriceService,
    CoinGeckoPriceService,
    CurrentPriceService,
    CryptoCompareMultiPriceService,
    ExchManagerService,
    KucoinExchService,
    KucoinFutureExchService,
    FtxExchService,
    { provide: ConversionRateService, useClass: ConversionRateCacheService }, // cache exchange rates
  ],
  exports: [CryptoWatchPriceService, ConversionRateService, CurrentPriceService, ExchManagerService],
})
export default class CryptoPriceModule {}
