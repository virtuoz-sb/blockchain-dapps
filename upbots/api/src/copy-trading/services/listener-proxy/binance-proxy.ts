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
export default class BinanceProxy extends EventEmitter {
  private readonly logger = new Logger(BinanceProxy.name);

  private name = "";

  public accountType = "spot";

  private exchangeName = "binance";

  private isUsingLoadBalancer = true;

  private Exchange = ccxt.binance;

  private exchange = null;

  private ws: WebSocket = null;

  private keepAliveTimer = null;

  private isAlive = false;

  private listenKey = null;

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

    this.logger.error(`***---(${this.name})-copyTrading-binance-publicKey: ${exchange?.publicKey}`);

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
      /// //////////test
      // await this.testOrder(false);
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
      this.logger.error(`***---(${this.name})-copyTrading-binance-totalBalance: ${JSON.stringify(availableTotalBalance)}`);
      return availableTotalBalance;
    } catch (e) {
      this.logger.error(`***---(${this.name})-copyTrading-binance-totalBalance-err: ${e.message}`);
      return null;
    }
  }

  async initUserWebsocket() {
    let response;
    try {
      // response = await this.exchange.fapiPrivatePostListenKey();
      response = await this.exchange.publicPostUserDataStream();
      this.logger.error(`***---(${this.name})-copyTrading-binance-initUserWebsocket-listenKey: ${response.listenKey}`);
    } catch (e) {
      this.logger.error(`***---(${this.name})-copyTrading-binance-initUserWebsocket-listenKey-error: ${e.message}`);
      return undefined;
    }

    if (!response || !response.listenKey) {
      this.logger.error(`***---(${this.name})-copyTrading-binance-initUserWebsocket-listenKey-response-err: ${JSON.stringify(response)}`);
      return undefined;
    }

    this.listenKey = response.listenKey;
    const me = this;
    const wsloadBalancer = this.configService.get<string>("CCXT_LOAD_BALANCER_WSURI_BINANCE");
    let ws: WebSocket;
    if (wsloadBalancer) {
      const wsURL = wsloadBalancer;
      ws = this.ws = new WebSocket(`${wsURL}/ws/${response.listenKey}`, {
        headers: {
          // "x-target-upstream": "stream.binance.com",
          Hostname: "stream.binance.com",
        },
        rejectUnauthorized: false,
      });
    } else {
      // const wssURL = "wss://ws-api.binance.com/ws-api/v3";
      const wssURL = "wss://stream.binance.com:9443";
      ws = this.ws = new WebSocket(wssURL);
    }
    ws.onerror = function (e) {
      me.logger.error(`***---(${me.name})-copyTrading-binance-initUserWebsocket-connectionError: ${e.message}`);
    };

    ws.onopen = function () {
      me.logger.error(`***---(${me.name})-copyTrading-binance-initUserWebsocket-openedUserStream`);
    };

    ws.onmessage = async function (event) {
      if (event && event.type === "message") {
        const message = JSON.parse(event.data);
        if (message.e === "executionReport") {
          const order = message;

          if (order.X === "FILLED") {
            const market = await me.settingsDataService.getExchangeMarket(me.exchangeName, order.s);
            order.base = market.baseCurrency;
            order.quote = market.quoteCurrency;
            me.processOrder(order);
          }
        }
      }
    };

    const heartbeat = (this.keepAliveTimer = setInterval(async () => {
      try {
        await me.exchange.publicPutUserDataStream({ listenKey: me.listenKey });
        // me.logger.debug("***---copyTrading-binance: user stream ping successfully done");
      } catch (e) {
        me.logger.error(`***---(${me.name})-copyTrading-binance: user stream ping error: ${e.message}`);
      }
    }, 1000 * 60 * 30));

    ws.onclose = function () {
      me.logger.error(`***---(${me.name})-copyTrading-binance: User stream connection closed.`);
      clearInterval(heartbeat);

      if (!this.isAlive) {
        return;
      }

      setTimeout(async () => {
        me.logger.error(`***---(${me.name})-copyTrading-binance: User stream connection reconnect`);
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
      params.side = order.S;
      params.quote = order.quote;
      params.base = order.base;
      const totalBalance = await this.exchange.fetchTotalBalance({
        recvWindow: 28000,
      });
      const tradedAmounts = Number(order.z) * Number(order.L);
      if (params.side === "BUY") {
        const quoteAmount = totalBalance[order.quote];
        params.openPercent = tradedAmounts / (tradedAmounts + quoteAmount);
      } else {
        const baseAmount = totalBalance[order.base];
        params.openPercent = Number(order.z) / (Number(order.z) + baseAmount);
      }
      console.warn(`***---(${this.name})-copyTrading-binance-processOrder:`, params);
      this.emit("order@filled", params);
    } catch (e) {
      console.error(`***---(${this.name})-copyTrading-binance-processOrder-err:`, e.message);
    }
  }

  async testOrder(buyOrSell: boolean) {
    const buyOrder = {
      s: "ETHUSDT",
      c: "003a630c26071c029688e43c",
      S: "BUY",
      o: "MARKET",
      f: "GTC",
      q: "0.030",
      p: "0",
      ap: "1132.09000",
      sp: "0",
      x: "TRADE",
      X: "FILLED",
      i: 8389765526892658000,
      l: "0.030",
      z: "0.030",
      L: "1132.09",
      n: "0.01358508",
      N: "USDT",
      T: 1655735682026,
      t: 1793310376,
      b: "0",
      a: "0",
      m: false,
      R: false,
      wt: "CONTRACT_PRICE",
      ot: "MARKET",
      ps: "BOTH",
      cp: false,
      rp: "-0.15840000",
      pP: false,
      si: 0,
      ss: 0,
      symbol: "ETHUSDT",
      clientOrderId: "003a630c26071c029688e43c",
      side: "BUY",
      type: "MARKET",
      timeInForce: "GTC",
      origQty: "0.030",
      orgPrice: "0",
      avgPrice: "1132.09000",
      stopPrice: "0",
      status: "FILLED",
      orderId: 8389765526892658000,
      quote: "USDT",
      updateTime: 1655735682026,
    };

    const sellOrder = {
      s: "ETHUSDT",
      c: "003a630c26071c029688e43c",
      S: "SELL",
      o: "MARKET",
      f: "GTC",
      q: "0.030",
      p: "0",
      ap: "1126.81000",
      sp: "0",
      x: "TRADE",
      X: "FILLED",
      i: 8389765526891867000,
      l: "0.023",
      z: "0.030",
      L: "1126.81",
      n: "0.01036665",
      N: "USDT",
      T: 1655735300806,
      t: 1793276560,
      b: "0",
      a: "0",
      m: false,
      R: false,
      wt: "CONTRACT_PRICE",
      ot: "MARKET",
      ps: "BOTH",
      cp: false,
      rp: "0",
      pP: false,
      si: 0,
      ss: 0,
      symbol: "ETHUSDT",
      clientOrderId: "003a630c26071c029688e43c",
      side: "SELL",
      type: "MARKET",
      timeInForce: "GTC",
      origQty: "0.030",
      orgPrice: "0",
      avgPrice: "1126.81000",
      stopPrice: "0",
      status: "FILLED",
      orderId: 8389765526891867000,
      quote: "USDT",
      updateTime: 1655735300806,
    };

    if (buyOrSell) {
      this.processOrder(buyOrder);
    } else {
      this.processOrder(sellOrder);
    }
  }
}
