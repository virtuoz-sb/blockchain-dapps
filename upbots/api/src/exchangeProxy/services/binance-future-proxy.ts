import { Logger, Injectable, UnprocessableEntityException } from "@nestjs/common";
import * as ccxt from "ccxt";
import { ConfigService } from "@nestjs/config";
import { ExchangeKeyValidityStatus } from "../../types";
import { ExchangeBalance } from "../models/exchange-balance.model";
import ExchangeKeyDataService from "../../exchange-key/services/exchange-key.data.service";
import getTradableBalance from "./get-free-balance";
import { ExchangeCredentials } from "../../portfolio/models";
/* eslint-disable new-cap */
/* eslint-disable consistent-return */

@Injectable()
export default class BinanceFutureProxy {
  public accountType = "future";

  public quoteCurrency = "USDT";

  private readonly logger = new Logger(BinanceFutureProxy.name);

  // help to track ccxt instances accross all users (for debugging purposes)
  private instanceId: string;

  private Exchange = ccxt.binanceusdm;

  private exchangeName = "binance-future";

  private isUsingLoadBalancer = true;

  constructor(private dataKeyService: ExchangeKeyDataService, private configService: ConfigService) {
    this.instanceId = Math.random().toString(16).slice(2);
    this.logger.debug(`${this.exchangeName}Proxy instancied, iid:${this.instanceId}`);
  }

  useLoadBalancer(useFlag: boolean) {
    this.isUsingLoadBalancer = useFlag;
  }

  private getExchange(cred?: Partial<ExchangeCredentials>) {
    const exchange = cred ? new this.Exchange(cred) : new this.Exchange();

    const loadBalancer = this.configService.get<string>("CCXT_LOAD_BALANCER_URI");

    if ((!cred || cred.useLoadBalancer) && loadBalancer) {
      const baseUrls = exchange.urls.api as ccxt.Dictionary<string>;
      const defaultHostname = exchange.hostname || "";
      const fapiPublicUrl = new URL(baseUrls.fapiPublic.replace("{hostname}", defaultHostname));
      const fapiPrivateUrl = new URL(baseUrls.fapiPrivate.replace("{hostname}", defaultHostname));
      const fapiPrivateV2Url = new URL(baseUrls.fapiPrivateV2.replace("{hostname}", defaultHostname));
      const publicUrl = new URL(baseUrls.public.replace("{hostname}", defaultHostname));
      const privateUrl = new URL(baseUrls.private.replace("{hostname}", defaultHostname));
      const v1Url = new URL(baseUrls.v1.replace("{hostname}", defaultHostname));
      // const v3Url = new URL(baseUrls.v3.replace("{hostname}", defaultHostname));
      exchange.urls.api =
        typeof exchange.urls.api === "string"
          ? loadBalancer
          : {
              ...exchange.urls.api,
              fapiPublic: loadBalancer + fapiPublicUrl.pathname,
              fapiPrivate: loadBalancer + fapiPrivateUrl.pathname,
              fapiPrivateV2: loadBalancer + fapiPrivateV2Url.pathname,
              public: loadBalancer + publicUrl.pathname,
              private: loadBalancer + privateUrl.pathname,
              v1: loadBalancer + v1Url.pathname,
              // v3: loadBalancer + v3Url.pathname,
            };
      exchange.headers = exchange.headers || {};
      exchange.headers["x-target-upstream"] = fapiPublicUrl.hostname;
    }
    // this.logger.debug(`${this.exchangeName}Proxy exchange -> ${JSON.stringify(exchange)}`);
    return exchange;
  }

  async decimalToPrecision(num: number, numPrecisionDigits: number): Promise<number> {
    const exchange = this.getExchange();
    const res = await exchange.decimalToPrecision(num, exchange.ROUND, numPrecisionDigits, exchange.precisionMode);
    return parseFloat(res);
  }

