import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import * as fs from 'fs';
import config from "../../../config";
import { AutoBotDto } from '../dto/autobot.dto';
import {
  mongoDB, 
  IAutoBotDocument, 
  IUserDocument, 
  ERunningStatus, 
  ETradingInitiator, 
  ETradingThread, 
  IAutoBot,
  BotTradingDto
} from "@torobot/shared";
import { AutoBotEngineService } from './autobot-engine.service';
import { TokenService } from '../../token/service/token.service';
import { TransactionService } from '../../transaction/service/transaction.service';
import { PoolService } from '../../pool/service/pool.service';
import { TokenDetailReqDto } from '../../token/dto/token.dto';

@Injectable()
export class AutoBotService {
  constructor(
    private poolService: PoolService,
    private autobotEngineService: AutoBotEngineService,
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
  
  async create(bot: AutoBotDto, user: IUserDocument) {
    const object = await mongoDB.AutoBots.create({...bot, owner: user._id});
    const poolDoc = await this.poolService.getById(bot.pool);
    await this.poolService.update(
      await this.poolService.validate(bot.pool),
      {autoBot: object._id}
    );

    return this.getById(object._id);
  }

  async update(bot: IAutoBotDocument, body: UpdateQuery<IAutoBotDocument>) {
    await mongoDB.AutoBots.findOneAndUpdate({ _id: bot._id }, body);
    return this.getById(bot._id);
  }

  delete(bot: IAutoBotDocument) {
    return mongoDB.AutoBots.findOneAndDelete({ _id: bot._id });
  }

  async getById(botId: string) {
    const doc = await mongoDB.AutoBots.populateModel(mongoDB.AutoBots.findById(botId));
    return doc as IAutoBotDocument;
  }

  async validate(botId: string): Promise<IAutoBotDocument> {
    const doc = await this.getById(botId);

    if (!doc) {
      throw new NotFoundException('AutoBot not found');
    }

    return doc as IAutoBotDocument;
  }

  async getAll() {
    return mongoDB.AutoBots.populateModel(mongoDB.Bots.find({}).sort({created: -1}));
  }

  async trigger(trading: BotTradingDto, user: IUserDocument) {
    const botDoc = await this.getById(trading.botId);
    const bot: IAutoBot = botDoc.toObject();
    let result = null;
    if (trading.active) {
      const stateValues = {
        active: true,
        status: ERunningStatus.RUNNING,
      };
      const botState = bot.state.active ? bot.state : stateValues;
      console.log('----botState:', botState)
      result = await this.autobotEngineService.trigger(trading);
      await this.update(botDoc, { state: botState });
    } else {
      const stateValues = {
        active: false,
        status: ERunningStatus.FAILED,
      };
      console.log('----botState:', stateValues)
      
      result = await this.autobotEngineService.trigger(trading);
      await this.update(botDoc, { state: stateValues });
    }
    return result;
  }

  async getLog(botId: string) {
    try {
      const log = fs.readFileSync(config.LOG_DIR_PATH + `/autobot/${botId}.txt`, {
        encoding: "utf8"
      })
      return log;
    } catch (e) {
      return "";
    }
  }

  async getHistory(botId: string) {
    try {
      const transactions = await this.transactionService.getsByAutoBotId(botId);
      return transactions;
    } catch (e) {
      return [];
    }
  }

  async withdrawWallet(botId: string) {
    try {
      return await this.autobotEngineService.withdrawWallet(botId);
    } catch (e) {
      return false;
    }
  }

  async fillDtoByDetail(payload: any) {
    // add or update token to DB
    const tokenDetailReq: TokenDetailReqDto = {
      blockchainId: payload.blockchain,
      nodeId: payload.node,
      dexId: payload.dex,
      walletId: payload.mainWallet,
      tokenAddress: payload.tokenAddress
    };
    const token = await this.tokenService.addByDetail(tokenDetailReq);

    const autobotDto = {
      blockchain: payload.blockchain,
      dex: payload.dex,
      node: payload.node,
      mainWallet: payload.mainWallet,
      coin: payload.coin,
      token: token._id,
      buyAmount: payload.buyAmount,
      pool: payload.pool
    };

    return autobotDto;
  }
}