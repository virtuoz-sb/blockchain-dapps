import { FavoriteCurrency } from "@/components/portfolio/types/portfolio.types";
import { BtcAmount } from "@/store/user/types";
import { formatPrice } from "./helpers.service";

export const calculateTotalBalance = (cexBalance: BtcAmount, dexBalance: BtcAmount, favoriteCurrency: FavoriteCurrency) => {
  if (cexBalance) {
    if (dexBalance) {
      const balance: BtcAmount = {
        usd: cexBalance.usd + dexBalance.usd,
        btc: cexBalance.btc + dexBalance.btc,
        eur: cexBalance.eur + dexBalance.eur,
      };
      return `${formatPrice(balance[favoriteCurrency.value], 2)} ${favoriteCurrency.label}`;
    } else {
      return `${formatPrice(cexBalance[favoriteCurrency.value], 5)} ${favoriteCurrency.label}`;
    }
  } else if (dexBalance) {
    return `${formatPrice(dexBalance[favoriteCurrency.value], 2)} ${favoriteCurrency.label}`;
  } else {
    return "N/A";
  }
};
