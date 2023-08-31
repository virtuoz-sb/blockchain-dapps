/* eslint-disable new-cap */
/* eslint-disable no-underscore-dangle */
import { Injectable, Logger, HttpService, UnprocessableEntityException, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Mongoose, Types } from "mongoose";
import MarketingAutomationService from "src/marketing-automation/marketing-automation.service";
import {
  DeleteSubscriptionRequest,
  FollowBotRequest,
  FollowBotResponse,
  PauseActionType,
  UserBotSubscriptionPauseRequest,
} from "../../proto/algobot/algobot_pb";
import { AlgobotServiceClient } from "../../proto/algobot/algobot_grpc_pb";
import { GRPC_CLIENT_ALGOBOT } from "../provider/algobot-grpc-client-factory";
import { AlgobotSubscriptionStateResponseDto, BotSubscriptionDeletedDto } from "../../trade/model/algobot-subscription-dto";
import { FollowBotRequestDto, FollowBotResponseDto } from "../../trade/model/algobot-dto";
import { UserBotCreateDto } from "../models/algobot.dto";
import { AlgoBotModel } from "../models/algobot.model";
import AlgobotDataService from "./algobot.data-service";
import MailService from "../../shared/mail.service";
import ExchangeKeyDataService from "../../exchange-key/services/exchange-key.data.service";

@Injectable()
export default class AlgobotService {
  private readonly logger = new Logger(AlgobotService.name);

  constructor(
    @InjectModel("AlgobotModel") private botModel: Model<AlgoBotModel>,
    private readonly httpService: HttpService,
    @Inject(GRPC_CLIENT_ALGOBOT)
    private readonly client: AlgobotServiceClient,
    private algobotDataService: AlgobotDataService,
    private readonly automationService: MarketingAutomationService,
    private mailService: MailService,
    private exchKeyDataService: ExchangeKeyDataService
  ) {}

  followAlgoBot(userId: string, data: FollowBotRequestDto): Promise<FollowBotResponseDto> {
    this.logger.debug(`followAlgoBot for userID: ${userId.toString()}`);
    this.validate(data);
    const requestMessage = this.createMessage(data, userId);
    this.logger.debug(`followAlgoBot, mapped:${requestMessage}`);

    const p = new Promise<FollowBotResponseDto>((resolve, reject) => {
      this.logger.debug(
        `followAlgoBot ${requestMessage.getBotid()} for userid: ${requestMessage.getUserid()}, keyRef: ${requestMessage.getApikeyid()}`
      );

      this.client.followAlgobot(requestMessage, (err, response) => {
        this.logger.debug("followAlgobot callback !!");

        if (err) {
          this.logger.error(`followAlgobot grpc ERROR for userID: ${userId.toString()} : ${err}`); // TODO: grpc error handling based on grpc error codes?
          return reject(err);
        }
        this.logger.debug(`followAlgobot grpc response for userID: ${userId.toString()} : ${response}`);
        if (response) {
          const created = response.toObject();
          // Enable Marketing Automation
          this.automationUserEnableBot(userId);

          // Nofity User via Email
          this.botSubscriptionNotificationByBotId(userId, data.botId, true);

          return resolve(this.mapResponse(created));
        }
        return reject(new Error("empty grpc response"));
      });
    });

    return p;
  }

  async applySusbscriptionState(userId, subscriptionId: string, putOnPause: boolean): Promise<AlgobotSubscriptionStateResponseDto> {
    const request = this.createPauseUnpauseRequest(subscriptionId, putOnPause);

    const p = new Promise<AlgobotSubscriptionStateResponseDto>((resolve, reject) => {
      this.logger.debug(`applySusbscriptionState putOnPause:${putOnPause} for userid: ${userId}, subscriptionId: ${subscriptionId}`);

      this.client.pauseUnpause(request, (err, response) => {
        this.logger.debug("pauseUnpause callback !!");

        if (err) {
          this.logger.error(`pauseUnpause grpc ERROR for userID: ${userId.toString()} : ${err}`); // TODO: grpc error handling based on grpc error codes?
          return reject(err);
        }
        this.logger.debug(`pauseUnpause grpc response for userID: ${userId.toString()} : ${response}`);
        if (response) {
          // Enable Marketing Automation
          if (putOnPause) {
            this.automationUserDisableBot(userId);
          } else {
            this.automationUserEnableBot(userId);
          }

          // Nofity User via Email
          this.botSubscriptionNotificationBySubId(userId, subscriptionId, !putOnPause);

          return resolve({ subId: response.getSubid(), enabled: response.getEnabled() } as AlgobotSubscriptionStateResponseDto);
        }
        return reject(new Error("empty grpc response"));
      });
    });

    return p;
  }

