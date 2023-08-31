import { Controller, Get, UseGuards, Param, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ApiTags } from "@nestjs/swagger";
import { cpuUsage } from "process";
import CryptoWatchPriceService from "./cryptoWatchPrice.service";
import CryptoComparePriceService from "./cryptoComparePrice.service";
import CryptoCompareMultiPriceService from "./cryptocompare-multi-price.service";
import ExchManagerService from "./exchanges/exch-manager.service";
import KucoinExchService from "./exchanges/kucoin-exch.service";
import UserCacheInterceptor from "../cache-config/user-cache.interceptor";

@ApiTags("price")
@Controller("cryptoPrice")
export default class CryptoPriceController {
  constructor(
    private cryptoWatchPriceService: CryptoWatchPriceService,
    private cryptoComparePriceService: CryptoComparePriceService,
    private cryptoCompareMultiPriceService: CryptoCompareMultiPriceService,
    private exchManagerService: ExchManagerService,
    private kucoinExchService: KucoinExchService
  ) {}

  @Get(":provider/:baseCurrency/:quoteCurrency")
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(UserCacheInterceptor)
  async listCryptoPrices(
    @Param("provider") provider: string,
    @Param("baseCurrency") baseCurrency: string,
    @Param("quoteCurrency") quoteCurrency: string
  ) {
    if (provider === "cryptocompare") {
      return this.cryptoComparePriceService.listCryptoPrices(baseCurrency, quoteCurrency);
    }
    if (provider === "kucoin" || provider === "kucoin-future") {
      const symbol = `${baseCurrency}-${quoteCurrency}`;
      const ticker = await this.kucoinExchService.getTicker(symbol);
      const price = {
        Latest: {
          close: ticker.result.price.last,
        },
      };
      return price;
    }
    let exchange = provider;
    if (provider === "binance-future") {
      exchange = "binance";
    } else if (provider === "ftx-future") {
      exchange = "ftx";
    } else if (provider === "coinbasepro") {
      exchange = "coinbase";
    }
    return this.cryptoWatchPriceService.listCryptoPrices(baseCurrency, quoteCurrency, exchange);
  }
}
