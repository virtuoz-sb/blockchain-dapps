import {
  BadRequestException,
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Logger,
  Param,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import UserFromJWT from "../utilities/user.decorator";
import RouteSegments from "../utilities/route-segment-name";
import { UserIdentity } from "../types";
import TradeBalanceService from "./services/trade-balance.service";
import { TradableBalanceOverview } from "./models/free-balance.dto";

@UseGuards(AuthGuard("jwt"))
@ApiTags(RouteSegments.Portfolio)
@Controller(RouteSegments.Portfolio)
export default class TradeBalanceController {
  private readonly logger = new Logger(TradeBalanceController.name);

  constructor(private balanceSvc: TradeBalanceService) {}

  @Get("trade-balance/:accountId")
  @ApiOperation({
    summary: "Get current available balance for trading on a particular key (accountId is the exchange key identifier)",
  })
  @ApiResponse({
    status: 200,
    type: TradableBalanceOverview,
    description: "success",
  })
  @CacheTTL(60) // in seconds
  @UseInterceptors(CacheInterceptor)
  async getBalanceForTrading(
    @UserFromJWT() user: UserIdentity,
    @Param("accountId") accountKeyId: string
  ): Promise<TradableBalanceOverview> {
    if (!accountKeyId) {
      throw new BadRequestException("key is mandatory");
    }
    const result = await this.balanceSvc.getBalanceForTrading(user?.id, accountKeyId);
    this.logger.debug(`getBalanceForTrading for user ${user.id} result ${JSON.stringify(result)}`);
    return result;
  }
}
