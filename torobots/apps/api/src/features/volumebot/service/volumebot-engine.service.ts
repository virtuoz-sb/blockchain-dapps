import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosResponse } from "axios";
import { DEV_ENGINE_URL, BotTradingDto } from "@torobot/shared";

@Injectable()
export class VolumeBotEngineService {
  client: ReturnType<typeof axios.create>;
  constructor() {
    this.client = axios.create({
      baseURL: DEV_ENGINE_URL,
      // headers: { Authorization: `Bearer ${auth}` },
    });
  }
  async trigger(payload: BotTradingDto) {
    console.log("=======>", payload)
    try {
      const ret = await this.client.post("/volumebot/trigger", payload);
      return ret.data;
    } catch (e) {
      throw new BadRequestException(`Couldn't connect to engine (${e.message})`);
    }
  }
}