import { Logger, Injectable } from "@nestjs/common";
import ExchangeKeyService from "src/exchange-key/services/exchange-key.service";
import { CredentialInfo } from "src/portfolio/models";
import ProxyFactoryService from "src/exchangeProxy/services/proxy-factory.service";
import UserService from "../../shared/user.service";
import { GetCurrencyOwnersDto } from "../models/currency-owners.dto";

@Injectable()
export default class UbxtStakingService {
  private readonly logger = new Logger(UbxtStakingService.name);

  constructor(
    private exchangeKeyService: ExchangeKeyService,
    private proxyFactory: ProxyFactoryService,
    private userService: UserService
  ) {}

  async getUbxtStackingUsers(): Promise<GetCurrencyOwnersDto> {
    const currency = "UBXT_LOCKED";
    const keys: CredentialInfo[] = await this.exchangeKeyService.getDecryptedExchangeCredentialsForExchange("ftx");

    const ftxProxy = this.proxyFactory.getFtxProxy();
    const balancePromises = keys.map((keyInfo) => {
      return ftxProxy
        .getTotalBalance(keyInfo.id, keyInfo.userId, keyInfo?.credentials)
        .then((res) => {
          this.logger.debug(`getUbxtStackingUsers -> getTotalBalance ${res?.totalBalances[currency]}, user ${keyInfo?.userId}`);
          return {
            user: keyInfo?.userId,
            balances: res?.totalBalances[currency] || 0,
            onError: !!res.error,
          };
        })
        .catch((err) => {
          // makes sure a crash on get balance does not stop the entire promise.All (later in the code)
          this.logger.error(
            `getUbxtStackingUsers -> getTotalBalance error caught for user ${keyInfo.userId} keyref ${keyInfo?.id}, error: ${err}`
          );
          return {
            user: keyInfo?.userId,
            balances: 0,
            onError: true,
          };
        });
    });

    const currencyKeysBalances = await Promise.all(balancePromises);
    const failures = currencyKeysBalances.filter((res) => res?.onError)?.length || 0;
    const uniqueOwners = [...new Set(currencyKeysBalances.filter((key) => key.balances).map((key) => String(key.user)))];
    const owners = await Promise.all(uniqueOwners.map((userId) => this.userService.findUserById(userId)));

    return {
      failures,
      currency: "UBXT_LOCKED",
      ownersCount: uniqueOwners.length,
      owners: owners.map((owner) => {
        return { id: owner.id, email: owner.email };
      }),
      countingDate: new Date(), // new Date().toISOString().slice(0, 10),
    };
  }
}
