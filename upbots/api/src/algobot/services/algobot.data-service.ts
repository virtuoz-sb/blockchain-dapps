/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/camelcase */
import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AlgobotReviewRecord } from "src/trade/model/algobot-dto";
import { BotOrderTrackingDto } from "../../trade/model/bot-order-tracking.dto";
import AlgobotsSubscriptionDto from "../models/algobot-subscription.dto";
import { OrderTrackingModel, OrderTrackingModelName } from "../../trade/model/order-tracking.schema";
import { OrderTrackingDto } from "../../trade/model/order-tracking.dto";
import { AlgoBotSubscriptionModel, BotAccountType } from "../models/algobot-subscription.model";
import { AlgoBotRankingDto, AlgoBotRatingDto, AlgoBotsDto, AlgoBotsUpdateDto } from "../models/algobot.dto";
import { AlgoBotModel } from "../models/algobot.model";

import { BotOrderTrackingModelName } from "../../trade/model/bot-order-tracking.schema";
import { AdminAlgoBotSubscriptionModel } from "../models/admin-algobot-subscription.model";
import AdminAlgobotsSubscriptionDto from "../models/admin-algobot-subscription.dto";
import ErrorAlgobotDto from "../models/error-algobot.dto";
import mapToBotSubscriptionDto from "./mapper/bot-subscription.mapper";
import AlgobotsSubscriptionAuditDto from "../models/algobot-subscription-audit.dto";
import { AlgoBotSubscriptionAuditModel, AlgoBotSubscriptionAuditModelName } from "../models/algobot-subscription-audit.model";
import mapToBotSubscriptionAuditDto from "./mapper/bot-subscription-audit.mapper";
import BotSubAuditQueryArg from "../models/botsub-audit-query";
import UserService from "../../shared/user.service";
import * as PerfeesBotWallet from "../../perfees/models/bot-wallet.model";
import * as PerfeesUserWallet from "../../perfees/models/user-wallet.model";
import { SignalTrackingModelName } from "../models/signal-tracking.schema";
import { SignalTrackingModel } from "../models/signal-tracking.dto";

const REVIEW_DATA_PAGE_SIZE = 10;

@Injectable()
export default class AlgobotDataService {
  private readonly logger = new Logger(AlgobotDataService.name);

  constructor(
    @InjectModel("AlgobotModel") private botModel: Model<AlgoBotModel>,
    @InjectModel("AlgoBotSubscriptionModel") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel(AlgoBotSubscriptionAuditModelName) private botSubAuditModel: Model<AlgoBotSubscriptionAuditModel>,
    @InjectModel(OrderTrackingModelName) private orderTrackModel: Model<OrderTrackingModel>,
    @InjectModel(BotOrderTrackingModelName) private botOrderTrackModel: Model<BotOrderTrackingDto>,
    @InjectModel("AdminAlgoBotSubscriptionModel") private adminBotSubscriptionModel: Model<AdminAlgoBotSubscriptionModel>,
    // @InjectModel("PerformanceCyclesModel") private performanceCyclesModel: Model<PerformanceCycleModel>,
    @InjectModel(PerfeesBotWallet.ModelName) private perfeesBotWalletModel: Model<PerfeesBotWallet.Model>,
    @InjectModel(PerfeesUserWallet.ModelName) private perfeesUserWallet: Model<PerfeesUserWallet.Model>,
    @InjectModel(SignalTrackingModelName) private signalTrackingMoel: Model<SignalTrackingModel>,
    private userSvc: UserService
  ) {}

  async getAllActiveWebhookBots(userId?: string, type?: string): Promise<AlgoBotsDto[]> {
    let condition: any = { enabled: true };
    if (type === "owners" && userId) {
      condition = { ...condition, owner: userId };
    }
    const res = await this.botModel.find(condition).lean();
    return res ? res.map(this.mapToDto) : new Array<AlgoBotsDto>();
  }

