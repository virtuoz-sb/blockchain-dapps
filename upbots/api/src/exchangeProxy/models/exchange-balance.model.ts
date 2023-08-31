import ccxt = require("ccxt");

export interface SubAccountBalance {
  nickname: string;
  balances: ccxt.PartialBalances;
}

export interface ExchangeBalance {
  exchange: string;
  subAccountBalances: SubAccountBalance[];
  totalBalances: ccxt.PartialBalances;
  error?: Error;
}
