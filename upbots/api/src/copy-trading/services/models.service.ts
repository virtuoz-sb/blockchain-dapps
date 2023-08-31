/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import CipherService from "../../shared/encryption.service";

import { User, UserDto, UserIdentity } from "../../types/user";

import * as Trader from "../models/trader.model";

import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";

@Injectable()
export default class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel(Trader.ModelName) private TraderModel: Model<Trader.Model>,
    @InjectModel("AlgoBotSubscription") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    private config: ConfigService,
    private cipherService: CipherService
  ) {}

  onModuleInit() {}

  async getTraderByMaster(userId: string, botId: string) {
    const condition = {
      userId,
      botId,
    };
    const trader = await this.TraderModel.findOne(condition);
    return trader;
  }

  async upsertTraderByMaster(userId: string, data: Trader.Dto) {
    const condition = {
      userId,
      botId: data.botId,
    };
    const trader = await this.TraderModel.update(condition, { ...data, userId }, { upsert: true });
    return trader;
  }

  async deleteTraderByMaster(userId: string, botId: string) {
    const condition = {
      userId,
      botId,
    };
    const result = await this.TraderModel.findOneAndDelete(condition);
    return result;
  }

  async getTradersByAdmin(payload: any) {
    let conditions = {};
    if (payload.traderIds && payload.traderIds.length > 0) {
      conditions = { ...conditions, _id: { $in: payload.traderIds } };
    }

    const traders = await this.TraderModel.find(conditions).populate("botId").populate("exchKeyId");
    const tradersPromise = traders.map(async (trader) => {
      const traderJSON = trader.toJSON();
      if (traderJSON?.exchKeyId?.secretKey) {
        traderJSON.exchKeyId.secretKey = this.decryptKey(traderJSON.exchKeyId.secretKey);
      }
      const botSubscriptions = await this.botSubscriptionModel
        .find({ botId: trader.botId, enabled: true, deleted: false })
        .sort({ createdAt: 1 });
      return {
        ...traderJSON,
        subs: botSubscriptions,
      };
    });
    const mappedTraders = await Promise.all(tradersPromise);
    return mappedTraders;
  }

  async upsertTraderByAdmin(payload: any) {
    if (payload.traderId && payload.traderId.length > 0) {
      // update
      const result = await this.TraderModel.update({ _id: payload.traderId }, payload.data);
      return result;
    }
    // insert
    let result = new this.TraderModel(payload.data);
    result = await result.save();
    return result;
  }

  async deleteTraderByAdmin(payload: any) {
    const result = await this.TraderModel.findOneAndDelete({ _id: payload.traderId });
    return result;
  }

  decryptKey(secretKey: string) {
    const encKey = this.config.get<string>("KEYSTORE_ENCK");
    const authKey = this.config.get<string>("KEYSTORE_AUTHK");

    const decrypted = this.cipherService.decryptWithHmac(secretKey, encKey, authKey);
    return decrypted;
  }
}
