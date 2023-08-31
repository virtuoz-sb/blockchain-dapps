import { Controller, Get, UseGuards, UseInterceptors, CacheInterceptor, Param, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import SettingsService from "./services/settings.service";
import { ExchangeSettingsReponse, TradeFormatsDto } from "./models/exchange-settings.dto";
import { PageSettingsDto } from "./models/page/page-settings";

@ApiTags("settings")
@Controller("settings")
@UseGuards(AuthGuard("jwt"))
@UseInterceptors(CacheInterceptor)
export default class SettingsController {
  constructor(private settingsSrv: SettingsService) {}

  @Get("exchanges")
  @ApiOperation({
    summary: "Get Upbots exchange settings",
    description: `
        Get the settings of exchanges in upbots.

        1) Gets the list of exchanges that upbots allows you to connect to. As a user, you can record API keys from those exchanges.

        2) For each exchange, it returns the pairs for which you can create trade orders.

        Note: data are seeded by the SeedModule.
        `,
  })
  @ApiResponse({
    status: 200,
    type: ExchangeSettingsReponse,
    description: "Return application settings for exchanges (allowed exchanges and pairs for trading)",
  })
  getExchangesSetting(): Promise<ExchangeSettingsReponse> {
    return this.settingsSrv.getExchangesSettings();
  }

  @Get("contract-size/:exchange/:base/:quote")
  @ApiOperation({
    summary: "Get Contract size",
  })
  @ApiResponse({
    status: 200,
    type: ExchangeSettingsReponse,
    description: "Return contract size",
  })
  getContractSize(@Param("exchange") exchange: string, @Param("base") base: string, @Param("quote") quote: string): Promise<number> {
    return this.settingsSrv.getContractSize(exchange, base, quote);
  }

  @Get("pages")
  @ApiOperation({
    summary: "Get Upbots pages settings",
    description: `
        Get the settings of pages in upbots.

        For each route of the app, indicates whether the page is coming soon

        Note: data are seeded by the SeedModule.
        `,
  })
  @ApiResponse({
    status: 200,
    description: "Return application settings for pages",
    type: PageSettingsDto,
    isArray: true,
  })
  async getPagesSettings(): Promise<PageSettingsDto[]> {
    return this.settingsSrv.getPagesSettings();
  }

  @Get("trades/formats/:exchange")
  @ApiOperation({
    summary: "For a given exchange, get the list of rules to respect for orders formats (price/amount)",
    description: `
      For a given exchange, return the list of rules to respect for orders formats (price/amount).
      When sending a trade to an exchange, those rules must be respected. Otherwise, the exchange will reject the order.

      The route supports filters on market or symbol where:
      - market is the pair label on the exchange (e.g. BTC/USD)
      - symbol is the id of the pair (e.g. XBTUSD)

      e.g. : on bitmex "Bitcoin perpetual future contract" market is BTC/USD and symbol is XBTUSD.
    `,
  })
  @ApiResponse({
    status: 200,
    description: "", // TO DO when creating mongo collection
    isArray: true,
  })
  @ApiParam({
    name: "exchange",
    type: String,
    required: true,
    example: "ftx",
  })
  @ApiQuery({
    name: "markets",
    type: String,
    required: false,
    description: "Array of strings comma-delimited. Can be upper or lower case.",
    example: "markets=BTC/USDT,FTT/USD",
    isArray: true,
  })
  @ApiQuery({
    name: "symbols",
    type: String,
    required: false,
    description: "Array of strings comma-delimited. Can be upper or lower case.",
    example: "symbols=xbtusd,fttusd",
    isArray: true,
  })
  getOrderFormats(
    @Param("exchange") exchange: string,
    @Query("markets") markets: string,
    @Query("symbols") symbols: string
  ): Promise<TradeFormatsDto> {
    let marketsArr: Array<string>;
    if (markets) {
      marketsArr = markets.toUpperCase().split(",");
    }
    let symbolsArr: Array<string>;
    if (symbols) {
      symbolsArr = symbols.toUpperCase().split(",");
    }

    return this.settingsSrv.getOrderFormats(exchange, marketsArr, symbolsArr);
  }
}
