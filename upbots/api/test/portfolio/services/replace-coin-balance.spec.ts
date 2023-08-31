/* eslint-disable import/first */
import ccxt = require("ccxt");
import { ExchangeBalance } from "../../../src/exchangeProxy/models/exchange-balance.model";
import replaceCoinBalance from "../../../src/portfolio/services/utils/replace-coin-balance";

describe("portfolio coin balance replacement", () => {
  it("should do nothting when no totalBalance", () => {
    const init = [{} as ExchangeBalance];
    const actual = replaceCoinBalance(init, "IOTA", "MIOTA");
    expect(actual.length).toBe(1);
  });
  it("should do nothting when empty", () => {
    const init = [];
    const actual = replaceCoinBalance(init, "IOTA", "MIOTA");
    expect(actual.length).toBe(0);
  });

  it("should replace IOTA by MIOTA", () => {
    const init = [
      {
        totalBalances: {
          IOTA: 5,
          OTHER: 2,
        } as ccxt.PartialBalances,
      } as ExchangeBalance,
    ];
    const actual = replaceCoinBalance(init, "IOTA", "MIOTA");
    expect(actual.length).toBe(1);
    const total = actual[0].totalBalances;
    expect(total.IOTA).toBeUndefined();
    expect(total.MIOTA).toBe(5);
    expect(total.OTHER).toBe(2);
  });

  it("should replace BQX by VGX", () => {
    const init = [
      {
        totalBalances: {
          BQX: 33,
          OTHER: 2,
        } as ccxt.PartialBalances,
      } as ExchangeBalance,
    ];
    const actual = replaceCoinBalance(init, "BQX", "VGX");
    expect(actual.length).toBe(1);
    const total = actual[0].totalBalances;
    expect(total.BQX).toBeUndefined();
    expect(total.VGX).toBe(33);
    expect(total.OTHER).toBe(2);
  });

  // validated hypothesis: not possible to have IOTA and MIOTA and the same key
  // validated hypothesis: not possible to have BQX and VGX and the same key
});
