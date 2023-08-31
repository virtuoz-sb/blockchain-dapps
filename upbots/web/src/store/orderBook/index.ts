import $http from "@/core/api.config";
import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { OrderBookResponse } from "@/models/interfaces";

const namespaced: boolean = true;

export interface OrderBookState {
  orderBook: any;
}

// STATE
const state: OrderBookState = {
  orderBook: null,
};

// GETTERS
export const getters: GetterTree<OrderBookState, RootState> = {
  getLastOrderBookPrice(state) {
    if (state.orderBook && state.orderBook.bids) {
      return state.orderBook.bids[0][0];
    }
  },
};

// MUTATIONS
export const mutations: MutationTree<OrderBookState> = {
  SET_ORDER_BOOK(state: OrderBookState, payload: any) {
    state.orderBook = payload;
  },
};

// ACTIONS
export const actions: ActionTree<OrderBookState, RootState> = {
  fetchOrderBook({ commit }, { exchange, selectedPair }: any) {
    if (exchange == "kucoin" || exchange == "ftx") {
      let pairSymbol = selectedPair;
      if (exchange === "ftx") {
        pairSymbol = pairSymbol.replace("/", "_");
      }
      return $http.get(`/api/price/orderbook/${exchange}/${pairSymbol}`).then(({ data }: any) => {
        commit("SET_ORDER_BOOK", data);
      });
    } else {
      return $http.get(`/api/orderbook/${exchange}/${selectedPair}`).then(({ data: { result } }: any) => {
        commit("SET_ORDER_BOOK", result);
      });
    }
  },
};

export const orderBookModule: Module<OrderBookState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
