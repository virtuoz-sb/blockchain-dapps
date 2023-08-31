import Vue from "vue";
import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $http from "@/core/api.config";
import { ErrorResponse } from "../error-response";

import { PerfeesState, UserWallet, BotWallet, UserTransaction, TransactionTypes, TransactionStatuses, PERFEES_EVENT_ACTION } from "./types";

const namespaced: boolean = true;

export const state: PerfeesState = {
  loading: false,
  error: null,
  userWallet: null,
  botWallets: null,
  userTransactions: null,
  estimatedAnnualPerfees: 0,
};

export const getters: GetterTree<PerfeesState, RootState> = {
  getUserWallet(state: PerfeesState) {
    if (state.userWallet) {
      return state.userWallet;
    }
    return {};
  },
  getUserTransactions(state: PerfeesState) {
    if (state.userTransactions) {
      return state.userTransactions;
    }
    return [];
  },
  getBotWallets(state: PerfeesState) {
    if (state.botWallets) {
      return state.botWallets;
    }
    return [];
  },
  getBotWalletById: (state) => (id: string): BotWallet | null => {
    if (state.botWallets === null) {
      return null;
    }
    const botWallet = state.botWallets.find((botWallet) => botWallet.botId === id);
    return botWallet;
  },
};

export const mutations: MutationTree<PerfeesState> = {
  SET_USER_WALLET_SUCCESS(state: PerfeesState, payload: UserWallet) {
    state.userWallet = payload;
  },
  SET_USER_TRANSACTIONS_SUCCESS(state: PerfeesState, payload: UserTransaction[]) {
    state.userTransactions = payload;
  },
  SET_ESTIMATED_ANNUAL_PERFEES(state: PerfeesState, payload: number) {
    state.estimatedAnnualPerfees = payload;
  },
  SET_BOT_WALLETS_SUCCESS(state: PerfeesState, payload: BotWallet[]) {
    state.botWallets = payload;
  },
  SET_ERROR(state: PerfeesState, error: ErrorResponse) {
    state.error = error;
  },
};
export const actions: ActionTree<PerfeesState, RootState> = {
  fetchUserWallet({ commit }) {
    return $http
      .get("/api/perfees/user-wallet")
      .then(({ data }) => {
        if (data) {
          commit("SET_USER_WALLET_SUCCESS", data);
        }
      })
      .catch((error: ErrorResponse) => {
        commit("SET_ERROR", error);
      });
  },
  fetchUserTransactions({ commit }) {
    return $http
      .get("/api/perfees/user-transactions")
      .then(({ data }) => {
        if (data) {
          commit("SET_USER_TRANSACTIONS_SUCCESS", data);
        }
      })
      .catch((error: ErrorResponse) => {
        commit("SET_ERROR", error);
      });
  },
  getEstimatedAnnualPerfees({ commit }) {
    return $http
      .get("/api/perfees/estimated-annual-perfees")
      .then(({ data }) => {
        if (data) {
          commit("SET_ESTIMATED_ANNUAL_PERFEES", data);
        }
      })
      .catch((error: ErrorResponse) => {
        commit("SET_ERROR", error);
      });
  },
  fetchBotWallets({ commit }) {
    return $http
      .get("/api/perfees/bot-wallets")
      .then(({ data }) => {
        if (data) {
          commit("SET_BOT_WALLETS_SUCCESS", data);
        }
      })
      .catch((error: ErrorResponse) => {
        commit("SET_ERROR", error);
      });
  },
  transferUserWallet({ dispatch }, payload) {
    return $http.post("/api/perfees/user-wallet-transfer", payload).then((response) => {
      if (response.status === 200) {
        dispatch("fetchUserWallet");
        dispatch("fetchBotWallets");
        return true;
      }
      return false;
    });
  },
  transferBotWallet({ dispatch }, payload) {
    return $http.post("/api/perfees/bot-wallet-transfer", payload).then((response) => {
      if (response.status === 200) {
        dispatch("fetchUserWallet");
        dispatch("fetchBotWallets");
        return true;
      }
      return false;
    });
  },

  autoRefillBotWallet({ dispatch }, payload) {
    return $http.post("/api/perfees/bot-wallet-auto-refill", payload).then((response) => {
      if (response.status === 200) {
        dispatch("fetchBotWallets");
        return true;
      }
      return false;
    });
  },

  calcCurrentPerformanceFee({ dispatch }, payload) {
    return $http.post("/api/perfees/calc-current-perfee", payload).then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return 0;
    });
  },

  closePerformanceCycle({ dispatch }, payload) {
    return $http.post("/api/perfees/performance-cycle-close", payload).then((response) => {
      if (response.status === 200) {
        return true;
      }
      return false;
    });
  },

  [PERFEES_EVENT_ACTION]: function ({ dispatch }, message: any) {
    if (message.eventType === "USER-TRANSACTION-UPDATED") {
      dispatch("fetchUserTransactions");
    } else if (message.eventType === "WALLET-UPDATED") {
      dispatch("fetchUserWallet");
      dispatch("fetchBotWallets");
    } else if (message.eventType === "WALLET-NO-ENOUGH") {
      dispatch("fetchUserWallet");
      dispatch("fetchBotWallets");
      Vue.notify({
        text: "Not enough UBXT to trade. The bot will be paused. Please allocate UBXT to reactivate the bot",
        duration: 15000,
        type: "warning",
      });
    }
  },
};

export const perfeesModule: Module<PerfeesState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
