import * as ccxt from "ccxt";
import { DigitsCountingPrecisionMode } from "./precision-mode";

export default class FetchMarketResponse {
  precisionMode: DigitsCountingPrecisionMode;

  exchange: string;

  markets: ccxt.Dictionary<ccxt.Market>;
}
