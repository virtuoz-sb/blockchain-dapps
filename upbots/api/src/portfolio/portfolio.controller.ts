import { Controller, Get, UseGuards, Logger, BadRequestException, Query, UseInterceptors, CacheTTL } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import * as moment from "moment";
import validationPipe from "../shared/validation.pipe";
import RouteSegments from "../utilities/route-segment-name";
import UserFromJWT from "../utilities/user.decorator";
import { UserIdentity } from "../types/user";
import { PortfolioSummary, PortfolioFiltered, UbxtBalance } from "./models/portfolio.dto";
import { GetPortfolioEvolutionDto } from "./models/evolution.schema";
import PortfolioService from "./services/portfolio.service";
import UserCacheInterceptor from "../cache-config/user-cache.interceptor";
import OptionalNumberDto from "./models/optional.query-string.dto";

@ApiTags(RouteSegments.Portfolio)
@Controller(RouteSegments.Portfolio)
export default class PortfolioController {
  private readonly logger = new Logger(PortfolioController.name);

  constructor(private service: PortfolioService) {}

  @Get("evolution")
  // @UseInterceptors(UserCacheInterceptor) //WARN: cache invalidation almost impossible due to variating qsParams
  @ApiOperation({
    summary: "Get portfolio evolution for a given user.",
    description: `
      For a given user, return the portfolio evolution valued in BTC, EUR and USD.

      Supports filters on start and end date.
      At least one param start or end is mandatory.

      Can also specify accounts to return, but will return all user's accounts by default.
    `,
  })
  @ApiQuery({
    name: "start",
    type: String,
    required: true,
    example: "start=YYYY-MM-DD",
  })
  @ApiQuery({
    name: "end",
    type: String,
    required: true,
    example: "end=YYYY-MM-DD",
  })
  @ApiQuery({
    name: "accountsIds",
    type: String,
    required: false,
    description: "Only accepts array of Mongo Object Id in comma separator format",
    example: "accountIds=mongoId1,mongoId2,mongoId3",
    isArray: true,
  })
  @ApiResponse({
    status: 200,
    type: GetPortfolioEvolutionDto,
    isArray: true,
    description: `
      For a given user:
      
      - Returns aggregated portfolio value evolution (BTC, EUR, USD) in time.
      - Returns portfolio value evolution (BTC, EUR, USD) in time per account.
    `,
  })
  @UseGuards(AuthGuard("jwt"))
  @CacheTTL(60) // in seconds
  @UseInterceptors(UserCacheInterceptor)
  async getPortforlioEvolution(
    @UserFromJWT() user: UserIdentity,
    @Query("start") start,
    @Query("end") end,
    @Query("accountsIds") accountsIds
  ) {
    const startDate: Date = moment.utc(start, "YYYY-MM-DD").startOf("day").toDate();
    const endDate: Date = moment.utc(end, "YYYY-MM-DD").endOf("day").toDate();

    if (!user) {
      throw new BadRequestException();
    }

    if (!start && !end) {
      throw new Error("At least one param start or end is mandatory.");
    }
    if (end < start) {
      throw new Error("Inconsistent date params found. Please check if start date is antecedent to end date.");
    }

    let ids: Array<string>;
    if (accountsIds) {
      ids = accountsIds.split(",");
    }

    const { id } = user;

    const response = await this.service.getPortforlioEvolution(id, startDate, endDate, ids);
    return response;
  }

  @ApiOperation({
    summary: "get all portfolio and accounts details (non filtered)",
    description: `Gets all your connected exchange portfolios`,
  })
  @ApiResponse({
    status: 200,
    type: PortfolioSummary,
    description: `returns connected wallet exchange keys with their balances`,
  })
  @Get("summary")
  @UseInterceptors(UserCacheInterceptor)
  @UseGuards(AuthGuard("jwt"))
  async getPortforlioSummary(
    @UserFromJWT() user: UserIdentity,
    @Query(validationPipe) optional: OptionalNumberDto
  ): Promise<PortfolioSummary> {
    if (!user) {
      throw new BadRequestException();
    }
    const { id } = user;
    this.logger.debug(`getPortforlioSummary usr ${id} query :${JSON.stringify(optional)}`, "PortfolioController");

    return this.service.getPortforlioSummary(id, null, null, optional?.take);
  }

  @ApiOperation({
    summary: "get filtered portfolio from key names filter",
    description: `Gets a subset of portfolio distribution and aggregated value`,
  })
  @Get("filter")
  @UseInterceptors(UserCacheInterceptor)
  @CacheTTL(60)
  @UseGuards(AuthGuard("jwt"))
  async getPortforlioFiltered(
    @UserFromJWT() user: UserIdentity,
    @Query("q") filter: string,
    @Query(validationPipe) optional: OptionalNumberDto
  ): Promise<PortfolioFiltered> {
    if (!user) {
      throw new BadRequestException();
    }
    const { id } = user;
    this.logger.debug(`getPortforlioFiltered usr ${id} filter=${filter} query :${JSON.stringify(optional)}`);

    return this.service.getPortforlioFiltered(id, filter, optional?.take);
  }

  @ApiOperation({
    summary: "get all portfolios (no filter and no account details)",
    description: `Gets all portfolio distribution and aggregated value`,
  })
  @Get("filter/all")
  @UseInterceptors(UserCacheInterceptor)
  @UseGuards(AuthGuard("jwt"))
  async getAllPortforlio(@UserFromJWT() user: UserIdentity): Promise<PortfolioFiltered> {
    if (!user) {
      throw new BadRequestException();
    }
    const { id } = user;
    Logger.debug(`getAllPortforlio`, "PortfolioController");

    return this.service.getPortforlioFilterAll(id);
  }

  @ApiOperation({
    summary: "Gets ubxt balances in btc / eur / usd",
    description: `Gets ubxt balances in btc / eur / usd`,
  })
  @Get("/ubxt-balance")
  @UseInterceptors(UserCacheInterceptor)
  @UseGuards(AuthGuard("jwt"))
  async getUbxtBalance(@UserFromJWT() user: UserIdentity): Promise<UbxtBalance> {
    if (!user) {
      throw new BadRequestException();
    }
    const { id } = user;
    return this.service.getUbxtBalance(id);
  }
}
