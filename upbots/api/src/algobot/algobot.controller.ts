import {
  BadRequestException,
  Body,
  CacheInterceptor,
  Controller,
  DefaultValuePipe,
  Delete,
  Request,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { mongo, Types } from "mongoose";
import AdminGuard from "../shared/admin.guard";
import { OrderTrackingDto } from "../trade/model/order-tracking.dto";
import {
  AlgobotSubscriptionStateRequest as BotSubscriptionStateRequest,
  AlgobotSubscriptionStateResponseDto as BotSubscriptionStateResponseDto,
  BotSubscriptionDeletedDto,
} from "../trade/model/algobot-subscription-dto";
import { BotOrderTrackingDto } from "../trade/model/bot-order-tracking.dto";
import {
  AlgobotReviewRecord,
  CloseBotOrderRequestDto,
  DeleteReviewRequestDto,
  FollowBotRequestDto,
  FollowBotResponseDto,
  RateAlgobotRequestDto,
} from "../trade/model/algobot-dto";
import { UserIdentity } from "../types";
import UserFromJWT from "../utilities/user.decorator";
import AlgobotService from "./services/algobot-service";
import { AlgoBotRankingDto, AlgoBotRatingDto, AlgoBotsDto, AlgoBotsUpdateDto } from "./models/algobot.dto";
import AlgobotDataService from "./services/algobot.data-service";
import validationPipe from "../shared/validation.pipe";
import AlgobotsSubscriptionDto from "./models/algobot-subscription.dto";
import AdminAlgobotsSubscriptionDto from "./models/admin-algobot-subscription.dto";
import AlgobotsSubscriptionAuditDto from "./models/algobot-subscription-audit.dto";

@ApiTags("algobots")
@Controller("algobots")
@UseGuards(AuthGuard("jwt"))
export default class AlgobotController {
  private readonly logger = new Logger(AlgobotController.name);

  constructor(private service: AlgobotDataService, private grpcService: AlgobotService) {}

  @Get("")
  @ApiOperation({
    summary: "Returns the list of active webhook-triggered algo bot (smart-bot)",
    description: `Returns the list of active webhook-triggered algo bot (smart-bot)`,
  })
  @ApiResponse({
    status: 200,
    type: AlgoBotsDto,
    isArray: true,
    description: "success",
  })
  // @UseInterceptors(CacheInterceptor)
  listAll(@UserFromJWT() user: UserIdentity, @Query("type") type: string): Promise<AlgoBotsDto[]> {
    return this.service.getAllActiveWebhookBots(user.id, type);
  }

  @Get("subscriptions")
  @ApiOperation({
    summary: "Returns the bot subscriptions for the logged in user (bot subscriptions)",
    description: `Returns the bot subscriptions for the logged in user (bot subscriptions)`,
  })
  @ApiResponse({
    status: 200,
    type: AlgobotsSubscriptionDto,
    isArray: true,
    description: "success",
  })
  listMyBotSubscriptions(@UserFromJWT() user: UserIdentity): Promise<AlgobotsSubscriptionDto[]> {
    return this.service.getMyBotSubscriptions(user.id);
  }

  @Get("subscriptions/:botId")
  @ApiOperation({
    summary: "Returns the bot subscriptions for the logged in user (bot subscriptions)",
    description: `Returns the bot subscriptions for the logged in user (bot subscriptions)`,
  })
  @ApiResponse({
    status: 200,
    type: AlgobotsSubscriptionDto,
    isArray: true,
    description: "success",
  })
  getMyBotSubscriptionsById(@UserFromJWT() user: UserIdentity, @Param("botId") botId: string): Promise<AlgobotsSubscriptionDto> {
    return this.service.getMyBotSubscriptionsById(user.id, botId);
  }

  @Get("total-bot-subscribers")
  @ApiOperation({
    summary: "Returns the total number of bot subscribers",
    description: `Returns the total number of bot subscribers`,
  })
  @ApiResponse({
    status: 200,
    type: Number,
    isArray: false,
    description: "success",
  })
  countTotalBotSubscriber(): Promise<number> {
    return this.service.getTotalBotSubscribers();
  }

  @Get("total-active-bots")
  @ApiOperation({
    summary: "Returns the total active bots",
    description: `Returns the total active bots`,
  })
  @ApiResponse({
    status: 200,
    type: Number,
    isArray: false,
    description: "success",
  })
  countTotalActiveBots(): Promise<number> {
    return this.service.getTotalActiveBots();
  }

  @Get("subscriptionaudits")
  @ApiOperation({
    summary: "Returns audit trail on whether algobot signal could be followed by the user and/or subscription error",
  })
  @ApiResponse({
    status: 200,
    type: AlgobotsSubscriptionAuditDto,
    isArray: true,
    description: "success",
  })
  listMyBotSubscriptionAudits(
    @UserFromJWT() user: UserIdentity,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number,
    @Query("s", new DefaultValuePipe(10), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number,
    @Query("b") botId: string,
    @Query("sub") botSubId: string
  ): Promise<AlgobotsSubscriptionAuditDto[]> {
    if (botId) {
      if (!Types.ObjectId.isValid(botId)) {
        throw new UnprocessableEntityException("invalid b parameter");
      }
    }
    if (botSubId) {
      if (!Types.ObjectId.isValid(botSubId)) {
        throw new UnprocessableEntityException("invalid sub parameter");
      }
    }
    if (botId === "") {
      // eslint-disable-next-line no-param-reassign
      botId = null;
    }
    if (botSubId === "") {
      // eslint-disable-next-line no-param-reassign
      botSubId = null;
    }
    return this.service.getMyBotSubscriptionAudits(user.id, page, pageSize, botId, botSubId);
  }

  @Post("/subscribe")
  @ApiOperation({
    summary: "Subscribes the user to the specified bot (follow bot)",
    description: `Subscribes the user to the specified bot. When user subscribed to a bot, trade engine will replicate bot trades (open or close position).`,
  })
  @ApiResponse({
    status: 200,
    type: FollowBotResponseDto,
    description: "success",
  })
  followAlgoBot(@UserFromJWT() user: UserIdentity, @Body(validationPipe) data: FollowBotRequestDto): Promise<FollowBotResponseDto> {
    this.logger.debug(`followAlgoBot dto:${JSON.stringify(data)}`);
    return this.grpcService.followAlgoBot(user.id, data);
  }

  @Post("/close-bot-order")
  @ApiOperation({})
  @ApiResponse({
    status: 200,
    type: FollowBotResponseDto,
    description: "success",
  })
  closeBotOrder(@UserFromJWT() user: UserIdentity, @Body() data: CloseBotOrderRequestDto): Promise<any> {
    this.logger.debug(`closeBotOrder dto:${JSON.stringify(data)}`);
    return this.grpcService.closeBotOrder(user.id, data.botId, data.botSubId, data.stratType);
  }

  @Get(":botId/details")
  @ApiOperation({ summary: "(deprecated will soon be removed) get user's orders related to a particular bot (algobot)" })
  @ApiResponse({
    status: 200,
    type: OrderTrackingDto,
    description: "list orders and exchange event details linked to a user and bot",
    isArray: true,
  })
  async getMyBotOrderDetails(@UserFromJWT() user: UserIdentity, @Param("botId") botId: string): Promise<OrderTrackingDto[]> {
    if (!user) {
      throw new BadRequestException();
    }
    return this.service.getMyBotOrderDetails(user.id, botId);
  }

  @Get(":botRef/seeddetails")
  @ApiOperation({ summary: "(deprecated will soon be removed) get seed orders related to a particular bot (algobot)" })
  @ApiResponse({
    status: 200,
    type: BotOrderTrackingDto,
    description: "list seed orders and exchange event details linked to a bot",
    isArray: true,
  })
  async getBotSeedOrderDetails(@UserFromJWT() user: UserIdentity, @Param("botRef") botRef: string): Promise<BotOrderTrackingDto[]> {
    if (!user) {
      throw new BadRequestException();
    }
    return this.service.getBotSeedOrderDetails(botRef);
  }

  @Get("ranking")
  @ApiOperation({ summary: "get algobots ranking" })
  @ApiResponse({
    status: 200,
    type: AlgoBotRankingDto,
    description: "algobots ranking data by followers",
    isArray: true,
  })
  async getBotsRanking(): Promise<AlgoBotRankingDto[]> {
    return this.service.getAlgoBotsRanking();
  }

  @Put("subscription/pause")
  @ApiOperation({ summary: "pause (disable) user's subscription to algobot. (no more automatic trading)" })
  @ApiResponse({ status: 200, type: BotSubscriptionStateResponseDto })
  async pauseAlgobotSubscription(
    @UserFromJWT() user: UserIdentity,
    @Body(validationPipe) data: BotSubscriptionStateRequest
  ): Promise<BotSubscriptionStateResponseDto> {
    if (!user) {
      throw new BadRequestException();
    }
    return this.grpcService.applySusbscriptionState(user.id, data.subId, true);
  }

  @Put("subscription/resume")
  @ApiOperation({ summary: "pause (disable) user's subscription to algobot. (no more automatic trading)" })
  @ApiResponse({ status: 200, type: BotSubscriptionStateResponseDto })
  async resumeAlgobotSubscription(
    @UserFromJWT() user: UserIdentity,
    @Body(validationPipe) data: BotSubscriptionStateRequest
  ): Promise<BotSubscriptionStateResponseDto> {
    if (!user) {
      throw new BadRequestException();
    }
    const isResumableSubscription = await this.service.isResumableSubscription(user.id, data.botId);
    if (!isResumableSubscription) {
      return {
        subId: data.subId,
        enabled: false,
      };
    }
    return this.grpcService.applySusbscriptionState(user.id, data.subId, false);
  }

  @Put("/subscription/accountpercent")
  @ApiOperation({
    summary: "Update account percent of algobot subscription",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  UpdateAlgobotSubscriptionAccountPercent(@UserFromJWT() user: UserIdentity, @Body() payload: any): Promise<boolean> {
    return this.service.updateAlgobotSubscriptionAccountPercent(user.id, payload.subscriptionId, payload.percentage);
  }

  @Put("/subscription/position-size")
  @ApiOperation({
    summary: "Update account position size of algobot subscription",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  UpdateAlgobotSubscriptionPositionSize(@UserFromJWT() user: UserIdentity, @Body() payload: any): Promise<boolean> {
    return this.service.updateAlgobotSubscriptionPositionSize(
      user.id,
      payload.subscriptionId,
      payload.percentage,
      payload.positionType,
      payload.positionAmount
    );
  }

  @Put("/subscription/accountkey")
  @ApiOperation({
    summary: "Update account key of algobot subscription",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  UpdateAlgobotSubscriptionAccountKey(@UserFromJWT() user: UserIdentity, @Body() payload: any): Promise<boolean> {
    return this.service.updateAlgobotSubscriptionAccountKey(user.id, payload.subscriptionId, payload.keyId, payload.accountType);
  }

  @Delete("subscription/:botId/:subId")
  @ApiOperation({ summary: "delete user's subscription to algobot" })
  @ApiResponse({ status: 200, type: BotSubscriptionDeletedDto })
  async deleteBotSubscription(
    @UserFromJWT() user: UserIdentity,
    @Param("botId") botId: string,
    @Param("subId") subId: string
  ): Promise<BotSubscriptionDeletedDto> {
    if (!user) {
      throw new BadRequestException();
    }

    if (!mongo.ObjectId.isValid(subId)) {
      throw new BadRequestException("invalid identifier");
    }

    return this.grpcService.deleteSubscription(user.id, botId, subId);
  }

  @Post("/admin/algobot")
  @ApiOperation({})
  @ApiResponse({
    status: 200,
    description: "success",
  })
  @UseGuards(AdminGuard)
  createBotByAdmin(@UserFromJWT() user: UserIdentity, @Body(validationPipe) data: any): Promise<any> {
    return this.grpcService.createAlgoBotByAdmin(user.id, data);
  }

  @Delete("/admin/algobot/:botId")
  @ApiOperation({})
  @ApiResponse({
    status: 201,
    description: "success",
  })
  @UseGuards(AdminGuard)
  deleteBotByAdmin(@Param("botId") botId: string): Promise<any> {
    return this.service.deleteAlgobot(botId);
  }

  @Get("admin/subscriptions")
  @ApiOperation({
    summary: "Returns all the bot subscriptions for admin the logged in user",
    description: `Returns all the bot subscriptions for admin the logged in user`,
  })
  @ApiResponse({
    status: 200,
    type: AdminAlgobotsSubscriptionDto,
    isArray: true,
    description: "success",
  })
  @UseGuards(AdminGuard)
  listAllBotSubscriptionsForAdmin(@UserFromJWT() user: UserIdentity): Promise<AdminAlgobotsSubscriptionDto[]> {
    this.logger.log(`admin user ${user.id} listAllBotSubscriptions`);
    return this.service.getAllBotSubscriptionsForAdmin();
  }

  @Get("admin/subscriptionaudits")
  @ApiOperation({
    summary: "return user botsusbcription audit trail history (Admin may query by user id)",
  })
  @ApiResponse({
    status: 200,
    type: AlgobotsSubscriptionAuditDto,
    isArray: true,
    description: "success",
  })
  @UseGuards(AdminGuard)
  getAdiminBotSubscriptionAuditsForUser(
    @UserFromJWT() user: UserIdentity,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number,
    @Query("s", new DefaultValuePipe(10), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number,
    @Query("u") userId: string,
    @Query("em") email: string,
    @Query("b") botId: string,
    @Query("signal") signalId: string
  ): Promise<AlgobotsSubscriptionAuditDto[]> {
    return this.service.getAdminBotSubscriptionAuditsForUser({
      page,
      pageSize,
      userId,
      email,
      botId,
      signalId,
    });
  }

  /**
   * Update bot owners
   */
  @Put("/owner-id")
  @ApiOperation({
    summary: "Update bot owner",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  @UseGuards(AdminGuard)
  UpdateAlgobotOwner(@Body() payload: { botId: string; email: string }): Promise<boolean> {
    return this.service.updateAlgobotOwnerByEmail(payload.botId, payload.email);
  }

  @Put(":botId/picture")
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("file"))
  async updateBotPicture(@Param("botId") botId: string, @UploadedFile() file) {
    const fileBase64 = file.buffer.toString("base64");

    if (fileBase64.length > 2500000) {
      throw new BadRequestException("Profile picture is too large! Please Crop it.");
    }
    return this.service.updateAlgobotPicture(botId, file);
  }

  @Put(":botId")
  @UseGuards(AuthGuard("jwt"))
  async updateBot(@Param("botId") botId: string, @Body() payload: AlgoBotsUpdateDto, @Request() req) {
    return this.service.updateAlgobot(botId, payload);
  }

  @Get("/bot-rating/:botId")
  @ApiOperation({ summary: "get the rating info of a bot" })
  @ApiResponse({
    status: 200,
    type: AlgoBotRatingDto,
    description: "get the rating info of a bot",
  })
  async getAlgobotRatingInfo(@UserFromJWT() user: UserIdentity, @Param("botId") botId: string): Promise<AlgoBotRatingDto> {
    if (!user) {
      throw new BadRequestException();
    }
    return this.service.getAlgobotRatingInfo({ userId: user.id, botId });
  }

  @Get("/bot-review/:botId/:page?")
  @ApiOperation({ summary: "get the algobot review data" })
  @ApiResponse({
    status: 200,
    type: AlgobotReviewRecord,
    isArray: true,
    description: "get the algobot review data with page number",
  })
  async getAlgobotReview(
    @UserFromJWT() user: UserIdentity,
    @Param("botId") botId: string,
    @Param("page") page?: number
  ): Promise<AlgobotReviewRecord[]> {
    if (!user) {
      throw new BadRequestException();
    }
    return this.service.getAlgobotReview({ botId, page });
  }

  @Post("/rate-a-bot")
  @ApiOperation({
    summary: "Rate algobot (add/edit)",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  rateAlgobot(@UserFromJWT() user: UserIdentity, @Body() data: RateAlgobotRequestDto): Promise<boolean> {
    return this.service.rateAlgobot({ userId: user.id, botId: data.botId, vote: data.vote, comment: data.comment });
  }

  @Delete("/bot-review/:botId")
  @ApiOperation({
    summary: "Delete a bot review",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  deleteReview(@UserFromJWT() user: UserIdentity, @Param("botId") botId: string): Promise<boolean> {
    return this.service.deleteReview({ userId: user.id, botId });
  }

  @Get(":botId/trading-history")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "upload trading history of one selected bot",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  async getBotTradingHistory(@Param("botId") botId: string) {
    return this.service.getBotSignalTracking(botId);
  }

  @Post(":botId/trading-history")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "upload trading history of one selected bot",
  })
  @ApiResponse({
    status: 200,
    description: "success",
  })
  async createBotTradingHistory(@Param("botId") botId: string, @Body() body, @Request() req) {
    return this.service.createSignalTracking({ payload: body, botId });
  }
}
