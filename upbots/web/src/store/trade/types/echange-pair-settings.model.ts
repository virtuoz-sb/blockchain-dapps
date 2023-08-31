/**
 * See api api/settings/exchanges documentation. This should match api returned data.
 * Referenced by TradingSettings (src/store/user/types.ts)
 */
export interface ExchangePairSettings {
  market: string;
  /**
   * symbol used for ordering
   */
  symbol: string;

  /**
   * symbol used for data fetching (price, orderbook)
   */
  symbolForData: string;

  baseCurrency: string;

  quoteCurrency: string;

  name: string;

  tradingAllowed: boolean;

  perpetualContract: boolean;
  inverse: boolean;
}
