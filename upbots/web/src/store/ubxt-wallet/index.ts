import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $http from "@/core/api.config";
import { ErrorResponse } from "../error-response";

import { UBXTWalletState, UbxtWallets } from "./types";

const namespaced: boolean = true;

export const state: UBXTWalletState = {
  loading: false,
  error: null,
  wallets: null,
};

export const getters: GetterTree<UBXTWalletState, RootState> = {
  getTotalBalance(state: UBXTWalletState) {
    if (state.wallets) {
      return state.wallets.bsc.token.rawBalance;
    }
  },

  getETHWalletAddress(state: UBXTWalletState) {
    if (state.wallets) {
      return state.wallets.eth.wallet.address;
    }
  },

  isNeedRebalance(state: UBXTWalletState) {
    if (state.wallets) {
      return !(state.wallets.bsc.token.rawBalance === state.wallets.eth.token.rawBalance);
    }
  },
};

export const mutations: MutationTree<UBXTWalletState> = {
  SET_UBXT_WALLETS_SUCCESS(state: UBXTWalletState, payload: UbxtWallets) {
    state.wallets = payload;
  },
};
export const actions: ActionTree<UBXTWalletState, RootState> = {
  fetchUbxtWallets({ commit, rootState, getters }) {
    const walletsId =
      rootState.authModule.user && rootState.authModule.user.custodialWallets && rootState.authModule.user.custodialWallets.identifier;
    if (walletsId) {
      return $http
        .get("/api/custodial-wallets/ubxt")
        .then(({ data }) => {
          if (data) {
            commit("SET_UBXT_WALLETS_SUCCESS", data);
          }
        })
        .then(() => {
          getters.isNeedRebalance ? $http.post("/api/custodial-wallets/rebalance") : Promise.resolve();
        })
        .catch((error: ErrorResponse) => {
          commit("SET_UBXT_WALLETS_ERROR", error);
        });
    }
  },
};

export const ubxtWalletModule: Module<UBXTWalletState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