  async deleteSubscription(userId, botId: string, subscriptionId: string): Promise<BotSubscriptionDeletedDto> {
    const request = new DeleteSubscriptionRequest();
    request.setSubid(subscriptionId);

    const p = new Promise<BotSubscriptionDeletedDto>((resolve, reject) => {
      this.logger.debug(`deleteSubscription for userid: ${userId}, subscriptionId: ${subscriptionId}`);

      this.client.deleteSubscription(request, (err, response) => {
        this.logger.debug("deleteSubscription callback !!");

        if (err) {
          this.logger.error(`pauseUnpause  grpc ERROR for userID: ${userId.toString()} : ${err}`); // TODO: grpc error handling based on grpc error codes?
          return reject(err);
        }
        this.logger.debug(`pauseUnpause grpc response for userID: ${userId.toString()} : ${response}`);
        if (response) {
          // Enable Marketing Automation
          this.automationUserDisableBot(userId);

          // Nofity User via Email
          this.botSubscriptionNotificationBySubId(userId, subscriptionId, false);

          // Delete User bot
          this.deleteUserBot(userId, botId);

          return resolve({ ack: response.getAck() } as BotSubscriptionDeletedDto);
        }
        return reject(new Error("empty grpc response"));
      });
    });

    return p;
  }

  async deleteUserBot(userId: string, botId: string) {
    const userBot = await this.botModel.findOne({ _id: botId });
    if (userBot.category === "userbot") {
      await this.botModel.deleteOne({ _id: botId });
    }
  }

  async closeBotOrder(userId, botId, subscriptionId: string, stratType: string): Promise<boolean> {
    const apiUrl = `${process.env.API_URL}/api/hook/algobot/`;
    const payload = {
      order: {
        botId,
        userFilter: [userId],
        position: "close",
        stratType,
        secret: process.env.WEBHOOK_SECRET,
      },
    };
    try {
      const res = await this.httpService.post(apiUrl, payload).toPromise();
      const { data } = res;
      return data;
    } catch (err) {
      this.logger.error(`Close Bot order ERROR: ${err}`);
      return err;
    }
  }

  async createAlgoBotByAdmin(userId: string, payload: any) {
    const algoBotData = {
      ...payload,
      owner: userId,
      avgtrades: 1,
      ratings: 4.2,
      lastMonthTrades: 0,
      allocated: {
        maxamount: 50000,
        currency: "USDT",
      },
      reviews: {
        username: "",
        userimg: "",
        botrating: 5,
      },
      enabled: true,
    };
    let algoboBot = await new this.botModel(algoBotData);
    algoboBot = await algoboBot.save();
    return algoboBot;
  }

