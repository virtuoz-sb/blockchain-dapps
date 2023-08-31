import { Module } from "vuex";
import { RootState } from "../root.store";
import { actions } from "./dex-monitoring.actions";
import { getters } from "./dex-monitoring.getters";
import { mutations } from "./dex-monitoring.mutations";
import { DexMonitoringState } from "./types";

const namespaced = true;

const state: DexMonitoringState = {
  usdConversionRates: {
    eur: null,
    btc: null,
  },
  wallets: [],
  assetsEvolution: [],
  selectedWallet: {
    label: "Please add your wallet",
    address: null,
  },
  tokensData: [],
  projectsDataList: [],
  projectsData: {},
};

export const dexMonitoringModule: Module<DexMonitoringState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
