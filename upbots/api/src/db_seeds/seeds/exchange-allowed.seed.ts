import { AllowedExchange } from "../../settings/models/exchange-settings.dto";

const allowedExchanges: AllowedExchange[] = [
  { name: "binance", label: "Binance", key: "binance", enabled: true, soon: true },
  { name: "binance-us", label: "Binance.US", key: "binanceus", enabled: true, soon: true },
  { name: "binance-future", label: "Binance-future", key: "binanceusdm", enabled: true, soon: true },
  { name: "huobi", label: "Huobi", key: "huobipro", enabled: true, soon: true },
  { name: "bitmex", label: "BitMEX", key: "bitmex", enabled: false, soon: true },
  { name: "ftx", label: "FTX", key: "ftx", enabled: true, soon: true },
  { name: "ftx-future", label: "FTX-future", key: "ftx", enabled: true, soon: true },
  { name: "kucoin", label: "Kucoin", key: "kucoin", enabled: true, soon: true },
  { name: "kucoin-future", label: "Kucoin-future", key: "kucoinfutures", enabled: true, soon: true },
  { name: "okex", label: "Okex", key: "okex", enabled: false, soon: true },
  { name: "coinbasepro", label: "CoinbasePro", key: "coinbasepro", enabled: true, soon: true },
];

export default allowedExchanges;

export function allowedExchangeNames(): string[] {
  return allowedExchanges.map((x) => x.name);
}
