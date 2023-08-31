/* eslint-disable import/prefer-default-export */
import { CurrencyRate } from "../../models/currency-convert-map";
import { ExchangeRates } from "../../../types";

export function selectBtcRates(rates: ExchangeRates): CurrencyRate<number> {
  let map = {};
  Object.entries(rates).forEach(([coin, coinRate]) => {
    map = {
      ...map,
      [coin]: coinRate.BTC,
    };
  });

  return map;
}
