import { Module } from "vuex";
import { RootState } from "../root.store";
import { exchangesList } from "./const";
import { actions } from "./swap.actions";
import { getters } from "./swap.getters";
import { mutations } from "./swap.mutations";
import { SwapState } from "./types";

const namespaced = true;

const state: SwapState = {
  pending: false,
  error: null,
  provider: "DEX.AG",
  providerSdk: null,
  providerRequest: null,
  walletConnected: false,
  exchangesData: exchangesList.map((exchange) => ({
    ...exchange,
    checked: true,
  })),
  tableData: [],
};

export const swapModule: Module<SwapState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
