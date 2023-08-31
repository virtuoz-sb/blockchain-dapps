import { PerformanceCycleDto } from "src/performance/models/performance.models";
import maxDrawdown from "../../src/utilities/max-drawdown.util";
import * as botAvaxPerformance from "./data/bot-avax-performance.json";
import * as btcPerformance from "./data/optimus-btc-performance.json";

const mapBotCycles = (cycles: any[]): PerformanceCycleDto[] => {
  return cycles.map((cycle) => ({
    openAt: cycle.openAt,
    openPeriod: cycle.openPeriod,
    closeAt: cycle.closeAt,
    closePeriod: cycle.closePeriod,
    stratType: cycle.stratType,
    result: cycle.result,
    measuredObject: cycle.measuredObject,
    cycleSequence: cycle.cycleSequence,
    open: cycle.open,
    sbl: cycle.sbl,
    exch: cycle.exch,
    profitPercentage: cycle.profitPercentage,
    entryPrice: cycle.entryPrice,
    closePrice: cycle.closePrice,
  }));
};

describe("Max DrawDown", () => {
  const botAvaxPerformanceDto = mapBotCycles(botAvaxPerformance);
  const btcPerformanceDto = mapBotCycles(btcPerformance);

  it("should be zero with empty or one element", () => {
    expect(maxDrawdown([])).toBe(0);
    expect(maxDrawdown([botAvaxPerformanceDto[0]])).toBe(0);
  });
  it("should be close to the precalculated MDD values", () => {
    expect(maxDrawdown(botAvaxPerformanceDto)).toBeCloseTo(-15.4842, 4);
    expect(maxDrawdown(btcPerformanceDto)).toBeCloseTo(-7.6572, 4);
  });
});
