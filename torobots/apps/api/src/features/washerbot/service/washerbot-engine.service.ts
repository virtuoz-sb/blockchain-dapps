import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosResponse } from "axios";
import { DEV_ENGINE_URL, BotTradingDto } from "@torobot/shared";

@Injectable()
export class WasherBotEngineService {
  client: ReturnType<typeof axios.create>;
  constructor() {
    this.client = axios.create({
      baseURL: DEV_ENGINE_URL,
      // headers: { Authorization: `Bearer ${auth}` },
    });
  }

  async trigger(payload: BotTradingDto) {
    try {
      const ret = await this.client.post("/washerbot/trigger", payload);
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine (${e.message})`);
    }
  }

  async withdrawWallet(botId: string) {
    try {
      const ret = await this.client.post("/washerbot/withdraw", {botId});
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine (${e.message})`);
    }
  }
}