  async getMyBotSubscriptions(userId: string): Promise<AlgobotsSubscriptionDto[]> {
    const res = await this.botSubscriptionModel
      .find({ userId, deleted: { $ne: true } }, null, {
        sort: { updatedAt: -1 },
      })
      .lean();
    return res ? res.map(mapToBotSubscriptionDto) : new Array<AlgobotsSubscriptionDto>();
  }

  async getMyBotSubscriptionsById(userId: string, botId: string): Promise<AlgobotsSubscriptionDto> {
    const res = await this.botSubscriptionModel.findOne({ userId, botId, deleted: { $ne: true } });
    return mapToBotSubscriptionDto(res);
  }

  async getTotalBotSubscribers(): Promise<number> {
    const res = await this.botSubscriptionModel.countDocuments({ enabled: true, deleted: { $ne: true } });
    return res;
  }

  async getTotalActiveBots(): Promise<number> {
    const res = await this.botModel.countDocuments({ enabled: true, deleted: { $ne: true } });
    return res;
  }

  async getAdminBotSubscriptionAuditsForUser(arg: BotSubAuditQueryArg): Promise<AlgobotsSubscriptionAuditDto[]> {
    if (!arg.email && !arg.userId) {
      throw new UnprocessableEntityException("userid or email required");
    }
    const { page, pageSize: size } = arg;
    const query: { userId?: string; botId?: string; signalId?: string } = {};
    if (arg.userId) {
      query.userId = arg.userId;
    } else {
      const usr = await this.userSvc.findUser(arg.email);
      query.userId = usr?.id;
    }
    if (arg.botId) {
      query.botId = arg.botId;
    }
    if (arg.signalId) {
      query.signalId = arg.signalId;
    }

    const res = await this.botSubAuditModel
      .find(query, null, {
        sort: { updatedAt: -1 },
      })
      .populate("oTrackId")
      .limit(size)
      .skip(page * size);
    return res ? res.map((x) => mapToBotSubscriptionAuditDto(x)) : new Array<AlgobotsSubscriptionAuditDto>();
  }

  async getMyBotSubscriptionAudits(userId: string, page, size: number, botId, botSubId: string): Promise<AlgobotsSubscriptionAuditDto[]> {
    const subs = await this.getMyBotSubscriptions(userId);
    let subIdFilter = subs.map((x) => x.id);
    let query: { userId; botId?; botSubId?: {} } = { userId };
    if (botId) {
      query = { ...query, botId };
    }
    if (botSubId) {
      subIdFilter = subIdFilter.filter((x) => x === botSubId);
    }
    query = { ...query, botSubId: { $in: subIdFilter } };
    const res = await this.botSubAuditModel
      .find(query, null, {
        sort: { updatedAt: -1 },
      })
      .populate("oTrackId")
      .limit(size)
      .skip(page * size);
    return res ? res.map((x) => mapToBotSubscriptionAuditDto(x)) : new Array<AlgobotsSubscriptionAuditDto>();
  }

  async getAllSubscriptionsIds(): Promise<string[]> {
    const ids = await this.botSubscriptionModel.distinct("_id");
    return ids;
  }

  async getAllSubscriptions(): Promise<AlgobotsSubscriptionDto[]> {
    const q = await this.botSubscriptionModel.find().lean();
    return q ? q.map(mapToBotSubscriptionDto) : new Array<AlgobotsSubscriptionDto>();
  }

  async getBotSubById(botSubId: string): Promise<AlgobotsSubscriptionDto> {
    return this.botSubscriptionModel.findById(botSubId).then((botDetails) => mapToBotSubscriptionDto(botDetails));
  }

  async getBotById(botId: string): Promise<AlgoBotsDto> {
    return this.botModel.findById(botId).then((botDetails) => this.mapToDto(botDetails));
  }

  async isPerFeesBotById(botId: string): Promise<boolean> {
    const algoBot: AlgoBotModel = await this.botModel.findOne({ _id: botId });
    if (!algoBot) {
      return false;
    }
    const isCommunityBot = await this.isCommunityBot(botId);
    const bFlag = !isCommunityBot && algoBot.category !== "userbot" && algoBot.category !== "copybot";
    return bFlag;
  }

