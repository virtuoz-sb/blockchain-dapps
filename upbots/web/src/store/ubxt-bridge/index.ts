import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { UbxtBridgeState, UbxtBridgeServerInfo, ChainID } from "./types";
import $http from "@/core/api.config";
import axios, { AxiosError } from "axios";
import Vue from "*.vue";

const namespaced: boolean = true;

const anyswapURL = "https://bridgeapi.anyswap.exchange/v2";
const $httpAnyswap = axios.create({
  baseURL: anyswapURL,
});

// S T A T E
export const state: UbxtBridgeState = {
  walletConnected: false,
  metamaskAccountLink: "",
  serverInfo: {},
  ethUbxtContractAddress: "0x8564653879a18C560E7C0Ea0E084c516C62F5653",
  bscUbxtContractAddress: "0xbbeb90cfb6fafa1f69aa130b7341089abeef5811",
  eth2bscDepositAddress: "0x533e3c0e6b48010873B947bddC4721b1bDFF9648",
  bridgeWay: true,
  networkId: 1,
};

// G E T T E R S
export const getters: GetterTree<UbxtBridgeState, RootState> = {
  getWalletConnected(state: any) {
    return state.walletConnected;
  },

  getMetamaskAccountLink(state: any) {
    return state.metamaskAccountLink;
  },

  getServerInfo(state: any) {
    return state.serverInfo;
  },
};

// M U T A T I O N S
export const mutations: MutationTree<UbxtBridgeState> = {
  setWalletConnected(state: any, payload: any) {
    state.walletConnected = payload;
  },

  setMetamaskAccountLink(state: any, payload: any) {
    state.metamaskAccountLink = payload;
  },

  setServerInfo(state: any, payload: any) {
    state.serverInfo = payload;
  },

  setBridgeWay(state: any, payload: any) {
    state.bridgeWay = payload;
  },

  setNetworkId(state: any, payload: any) {
    state.networkId = payload;
  },
};

// A C T I O N S
export const actions: ActionTree<UbxtBridgeState, RootState> = {
  updateWalletConnected({ state, commit }, walletConnected: any) {
    commit("setWalletConnected", walletConnected);
  },

  updateMetamaskAccountLink({ state, commit }, metamaskAccountLink: any) {
    commit("setMetamaskAccountLink", metamaskAccountLink);
  },

  fetchServerInfo({ state, commit }) {
    const bscNetId = 56;
    const link = `/serverInfo/${bscNetId}`;
    return $httpAnyswap.get<UbxtBridgeServerInfo>(link).then((response: any) => {
      const payload = response && response.data;
      const ubxtv3 = payload && payload.ubxtv3;
      const serverInfo = ubxtv3 ? ubxtv3 : null;
      commit("setServerInfo", serverInfo);
      return serverInfo;
    });
  },

  registerAccount({ state, commit }, payload: { account: string }) {
    const account = state.metamaskAccountLink;
    const chainId = 56;
    const pairId = "UBXTv3";
    const link = `/register/${account}/${chainId}/${pairId}`;
    return $httpAnyswap.get(link).then((response: any) => {
      const payload = response && response.data;
      Promise.resolve();
    });
  },
};

export const ubxtBridgeModule: Module<UbxtBridgeState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
