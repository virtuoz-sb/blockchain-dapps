import {
  Controller,
  Get,
  UseGuards,
  Param,
  CacheTTL,
  UseInterceptors,
  CacheInterceptor,
  ParseArrayPipe,
  Query,
  Logger,
  UnprocessableEntityException,
  CacheKey,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import BinanceProxy from "src/exchangeProxy/services/binance-proxy";
import { ExchangeRates, PriceHistoryResponse } from "../types";
import CryptoCompareMultiPriceService from "./cryptocompare-multi-price.service";
import CurrentPriceService from "./price-summary.service";
import ExchManagerService from "./exchanges/exch-manager.service";
import CoinGeckoPriceService from "./coinGeckoPrice.service";
import { CurrentPriceSummary } from "./types";
import ProxyFactoryService from "../exchangeProxy/services/proxy-factory.service";

@ApiTags("price")
@Controller("price")
@UseGuards(AuthGuard("jwt"))
export default class PriceController {
  private readonly logger = new Logger(PriceController.name);

  constructor(
    private priceSvc: CurrentPriceService,
    private multiPrice: CryptoCompareMultiPriceService,
    private exchManagerService: ExchManagerService,
    private coinGeckoService: CoinGeckoPriceService,
    private proxyFactoryService: ProxyFactoryService
  ) {}

  @Get(":exchange/:symbol")
  @ApiOperation({
    summary: "Get current price and its 24h evolution percentage",
    description: `
    returns (cached) current price summary with its 24h evolution percentage for the specified exchange and symbol
        `,
  })
  @ApiResponse({
    status: 200,
    type: CurrentPriceSummary,
    description: "success",
  })
  @CacheTTL(30) // in seconds
  @UseInterceptors(CacheInterceptor)
  getCurrentPrice(@Param("exchange") exchange: string, @Param("symbol") symbol: string): Promise<CurrentPriceSummary> {
    // TODO: filter allowed exchanges and return 422

    return this.priceSvc.getCurrentPriceSummary(exchange, symbol);
  }

  @Get("convert")
  getCoinRates(
    @Query("fsyms", new ParseArrayPipe({ items: String, separator: "," })) fromSymbols: string[],
    @Query("tsyms", new ParseArrayPipe({ items: String, separator: "," })) toSymbols: string[]
  ): Promise<ExchangeRates> {
    this.logger.debug(`getCoinRates fsyms ${fromSymbols} tsyms ${toSymbols}`);
    return this.multiPrice.listCryptoPrices(fromSymbols, toSymbols);
  }

  @Get("coingecko")
  @ApiOperation({
    summary: "Get the current price of any crypto currencies in any other supported currencies with CoinGecko API V3",
  })
  @CacheTTL(60)
  @CacheKey("get_coin_rates")
  getCoinRatesCoingecko(
    @Query("fsyms", new ParseArrayPipe({ items: String, separator: "," })) fromSymbols: string[],
    @Query("tsyms", new ParseArrayPipe({ items: String, separator: "," })) toSymbols: string[]
  ): Promise<ExchangeRates> {
    this.logger.debug(`get coin prices from CoinGecko fsyms: ${fromSymbols} tsyms: ${toSymbols}`);
    return this.multiPrice.getCryptoPricesByCoingeckoAPI(fromSymbols, toSymbols);
  }

  @Get("summary")
  @CacheTTL(3)
  @UseInterceptors(CacheInterceptor)
  getExchangeSummary(@Query("exchange") exchange: string): Promise<any> {
    if (!exchange) {
      throw new UnprocessableEntityException('Exchange query param is required"');
    }
    return this.priceSvc.getExchangeSummary(exchange);
  }

  @Get("history")
  @CacheTTL(60)
  @CacheKey("get_coin_history")
  @ApiOperation({
    summary: "Get historical market data include price, market cap, and 24h volumn with CoinGecko API V3",
  })
  getPriceHistoryCoingecko(@Query("crypto") crypto: string, @Query("fiat") fiat: string): Promise<PriceHistoryResponse> {
    this.logger.debug(`get historial market data from CoinGecko crypto: ${crypto} fiat: ${fiat}`);
    return this.coinGeckoService.getCryptoPriceHistory(crypto, fiat);
  }

  @Get("orderbook/:exchange/:symbol")
  getOrderBook(@Param("exchange") exchange: string, @Param("symbol") symbol: string): Promise<any> {
    if (!exchange) {
      throw new UnprocessableEntityException('Exchange query param is required"');
    }
    if (!symbol) {
      throw new UnprocessableEntityException('symbol query param is required"');
    }
    return this.exchManagerService.getOrderBook(exchange, symbol);
  }

  @Get("orderhistories/:exchange/:symbol")
  getOrderHistories(@Param("exchange") exchange: string, @Param("symbol") symbol: string): Promise<any> {
    if (!exchange) {
      throw new UnprocessableEntityException('Exchange query param is required"');
    }
    if (!symbol) {
      throw new UnprocessableEntityException('symbol param is required"');
    }
    return this.exchManagerService.getOrderHistories(exchange, symbol);
  }

  @Get("klines")
  @CacheTTL(1800)
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: "Get historical market data include price and market cap with Binance",
  })
  getPriceHistoryBinance(@Query("crypto") crypto: string, @Query("fiat") fiat: string, @Query("days") days: number): Promise<any> {
    this.logger.debug(`get historial market data from Binance crypto: ${crypto} fiat: ${fiat}`);
    const binance = this.proxyFactoryService.setExchangeProxy("binance") as BinanceProxy;
    return binance.getKLines(crypto, fiat, days);
  }
}