  getTotalBalance(keyId, userId: string, cred: ExchangeCredentials): Promise<ExchangeBalance> {
    this.logger.debug(`${this.exchangeName}Proxy getTotalBalance  iid:${this.instanceId} userid:${userId}`);
    const account = this.setAccount(cred);

    return Promise.resolve(
      account
        .fetchTotalBalance({ recvWindow: 28000 })
        .then((mainAccountBalances) => {
          this.logger.debug(
            `${this.exchangeName}Proxy getTotalBalance finished iid:${this.instanceId} userid:${userId} -> ${JSON.stringify(
              mainAccountBalances
            )}`
          );
          return {
            keyId,
            exchange: this.exchangeName,
            subAccountBalances: [],
            totalBalances: mainAccountBalances,
          };
        })
        .catch((err) => {
          this.logger.error(`getTotalBalance usr ${userId} key ${keyId} err: ${err}`);

          // disable the key
          if (err.name === "ExchangeError" || err.name === "AuthenticationError") {
            this.logger.warn(`getTotalBalance usr ${userId} key ${keyId} will invalidate key because error: ${err}`);
            this.dataKeyService.updateValidityStatus(keyId, false, err.message);
          }
          return { keyId, exchange: this.exchangeName, subAccountBalances: [], totalBalances: {}, error: err };
          // return this.handleError(err);
          // throw err;
        })
    ); // {"code":-1131,"msg":"'recvWindow' must be less than 60000."}
  }

  getFreeBalance(keyId, userId: string, cred: ExchangeCredentials): Promise<ExchangeBalance> {
    this.logger.debug(`${this.exchangeName}Proxy getFreeBalance  iid:${this.instanceId} userid:${userId}`);
    const account = this.setAccount(cred);
    return getTradableBalance(this.exchangeName, userId, keyId, account, this.dataKeyService, this.logger);
  }

  private setAccount(cred: ExchangeCredentials): ccxt.Exchange {
    const passwordRequired = this.getExchange().requiredCredentials.password;
    const password = cred?.password;
    const secretKey = cred?.secret;
    const apiKey = cred?.apiKey;

    if (passwordRequired && !password) {
      throw new UnprocessableEntityException(`Login to ${this.Exchange.name} failed`, "Password is required");
    }

    const creds = {
      apiKey,
      secret: secretKey,
      password,
      enableRateLimit: true,
      timeout: 30000,
      useLoadBalancer: cred.useLoadBalancer === undefined ? this.isUsingLoadBalancer : cred.useLoadBalancer,
      options: { defaultType: "future", warnOnFetchOpenOrdersWithoutSymbol: false },
    };

    if (passwordRequired) {
      creds.password = password;
    }

    return this.getExchange(creds);
  }

  checkCredentialsOnCreation(cred: ExchangeCredentials): Promise<boolean> {
    const account = this.setAccount(cred);
    return Promise.resolve(account.fetchTotalBalance({ recvWindow: 28000 }).then((res) => true)).catch((err) => {
      this.logger.error(JSON.stringify(err, null, 2), "BinanceProxy");
      return Promise.reject(
        new UnprocessableEntityException(
          "Credentials error",
          "Couldn't add your API key. Please double check your public and secret key or retry later."
        )
      );
    });
  }

  healthValidityCheck(cred: ExchangeCredentials): Promise<ExchangeKeyValidityStatus> {
    const account = this.setAccount(cred);
    const keyValidityStatus = account
      .fetchTotalBalance({ recvWindow: 28000 })
      .then((res) => {
        return { valid: true, error: "No error" };
      })
      .catch((err) => {
        return { valid: false, error: err.message };
      });
    return keyValidityStatus;
  }

  handleError(err) {
    if (err instanceof ccxt.DDoSProtection || err.message.includes("ECONNRESET")) {
      this.logger.error(`[DDoS Protection] ${err.message}`);
      return Promise.reject(new Error(`[DDoS Protection] ${err.message}`));
    }
    if (err instanceof ccxt.RequestTimeout) {
      this.logger.error(`[Request Timeout] ${err.message}`);
      return Promise.reject(new Error(`[Request Timeout] ${err.message}`));
    }
    if (err instanceof ccxt.AuthenticationError) {
      this.logger.error(`[Authentication Error] ${err.message}`);
      return Promise.reject(new Error(`[Authentication Error] ${err.message}`));
    }
    if (err instanceof ccxt.ExchangeNotAvailable) {
      this.logger.error(`[Exchange Not Available Error] ${err.message}`);
      return Promise.reject(new Error(`[Exchange Not Available Error] ${err.message}`));
    }
    if (err instanceof ccxt.ExchangeError) {
      this.logger.error(`[Exchange Error] ${err.message}`);
      return Promise.reject(new Error(`[Exchange Error] ${err.message}`));
    }
    if (err instanceof ccxt.NetworkError) {
      this.logger.error(`[Network Error] ${err.message}`);
      return Promise.reject(new Error(`[Network Error] ${err.message}`));
    }
    throw err;
  }
}
