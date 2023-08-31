import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosResponse } from "axios";
import { DEV_ENGINE_URL, BotTradingDto } from "@torobot/shared";

@Injectable()
export class TokenCreatorBotEngineService {
  client: ReturnType<typeof axios.create>;
  constructor() {
    this.client = axios.create({
      baseURL: DEV_ENGINE_URL,
      // headers: { Authorization: `Bearer ${auth}` },
    });
  }

  async create(botId: string) {
    try {
      const ret = await this.client.post("/tokencreatorbot/create", {botId});
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine (${e.message})`);
    }
  }

  async mintToken(payload: {amount: string, creatorId: string}) {
    try {
      const ret = await this.client.post("/tokencreatorbot/tokenmint", { botId: payload.creatorId, amount: payload.amount });
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine (${e.message})`);
    }
  }

  async burnToken(payload: {amount: string, creatorId: string}) {
    try {
      const ret = await this.client.post(
        "/tokencreatorbot/tokenburn", 
        { 
          botId: payload.creatorId, 
          amount: payload.amount 
        }
      );
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine (${e.message})`);
    }
  }

  async addLP(payload: {baseCoinAddress: string, baseCoinAmount: string, tokenAmount: string, dexId: string, creatorId: string}) {
    try {
      const ret = await this.client.post(
        "/tokencreatorbot/addlp", 
        {
          botId: payload.creatorId,
          baseCoinAddress: payload.baseCoinAddress,
          baseCoinAmount: payload.baseCoinAmount,
          tokenAmount: payload.tokenAmount,
          dexId: payload.dexId
        }
      );
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine(${e.message})`);
    }
  }

  async removeLP(payload: {baseCoinAddress: string, lpAddress: string, lpAmount: string, dexId: string, creatorId: string}) {
    try {
      const ret = await this.client.post(
        "/tokencreatorbot/removelp",
        {
          botId: payload.creatorId,
          baseCoinAddress: payload.baseCoinAddress,
          lpAddress: payload.lpAddress,
          lpAmount: payload.lpAmount,
          dexId: payload.dexId
        }
      );
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine(${e.message})`);
    }
  }
}