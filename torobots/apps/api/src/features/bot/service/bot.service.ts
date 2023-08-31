import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import * as fs from 'fs';
import config from "../../../config";
import { BotDto } from '../dto/bot.dto';
import {
  mongoDB, 
  IBotDocument, 
  IUserDocument, 
  ERunningStatus, 
  ETradingInitiator, 
  BotTradingDto, 
  STATUS_STOPPED, 
  STATUS_READY, 
  ETradingThread, 
  IBot,
  BotFilter,
  EUserRole
} from "@torobot/shared";
import { ObjectId } from 'mongodb';
import { BotEngineService } from './bot-engine.service';
import { TokenService } from '../../token/service/token.service';
import { TransactionService } from '../../transaction/service/transaction.service';
import { TokenDetailReqDto } from '../../token/dto/token.dto';

@Injectable()
export class BotService {
  constructor(
    private botEngineService: BotEngineService,
    private tokenService: TokenService,
    private transactionService: TransactionService,
  ) {}

  private getInitiatorCondition(initiator: ETradingInitiator) {
    let condition = {};
    if (initiator === ETradingInitiator.BOT) {
      condition = {initiator: { $ne: ETradingInitiator.DIRECT }}
    } else if (initiator === ETradingInitiator.DIRECT) {
      condition = {initiator: ETradingInitiator.DIRECT};
    }
    return condition;
  }
  
  async create(bot: BotDto, user: IUserDocument) {
    const object = await mongoDB.Bots.create({...bot, owner: user._id});
    return this.getById(object._id);
  }

  async update(bot: IBotDocument, body: UpdateQuery<IBotDocument>) {
    await mongoDB.Bots.findOneAndUpdate({ _id: bot._id }, body);
    return this.getById(bot._id);
  }

  delete(bot: IBotDocument) {
    return mongoDB.Bots.findOneAndDelete({ _id: bot._id });
  }

  async getById(botId: string) {
    const doc = await mongoDB.Bots.populateModel(mongoDB.Bots.findById(botId));
    return doc as IBotDocument;
  }

  async validate(botId: string): Promise<IBotDocument> {
    const doc = await this.getById(botId);

    if (!doc) {
      throw new NotFoundException('Bot not found');
    }

    return doc as IBotDocument;
  }

  getAll(initiator: ETradingInitiator, user: IUserDocument) {
    let condition = this.getInitiatorCondition(initiator);
    condition = {
      ...condition,
      ...(user.role !== EUserRole.ADMIN ? {owner: user._id} : {})
    };
    return mongoDB.Bots.populateModel(mongoDB.Bots.find(condition).sort({created: -1}));
  }

  async trigger(trading: BotTradingDto, user: IUserDocument) {
    const botDoc = await this.getById(trading.botId);
    const bot: IBot = botDoc.toObject();

    let result = null;
    if (trading.active) {
      const stateValues = {
        active: true,
        status: ERunningStatus.RUNNING,
        result: STATUS_READY,
        thread: ETradingThread.NONE,
      }
      const botState = bot.state.active ? bot.state : stateValues;
      console.log('----botState:', botState)
      const state = {
        ...botState,
        extends: {
          instant: {
            ...stateValues,
            active: trading.thread === ETradingThread.SELLING_INSTANT || trading.thread === ETradingThread.SELLING_SPAM,
          },
          stopLoss: {
            ...stateValues,
            active: false
          }
        }
      }
      await this.update(botDoc, { state });
      result = await this.botEngineService.trigger(trading);
    } else {
      const stateValues = {
        active: false,
        status: ERunningStatus.FAILED,
        result: STATUS_STOPPED,
      }
      const botState = stateValues;
      const state = {
        ...botState,
        thread: bot.state.thread,
        extends: {
          instant: {
            ...stateValues,
            thread: bot.state.extends?.instant?.thread || ETradingThread.NONE
          },
          stopLoss: {
            ...stateValues,
            thread: bot.state.extends?.stopLoss?.thread || ETradingThread.NONE
          }
        }
      }
      result = await this.botEngineService.trigger(trading);
      await this.update(botDoc, { state });
    }
    return result;
  }

  async getAllStatus(initiator: ETradingInitiator) {
    const condition = this.getInitiatorCondition(initiator);
    return mongoDB.Bots.find(condition).select("id state");
  }

  async getLog(botId: string) {
    try {
      const log = fs.readFileSync(config.LOG_DIR_PATH + `/bot/${botId}.txt`, {
        encoding: "utf8"
      })
      return log;
    } catch (e) {
      return "";
    }
  }

  async getHistory(botId: string) {
    try {
      const transactions = await this.transactionService.getsByBotId(botId);
      return transactions;
    } catch (e) {
      return [];
    }
  }

  async fillDtoByDetail(payload: any) {
    // add or update token to DB
    const tokenDetailReq: TokenDetailReqDto = {
      blockchainId: payload.blockchain,
      nodeId: payload.node,
      dexId: payload.dex,
      walletId: payload.wallet,
      tokenAddress: payload.tokenAddress
    };
    const token = await this.tokenService.addByDetail(tokenDetailReq);

    const botDto = {
      blockchain: payload.blockchain,
      dex: payload.dex,
      node: payload.node,
      wallet: payload.wallet,
      coin: payload.coin,
      token: token._id,
      type: payload.type,
      initiator: payload.initiator,
      buy: payload.buy,
      sell: payload.sell,
      config: payload.config
    };

    return botDto;
  }

  async search(filter: BotFilter, user: IUserDocument) {
    let tokenId = "";
    if (filter.tokenAddress && filter.tokenAddress !== '') {
      const token = (await mongoDB.Tokens.findOne({address: filter.tokenAddress}));
      tokenId = token ? token._id : new ObjectId("000000000000000000000000");
    }

    const where = {
      ...(user.role !== EUserRole.ADMIN ? {owner: user._id} : {}),
      ...(filter.initiator ? this.getInitiatorCondition(filter.initiator) : {}),
      ...(filter.state ? {'state.status': filter.state} : {}),
      ...(filter.chain ? {blockchain: filter.chain} : {}),
      ...(filter.tokenAddress !== '' ? {token: tokenId} : {}),
      ...(filter.uniqueNum > 0 ? {uniqueNum: filter.uniqueNum} : {})
    };

    const length = filter.pageLength || 10;
    const start = filter.page ? (filter.page - 1) * length : 0;
    const total = await mongoDB.Bots.countDocuments({...where});
    const data = await mongoDB.Bots.populateModel(
      mongoDB.Bots
        .find({...where})
        .sort({'state.active': -1, updated: -1})
        .skip(start)
        .limit(length)
    );
    
    return {
      total,
      data
    }
  }
}