  async createUserBot(userId: string, payload: UserBotCreateDto) {
    // step1. create user bot
    /// ///////////////////////////////////
    const userBotData = {
      name: payload.name,
      botVer: "1",
      description: "",
      stratType: payload.stratType,
      category: "userbot",
      creator: "User",
      avgtrades: 1,
      ratings: 4.2,
      raters: [],
      lastMonthTrades: 0,
      botRef: `${userId}-${payload.base}-${payload.quote}`,
      owner: userId,
      allocated: {
        maxamount: 100000,
        currency: "USDT",
      },
      market: {
        base: payload.base,
        quote: payload.quote,
      },
      reviews: {
        username: "",
        userimg: "",
        botrating: 5,
      },
      perfFees: {
        percent: 0,
      },
      exchangesType: ["FTX", "Binance", "KuCoin", "Huobi", "Coinbasepro", "KuCoin-future", "Binance-future", "Ftx-future"],
      priceDecimal: 2,
      webhook: payload.webhook,
      enabled: true,
    };
    let userBot = await new this.botModel(userBotData);
    userBot = await userBot.save();

    // step2. create user bot subscription
    /// ///////////////////////////////////
    // const apiUrl = `${process.env.API_URL}/api/hook/algobot/`;
    const exchKey = await this.exchKeyDataService.findOneKeyForDisplay(payload.accountId);
    const userBotSubscriptionData = {
      botId: String(userBot._id),
      apiKeyRef: payload.accountId,
      feesToken: "UBXT",
      feesPlan: "perfFees",
      accountType: exchKey.type || "spot",
      stratType: payload.stratType,
      accountPercentage: payload.position,
      accountLeverage: payload.leverage,
      contractSize: 1.0,
      baseAmount: 0,
      quote: payload.quote,
      positionType: "percent",
      positionAmount: payload.position,
    };
    try {
      const res = await this.followAlgoBot(userId, userBotSubscriptionData);
      return res;
    } catch (err) {
      this.logger.error(`createUserBot subscription ERROR: ${err}`);
      return err;
    }
    // return this.algobotDataService.mapToDto(userBot);
  }

  private createPauseUnpauseRequest(subscriptionId: string, putOnPause: boolean): UserBotSubscriptionPauseRequest {
    const r = new UserBotSubscriptionPauseRequest();
    r.setSubid(subscriptionId);
    r.setAction(putOnPause ? PauseActionType.PAUSE : PauseActionType.RESUME);
    return r;
  }

  private createMessage(data: FollowBotRequestDto, userId: string): FollowBotRequest {
    const r = new FollowBotRequest();
    r.setApikeyid(data.apiKeyRef);
    r.setBotid(data.botId);
    r.setStrattype(data.stratType);
    r.setAccounttype(data.accountType);
    r.setAccountpercentage(data.accountPercentage);
    r.setAccountleverage(data.accountLeverage);
    r.setContractsize(data.contractSize);
    r.setBaseamount(data.baseAmount);
    r.setPositiontype(data.positionType);
    r.setPositionamount(data.positionAmount);
    r.setUserid(userId);
    r.setQuote(data.quote);
    return r;
  }

  /**
   * minimum business validation rules
   * @param x
   */
  private validate(x: FollowBotRequestDto) {
    if (!x) {
      throw new UnprocessableEntityException("algobot validation error", "cannot request a null strategy.");
    }
    if (!x.botId) {
      throw new UnprocessableEntityException("algobot validation error", `botId  required.`);
    }
  }

  private mapResponse(r: FollowBotResponse.AsObject): FollowBotResponseDto {
    return {
      botId: r.botid,
      subscriptionId: r.subscriptionid,
    };
  }

  private async getMyActiveBots(userId: string) {
    return this.algobotDataService.getMyBotSubscriptions(userId);
  }

  private async automationUserDisableBot(userId: string) {
    return;
    const myActiveBots = await this.getMyActiveBots(userId);
    this.automationService.handleUserDisableBot(userId, myActiveBots.length);
  }

  private async automationUserEnableBot(userId: string) {
    return;
    await this.automationService.handleUserActivateBot(userId);
  }

  private async getBotId(userid: string, subscriptionId: string) {
    const allBots = await this.algobotDataService.getMyBotSubscriptions(userid);
    return allBots.find((e) => e?.id === subscriptionId)?.botId || "";
  }

  private async getBotName(botId: string) {
    const bot = await this.algobotDataService.getBotById(botId);
    if (bot) return bot.name;
    return bot.name || "";
  }

  private async botSubscriptionNotificationBySubId(userid: string, subscriptionId: string, enabled: boolean) {
    return;
    const searchBotId = await this.getBotId(userid, subscriptionId);
    if (searchBotId) {
      const botName = await this.getBotName(searchBotId);
      this.mailService.sendBotSubscriptionNotification(userid, botName, enabled);
    }
  }

  private async botSubscriptionNotificationByBotId(userid: string, botId: string, enabled: boolean) {
    return;
    const botName = await this.getBotName(botId);
    this.mailService.sendBotSubscriptionNotification(userid, botName, enabled);
  }
}