  async isCommunityBot(botId: string): Promise<boolean> {
    const bot = await this.getBotById(botId);

    if (bot && (bot.botRef === "AVAXUSDT1" || bot.botRef === "TOMOLO1")) {
      return true;
    }
    return false;
  }

  async isResumableSubscription(userId, botId: string): Promise<boolean> {
    const isPerFeesBotById = await this.isPerFeesBotById(botId);

    if (!isPerFeesBotById) {
      return true;
    }

    const perfeesUserWallet = await this.perfeesUserWallet.findOne({ userId });
    const perfeesBotWallet = await this.perfeesBotWalletModel.findOne({ userId, botId });
    if (!perfeesUserWallet || !perfeesBotWallet) {
      return true;
    }

    const minWalletAmount = 1;
    if (!perfeesBotWallet.autoRefill) {
      const perfeesBotAmount = perfeesBotWallet.amount - perfeesBotWallet.debtAmount + perfeesBotWallet.creditAmount;
      if (perfeesBotAmount <= minWalletAmount) {
        return false;
      }
    } else {
      const perfeesUserAmount = perfeesUserWallet.amount - perfeesUserWallet.debtAmount + perfeesUserWallet.creditAmount;
      if (perfeesUserAmount <= minWalletAmount) {
        return false;
      }
    }

    return true;
  }

  async getMyBotOrderDetails(userId: string, botIdentifier: string): Promise<OrderTrackingDto[]> {
    /*
      const res = await this.orderModel.find({ stratId: strategyId }, null, {
      sort: { updated_at: -1 },
    });
    */

    // TODO: how to exclude order tracking related to deleted bot subscription  ?
    const res = await this.orderTrackModel.find({ userId, botId: botIdentifier }, null, {
      sort: { created_at: -1 },
    });
    // this.logger.debug(`getMyBotOrderDetails user ${userId} bot ${botIdentifier}  res ${JSON.stringify(res)}`);

    return res ? res.map((x) => x.toJSON()) : new Array<OrderTrackingDto>();
  }

  async getTimerangeCompletedSubscriptionOrderDetails(botSubId: string, start: Date): Promise<OrderTrackingDto[]> {
    const res = await this.orderTrackModel.find({ botSubId, completed: true, created_at: { $gte: start } }, null, {
      sort: { cycleSequence: -1 },
    });

    return res ? res.map((x) => x.toJSON()) : new Array<OrderTrackingDto>();
  }

  async getBotSeedOrderDetails(botIdentifier: string): Promise<BotOrderTrackingDto[]> {
    const res = await this.botOrderTrackModel.find({ botRef: botIdentifier }, null, {
      sort: { created_at: -1 },
    });
    this.logger.debug(`getBotSeedOrderDetails bot ${botIdentifier}  res ${JSON.stringify(res)}`);

    return res ? res.map((x) => x.toJSON()) : new Array<BotOrderTrackingDto>();
  }

