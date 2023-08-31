import { TradingFilters } from "./types";

export const tradingFilters: TradingFilters = {
  stableCoins: [
    { value: "STABLECOINS", label: "STABLE COINS", headerLabel: true },
    { value: "USDT", label: "USDT" },
    { value: "TUSD", label: "TUSD" },
    { value: "BUSD", label: "BUSD" },
    { value: "USDC", label: "USDC" },
  ],
  alts: [
    { value: "ALTS", label: "ALTS", headerLabel: true },
    { value: "ETH", label: "ETH" },
    { value: "TRX", label: "TRX" },
  ],
  fiats: [
    { value: "FIATS", label: "FIATS", headerLabel: true },
    { value: "EUR", label: "EUR" },
    { value: "USD", label: "USD" },
  ],
};
