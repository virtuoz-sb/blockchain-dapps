import { PartialBalances } from "ccxt";
import { integer4Precision } from "../../../utilities/math.util";
import { DistributionAmount, DistributionOverview } from "../../models";
import { CurrencyRate } from "../../models/currency-convert-map";

// eslint-disable-next-line import/prefer-default-export
export function computeDistribution(
  balances: PartialBalances[],
  currencies: string[],
  ratesInBtc: CurrencyRate<number>,
  btceur: number,
  btcusd: number,
  totalBtc: number,
  maximumDistributionSize?: number
): DistributionOverview {
  // browse all non zero currencies, get balances accross all accounts, sum them then convert to btc eur usd
  const amounts: DistributionAmount[] = [];
  currencies.forEach((currency) => {
    const currentAmount = balances.reduce<number>((prev: number, curr: PartialBalances) => {
      if (!curr[currency]) {
        return prev; // skip addition if currency is not present in current balance
      }
      const tmp = prev + curr[currency];
      // if (isNaN(tmp)) {
      //   const debugthis = 'bug';
      // }
      return tmp;
    }, 0);
    const rateInBtc = ratesInBtc[currency.toUpperCase()] || ratesInBtc[currency.toLowerCase()];
    // Logger.debug(`push coin distrib for ${currency} amt ${currentAmount}`);

    if (currentAmount > 0) {
      amounts.push(
        new DistributionAmount({
          currency,
          currencyAmount: currentAmount,
          btc: currentAmount * rateInBtc,
          eur: btceur * (currentAmount * rateInBtc),
          usd: btcusd * (currentAmount * rateInBtc),
        })
      );
    }
  });

  // sort btc per currency descending
  const sorted = amounts.sort((a, b) => b.btc - a.btc);
  const result = new DistributionOverview();

  // compute percentage for the maximumDistributionSize-th first
  const mainDistributions = sorted.slice(0, maximumDistributionSize);
  let mainPercentage = 0;
  mainDistributions.forEach((d, i) => {
    const distAmount = d;
    if (mainDistributions.length === sorted.length && i === mainDistributions.length - 1) {
      // avoid floating point errors when there is no "other" coin remaining and we are at the last coin (smaller one since there're sorted)
      distAmount.percentage = 1e4 - mainPercentage;
    } else {
      distAmount.percentage = integer4Precision(d.btc / totalBtc); // 0.01% = 0.0001 <> 100% = 10000
    }
    result[d.currency] = distAmount;
    mainPercentage += distAmount.percentage;
  });

  // mainPercentage = roundDecimal(mainPercentage);

  // regroup remaining
  if (sorted.length > maximumDistributionSize) {
    // add 'other' category by reducing all the remaining amount
    const remainingAmount = sorted.reduce<number>((prev, curr, index) => {
      if (index >= maximumDistributionSize) {
        return prev + curr.btc;
      }
      return 0;
    }, 0);
    result.other = new DistributionAmount({
      currency: "BTC",
      currencyAmount: remainingAmount,
      btc: remainingAmount,
      eur: btceur * remainingAmount,
      usd: btcusd * remainingAmount,
      percentage: 1e4 - mainPercentage, // avoid floating point error
      // percentage: integer4Precision(remainingAmount / totalBtc), // this causes floating point error
      // percentage: roundDecimal(remainingAmount / totalBtc),
    });
  }
  // compute remaining in 'other' distribution
  return result;
}
