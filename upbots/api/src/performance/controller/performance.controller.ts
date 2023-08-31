import { CacheInterceptor, Controller, Get, Post, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import AdminGuard from "src/shared/admin.guard";
import DeveloperGuard from "src/shared/developer.guard";
import PerformanceService from "../services/performance.service";
import { PerformanceSnapshotDto, PerformanceCycleDto, PublicAlgobotPerformanceDto } from "../models/performance.models";
import AdminPerformanceCycleDto from "../models/admin-performance.dto";
import AlgobotPerfAggregateService from "../services/algobots-perf-aggregate-service";
import { AlgoBotsWithSnapShotPerformanceDto, MyTradeDto } from "../models/algobot-with-performance.dto";
import AlgoBotStatsDto from "../../algobot/models/algobot-stats.dto";
import PerformanceServiceData from "../services/performance.service.data";
import UserFromJWT from "../../utilities/user.decorator";
import { UserIdentity } from "../../types";

@ApiTags("performance")
@Controller("performance")
// UseGuards for each private endpoint excl public
export default class PerformanceController {
  constructor(
    private performanceSvc: PerformanceService,
    private performanceServiceData: PerformanceServiceData,
    private aggrSvc: AlgobotPerfAggregateService
  ) {}

  @Get("/subscription/:botSubId/cycles/six-months")
  @ApiOperation({ summary: "for a given bot subscription get cycles of the last six months" })
  @ApiResponse({
    status: 200,
    type: PerformanceCycleDto,
    description: "for a given bot subscription get cycles of the last six months",
    isArray: true,
  })
  @UseGuards(AuthGuard("jwt"))
  getLastSixMonthSubscriptionCycles(@Param("botSubId") botSubId: string): Promise<PerformanceCycleDto[]> {
    return this.performanceSvc.getSixPastMonthsSubscriptionCycles(botSubId);
  }

  @Get("/subscription/:botSubId/snapshot/six-months")
  @ApiOperation({ summary: "for a given bot subscription get the performance snapshot of the last six months" })
  @ApiResponse({
    status: 200,
    type: PerformanceSnapshotDto,
    isArray: false,
  })
  @UseGuards(AuthGuard("jwt"))
  getSixPastMonthsSubscriptionSnapshot(@Param("botSubId") botSubId: string): Promise<PerformanceSnapshotDto> {
    return this.performanceSvc.getSixPastMonthsSubscriptionSnapshot(botSubId);
  }

  @Get("/bot/:botId/cycles/six-months")
  @ApiOperation({ summary: "for a given bot get cycles of the last six months" })
  @ApiResponse({
    status: 200,
    type: PerformanceCycleDto,
    description: "for a given bot get cycles of the last six months",
    isArray: true,
  })
  @UseGuards(AuthGuard("jwt"))
  getLastSixMonthBotCycles(@Param("botId") botId: string): Promise<PerformanceCycleDto[]> {
    return this.performanceSvc.getSixPastMonthsBotCycles(botId);
  }

  /*
  @Get("/bots/cycles/six-months")
  @ApiOperation({
    summary: "algobots and cycle perf data",
  })
  @ApiResponse({
    status: 200,
    type: AlgoBotsWithPerformanceDto,
    isArray: true,
    description: "success",
  })
  getAlgobotsWithCyclePerformance(): Promise<AlgoBotsWithPerformanceDto[]> {
    // TODO: add cache
    return this.aggrSvc.getAllBotsWithPerformance6MonthsCycle();
  }
  */

  @Get("/bot/:botId/snapshot/six-months")
  @ApiOperation({ summary: "for a given bot get the performance snapshot of the last six months" })
  @ApiResponse({
    status: 200,
    type: PerformanceSnapshotDto,
    isArray: false,
  })
  @UseGuards(AuthGuard("jwt"))
  getSixPastMonthsBotSnapshot(@Param("botId") botId: string): Promise<AlgoBotsWithSnapShotPerformanceDto> {
    return this.aggrSvc.getSnapshot6MonthsForSpecificBot(botId);
  }

  @Get("/bots/snapshot/six-months")
  // @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: "algobots and snapshot perf data",
  })
  @ApiResponse({
    status: 200,
    type: AlgoBotsWithSnapShotPerformanceDto,
    isArray: true,
    description: "success",
  })
  @UseGuards(AuthGuard("jwt"))
  getAlgobotsWithSnapshotPerformance(): Promise<AlgoBotsWithSnapShotPerformanceDto[]> {
    return this.aggrSvc.getAllBotsWithSnapshot6Months();
  }

  //* Public endpoint bot performannce *//
  @Get("/public/bots/snapshot/six-months")
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: "public algobots and snapshot perf data",
  })
  @ApiResponse({
    status: 200,
    type: PublicAlgobotPerformanceDto,
    isArray: true,
    description: "success",
  })
  getAlgobotsWithSnapshotPerformancePublic(): Promise<PublicAlgobotPerformanceDto[]> {
    return this.aggrSvc.getPublicAlgobotPerformanceData();
  }

  @Get("/user-bots/:userId/cycles/six-months")
  @ApiOperation({ summary: "for a given user get bot cycles of the last six months" })
  @ApiResponse({
    status: 200,
    type: PerformanceCycleDto,
    isArray: true,
  })
  @UseGuards(AuthGuard("jwt"))
  getLastSixMonthUserCycles(@Param("userId") userId: string): Promise<PerformanceCycleDto[]> {
    return this.performanceSvc.getSixPastMonthsUserCycles(userId);
  }

  @Get("admin/cycles/six-months")
  @ApiOperation({
    summary: "Returns the performance cycles of the last six months for all the bot subscriptions for an admin logged user",
    description: `Returns all the performance cycles related to bot subscriptions for an admin logged user`,
  })
  @ApiResponse({
    status: 200,
    type: AdminPerformanceCycleDto,
    isArray: true,
  })
  @UseGuards(AdminGuard)
  getAllLastSixMonthSubscriptionCycles(): Promise<AdminPerformanceCycleDto[]> {
    return this.performanceSvc.getAllSixPastMonthsSubscriptionCycles();
  }

  @Get("/user-bots-stats")
  @ApiOperation({ summary: "bots stats by user id" })
  @UseGuards(DeveloperGuard)
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({
    status: 200,
    type: AlgoBotStatsDto,
    isArray: true,
  })
  getBotStatsByUser(@UserFromJWT() user: UserIdentity): Promise<AlgoBotStatsDto[]> {
    return this.performanceServiceData.getBotStatsByUser(user.id);
  }

  @Get("my-trades")
  @ApiOperation({ summary: "get my trades" })
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({
    status: 200,
    type: MyTradeDto,
    description: "get my trades data",
    isArray: true,
  })
  async getMyTrades(@UserFromJWT() user: UserIdentity): Promise<MyTradeDto[]> {
    return this.performanceServiceData.getMyTradesData(user.id);
  }

  @Post(":botId/update-theorical-cycles")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({})
  @ApiResponse({
    status: 200,
    description: "success",
  })
  async updateBotTheoricalCycles(@Param("botId") botId: string) {
    await this.performanceServiceData.removePerformanceCycleByCondition({ botId });
    return this.performanceSvc.computeAndSaveSixMonthOfOneBotTheoricalCycles(botId);
  }
}
