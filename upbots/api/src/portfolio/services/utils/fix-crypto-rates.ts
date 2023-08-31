/* eslint-disable no-param-reassign */
import { ExchangeRates } from "../../../types";

/**
 * workaround to derive all exchange rates that have a mistake since not available in cryptocompre api (only USD value is correct)
 * error status: coinRate.BTC === coinRate.EUR
 * see https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,TOMOBULL,DOGEBEAR,SUSHIBULL&tsyms=BTC,EUR,USD
 * @param rates
 */

export default function fixCoinRates(rates: ExchangeRates): ExchangeRates {
  let map = {};
  Object.entries(rates).forEach(([coin, coinRate]) => {
    if (coinRate.BTC === coinRate.EUR) {
      const adjustedBTCRate = coinRate.USD * (1 / rates.BTC.USD);
      const adjustedEURRate = adjustedBTCRate * rates.BTC.EUR;
      coinRate = { ...coinRate, BTC: adjustedBTCRate, EUR: adjustedEURRate };
    }
    map = {
      ...map,
      [coin]: coinRate,
    };
  });

  return map;
}
