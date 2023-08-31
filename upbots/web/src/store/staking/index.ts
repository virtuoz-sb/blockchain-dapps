import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { stakingState } from "./types";
import $http from "@/core/api.config";

const namespaced: boolean = true;

// STATE
export const state: stakingState = {
  farmAPY: 0,
  lpFarmAPY: 0,
  bscFarmAPY: 0,
  bscLpFarmAPY: 0,

  stakingAmount: null,
  botsAccess: false,
  switcherCurrency: "eth",

  walletConnected: false,
  metamaskAccountLink: "",
};

// GETTERS
export const getters: GetterTree<stakingState, RootState> = {
  getFarmAPY(state: stakingState) {
    return state.farmAPY;
  },

  getLPFarmAPY(state: stakingState) {
    return state.lpFarmAPY;
  },

  getBSCFarmAPY(state: stakingState) {
    return state.bscFarmAPY;
  },

  getBSCLPFarmAPY(state: stakingState) {
    return state.bscLpFarmAPY;
  },

  getWalletConnected(state: stakingState) {
    return state.walletConnected;
  },

  getMetamaskAccountLink(state: stakingState) {
    return state.metamaskAccountLink;
  },

  getStakingAmountSuccess(state: stakingState) {
    return state.botsAccess;
  },
};

// MUTATIONS
export const mutations: MutationTree<stakingState> = {
  setFarmAPY(state: stakingState, payload: number) {
    state.farmAPY = payload;
  },

  setLPFarmAPY(state: stakingState, payload: number) {
    state.lpFarmAPY = payload;
  },

  setBSCFarmAPY(state: stakingState, payload: number) {
    state.bscFarmAPY = payload;
  },

  setBSCLPFarmAPY(state: stakingState, payload: number) {
    state.bscLpFarmAPY = payload;
  },

  setWalletConnected(state: stakingState, payload: any) {
    state.walletConnected = payload;
  },

  setMetamaskAccountLink(state: stakingState, payload: any) {
    state.metamaskAccountLink = payload;
  },

  setUBXTStakingAmount(state: stakingState, payload: number) {
    state.stakingAmount = payload;
  },

  setBotsAccess(state: stakingState, payload: boolean) {
    state.botsAccess = payload;
  },

  setSwitcherCurrency(state: stakingState, payload: string) {
    state.switcherCurrency = payload;
  },
};

// ACTIONS
export const actions: ActionTree<stakingState, RootState> = {
  updateFarmAPY({ state, commit }, { apy }: { apy: number }) {
    commit("setFarmAPY", apy);
  },

  updateLPFarmAPY({ state, commit }, { apy }: { apy: number }) {
    commit("setLPFarmAPY", apy);
  },

  updateBSCFarmAPY({ state, commit }, { apy }: { apy: number }) {
    commit("setBSCFarmAPY", apy);
  },

  updateBSCLPFarmAPY({ state, commit }, { apy }: { apy: number }) {
    commit("setBSCLPFarmAPY", apy);
  },

  updateWalletConnected({ state, commit }, walletConnected: any) {
    commit("setWalletConnected", walletConnected);
  },

  updateMetamaskAccountLink({ state, commit }, metamaskAccountLink: any) {
    commit("setMetamaskAccountLink", metamaskAccountLink);
  },

  fetchStakingAmount({ state, commit }) {
    return $http.get("/api/account/staking-amount").then(({ data }: any) => {
      if (data) {
        commit("setUBXTStakingAmount", data.ubxtStakingAmount);
        commit("setBotsAccess", data.botsAccess);
      }
    });
  },

  putStakingAmount({ state, commit }, payload: number) {
    return $http.put("/api/account/staking-amount", { ubxtStakingAmount: payload }).then((response) => {
      if (response.data === true) commit("setUBXTStakingAmount", payload);
    });
  },

  addUserTransaction({ state, commit }, payload) {
    return $http.post("/api/staking/user-transaction", payload).then((response) => {
      if (response.status === 200) {
        return true;
      }
      return false;
    });
  },
};

export const stakingModule: Module<stakingState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
