import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $http from "@/core/api.config";
import { CryptoPriceState, CryptoPriceData, CryptoPriceRequestPayload, CryptoPriceResultResponse } from "./types";

const namespaced: boolean = true;

// S T A T E

export const state: CryptoPriceState = {
  loaded: {},
  data: {},
};

// G E T T E R S
export const getters: GetterTree<CryptoPriceState, RootState> = {
  getPriceData(state): { [pair: string]: CryptoPriceData } {
    return state.data;
  },
  getLoaded(state): { [pair: string]: boolean } {
    return state.loaded;
  },
};

// M U T A T I O N S
export const mutations: MutationTree<CryptoPriceState> = {
  cryptoPrice(state: CryptoPriceState, payload: CryptoPriceResultResponse) {
    state.data[`${payload.cryptoSymbol}/${payload.fiatSymbol}`] = payload.data;
    state.loaded[`${payload.cryptoSymbol}/${payload.fiatSymbol}`] = true;
  },
};

// A C T I O N S
export const actions: ActionTree<CryptoPriceState, RootState> = {
  fetchCryptoPrice({ commit }, payload: CryptoPriceRequestPayload): any {
    return $http
      .get<CryptoPriceResultResponse>(`/api/cryptoprice/watch/${payload.fiatSymbol}/${payload.cryptoSymbol}` || "")
      .then((response) => {
        const res_payload = {
          cryptoSymbol: payload.cryptoSymbol,
          fiatSymbol: payload.fiatSymbol,
          data: response && response.data,
        };
        commit("cryptoPrice", res_payload);
      });
  },
  fetchCryptoPriceCoinGecko({ commit }, payload: CryptoPriceRequestPayload): any {
    return $http
      .get<CryptoPriceResultResponse>(
        `https://api.coingecko.com/api/v3/coins/${payload.cryptoSymbol}/market_chart?vs_currency=usd&days=1&interval=hourly` || ""
      )
      .then((response) => {
        const res_payload = {
          cryptoSymbol: payload.cryptoSymbol,
          fiatSymbol: payload.fiatSymbol,
          data: response && response.data,
        };
        commit("cryptoPrice", res_payload);
      });
  },
};

export const cryptoPrice: Module<CryptoPriceState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
