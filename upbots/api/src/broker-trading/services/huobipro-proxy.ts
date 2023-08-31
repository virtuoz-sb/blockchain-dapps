/* eslint-disable new-cap */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */

import { Logger, Injectable, UnprocessableEntityException } from "@nestjs/common";
import * as ccxt from "ccxt";
import { ConfigService } from "@nestjs/config";
import { ExchangeCredentials } from "../models/shared.types";

@Injectable()
export default class HuobiproProxy {
  public accountType = "spot";

  public quoteCurrency = "USDT";

  private readonly logger = new Logger(HuobiproProxy.name);

  private Exchange = ccxt.huobipro;

  private exchange: ccxt.huobipro;

  constructor(private configService: ConfigService) {}

  useLoadBalancer(useFlag: boolean) {}

  private getExchange(cred?: Partial<any>) {
    const exchange = cred ? new this.Exchange(cred) : new this.Exchange();

    const loadBalancer = this.configService.get<string>("CCXT_LOAD_BALANCER_URI");
    if ((!cred || cred.useLoadBalancer) && loadBalancer) {
      const baseUrls = exchange.urls.api as ccxt.Dictionary<string>;
      const defaultHostname = exchange.hostname || "";
      const publicUrl = new URL(baseUrls.public.replace("{hostname}", defaultHostname));
      const privateUrl = new URL(baseUrls.private.replace("{hostname}", defaultHostname));
      exchange.urls.api =
        typeof exchange.urls.api === "string"
          ? loadBalancer
          : {
              ...exchange.urls.api,
              public: loadBalancer + publicUrl.pathname,
              private: loadBalancer + privateUrl.pathname,
            };
      exchange.headers = exchange.headers || {};
      exchange.headers["x-target-upstream"] = publicUrl.hostname;
    }
    return exchange;
  }

  setAccount(exchange: ExchangeCredentials): ccxt.Exchange {
    const password = exchange?.password;
    const secretKey = exchange?.secret;
    const apiKey = exchange?.apiKey;

    const creds = {
      apiKey,
      secret: secretKey,
      password,
      enableRateLimit: true,
      timeout: 10000,
    };

    this.exchange = this.getExchange(creds);
    return this.exchange;
  }

  async createSubAccount(userName: string, note: string) {
    const reqData = {
      userList: [
        {
          userName,
          note,
        },
      ],
    };
    const ret = await this.exchange.v2PrivatePostSubUserCreation(reqData);
    if (!ret || !ret.ok) {
      return null;
    }
    return ret.data[0].uid;
  }

  async createSubAccountApiKey(subUid: string, note: string) {
    const reqData = {
      subUid,
      note,
      permission: "trade,readOnly",
    };
    const ret = await this.exchange.v2PrivatePostSubUserApiKeyGeneration(reqData);
    if (!ret || !ret.ok) {
      return null;
    }
    return ret.data;
  }

  async getDepositAddress(network: string, currency: string) {
    const ret = await this.exchange.fetchDepositAddress(currency, { network: "ERC20" });
    if (!ret) {
      return null;
    }
    return ret.address;
  }

  async getBalance(type: string) {
    const balance = {};
    const ret = await this.exchange.fetchBalance({ type: "spot" });
    for (let i = 0; i < ret.info.data.list.length; i++) {
      if (ret.info.data.list[i].type !== "trade") {
        continue;
      }
      if (Number(ret.info.data.list[i].available) > 0) {
        balance[ret.info.data.list[i].currency] = Number(ret.info.data.list[i].available);
      } else {
        balance[ret.info.data.list[i].currency] = 0;
      }
    }
    return balance;
  }

  async getTransactions() {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const now = this.exchange.milliseconds();
    let startTime = now - thirtyDays * 6;
    const allTransactions = [];

    // get spot account id
    const accounts = await this.exchange.fetchAccounts();
    const spotAccount = accounts.find((account) => account.type === "spot");

    while (startTime < now) {
      const endTime = startTime + thirtyDays;
      const history = await this.exchange.privateGetAccountHistory({
        "account-id": spotAccount?.id,
        "start-time": startTime,
        "end-time": endTime,
      });
      if (history.status === "ok" && history.data.length > 0) {
        history.data.forEach((item) => {
          if (item["transact-type"] === "deposit" || item["transact-type"] === "withdraw") {
            allTransactions.push({
              currency: item.currency,
              type: item["transact-type"],
              amount: item["transact-amt"],
              time: new Date(Number(item["transact-time"])),
            });
          }
        });
      }
      startTime = endTime;
    }
    return allTransactions;
  }
}