  async getAlgoBotsRanking(): Promise<AlgoBotRankingDto[]> {
    const res = await this.botSubscriptionModel.aggregate([
      {
        $group: {
          _id: {
            botId: "$botId",
          },
          followers: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "COL_ALGOBOTS",
          localField: "_id.botId",
          foreignField: "_id",
          as: "botDetail",
        },
      },
      {
        $project: {
          _id: false,
          botId: "$_id.botId",
          botName: "$botDetail.name",
          followers: true,
        },
      },
      {
        $sort: {
          followers: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);
    return res || [];
  }

  async getAllBotSubscriptionsForAdmin(): Promise<AdminAlgobotsSubscriptionDto[]> {
    const res = await this.adminBotSubscriptionModel
      .find({ deleted: { $ne: true } }, null, {
        sort: { updatedAt: -1 },
      })
      .populate("userId", "email");
    return res ? res.map(this.mapToAdminBotSubscriptionDto) : new Array<AdminAlgobotsSubscriptionDto>();
  }

  async getAlgoBotsErrors(): Promise<ErrorAlgobotDto[]> {
    const res = await this.botSubscriptionModel.find({ error: { $ne: null } }, null, {
      sort: { errorAt: -1 },
    });
    return res ? res.map(this.mapToErrorBotSubscriptionDto) : new Array<ErrorAlgobotDto>();
  }

  async getMyAlgoBotsErrors(userId: string, page, size: number): Promise<ErrorAlgobotDto[]> {
    this.logger.debug(`getMyAlgoBotsErrors user ${userId}}`);

    let res = new Array<ErrorAlgobotDto>();
    const resSubscriptions = await this.botSubscriptionModel
      .find({ userId, error: { $ne: null } }, null, {
        sort: { errorAt: -1 },
      })
      .limit(size)
      .skip(page * size);

    // this.logger.debug(`getMyAlgoBotsErrors resSubscriptions ${JSON.stringify(resSubscriptions)}`);

    if (resSubscriptions) {
      res = res.concat(resSubscriptions.map(this.mapToErrorBotSubscriptionDto));
    }

    const initiator = "algobot";
    const resOrderTracking = await this.orderTrackModel
      .find({ userId, initiator, error: { $ne: null } }, null, {
        sort: { errorAt: -1 },
      })
      .limit(size)
      .skip(page * size);

    // this.logger.debug(`getMyAlgoBotsErrors resOrderTracking ${JSON.stringify(resOrderTracking)}`);

    if (resOrderTracking) {
      res = res.concat(resOrderTracking.map((x) => this.mapToErrorOrderTrackingDto(x)));
    }

    // this.logger.debug(`getMyAlgoBotsErrors res ${JSON.stringify(res)}`);

    // descending sort
    return Promise.all(res.sort((a, b) => b.errorAt.getTime() - a.errorAt.getTime()));
  }

  async updateAlgobotSubscriptionAccountPercent(userId, subscriptionId: string, accountPercent: number): Promise<boolean> {
    try {
      const payload = {
        accountPercent,
      };
      const ret = await this.botSubscriptionModel.updateOne({ _id: subscriptionId, userId }, payload);
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateAlgobotSubscriptionPositionSize(
    userId,
    subscriptionId: string,
    accountPercent: number,
    positionType: string,
    positionAmount: number
  ): Promise<boolean> {
    try {
      const ret = await this.botSubscriptionModel.updateOne(
        { _id: subscriptionId, userId },
        { accountPercent, positionType, positionAmount }
      );
      if (ret.modifiedCount > 0 || ret.nModified > 0) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async updateAlgobotSubscriptionAccountKey(
    userId,
    subscriptionId: string,
    apiKeyRef: string,
    accountType: BotAccountType
  ): Promise<boolean> {
    try {
      const payload = {
        apiKeyRef,
        accountType,
      };
      const ret = await this.botSubscriptionModel.updateOne({ _id: subscriptionId, userId }, payload);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAlgobotById(botId: string) {
    const bot = await this.botModel.findOne({ _id: botId });
    return bot;
  }

  async updateAlgobotOwnerByEmail(botId: string, userEmail: string) {
    // find user id from the user Email
    const usr = await this.userSvc.findUser(userEmail);
    const userId = usr?.id;
    if (!userId) return false;

    await this.botModel.findOneAndUpdate(
      { _id: botId },
      {
        realOwnerId: userId,
      }
    );
    return true;
  }

  async updateAlgobotPicture(botId: string, file: any): Promise<{ status: string; data: string; mimetype: string }> {
    const bot = await this.botModel.findOne({ _id: botId });
    if (!bot) {
      return { status: "failed", data: "bot not found", mimetype: null };
    }
    if (file) {
      bot.picture.mimetype = file.mimetype;
      bot.picture.data = file.buffer.toString("base64");
      await bot.save();
    }
    return {
      status: "success",
      data: bot.picture.data,
      mimetype: bot.picture.mimetype,
    };
  }

  async updateAlgobot(botId: string, payload: AlgoBotsUpdateDto) {
    let bot = await this.botModel.findOneAndUpdate({ _id: botId }, payload);
    bot = await this.botModel.findOne({ _id: botId });
    return bot;
  }

  async deleteAlgobot(botId: string) {
    try {
      const bot = await this.botModel.findById(botId);
      if (!bot) return { status: "failed", data: "bot not found" };
      await this.botSubscriptionModel.deleteMany({ botId });
      return this.botModel.deleteOne({ _id: botId });
    } catch (e) {
      return { status: "failed", data: e.message };
    }
  }

  async getAlgobotRatingInfo(params: { userId: string; botId: string }): Promise<AlgoBotRatingDto> {
    const bot = await this.botModel.findOne({ _id: params.botId });

    if (bot) {
      let myRating = 0;
      let myComment = "";
      if (bot.raters) {
        const myVote = bot.raters.find((item) => item.user === params.userId);
        if (myVote) {
          myRating = myVote.vote;
          myComment = myVote.comment;
        }
      }

      return {
        ratings: bot.ratings,
        raters: bot.raters ? bot.raters.length : 0,
        myRating,
        myComment,
      };
    }
    return null;
  }

  async getAlgobotReview(params: { botId: string; page: number }): Promise<AlgobotReviewRecord[]> {
    const page = params.page ?? 0;
    const bot = await this.botModel.findOne({ _id: params.botId });

    if (bot && bot.raters && page * REVIEW_DATA_PAGE_SIZE < bot.raters.length) {
      const slicedData = params.page
        ? bot.raters.slice(params.page * REVIEW_DATA_PAGE_SIZE, (params.page + 1) * REVIEW_DATA_PAGE_SIZE)
        : bot.raters;

      const data = await Promise.all(
        slicedData.map(async (item) => {
          const user = await this.userSvc.findUserById(item.user);

          return {
            ...item,
            userId: item.user,
            user: `${user.firstname} ${user.lastname ?? ""}`.trim(),
            picture: user.picture,
            reviewedAt: item.reviewedAt ? new Date(item.reviewedAt).getTime() : 0,
          };
        })
      );

      return data;
    }
    return null;
  }

  calcRating(raters: { id: string; user: string; vote: number; reviewedAt: Date }[]): number {
    if (raters.length > 0) {
      return raters.reduce((a, b) => a + (b.vote || 0), 0) / raters.length;
    }
    return 0;
  }

  async rateAlgobot(params: { userId: string; botId: string; vote: number; comment: string }) {
    const bot = await this.botModel.findOne({ _id: params.botId });

    if (bot) {
      const vote = Math.max(1, Math.min(5, params.vote));
      const comment = params.comment ?? "";
      const raters = bot.raters ?? [];
      let ratings = bot.ratings ?? 0;

      // find userId for checking that user did already vote before.
      const pickIndex = raters.findIndex((e) => e.user === params.userId);

      if (pickIndex === -1) {
        // user never voted before
        // ratings = (ratings * raters.length + vote) / (raters.length + 1);
        raters.push({
          id: `${params.botId.substring(12)}${params.userId.substring(12)}`,
          user: params.userId,
          vote,
          comment,
          reviewedAt: new Date(),
        });
      } else {
        // user voted before
        // ratings = (ratings * raters.length - raters[pickIndex].vote + vote) / (raters.length || 1);
        raters[pickIndex].vote = vote;
        raters[pickIndex].comment = comment;
        raters[pickIndex].reviewedAt = new Date();
      }
      ratings = this.calcRating(raters);

      await this.botModel.findOneAndUpdate({ _id: params.botId }, { ratings, raters });

      return true;
    }
    return false;
  }

  async deleteReview(params: { userId: string; botId: string }) {
    const bot = await this.botModel.findOne({ _id: params.botId });

    if (bot) {
      let raters = bot.raters ?? [];
      let ratings = bot.ratings ?? 0;

      raters = raters.filter((item) => item.user !== params.userId);
      ratings = this.calcRating(raters);
      await this.botModel.findOneAndUpdate({ _id: params.botId }, { ratings, raters });
      return true;
    }
    return false;
  }

  async createSignalTracking(params: { payload: any; botId: string }) {
    const bot = await this.botModel.findOne({ _id: params.botId });
    if (bot) {
      const promises = [];
      await this.signalTrackingMoel.deleteMany({ botId: params.botId });
      if (params.payload.length) {
        params.payload.forEach((payload: any) => {
          const promise = this.signalTrackingMoel.create({
            ...payload,
            botId: params.botId,
          });
          promises.push(promise);
        });
      }
      await Promise.all(promises);
      return true;
    }
    return null;
  }

  async getBotSignalTracking(botId: string) {
    const trackings = await this.signalTrackingMoel.find({ botId });
    return trackings;
  }

  public mapToDto(m: AlgoBotModel): AlgoBotsDto {
    if (!m) return null;
    const {
      name,
      botVer,
      description,
      stratDesc,
      stratType,
      category,
      createdAt,
      updatedAt,
      creator,
      picture,
      avgtrades,
      lastMonthTrades,
      ratings,
      raters,
      botRef,
      botFees,
      perfFees,
      exchangesType,
      priceDecimal,
      webhook,
    } = m;

    return {
      id: (m._id as Types.ObjectId).toHexString(),
      base: m.market.base,
      quote: m.market.quote,
      name,
      botVer,
      description,
      stratDesc,
      stratType,
      category,
      createdAt,
      updatedAt,
      ownerId: (m.owner as Types.ObjectId).toHexString(),
      creator,
      picture,
      avgtrades,
      lastMonthTrades,
      allocatedMaxAmount: m.allocated?.maxamount,
      allocatedCurrency: m.allocated?.currency,
      ratings,
      raters,
      reviewerName: m.reviews?.username,
      reviewerImg: m.reviews?.userimg,
      reviewerBotRating: m.reviews?.botrating,
      botRef,
      botFees,
      perfFees,
      exchangesType,
      priceDecimal,
      webhook,
    };
  }

  private mapToAdminBotSubscriptionDto(m: AdminAlgoBotSubscriptionModel): AdminAlgobotsSubscriptionDto {
    if (!m) return null;
    const {
      botId,
      apiKeyRef,
      botRunning,
      enabled,
      isOwner,
      stratType,
      createdAt,
      updatedAt,
      cycleSequence,
      status,
      accountPercent,
      error,
      errorAt,
      errorReason,
    } = m;
    return {
      id: (m._id as Types.ObjectId).toHexString(),
      botId: (botId as Types.ObjectId).toHexString(),
      apiKeyRef,
      botRunning,
      enabled,
      isOwner,
      stratType,
      createdAt,
      updatedAt,
      cycleSequence,
      status,
      accountPercent,
      error,
      errorAt,
      errorReason,
      user: m.userId,
    };
  }

  private mapToErrorBotSubscriptionDto(m: AlgoBotSubscriptionModel): ErrorAlgobotDto {
    if (!m) return null;
    const { botId } = m;
    return {
      id: (m._id as Types.ObjectId).toHexString(),
      botId: (botId as Types.ObjectId).toHexString(),
      errorType: "subscription",
      // error: m.error, // do not expose technical error to the public
      errorAt: m.errorAt,
      errorReason: m.errorReason,
    };
  }

  private mapToErrorOrderTrackingDto(m: OrderTrackingModel): ErrorAlgobotDto {
    if (!m) return null;
    return {
      id: m.botSubId,
      botId: m.botId,
      errorType: "order-tracking",
      // error: m.error, // do not expose technical error to the public
      errorAt: m.errorAt,
      errorReason: m.errorReason,
    };
  }
}
