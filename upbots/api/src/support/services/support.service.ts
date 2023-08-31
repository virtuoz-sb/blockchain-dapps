import { Injectable, Logger } from "@nestjs/common";
import ExchangeKeyService from "../../exchange-key/services/exchange-key.service";
import { GetCurrencyOwnersDto } from "../models/currency-owners.dto";
import UserService from "../../shared/user.service";
import UbxtStakingService from "./ubxt-stacking.service";
import ProxyFactoryService from "../../exchangeProxy/services/proxy-factory.service";

@Injectable()
export default class SupportService {
  // FIXME: remove SupportService when UbxtStakingService is released to prod
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private exchangeKeyService: ExchangeKeyService,
    private proxyFactoryService: ProxyFactoryService,
    private userService: UserService
  ) {}

  async getCurrencyOwners(currency: string): Promise<GetCurrencyOwnersDto> {
    this.logger.warn(`use of deprecated service, please use ${UbxtStakingService.name} instead`);
    const keys = await this.exchangeKeyService.getAllDecryptedExchangeCredentials();
    // READ IN PARALLEL APPROACH
    /* eslint-disable consistent-return */
    const getCurrencyKeysBalances = keys.map(async (key) => {
      try {
        const proxy = this.proxyFactoryService.setExchangeProxy(key.exchangeName);
        return proxy.getTotalBalance(key.id, key.userId, key.credentials).then((res) => {
          return {
            user: key.userId,
            balances: res?.totalBalances[currency] || 0,
          };
        });
      } catch (err) {
        this.logger.error(`[getCurrencyOwners::error] ${err.message}`);
      }
    });

    const currencyKeysBalances = await Promise.all(getCurrencyKeysBalances);
    const currencyOwners = [...new Set(currencyKeysBalances.filter((key) => key.balances).map((key) => String(key.user)))];
    // const currencyOwners = [...new Set(getCurrencyKeysBalances.filter((key) => key.balances).map((key) => String(key.user)))];
    const owners = await Promise.all(currencyOwners.map((userId) => this.userService.findUserById(userId)));

    return {
      failures: -1,
      currency,
      ownersCount: currencyOwners.length,
      owners: owners.map((owner) => {
        return { id: owner.id, email: owner.email };
      }),
      countingDate: new Date(),
    };
  }
}
