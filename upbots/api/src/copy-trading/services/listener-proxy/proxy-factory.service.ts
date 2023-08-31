/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { ExchangeKey } from "../../../types";

import BinanceFutureProxy from "./binance-future-proxy";
import BinanceProxy from "./binance-proxy";
import KucoinProxy from "./kucoin-proxy";

import SettingsDataService from "../../../settings/services/settings.data.service";

@Injectable()
export default class ProxyFactoryService {
  private readonly logger = new Logger(ProxyFactoryService.name);

  constructor(private configService: ConfigService, private settingsDataService: SettingsDataService) {}

  async setExchangeProxy(exchange: ExchangeKey, name: string): Promise<any> {
    let proxy = null;

    if (exchange.exchange === "kucoin") {
      proxy = new KucoinProxy(this.configService, this.settingsDataService);
    } else if (exchange.exchange === "binance") {
      proxy = new BinanceProxy(this.configService, this.settingsDataService);
    } else if (exchange.exchange === "binance-future") {
      proxy = new BinanceFutureProxy(this.configService, this.settingsDataService);
    }

    if (proxy) {
      if (!proxy.setAccount(exchange, name)) {
        return null;
      }
      return proxy;
    }

    return null;
  }
}
