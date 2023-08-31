/* eslint-disable import/prefer-default-export */
import { PartialBalances } from "ccxt";
import { ExchangeBalance } from "src/exchangeProxy/models/exchange-balance.model";

export function findNonZeroAndNonIgnoredCurrencies(balance: PartialBalances): string[] {
  if (!balance) {
    this.logger.warn(`findNonZeroAndNonIgnoredCurrencies balance input ${balance}`);
    return [];
  }

  const nonZeroAndNonIgnoredCurrencies = new Array<string>();
  Object.keys(balance).forEach((symbol) => {
    if (Object.prototype.hasOwnProperty.call(balance, symbol)) {
      const value = balance[symbol];
      // this.logger.debug(`findnon zero currency for each  ${symbol} value ${value}`);
      if (value > 0) {
        nonZeroAndNonIgnoredCurrencies.push(symbol);
      }
    }
  });

  return nonZeroAndNonIgnoredCurrencies;
}

export function findUniqueCurrencies(data: ExchangeBalance[]): string[] {
  let currencies = new Array<string>();
  if (!data) {
    return [];
  }
  data.forEach((exchnageBal) => {
    currencies = [...currencies, ...findNonZeroAndNonIgnoredCurrencies(exchnageBal.totalBalances)];
  });
  return [...new Set([...currencies])];
}

export function ignoreLocked(currencies: string[]): string[] {
  return currencies.filter((x) => !x.endsWith("_LOCKED"));
}
