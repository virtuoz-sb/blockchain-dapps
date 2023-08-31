import { Logger } from "@nestjs/common";
import * as ccxt from "ccxt";
import ExchangeKeyDataService from "../../exchange-key/services/exchange-key.data.service";
import { ExchangeBalance } from "../models/exchange-balance.model";

const getTradableBalance = function getTradableBalance(
  exchangeName,
  userId,
  keyId: string,
  exchangeProxy: ccxt.Exchange,
  dataKeyService: ExchangeKeyDataService,
  logger: Logger
): Promise<ExchangeBalance> {
  return exchangeProxy
    .fetchFreeBalance({ recvWindow: 28000 })
    .then((mainAccountBalances) => {
      return {
        exchange: this.exchangeName,
        subAccountBalances: [],
        totalBalances: mainAccountBalances,
      };
    })
    .catch((err) => {
      logger.error(`getFreeBalance usr ${userId} key ${keyId} err: ${err}`);

      // disable the key
      if (err.name === "ExchangeError" || err.name === "AuthenticationError") {
        dataKeyService.updateValidityStatus(keyId, false, err.message);
        logger.warn(`getFreeBalance has disbaled key for usr ${userId} key ${keyId}`);
      }
      return { exchange: exchangeName, subAccountBalances: [], totalBalances: {} };
      // return this.handleError(err);
      // throw err;
    });
  // {"code":-1131,"msg":"'recvWindow' must be less than 60000."}
};

export default getTradableBalance;
