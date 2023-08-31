import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import * as fs from 'fs';
import config from "../../../config";
import { WasherBotDto } from '../dto/washerbot.dto';
import {
  mongoDB,
  IWasherBotDocument,
  IUserDocument,
  BotTradingDto,
  EWasherBotStatus,
  WasherFilter,
  BlockchainClient,
  IBlockchain,
  INode,
  EWasherBotActionResult
} from "@torobot/shared";

import { TokenService } from '../../token/service/token.service';
import { TokenDetailReqDto } from '../../token/dto/token.dto';
import { WasherBotEngineService } from './washerbot-engine.service';
import { ObjectId } from 'mongodb';
import { CounterService } from 'src/features/counter/service/counter.service';

@Injectable()
export class WasherBotService {
  constructor(
    private botEngineService: WasherBotEngineService,
    private tokenService: TokenService,
    private counterService: CounterService,
  ) { }

  async create(bot: WasherBotDto, user: IUserDocument) {
    const uniqueNum = await this.counterService.getNextSequenceValue("WasherBot");
    const object = await mongoDB.WasherBots.create({...bot, owner: user._id, uniqueNum: uniqueNum});
    return this.getById(object._id);
  }

  async getById(botId: string) {
    const doc = await mongoDB.WasherBots.populateModel(mongoDB.WasherBots.findById(botId));
    return doc as IWasherBotDocument;
  }

  async update(bot: IWasherBotDocument, body: UpdateQuery<IWasherBotDocument>) {
    await mongoDB.WasherBots.findOneAndUpdate({_id: bot._id}, body);
    return this.getById(bot._id);
  }

  delete(bot: IWasherBotDocument) {
    return mongoDB.WasherBots.findOneAndDelete({ _id: bot._id });
  }

  async validate(botId: string): Promise<IWasherBotDocument> {
    const doc = await this.getById(botId);

    if (!doc) {
      throw new NotFoundException('WasherBot not found');
    }
    return doc as IWasherBotDocument;
  }

  async getAll() {
    return mongoDB.WasherBots.populateModel(mongoDB.WasherBots.find({}).sort({created: -1}));
  }

  async getLog(botId: string) {
    try {
      const log = fs.readFileSync(config.LOG_DIR_PATH + `/washerbot/${botId}.txt`, {
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

    const washerbotDto = {
      blockchain: payload.blockchain,
      exchangeType: payload.exchangeType,
      dex: payload.dex,
      node: payload.node,
      coin: payload.coin,
      token: token._id,
      wallet: payload.wallet,
      subWallets: payload.subWallets,
      depositMainCoin: payload.depositMainCoin,
      depositBaseCoin: payload.depositBaseCoin,
      cexAccount: payload.cexAccount,
      accountId: payload.accountId,
      cex: payload.cex,
      start: payload.start,
      end: payload.end,
      targetVolume: payload.targetVolume,
      cntWallet: payload.cntWallet,
      slippageLimit: payload.slippageLimit,
      minTradingAmount: payload.minTradingAmount,
      dailyLossLimit: payload.dailyLossLimit,
      coinmarketcapId: payload.coinmarketcapId
    }

    return washerbotDto;
  }

  async withdrawWallet(botId: string) {
    try {
      return await this.botEngineService.withdrawWallet(botId);
    } catch (e) {
      return false;
    }
  }

  async trigger(trading: BotTradingDto, user: IUserDocument) {
    const botDoc = await this.getById(trading.botId);
    let result = null;
    if (trading.active) {
      result = await this.botEngineService.trigger(trading);
      await this.update(botDoc, {
        state: {
          status: EWasherBotStatus.RUNNING,
          result: EWasherBotActionResult.DRAFT
        },
        stateNum: 1
      });
    } else {
      result = await this.botEngineService.trigger(trading);
      await this.update(botDoc, {
        state: {
          status: EWasherBotStatus.STOPPED,
          result: EWasherBotActionResult.DRAFT
        },
        stateNum: 0
      });
    }
    return result;
  }

  async getAllStatus() {
    return mongoDB.WasherBots.find().select("id state tokenSold");
  }

  async search(filter: WasherFilter) {
    let tokenId = "";
    if (filter.tokenAddress && filter.tokenAddress !== '') {
      const token = (await mongoDB.Tokens.findOne({address: filter.tokenAddress}));
      tokenId = token ? token._id : new ObjectId("000000000000000000000000");
    }
    const where = {
      ...(filter.exchangeType ? {exchangeType: filter.exchangeType} : {}),
      ...(filter.chain ? {blockchain: filter.chain} : {}),
      ...(filter.tokenAddress !== '' ? {token: tokenId} : {}),
    };
    const length = filter.pageLength || 10;
    const start = filter.page ? (filter.page - 1) * length : 0;
    const total = await mongoDB.WasherBots.countDocuments({...where});
    const data = await mongoDB.WasherBots.populateModel(
      mongoDB.WasherBots
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
