/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { SignalTrackingModelName } from "../../algobot/models/signal-tracking.schema";
import { SignalTrackingDto, SignalTrackingModel } from "../../algobot/models/signal-tracking.dto";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import * as Trader from "../models/trader.model";

import CipherService from "../../shared/encryption.service";
import ModelsService from "./models.service";
import ProxyFactoryService from "./listener-proxy/proxy-factory.service";

@Injectable()
export default class ListenersService {
  private readonly logger = new Logger(ListenersService.name);

  private proxies = [];

  constructor(
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>,
    @InjectModel(Trader.ModelName) private TraderModel: Model<Trader.Model>,
    @InjectModel("AlgoBotSubscription") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    private config: ConfigService,
    private cipherService: CipherService,
    private readonly httpService: HttpService,
    private readonly modelsService: ModelsService,
    private proxyFactoryService: ProxyFactoryService
  ) {}

  onModuleInit() {
    if (process.env.DISABLE_CRON_JOBS === "true") {
      this.buildTradersListen();
    }
  }

  async buildTradersListen() {
    const traders = await this.modelsService.getTradersByAdmin({});

    this.proxies = [];
    const promise = traders.map(async (trader) => {
      const exchKey: any = trader.exchKeyId;
      if (!exchKey) {
        return null;
      }

      const proxy = await this.proxyFactoryService.setExchangeProxy(exchKey, trader.botId?.name || "no-bot");
      if (!proxy) {
        return null;
      }

      proxy.on("order@filled", (order) => {
        this.onOrderEvent(trader, order);
      });

      this.proxies.push(proxy);
      return proxy;
    });
    await Promise.all(promise);
  }

  async onOrderEvent(trader: Trader.Model, params: any) {
    const botData: any = trader.botId;
    const botId = botData._id;

    const stratTypeAndPosition = await this.getStratTypeAndPosition(
      botId,
      params.side.toUpperCase(),
      params.base.toUpperCase(),
      params.quote.toUpperCase()
    );

    if (!stratTypeAndPosition) {
      return null;
    }

    const { stratType } = stratTypeAndPosition;
    const { position } = stratTypeAndPosition;
    const apiUrl = `${process.env.API_URL}/api/hook/algobot/`;
    const payload = {
      order: {
        botType: "copybot",
        botId,
        position,
        stratType,
        userFilter: [],
        secret: process.env.WEBHOOK_SECRET,
        params,
      },
    };
    this.logger.error(`***---copy-trading-listeners-orderPayload:: ${JSON.stringify(payload)}`);
    try {
      const res = await this.httpService.post(apiUrl, payload).toPromise();
      const { data } = res;
      return data;
    } catch (err) {
      this.logger.error(`Close Bot order ERROR: ${err}`);
      return err;
    }
  }

  async getStratTypeAndPosition(botId: string, side: string, base: string, quote: string) {
    const payload = {
      stratType: "LONG",
      position: "open",
    };

    payload.position = side === "BUY" ? "open" : "close";

    // const lastSignalTracking = await this.signalTrackingModel
    //   .findOne({ botId, base, quote })
    //   .sort({ signalDateTime: -1, botCycle: -1, botVer: -1, position: 1 });

    // if (!lastSignalTracking || lastSignalTracking.position === "close") {
    //   payload.position = "open";
    //   if (side === "BUY") {
    //     payload.stratType = "LONG";
    //   } else {
    //     payload.stratType = "SHORT";
    //   }
    // } else {
    //   payload.stratType = lastSignalTracking.stratType;
    //   payload.position = "close";
    // }

    return payload;
  }
}
