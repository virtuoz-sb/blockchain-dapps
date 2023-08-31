/* eslint-disable no-param-reassign */
import { ExchangeBalance } from "../../../exchangeProxy/models/exchange-balance.model";

// replaces IOTA balance by MIOTA balance as binance still uses IOTA instead of million-IOTA (MIOTA) unit.
export default function replaceCoinBalance(orig: ExchangeBalance[], from, to: string): ExchangeBalance[] {
  if (!orig) {
    return null;
  }
  orig.forEach((x) => {
    if (x.totalBalances && x.totalBalances[from] && !x.totalBalances[to]) {
      x.totalBalances[to] = x.totalBalances[from];
      delete x.totalBalances[from];
    }
  });
  return orig;
}
