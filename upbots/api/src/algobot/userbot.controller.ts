import {
  BadRequestException,
  Body,
  CacheInterceptor,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  HttpService,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { mongo, Types } from "mongoose";
import * as stringHash from "string-hash";
import AdminGuard from "../shared/admin.guard";
import { OrderTrackingDto } from "../trade/model/order-tracking.dto";
import {
  AlgobotSubscriptionStateRequest as BotSubscriptionStateRequest,
  AlgobotSubscriptionStateResponseDto as BotSubscriptionStateResponseDto,
  BotSubscriptionDeletedDto,
} from "../trade/model/algobot-subscription-dto";
import { BotOrderTrackingDto } from "../trade/model/bot-order-tracking.dto";
import { FollowBotRequestDto, FollowBotResponseDto, CloseBotOrderRequestDto } from "../trade/model/algobot-dto";
import { UserIdentity } from "../types";
import UserFromJWT from "../utilities/user.decorator";
import AlgobotService from "./services/algobot-service";
import { AlgoBotsDto, UserBotCreateDto, UserBotWebhookMessageDto, UserBotWebhookDto } from "./models/algobot.dto";
import AlgobotDataService from "./services/algobot.data-service";
import validationPipe from "../shared/validation.pipe";
import AlgobotsSubscriptionDto from "./models/algobot-subscription.dto";
import AdminAlgobotsSubscriptionDto from "./models/admin-algobot-subscription.dto";
import AlgobotsSubscriptionAuditDto from "./models/algobot-subscription-audit.dto";

@ApiTags("algobots")
@Controller("algobots/userbot")
export default class UserBotController {
  private readonly logger = new Logger(UserBotController.name);

  constructor(private readonly httpService: HttpService, private service: AlgobotDataService, private grpcService: AlgobotService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post("")
  @ApiOperation({
    summary: "Create a user bot",
  })
  @ApiResponse({
    status: 200,
    type: FollowBotResponseDto,
    description: "success",
  })
  createUserBot(@UserFromJWT() user: UserIdentity, @Body(validationPipe) data: UserBotCreateDto): Promise<FollowBotResponseDto> {
    this.logger.debug(`createUserBot dto:${JSON.stringify(data)}`);
    return this.grpcService.createUserBot(user.id, data);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("webhook/:botId")
  @ApiResponse({
    status: 200,
    description: "success",
  })
  async getWebhookMessage(@UserFromJWT() user: UserIdentity, @Param("botId") botId: string): Promise<UserBotWebhookMessageDto> {
    const webhookSecrets = process.env.WEBHOOK_SECRET.split(" ");
    const bot = await this.service.getAlgobotById(botId);
    const creatorHash = await stringHash(bot.creator);
    const messages = [];
    if (bot.stratType === "LONG" || bot.stratType === "LONG_SHORT") {
      messages.push({
        botId,
        stratType: "LONG",
        position: "open",
        userFilter: [user.id],
        secret: `${webhookSecrets[0]}.upbots.${creatorHash}`,
      });
      messages.push({
        botId,
        stratType: "LONG",
        position: "close",
        userFilter: [user.id],
        secret: `${webhookSecrets[0]}.upbots.${creatorHash}`,
      });
    }
    if (bot.stratType === "SHORT" || bot.stratType === "LONG_SHORT") {
      messages.push({
        botId,
        stratType: "SHORT",
        position: "open",
        userFilter: [user.id],
        secret: `${webhookSecrets[0]}.upbots.${creatorHash}`,
      });
      messages.push({
        botId,
        stratType: "SHORT",
        position: "close",
        userFilter: [user.id],
        secret: `${webhookSecrets[0]}.upbots.${creatorHash}`,
      });
    }
    const response: UserBotWebhookMessageDto = {
      webhookURL: `${process.env.API_URL}/api/algobots/userbot/webhook`,
      messages,
    };
    return Promise.resolve(response);
  }

  @Post("webhook")
  @ApiOperation({})
  @ApiResponse({
    status: 200,
    description: "success",
  })
  async sendWebhook(@UserFromJWT() user: UserIdentity, @Body() data: UserBotWebhookDto): Promise<AlgoBotsDto> {
    this.logger.debug(`send Userbot Webhook dto:${JSON.stringify(data)}`);
    const apiUrl = `${process.env.API_URL}/api/hook/algobot/`;
    // const webhookSecrets = process.env.WEBHOOK_SECRET.split(" ");
    const payload = {
      order: {
        ...data,
        // secret: webhookSecrets[0],
      },
    };
    try {
      const res = await this.httpService.post(apiUrl, payload).toPromise();
      return res.data;
    } catch (err) {
      this.logger.error(`send Userbot Webhook ERROR: ${err}`);
      return err;
    }
  }
}
