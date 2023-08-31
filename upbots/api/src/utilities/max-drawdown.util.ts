import { PerformanceCycleDto } from "src/performance/models/performance.models";
/**
 * @param prices an array of floats (entry and close prices) (the values we want the DD of)
 * @returns Maximum Drawdown on percentage %.
 */
export default (performanceCycles: PerformanceCycleDto[]): number => {
  const pricesValues = [].concat(
    ...performanceCycles
      .filter((e) => !e.open)
      .map((e) => [...Object.values({ entryPrice: e.entryPrice, closePrice: e.closePrice })])
      .reverse()
  ) as number[];
  let lastTotalComp = 100;
  let maxTotalComp = 0;
  let mdd = 0;
  for (let i = 0; i < pricesValues.length; i += 2) {
    const gain = pricesValues[i + 1] / pricesValues[i] - 1;
    const totalComp = (gain + 1) * lastTotalComp;
    if (totalComp > maxTotalComp) maxTotalComp = totalComp;
    const drawdown = totalComp / maxTotalComp - 1;
    lastTotalComp = totalComp;
    mdd = Math.min(mdd, drawdown);
  }
  return Number((mdd * 100).toFixed(4));
};
