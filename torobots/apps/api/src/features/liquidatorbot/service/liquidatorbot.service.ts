import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import * as fs from 'fs';
import config from "../../../config";
import { LiquidatorBotDto } from '../dto/liquidatorbot.dto';
import {
  mongoDB,
  ILiquidatorBotDocument,
  IUserDocument,
  BotTradingDto,
  ILiquidatorBot,
  ELiquidatorBotStatus,
  LiquidatorFilter
} from "@torobot/shared";

import { TokenService } from '../../token/service/token.service';
import { TokenDetailReqDto } from '../../token/dto/token.dto';
import { LiquidatorBotEngineService } from './liquidatorbot-engine.service';
import { ObjectId } from 'mongodb';
import { CounterService } from 'src/features/counter/service/counter.service';

@Injectable()
export class LiquidatorBotService {
  constructor(
    private botEngineService: LiquidatorBotEngineService,
    private tokenService: TokenService,
    private counterService: CounterService
  ) { }

  async create(bot: LiquidatorBotDto, user: IUserDocument) {
    const uniqueNum = await this.counterService.getNextSequenceValue("LiquidatorBot");
    const object = await mongoDB.LiquidatorBots.create({...bot, owner: user._id, uniqueNum: uniqueNum});
    return this.getById(object._id);
  }

  async getById(botId: string) {
    const doc = await mongoDB.LiquidatorBots.populateModel(mongoDB.LiquidatorBots.findById(botId));
    return doc as ILiquidatorBotDocument;
  }

  async update(bot: ILiquidatorBotDocument, body: UpdateQuery<ILiquidatorBotDocument>) {
    await mongoDB.LiquidatorBots.findOneAndUpdate({_id: bot._id}, body);
    return this.getById(bot._id);
  }

  delete(bot: ILiquidatorBotDocument) {
    return mongoDB.LiquidatorBots.findOneAndDelete({ _id: bot._id });
  }

  async validate(botId: string): Promise<ILiquidatorBotDocument> {
    const doc = await this.getById(botId);

    if (!doc) {
      throw new NotFoundException('LiquidatorBot not found');
    }
    return doc as ILiquidatorBotDocument;
  }

  async getAll() {
    return mongoDB.LiquidatorBots.populateModel(mongoDB.LiquidatorBots.find({}).sort({created: -1}));
  }

  async getLog(botId: string) {
    try {
      const log = fs.readFileSync(config.LOG_DIR_PATH + `/liquidatorbot/${botId}.txt`, {
        encoding: 'utf8'
      })
      return log;
    } catch (e) {
      return '';
    }
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

    const liquidatorbotDto = {
      blockchain: payload.blockchain,
      type: payload.type,
      dex: payload.dex,
      node: payload.node,
      coin: payload.coin,
      token: token._id,
      wallet: payload.wallet,
      cexAccount: payload.cexAccount,
      accountId: payload.accountId,
      cex: payload.cex,
      tokenAmount: payload.tokenAmount,
      tokenSold: payload.tokenSold,
      timeInterval: payload.timeInterval,
      orderType: payload.orderType,
      rate: payload.rate,
      lowerPrice: payload.lowerPrice,
      presetAmount: payload.presetAmount,
      bigSellPercentage: payload.bigSellPercentage,
      smallSellPercentage: payload.smallSellPercentage
    }

    return liquidatorbotDto;
  }

  async trigger(trading: BotTradingDto, user: IUserDocument) {
    const botDoc = await this.getById(trading.botId);
    let result = null;
    if (trading.active) {
      result = await this.botEngineService.trigger(trading);
      await this.update(botDoc, { state: ELiquidatorBotStatus.RUNNING, stateNum: 1 });
    } else {
      result = await this.botEngineService.trigger(trading);
      await this.update(botDoc, { state: ELiquidatorBotStatus.STOPPED, stateNum: 0 });
    }
    return result;
  }

  async getAllStatus() {
    return mongoDB.LiquidatorBots.find().select("id state tokenSold");
  }

  async search(filter: LiquidatorFilter) {
    let tokenId = "";
    if (filter.tokenAddress && filter.tokenAddress !== '') {
      const token = (await mongoDB.Tokens.findOne({address: filter.tokenAddress}));
      tokenId = token ? token._id : new ObjectId("000000000000000000000000");
    }
    const where = {
      ...(filter.type ? {type: filter.type} : {}),
      ...(filter.chain ? {blockchain: filter.chain} : {}),
      ...(filter.tokenAddress !== '' ? {token: tokenId} : {}),
    };
    const length = filter.pageLength || 10;
    const start = filter.page ? (filter.page - 1) * length : 0;
    const total = await mongoDB.LiquidatorBots.countDocuments({...where});
    const data = await mongoDB.LiquidatorBots.populateModel(
      mongoDB.LiquidatorBots
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

  async getOrderbooks(_id: string, filter: any) {
    const data = await mongoDB.LiquidatorDailyOrders.aggregate(
      [{
        $match: {liquidator: _id}
      },
      {
        $group: {
          _id: '$date',
          count: {$sum: 1},
          buy: {$sum: "$buy"},
          sell: {$sum: '$sell'},
        }
      },
      {
        $skip: (filter.page-1)*filter.pageLength || 0
      },
      {
        $limit: filter.pageLength || 5
      },
      {
        $sort: {_id: -1}
      }
      ]
    );

    const count = await mongoDB.LiquidatorDailyOrders.aggregate(
      [{
        $match: {liquidator: _id}
      },
      {
        $group: {
          _id: '$date',
        }
      },
      {
        $count: "total"
      }]
    );

    return {
      data,
      total: count[0]?.total || 0
    }
  }
}
