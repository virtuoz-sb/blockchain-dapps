/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-multi-assign */
/* eslint-disable prefer-destructuring */

import { EventEmitter } from "events";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import * as WebSocket from "ws";

import * as ccxt from "ccxt";
import { ConfigService } from "@nestjs/config";
import { ExchangeKey } from "../../../types";

import * as Trader from "../../models/trader.model";

import SettingsDataService from "../../../settings/services/settings.data.service";

@Injectable()
export default class KucoinProxy extends EventEmitter {
  private readonly logger = new Logger(KucoinProxy.name);

  private name = "";

  public accountType = "spot";

  private exchangeName = "kucoin";

  private isUsingLoadBalancer = true;

  private Exchange = ccxt.kucoin;

  private exchange = null;

  private ws: WebSocket = null;

  private keepAliveTimer = null;

  private isAlive = false;

  private connectionToken = null;

  private connectionId = null;

  private pingIntervalTime = 1000 * 10;

  private lastOrderId = null;

  constructor(private configService: ConfigService, private settingsDataService: SettingsDataService) {
    super();
    this.setMaxListeners(0);
    this.isAlive = true;
  }

  private getExchange(cred?: Partial<any>) {
    const exchange = cred ? new this.Exchange(cred) : new this.Exchange();

    const loadBalancer = this.configService.get<string>("CCXT_LOAD_BALANCER_URI");

    if ((!cred || this.isUsingLoadBalancer) && loadBalancer) {
      const baseUrls = exchange.urls.api as ccxt.Dictionary<string>;
      const defaultHostname = exchange.hostname || "";
      const publicUrl = new URL(baseUrls.public.replace("{hostname}", defaultHostname));
      const privateUrl = new URL(baseUrls.private.replace("{hostname}", defaultHostname));
      const v1Url = new URL(baseUrls.v1.replace("{hostname}", defaultHostname));
      // const v2Url = new URL(baseUrls.v2.replace("{hostname}", defaultHostname));
      // const v3Url = new URL(baseUrls.v3.replace("{hostname}", defaultHostname));
      exchange.urls.api =
        typeof exchange.urls.api === "string"
          ? loadBalancer
          : {
              ...exchange.urls.api,
              public: loadBalancer + publicUrl.pathname,
              private: loadBalancer + privateUrl.pathname,
              v1: loadBalancer + v1Url.pathname,
              // v2: loadBalancer + v2Url.pathname,
              // v3: loadBalancer + v3Url.pathname,
            };
      exchange.headers = exchange.headers || {};
      exchange.headers["x-target-upstream"] = publicUrl.hostname;
    }
    return exchange;
  }

  async setAccount(exchange: ExchangeKey, name = ""): Promise<ccxt.Exchange> {
    this.name = name;

    const password = exchange?.password;
    const secretKey = exchange?.secretKey;
    const apiKey = exchange?.publicKey;

    const creds = {
      apiKey,
      secret: secretKey,
      password,
      enableRateLimit: true,
      timeout: 30000,
      useLoadBalancer: false, // cred.useLoadBalancer === undefined ? this.isUsingLoadBalancer : cred.useLoadBalancer,
    };

    this.exchange = this.getExchange(creds);

    const totalBalance = await this.fetchTotalBalance();
    if (!totalBalance) {
      return null;
    }

    const me = this;
    setTimeout(async () => {
      await me.initUserWebsocket();
    }, 2000);

    return this.exchange;
  }

  async fetchTotalBalance() {
    try {
      const totalBalance = await this.exchange.fetchTotalBalance({
        recvWindow: 28000,
      });
      const availableTotalBalance = {};
      Object.entries(totalBalance).map((balance: any[]) => {
        if (Number(balance[1]) > 0) {
          availableTotalBalance[balance[0]] = balance[1];
        }
        return 0;
      });
      this.logger.warn(`***---(${this.name})-copyTrading-kucoin-totalBalance: ${JSON.stringify(availableTotalBalance)}`);
      return availableTotalBalance;
    } catch (e) {
      this.logger.warn(`***---(${this.name})-copyTrading-kucoin-totalBalance-err: ${e.message}`);
      return null;
    }
  }

