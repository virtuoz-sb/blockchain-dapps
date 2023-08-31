import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $http from "@/core/api.config";

import { ExchangeKeysState, ExchangeKey, AddExchangeKeyRequestPayload, EditExchangeKeyRequestPayload } from "./types";
import { AxiosError, AxiosResponse } from "axios";
import { cloneDeep } from "@/core/helper-functions";

const namespaced: boolean = true;

export const PUT_EDIT_EXCHANGEKEYS_BEGIN = "GET_EDIT_EXCHANGEKEYS_BEGIN";
export const PUT_EDIT_EXCHANGEKEYS_SUCCESS = "GET_EDIT_EXCHANGEKEYS_SUCCESS";
export const PUT_EDIT_EXCHANGEKEYS_ERROR = "GET_EDIT_EXCHANGEKEYS_ERROR";

// S T A T E
export const state: ExchangeKeysState = {
  error: null,
  loading: false,
  keys: [],
  exchanges: [],
}; // init state

// G E T T E R S
export const getters: GetterTree<ExchangeKeysState, RootState> = {};

// M U T A T I O N S
export const mutations: MutationTree<ExchangeKeysState> = {
  fetchExchangeKeys(state: ExchangeKeysState, payload: ExchangeKey[]) {
    state.keys = payload;
  },
  // ADD exchange key
  addExchangeKeys(state: ExchangeKeysState, payload: ExchangeKey[]) {
    state.keys = payload;
  },
  // EDIT exchange key
  editExchangeKeys(state: ExchangeKeysState, payload: ExchangeKey[]) {
    state.keys = payload;
  },
  // DELETE exchange key
  deleteExchangeKeys(state: ExchangeKeysState, payload: ExchangeKey[]) {
    state.keys = payload;
  },
  [PUT_EDIT_EXCHANGEKEYS_BEGIN]: (state: ExchangeKeysState) => {
    state.loading = true;
    state.error = null;
  },
  [PUT_EDIT_EXCHANGEKEYS_SUCCESS]: (state: ExchangeKeysState, payload: ExchangeKey[]) => {
    state.loading = false;
    state.error = null;
    state.keys = payload;
  },
  [PUT_EDIT_EXCHANGEKEYS_ERROR]: (state: ExchangeKeysState, error: AxiosResponse) => {
    state.loading = false;
    // state.error = null; //not an Axios Response in the interface State ...
    state.error = {
      code: error.status,
      timestamp: new Date(),
      path: error.config.baseURL,
      method: error.config.method,
      message: error.statusText,
    };
  },
};

// A C T I O N S
export const actions: ActionTree<ExchangeKeysState, RootState> = {
  fetchKeysActionAsync({ commit }) {
    return $http.get<ExchangeKey>("/api/keys").then((response) => {
      const payload = response && response.data;
      commit("fetchExchangeKeys", payload);
    });
  },
  createExchangeKeyActionAsync({ commit, dispatch }, payload: AddExchangeKeyRequestPayload) {
    return $http
      .post<ExchangeKey>("/api/keys", payload)
      .then((response) => {
        const payload = response && response.data;
        commit("addExchangeKeys", payload);
        return response;
      })
      .then(() => {
        return dispatch("userModule/fetchUserSummary", null, { root: true });
      });
  },
  editExchangeKeyActionAsync({ commit }, payload: EditExchangeKeyRequestPayload) {
    return $http.put<ExchangeKey>("/api/keys", payload).then((response) => {
      const payload = response && response.data;
      commit("editExchangeKeys", payload);
    });
  },
  editExchangeKeyAction({ commit, dispatch }, payload: EditExchangeKeyRequestPayload) {
    // REFACTORING TO FORSEE BETWEEN USER/EXCHANGEKEY/PORTFOLIO
    commit(PUT_EDIT_EXCHANGEKEYS_BEGIN);
    return $http
      .put<ExchangeKey>("/api/keys", payload)
      .then((response) => {
        const res = response && response.data;
        commit(PUT_EDIT_EXCHANGEKEYS_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(PUT_EDIT_EXCHANGEKEYS_ERROR, res);
      });
  },
  deleteKeyActionAsync({ commit, dispatch }, payload: { id: string }) {
    return $http
      .delete<ExchangeKey>(`/api/keys/` + payload.id)
      .then((response) => {
        const payload = response && response.data;
        commit("deleteExchangeKeys", payload);
      })
      .then(() => {
        return dispatch("userModule/fetchUserSummary", null, { root: true });
      });
  },
};

export const exchangeKeyModule: Module<ExchangeKeysState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
