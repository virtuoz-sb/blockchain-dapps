import {
  Controller,
  Get,
  UseGuards,
  BadRequestException,
  Logger,
  Post,
  Body,
  HttpStatus,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Param,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import ComingSoonGuard from "../shared/comingSoon.guard";
import UserFromJWT from "../utilities/user.decorator";
import { UserIdentity } from "../types";
import { CreateManualSignalStrategyDto, StratCreatedResponseDto } from "./model/create-strategy-dto";
import validationPipe from "../shared/validation.pipe";
import StrategyRequestService from "./services/strategy-request.service";
import TradeStrategyDataService from "./services/trade-strategy-data-service";
import { PriceStrategy } from "./model/price-strategy-dto";
import { OrderTrackingDto } from "./model/order-tracking.dto";
import TradeOrdersDataService from "./services/trade-orders-data-service";
import TradeFormatValidity from "./services/trade-format-validity.service";
import { GetValidityCheckDto } from "./model/trade-formats-dto";
import { ManualTradeApiTag, ManualTradeRoutePrefix } from "./route_constant";
import ManualTradeGuard from "../shared/manual-trade.guard";
import FakeModeInterceptor from "./fake-mode.interceptor";

@ApiTags(ManualTradeApiTag)
@UseGuards(AuthGuard("jwt"))
@Controller(ManualTradeRoutePrefix)
export default class StrategyOrderTradeController {
  private readonly logger = new Logger(StrategyOrderTradeController.name);

  constructor(
    private createStratService: StrategyRequestService,
    private stratService: TradeStrategyDataService,
    private ordersService: TradeOrdersDataService,
    private tradeFormatValidityService: TradeFormatValidity
  ) {}

  @Get("all")
  @ApiOperation({
    summary: "returns user price strategy (paged) list",
    // description: `ordered by latest first`,
  })
  @ApiResponse({
    status: 200,
    type: PriceStrategy,
    description: "returns user's price strategy listed by more recent first",
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: "error",
  })
  @ApiQuery({
    name: "p",
    required: false,
    description: "page index (zero-based)",
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: "s",
    required: false,
    description: "page size (default: 10)",
    example: 10,
    type: Number,
  })
  getPriceStrategiesForUser(
    @UserFromJWT() user: UserIdentity,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number, // ParseIntPipe: cast query param to number
    @Query("s", new DefaultValuePipe(10), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number // DefaultValuePipe makes query string optional
  ): Promise<PriceStrategy[]> {
    if (!user) {
      throw new BadRequestException();
    }
    // Logger.debug(`getPriceStrategiesForUser ${user.id}, page:${page}, pagesize:${pageSize}`);

    return this.stratService.getUserStrategies(user.id, page, pageSize);
  }

  @Get(":stratId/details")
  @ApiOperation({
    summary: "(deprecated will soon be removed) get orders related to a particular price strategy",
  })
  @ApiResponse({
    status: 200,
    type: OrderTrackingDto,
    description: "list orders and exchange event details linked to a price-strategy",
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: "returns HTTP 400 error when provided stratId is not found",
  })
  async getStratOrders(@UserFromJWT() user: UserIdentity, @Param("stratId") stratId: string): Promise<OrderTrackingDto[]> {
    if (!user) {
      throw new BadRequestException();
    }

    const exists = await this.stratService.strategyExist(user.id, stratId);
    if (!exists) {
      this.logger.warn(`getStratOrders for unexisting user ${user.id} or startId ${stratId}`);
      throw new BadRequestException();
    }

    return this.ordersService.getTradeOrders(user.id, stratId);
  }

  @ApiOperation({
    summary: "create new manual trade startegy-order",
    description: `Add a new trade request to the trading engine`,
  })
  @Post()
  @UseInterceptors(FakeModeInterceptor)
  @UseGuards(ComingSoonGuard, ManualTradeGuard)
  @ApiResponse({
    status: 201,
    type: StratCreatedResponseDto,
  })
  async addNewManualStrategy(
    @UserFromJWT() userInfo: UserIdentity,
    @Body(validationPipe)
    data: CreateManualSignalStrategyDto
  ): Promise<StratCreatedResponseDto> {
    Logger.debug(`addNewManualTrade dto:${JSON.stringify(data)}`, "ManualTradeController");

    const resp = await this.createStratService.requestNewStrategy(userInfo.id, data);
    Logger.debug(`addNewManualTrade created:${JSON.stringify(resp)}`, "ManualTradeController");

    return resp;
  }

  // TODO: GET  /trade/{id} to fetch the latest status

  @Get("/format-validity/:exchange")
  @ApiOperation({
    summary: "For a given symbol from a given exchange, check whether the order format complies with the exchange's rules.",
    description: `
      For a given symbol from a given exchange, check whether the order format complies with the exchange's rules.
      When sending a trade to an exchange, certain rules must be respected. Otherwise, the exchange will reject the order.

      If the trade order is not compliant, the api returns a compliant format suggestion.
    `,
  })
  @ApiResponse({
    status: 200,
    type: GetValidityCheckDto,
    description: "", // TO DO
    isArray: true,
  })
  @ApiQuery({
    name: "quantity",
    type: Number,
    required: true,
    example: "quantity=0.7654",
  })
  @ApiQuery({
    name: "price",
    type: Number,
    required: true,
    example: "price=11234.8765",
  })
  @ApiQuery({
    name: "symbol",
    type: String,
    required: true,
    example: "XBTUSD",
    description: `
    Param "symbol" must be market's symbol on the exchange (e.g. XBTUSD for BTC/USD on binance).
    
    To retrieve a symbol from a market, you can request endpoint  "/api/settings/trades/formats/{exchange}?symbols={symbol}
    
    Is not case sensitive.
    `,
  })
  @ApiParam({
    name: "exchange",
    type: String,
    required: true,
    example: "ftx",
  })
  async checkTradeFormat(
    @Param("exchange") exchange: string,
    @Query("symbol") symbol: string,
    @Query("baseCurrency") baseCurrency: string,
    @Query("quoteCurrency") quoteCurrency: string,
    @Query("quantity") quantity: string,
    @Query("price") price: string
  ) {
    if (!symbol) {
      throw new Error("Symbol param is missing, please check your request url");
    }
    if (!baseCurrency) {
      throw new Error("BaseCurrency param is missing, please check your request url");
    }
    if (!quoteCurrency) {
      throw new Error("QuoteCurrency param is missing, please check your request url");
    }
    if (!quantity) {
      throw new Error("Quantity param is missing, please check your request url");
    }
    if (!price) {
      throw new Error("Price param is missing, please chech your request url");
    }

    const quantityIntgr: number = parseFloat(quantity);
    const priceIntgr: number = parseFloat(price);
    if (Number.isNaN(quantityIntgr) || Number.isNaN(priceIntgr)) {
      throw new Error("Quantity or price is not a number. Please check your query params.");
    }

    return this.tradeFormatValidityService.checkTradeFormat(exchange, symbol, baseCurrency, quoteCurrency, quantityIntgr, priceIntgr);
  }

  @Get("/format-validity/price/:exchange")
  @ApiOperation({
    summary: "For a given symbol from a given exchange, check whether the price format complies with the exchange's rules.",
    description: `
      For a given symbol from a given exchange, check whether the price format complies with the exchange's rules.
      When sending a trade to an exchange, certain rules must be respected. Otherwise, the exchange will reject the order.

      If the trade price is not compliant, the api returns a compliant format suggestion.
    `,
  })
  @ApiResponse({
    status: 200,
    isArray: true,
  })
  @ApiQuery({
    name: "price",
    type: Number,
    required: true,
    example: "price=11234.8765",
  })
  @ApiQuery({
    name: "symbol",
    type: String,
    required: true,
    example: "XBTUSD",
    description: `
    Param "symbol" must be market's symbol on the exchange (e.g. XBTUSD for BTC/USD on binance).
    
    To retrieve a symbol from a market, you can request endpoint  "/api/settings/trades/formats/{exchange}?symbols={symbol}
    
    Is not case sensitive.
    `,
  })
  @ApiParam({
    name: "exchange",
    type: String,
    required: true,
    example: "ftx",
  })
  async checkPriceFormat(@Param("exchange") exchange: string, @Query("symbol") symbol: string, @Query("price") price: string) {
    if (!symbol) {
      throw new Error("Symbol param is missing, please check your request url");
    }
    if (!price) {
      throw new Error("Price param is missing, please chech your request url");
    }

    const priceIntgr: number = parseFloat(price);
    if (Number.isNaN(priceIntgr)) {
      throw new Error("Price is not a number. Please check your query params.");
    }

    return this.tradeFormatValidityService.checkPriceFormatOnly(exchange, symbol, priceIntgr);
  }

  @Get("/format-validity/quantity/:exchange")
  @ApiOperation({
    summary: "For a given symbol from a given exchange, check whether the quantity format complies with the exchange's rules.",
    description: `
      For a given symbol from a given exchange, check whether the quantity format complies with the exchange's rules.
      When sending a trade to an exchange, certain rules must be respected. Otherwise, the exchange will reject the order.

      If the trade quantity is not compliant, the api returns a compliant format suggestion.
    `,
  })
  @ApiResponse({
    status: 200,
    isArray: true,
  })
  @ApiQuery({
    name: "quantity",
    type: Number,
    required: true,
    example: "price=11234.8765",
  })
  @ApiQuery({
    name: "symbol",
    type: String,
    required: true,
    example: "XBTUSD",
    description: `
    Param "symbol" must be market's symbol on the exchange (e.g. XBTUSD for BTC/USD on binance).
    
    To retrieve a symbol from a market, you can request endpoint  "/api/settings/trades/formats/{exchange}?symbols={symbol}
    
    Is not case sensitive.
    `,
  })
  @ApiParam({
    name: "exchange",
    type: String,
    required: true,
    example: "ftx",
  })
  async checkQuantityFormat(@Param("exchange") exchange: string, @Query("symbol") symbol: string, @Query("quantity") quantity: string) {
    if (!symbol) {
      throw new Error("Symbol param is missing, please check your request url");
    }
    if (!quantity) {
      throw new Error("Quantity param is missing, please chech your request url");
    }

    const quantityIntgr: number = parseFloat(quantity);
    if (Number.isNaN(quantityIntgr)) {
      throw new Error("Quantity is not a number. Please check your query params.");
    }

    return this.tradeFormatValidityService.checkQuantityFormatOnly(exchange, symbol, quantityIntgr);
  }
}
