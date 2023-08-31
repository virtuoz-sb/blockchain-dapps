import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExchangeKey } from "../../types/exchange-key";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import { OrderTrackingModelName, OrderTrackingModel } from "../../trade/model/order-tracking.schema";

/* eslint-disable no-underscore-dangle */

@Injectable()
export default class ExchangeKeyStatisticsService {
  private readonly logger = new Logger(ExchangeKeyStatisticsService.name);

  constructor(
    @InjectModel("ExchangeKey") private keyModel: Model<ExchangeKey>,
    @InjectModel("AlgoBotSubscriptionModel") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel(OrderTrackingModelName) private orderTrackModel: Model<OrderTrackingModel>
  ) {}

  async getStatistics(data: any): Promise<any> {
    let res = {};
    let condition = {};

    if (data.exchange) {
      condition = { exchange: data.exchange };
    }
    condition = { ...condition, valid: true };
    const keyModels = await this.keyModel.find(condition);
    const userGroups = {};
    let botSubsCount = 0;
    const botSubs = [];

    const botSubsPromises = keyModels.map(async (keyModel) => {
      userGroups[keyModel.userId] = (userGroups[keyModel.userId] || 0) + 1;
      const botSubModel = await this.botSubscriptionModel.findOne({ apiKeyRef: keyModel._id, enabled: true });
      if (botSubModel) {
        botSubsCount += 1;
        botSubs.push(botSubModel);
      }
    });
    await Promise.all(botSubsPromises);

    const trackingUsers = [];
    let trackingAmount = 0;
    const orderTrackings = await this.orderTrackModel.find(
      {
        side: "Buy",
        exch: data.exchange,
        completed: true,
        $and: [{ created_at: { $gte: new Date(data.start) } }, { created_at: { $lte: new Date(data.end) } }],
      },
      null,
      { sort: { created_at: 1 } }
    );
    for (let i = 0; i < orderTrackings.length; i += 1) {
      const userId = orderTrackings[i].userId.toString();
      if (!trackingUsers.includes(userId)) {
        trackingUsers.push(userId);
      }
      trackingAmount += Number(orderTrackings[i].qtyBaseAsked);
    }

    res = {
      total: {
        keyCount: keyModels.length,
        userCount: Object.keys(userGroups).length,
        botSubsCount,
      },
      trading: {
        amount: trackingAmount,
        userCount: trackingUsers.length,
        users: trackingUsers,
      },
    };
    return res;
  }
}
