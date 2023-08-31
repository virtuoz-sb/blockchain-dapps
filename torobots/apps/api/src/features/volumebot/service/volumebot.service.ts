import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import * as fs from 'fs';
import config from "../../../config";
import { VolumeBotDto } from '../dto/volumebot.dto';
import {
  mongoDB,
  IVolumeBotDocument,
  IUserDocument,
  BotTradingDto,
  EVolumeBotStatus,
  VolumeBotFilter
} from "@torobot/shared";
import { VolumeBotEngineService } from './volumebot-engine.service';
import { TokenService } from '../../token/service/token.service';
import { TransactionService } from '../../transaction/service/transaction.service';
import { TokenDetailReqDto } from '../../token/dto/token.dto';

@Injectable()
export class VolumeBotService {
  constructor(
    private botEngineService: VolumeBotEngineService,
    private tokenService: TokenService,
    private transactionService: TransactionService,
  ) {}
  
  async create(bot: VolumeBotDto, user: IUserDocument) {
    const object = await mongoDB.VolumeBots.create({...bot, owner: user._id});
    return this.getById(object._id);
  }

  async getById(botId: string) {
    const doc = await mongoDB.VolumeBots.populateModel(mongoDB.VolumeBots.findById(botId));
    return doc as IVolumeBotDocument;
  }

  async update(bot: IVolumeBotDocument, body: UpdateQuery<IVolumeBotDocument>) {
    await mongoDB.VolumeBots.findOneAndUpdate({_id: bot._id}, body);
    return this.getById(bot._id);
  }

  delete(bot: IVolumeBotDocument) {
    return mongoDB.VolumeBots.findOneAndDelete({ _id: bot._id });
  }

  async validate(botId: string): Promise<IVolumeBotDocument> {
    const doc = await this.getById(botId);

    if (!doc) {
      throw new NotFoundException('VolumeBot not found');
    }

    return doc as IVolumeBotDocument;
  }

  async getAll() {
    return mongoDB.VolumeBots.populateModel(mongoDB.VolumeBots.find({}).sort({created: -1}));
  }

  async getLog(botId: string) {
    try {
      const log = fs.readFileSync(config.LOG_DIR_PATH + `/volumebot/${botId}.txt`, {
        encoding: "utf8"
      })
      return log;
    } catch (e) {
      return "";
    }
  }

  async getAllStatus() {
    return mongoDB.VolumeBots.find().select("id state addLiquiditySchedule sellingSchedule");
  }

  async fillDtoByDetail(payload: any) {
    const tokenDetailReq: TokenDetailReqDto = {
      blockchainId: payload.blockchain,
      nodeId: payload.node,
      dexId: payload.dex,
      walletId: payload.mainWallet,
      tokenAddress: payload.token
    };
    const token = await this.tokenService.addByDetail(tokenDetailReq);

    const volumebotDto = {
      blockchain: payload.blockchain,
      dex: payload.dex,
      node: payload.node,
      mainWallet: payload.mainWallet,
      coin: payload.coin,
      token: token._id,
      addLiquiditySchedule: payload.addLiquiditySchedule,
      sellingSchedule: payload.sellingSchedule,
      isAutoSellingStrategy: payload.isAutoSellingStrategy,
      alertAmountForPurchase: payload.alertAmountForPurchase,
      percentForAutoSelling: payload.percentForAutoSelling
    };

    return volumebotDto;
  }

  async trigger(trading: BotTradingDto, user: IUserDocument) {
    const botDoc = await this.getById(trading.botId);
    let result = null;
    if (trading.active) {
      result = await this.botEngineService.trigger(trading);
      await this.update(botDoc, { state: EVolumeBotStatus.RUNNING, stateNum: 1 });
    } else {
      result = await this.botEngineService.trigger(trading);
      await this.update(botDoc, { state: EVolumeBotStatus.FAILED, stateNum: 0 });
    }
    return result;
  }

  async search(filter: VolumeBotFilter) {
    const where = {};
    const length = filter.pageLength || 10;
    const start = filter.page ? (filter.page - 1) * length : 0;
    const total = await mongoDB.VolumeBots.countDocuments({...where});
    const data = await mongoDB.VolumeBots.populateModel(
      mongoDB.VolumeBots
        .find({...where})
        .sort({stateNum: -1, updated: -1})
        .skip(start)
        .limit(length)
    );
    
    return {
      total,
      data
    }
  }
}