  async initUserWebsocket() {
    let response;
    try {
      response = await this.exchange.privatePostBulletPrivate();
      this.logger.warn(`***---(${this.name})-copyTrading-kucoin-initUserWebsocket-token: ${response.data.token}`);
    } catch (e) {
      this.logger.error(`***---(${this.name})-copyTrading-kucoin-initUserWebsocket-token-error: ${e.message}`);
      return undefined;
    }

    if (!response || response.code !== "200000" || !response.data?.token) {
      this.logger.error(`***---(${this.name})-copyTrading-kucoin-initUserWebsocket-token-response-err: ${JSON.stringify(response)}`);
      return undefined;
    }

    this.connectionToken = response.data.token;
    this.pingIntervalTime = response.data.instanceServers[0].pingInterval;
    const webSocketURL = response.data.instanceServers[0].endpoint;
    const me = this;
    const ws = (this.ws = new WebSocket(`${webSocketURL}?token=${this.connectionToken}`));
    ws.onerror = function (e) {
      me.logger.warn(`***---(${me.name})-copyTrading-kucoin-initUserWebsocket-connectionError: ${e.message}`);
    };

    ws.onopen = function () {
      me.logger.warn(`***---(${me.name})-copyTrading-kucoin-initUserWebsocket-openedUserStream`);
    };

    ws.onmessage = async function (event) {
      if (event && event.type === "message") {
        const message = JSON.parse(event.data);
        if (message.type === "welcome") {
          this.connectionId = message.id;
          ws.send(
            JSON.stringify({
              id: this.connectionId,
              type: "subscribe",
              topic: "/spotMarket/tradeOrders",
              privateChannel: true,
              response: true,
            })
          );
        } else if (message.type === "message" && message.topic === "/spotMarket/tradeOrders" && message.subject === "orderChange") {
          const order = message.data;
          if (message.data.status === "done") {
            if (this.lastOrderId === order.orderId) {
              return;
            }
            this.lastOrderId = order.orderId;
            const market = await me.settingsDataService.getExchangeMarket(me.exchangeName, order.symbol);
            order.side = order.side.toUpperCase();
            order.base = market.baseCurrency;
            order.quote = market.quoteCurrency;
            me.processOrder(order);
          }
        }
      }
    };

    const heartbeat = (this.keepAliveTimer = setInterval(async () => {
      try {
        ws.send(
          JSON.stringify({
            id: this.connectionId,
            type: "ping",
          })
        );
        // me.logger.debug("***---copyTrading-kucoin: user stream ping successfully done");
      } catch (e) {
        me.logger.error(`***---(${me.name})-copyTrading-kucoin: user stream ping error: ${e.message}`);
      }
    }, this.pingIntervalTime));

    ws.onclose = function () {
      me.logger.warn(`***---(${me.name})-copyTrading-kucoin: User stream connection closed.`);
      clearInterval(heartbeat);

      if (!this.isAlive) {
        return;
      }

      setTimeout(async () => {
        me.logger.warn(`***---(${me.name})-copyTrading-kucoin: User stream connection reconnect`);
        await me.initUserWebsocket();
      }, 1000 * 30);
    };

    return true;
  }

  async closeAll() {
    this.isAlive = false;
    this.ws.terminate();
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }
  }

  async processOrder(order) {
    const params = {
      side: "",
      base: "",
      quote: "",
      openPercent: 0,
    };
    try {
      params.side = order.side;
      params.quote = order.quote;
      params.base = order.base;
      const totalBalance = await this.exchange.fetchTotalBalance({
        recvWindow: 28000,
      });
      const tradedAmounts = Number(order.funds);
      if (params.side === "BUY") {
        const quoteAmount = totalBalance[order.quote];
        params.openPercent = tradedAmounts / (tradedAmounts + quoteAmount);
      } else {
        const baseAmount = totalBalance[order.base];
        params.openPercent = Number(order.size) / (Number(order.size) + baseAmount);
      }
    } catch (e) {
      console.log(`***---(${this.name})-copyTrading-kucoin-processOrder-err:`, e.message);
    }
    this.emit("order@filled", params);
  }
}
