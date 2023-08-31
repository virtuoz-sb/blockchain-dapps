import { Module } from "vuex";
import { getters } from "./orders.getters";
import { actions } from "./orders.actions";
import { mutations } from "./orders.mutations";
import { AxiosResponse } from "axios";
import { RootState } from "../../root.store";
import { Strategy, StrategyDetailsVuex } from "../types/types";

const namespaced: boolean = true; // when true, avoids action name collision between different modules

export interface OrderState {
  orders: any[]; // TODO: remove deprecated orders store property (indireclty used by MyOrders.vue)
  currentAssets: any;
  pending: boolean;
  orderStrategyIds: string[];
  error: AxiosResponse;
  strategies: Strategy[];
  strategiesDetails: StrategyDetailsVuex[];
  // orderStrategies: string[];
}

export const state: OrderState = {
  pending: false,
  orders: [], // TODO: remove deprecated orders store property
  strategies: [],
  currentAssets: { label: "BTC/USD", value: "BTC/USD" },
  orderStrategyIds: [],
  strategiesDetails: [],
  error: null,
}; // init state

// this is the module name (important for vuex namespacing)
export const orderModule: Module<OrderState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
