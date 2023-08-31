import { Vue } from "vue-property-decorator";
import isEqual from "lodash.isequal";
import $http from "@/core/api.config";
import { ActionTree } from "vuex";
import { RootState } from "../root.store";
import {
  UPDATE_WALLETS,
  UPDATE_SELECTED_WALLET,
  UPDATE_TOKENS_DATA,
  UPDATE_PROJECTS_DATA,
  UPDATE_CONVERSIONS_RATE,
  UPDATE_PROJECTS_DATA_LIST,
  UPDATE_ASSETS_EVOLUTION,
} from "./dex-monitoring.mutations";
import { BalancesDto, DexMonitoringState, DexWallet } from "./types";
import { allWalletsOption } from "./consts";
import { reduceProjectsData, saveWallets, updateAssetsSummary } from "./helpers";

export const actions: ActionTree<DexMonitoringState, RootState> = {
  selectWallet({ state, commit }, payload: DexWallet) {
    commit(UPDATE_SELECTED_WALLET, payload);
    commit(UPDATE_PROJECTS_DATA, reduceProjectsData(state.projectsDataList, payload));
  },

  async addWallet({ commit, state, dispatch }, { wallet }: { wallet: DexWallet }) {
    const wallets = [...state.wallets, wallet];
    commit(UPDATE_WALLETS, wallets);
    dispatch("selectWallet", wallet);
    return saveWallets(wallet);
  },

  async deleteWallet({ commit, state, dispatch }, { wallet }: { wallet: DexWallet }) {
    const res = await $http.delete("/api/dex-monitoring/wallet", {
      params: {
        address: wallet.address,
      },
    });

    if (res && res.data) {
      const wallets = state.wallets.filter((w) => !isEqual(w, wallet));
      commit(UPDATE_WALLETS, wallets);
      if (wallets.length === 0) {
        dispatch("selectWallet", allWalletsOption);
      } else {
        dispatch("selectWallet", wallets[0]);
      }
    }
  },

  async loadWallets({ commit, state }) {
    if (state.wallets && state.wallets.length !== 0) {
      commit(UPDATE_SELECTED_WALLET, allWalletsOption);
    } else {
      const res = await $http.get("/api/dex-monitoring/wallet");
      const wallets = res.data;

      if (wallets && wallets.length) {
        if (wallets && wallets.length) {
          commit(UPDATE_WALLETS, wallets);
          commit(UPDATE_SELECTED_WALLET, allWalletsOption);
        }
      } else {
        const walletsFromStorage = localStorage.getItem("dexWallets");
        if (walletsFromStorage) {
          const parsedWallets = JSON.parse(walletsFromStorage);
          if (parsedWallets && parsedWallets.length) {
            commit(UPDATE_WALLETS, parsedWallets);
            commit(UPDATE_SELECTED_WALLET, allWalletsOption);
            parsedWallets.forEach((wallet: DexWallet) => saveWallets(wallet));
          }
        }
      }
    }
  },

  async fetchBalances({ state, commit }, payload: { liveFetch?: boolean } = { liveFetch: false }) {
    const { liveFetch } = payload;

    try {
      if (!state.wallets.length) {
        return;
      }
      const addresses = state.wallets.filter(({ address }) => address).map(({ address }) => address);
      const res = await $http.get<BalancesDto>(`/api/dex-monitoring/balance?addresses=${addresses.join(",")}&liveFetch=${liveFetch}`);
      const { data } = res;

      commit(UPDATE_TOKENS_DATA, data.tokens);
      commit(UPDATE_CONVERSIONS_RATE, data.quoteCurrencyConversionRates);
      commit(UPDATE_PROJECTS_DATA_LIST, data.projects);
      commit(UPDATE_PROJECTS_DATA, reduceProjectsData(data.projects, state.selectedWallet));

      commit(UPDATE_ASSETS_EVOLUTION, await updateAssetsSummary());
    } catch (e) {
      if (e.message.includes(422)) {
        Vue.notify({ text: "The select wallet has an invalid address", type: "error" });
      } else {
        Vue.notify({ text: "Unknown error from the api, please try again later", type: "error" });
      }
    }
  },
};
