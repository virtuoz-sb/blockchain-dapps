import { DistributionTable, PortfolioEvolution } from "@/components/portfolio/types/portfolio.types";
import { GetterTree } from "vuex";
import { RootState } from "../root.store";
import { allWalletsOption, emptyWalletsOption } from "./consts";
import { calculateTotalAssets, calculateTotalDebts, generatePortfolioEvolution, getTokensSum } from "./helpers";
import { DexMonitoringState, DexWallet, ProjectsData, TokenData, UsdConversionRates } from "./types";

export const getters: GetterTree<DexMonitoringState, RootState> = {
  getWallets(state): DexWallet[] {
    if (state.wallets.length !== 0) {
      return [allWalletsOption, ...state.wallets];
    }
    return state.wallets;
  },

  getSelectedWallet(state): DexWallet {
    if (state.wallets.length === 0) {
      return emptyWalletsOption;
    }
    return state.selectedWallet;
  },

  getUsdConversionRates(state): UsdConversionRates {
    return state.usdConversionRates;
  },

  getTokensData(state): TokenData[] {
    return state.tokensData;
  },

  getProjectsData(state): ProjectsData {
    return state.projectsData;
  },

  getProjectsDataList(state): ProjectsData[] {
    return state.projectsDataList;
  },

  getPortfolioDistribution(state): DistributionTable[] {
    const portfolioTokens = getTokensSum(state.tokensData, state.selectedWallet).map((token) => ({
      coin: token.contractTickerSymbol,
      amount: token.balance,
      usdValue: token.quote,
      btcValue: token.quote * state.usdConversionRates.btc,
      eurValue: token.quote * state.usdConversionRates.eur,
      blockchain: token.blockchain,
    }));

    return portfolioTokens.sort((a, b) => b.usdValue - a.usdValue);
  },

  getPortfolioEvolution(state, getters, rootState: any): PortfolioEvolution {
    const selectedQuantity = rootState.userModule.selectedQuantity;
    if (state.wallets.length === 0 || state.assetsEvolution.length === 0) {
      return null;
    }
    return generatePortfolioEvolution(state.wallets, state.selectedWallet, state.assetsEvolution, selectedQuantity);
  },

  getAssets(state) {
    const totalAssets = calculateTotalAssets(state.tokensData, state.projectsDataList, state.selectedWallet);
    return {
      title: "Total Assets",
      usd: totalAssets,
      eur: totalAssets * state.usdConversionRates.eur,
      btc: totalAssets * state.usdConversionRates.btc,
      conversionDate: new Date(),
    };
  },

  getDebts(state) {
    const totalDebts = calculateTotalDebts(state.projectsDataList, state.selectedWallet);
    return {
      title: "Total Debts",
      usd: totalDebts,
      eur: totalDebts * state.usdConversionRates.eur,
      btc: totalDebts * state.usdConversionRates.btc,
      conversionDate: new Date(),
    };
  },

  getNetworth(state) {
    const networth =
      calculateTotalAssets(state.tokensData, state.projectsDataList, state.selectedWallet) -
      calculateTotalDebts(state.projectsDataList, state.selectedWallet);
    return {
      title: "Total Networth",
      usd: networth,
      eur: networth * state.usdConversionRates.eur,
      btc: networth * state.usdConversionRates.btc,
      conversionDate: new Date(),
    };
  },
};
