import { BadRequestException, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import ProxyFactoryService from "../../exchangeProxy/services/proxy-factory.service";
import ExchangeKeyService from "../../exchange-key/services/exchange-key.service";
import { TradableBalanceOverview } from "../models/free-balance.dto";

@Injectable()
export default class TradeBalanceService {
  private readonly logger = new Logger(TradeBalanceService.name);

  constructor(private keySvc: ExchangeKeyService, private proxyFactoryService: ProxyFactoryService) {}

  async getBalanceForTrading(userId, keyId: string): Promise<TradableBalanceOverview> {
    const keyFound = await this.keySvc.getDecryptedExchangeCredentialsForOneKey(keyId);
    if (!keyFound) {
      throw new BadRequestException();
    }

    if (keyFound.userId.toString() !== userId.toString()) {
      throw new ForbiddenException();
    }
    const { credentials } = keyFound;
    const proxy = this.proxyFactoryService.setExchangeProxy(keyFound.exchangeName);
    const allBal = await proxy.getFreeBalance(keyId, userId, credentials);
    const result = {
      exchange: keyFound.exchangeName,
      freeBalances: {},
    };
    // TODO: check replace coin balance logic (BQX, VGX)
    if (allBal && allBal.totalBalances) {
      let nonNullBalances = {};
      Object.entries(allBal.totalBalances).forEach(([coin, bal]) => {
        if (bal && bal > 0) {
          // display non null balances
          nonNullBalances = { ...nonNullBalances, [coin]: bal };
        }
      });

      result.freeBalances = nonNullBalances;
    }
    return result;
  }
}
