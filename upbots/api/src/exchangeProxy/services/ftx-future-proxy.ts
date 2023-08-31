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
export default class FtxFutureProxy {
  public accountType = "future";

  public quoteCurrency = "USD";

  private readonly logger = new Logger(FtxFutureProxy.name);

  // help to track ccxt instances accross all users (for debugging purposes)
  private instanceId: string;

  private Exchange = ccxt.ftx;

  private exchangeName = "ftx";

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

  async decimalToPrecision(num: number, numPrecisionDigits: number): Promise<number> {
    const exchange = this.getExchange();
    const res = await exchange.decimalToPrecision(num, exchange.ROUND, numPrecisionDigits, exchange.precisionMode);
    return parseFloat(res);
  }

  async getTotalBalance(keyId, userId: string, cred: ExchangeCredentials): Promise<ExchangeBalance> {
    this.logger.debug(`${this.exchangeName}Proxy getTotalBalance  iid:${this.instanceId} userid:${userId}`);
    const account = this.setAccount(cred);

    return account
      .fetchTotalBalance({ recvWindow: 28000 })
      .then((mainAccountBalances) => {
        /* FTX compute total */
        const allBalances = [mainAccountBalances];
        let totalBalances = {};
        allBalances.forEach((balance) => {
          Object.keys(balance).forEach((coin) => {
            if (totalBalances[coin]) {
              totalBalances = { ...totalBalances, [coin]: totalBalances[coin] += balance[coin] };
            } else {
              totalBalances = { ...totalBalances, [coin]: balance[coin] };
            }
          });
        });

        return {
          keyId,
          exchange: this.exchangeName,
          subAccountBalances: [{ nickname: "main", balances: mainAccountBalances }],
          totalBalances,
        };
      })
      .catch((err) => {
        this.logger.error(`getTotalBalance usr ${userId} key ${keyId} error : ${err}`);

        // disable the key
        if (err.name === "ExchangeError" || err.name === "AuthenticationError") {
          this.logger.warn(`getTotalBalance usr ${userId} key ${keyId} will invalidate key because error: ${err}`);
          this.dataKeyService.updateValidityStatus(keyId, false, err.message);
        }
        return { keyId, exchange: this.exchangeName, subAccountBalances: [], totalBalances: {}, error: err };
      });
  }

  getFreeBalance(keyId, userId: string, cred: ExchangeCredentials): Promise<ExchangeBalance> {
    this.logger.debug(`${this.exchangeName}Proxy getFreeBalance  iid:${this.instanceId} userid:${userId}`);
    const account = this.setAccount(cred);
    // TODO: maybe check for feeBalances for FTX subaccounts..
    return getTradableBalance(this.exchangeName, userId, keyId, account, this.dataKeyService, this.logger);
  }

  private setAccount(cred: ExchangeCredentials): ccxt.Exchange {
    const passwordRequired = this.getExchange().requiredCredentials.password;
    const password = cred?.password;
    const secretKey = cred?.secret;
    const apiKey = cred?.apiKey;
    const subAccount = cred?.subAccountName;

    if (passwordRequired && !password) {
      throw new UnprocessableEntityException(`Login to ${this.Exchange.name} failed`, "Password is required");
    }

    const creds = {
      apiKey,
      secret: secretKey,
      password,
      enableRateLimit: true,
      timeout: 10000,
      headers: undefined,
    };

    if (passwordRequired) {
      creds.password = password;
    }
    if (subAccount && subAccount.length > 0) {
      const h = {};
      h["FTX-SUBACCOUNT"] = subAccount;
      creds.headers = h;
      this.logger.log(`FTX subaccount set up ${creds.headers}`);
    }

    return this.getExchange(creds);
  }

  checkCredentialsOnCreation(cred: ExchangeCredentials): Promise<boolean> {
    const account = this.setAccount(cred);

    return Promise.resolve(account.fetchTotalBalance({ recvWindow: 28000 }).then((res) => true)).catch((err) => {
      this.logger.error(JSON.stringify(err, null, 2), "FtxProxy");
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
