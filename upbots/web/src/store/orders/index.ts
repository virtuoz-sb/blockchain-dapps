import $http from "@/core/api.config";
import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { AxiosResponse, AxiosError } from "axios";
import { StrategyDetailsVuex, Strategy, StrategyDetailsDto } from "./types/types";
import { CreateStrategyOrderDto, StrategyOrderCreationResponse } from "./types/create-order-strategy.payload";
import { orderParser } from "../../services/order.service";

const namespaced: boolean = true;

export interface OrderState {
  orders: any[]; // TODO: remove deprecated orders store property (indireclty used by MyOrders.vue)
  currentAssets: any;
  pending: boolean;
  orderStrategyIds: string[];
  error: AxiosResponse;
  strategies: any[];
  strategiesDetails: StrategyDetailsVuex[];
  isUnreadOrders: boolean;
  // orderStrategies: string[];
}

// STATE
const state: OrderState = {
  pending: false,
  orders: [], // TODO: remove deprecated orders store property
  strategies: [],
  currentAssets: { label: "BTC/USD", value: "BTC/USD" },
  orderStrategyIds: [],
  strategiesDetails: [],
  isUnreadOrders: false,
  error: null,
};

// GETTERS
export const getters: GetterTree<OrderState, RootState> = {
  orderBuy(state) {
    return state.orders.filter((el: any) => el.orderType === "buy");
  },

  orderSell(state) {
    // TODO: implement MyOrders (specs required)
    return state.orders.filter((el: any) => el.orderType === "sell");
  },

  quoteAsset(state) {
    return state.currentAssets.value.split("/")[0];
  },

  baseAsset(state) {
    return state.currentAssets.value.split("/")[1];
  },

  selectedAssetPair(state) {
    return state.currentAssets.value;
  },

  longStrategies(state) {
    return state.strategies.filter((s) => s.side === "Buy");
  },

  shortStrategies(state) {
    return state.strategies.filter((s) => s.side === "Sell");
  },
};

// MUTATIONS
export const mutations: MutationTree<OrderState> = {
  SET_CREATE_ORDER_BEGIN(state: OrderState) {
    // state.orders.push(payload);
    state.pending = true;
    state.error = null;
  },

  SET_CREATE_ORDER_SUCCESS(state: OrderState, payload: StrategyOrderCreationResponse) {
    state.pending = false;
    state.error = null;
    state.orderStrategyIds.push(payload.id);
  },

  SET_CREATE_ORDER_ERROR(state: OrderState, error: AxiosResponse) {
    state.pending = false;
    state.error = error;
  },

  // TODO: remove dead code: there is no such thing as delete order
  // SET_REMOVE_ORDER(state: OrderState, payload: any) => {
  //   state.orders = state.orders
  //     .map((el: any) => {
  //       if (el.id === payload.orderId) return { ...el, order: el.order.filter((item: any) => item.form.optionId !== payload.operationId) };
  //       return el;
  //     })
  //     .filter((el: any) => el.order.length);
  // },
  SET_ASSETS(state: OrderState, assets: string) {
    state.currentAssets = assets;
  },

  SET_STRATEGIES(state: OrderState, payload: Strategy[]) {
    state.strategies = payload;
  },

  SET_STRATEGIES_DETAILS(state: OrderState, payload: StrategyDetailsDto[]) {
    state.strategiesDetails = [...state.strategiesDetails, payload] as StrategyDetailsVuex[];
  },

  SET_ORDERS(state: OrderState, payload: any) {
    state.strategies = payload;
  },

  SET_UNREAD_STATUS(state: OrderState, payload: boolean) {
    state.isUnreadOrders = payload;
  },
};

// ACTIONS
export const actions: ActionTree<OrderState, RootState> = {
  createNewStrategyOrderAction({ commit }, payload: CreateStrategyOrderDto) {
    commit("SET_CREATE_ORDER_BEGIN", payload);
    return $http
      .post<StrategyOrderCreationResponse>("/api/trade", payload)
      .then((response) => {
        const res = response && response.data;
        commit("SET_CREATE_ORDER_SUCCESS", res);
      })
      .catch((error: AxiosError) => {
        //TODO: handle 422 error and display validation error message console.log("createNewStrategyOrderAction error: ", error);
        const res = error && error.response && error.response.data;
        commit("SET_CREATE_ORDER_ERROR", res);

        throw error;
      });
  },

  // fetchStrategies({ commit }) {
  //   return $http.get<Strategy[]>("/api/trade/all").then(({ data }) => {
  //     commit("SET_STRATEGIES", data);
  //   });
  // },

  fetchStrategyDetails({ state, commit }, id: string) {
    return $http.get<StrategyDetailsDto[]>(`/api/trade/${id}/details`).then(({ data }) => {
      if (data.length) {
        const strategyDetail = { id: data[0].stratId, data };
        commit("SET_STRATEGIES_DETAILS", strategyDetail);
      }
    });
  },

  fetchOrders({ state, commit, dispatch, rootState, rootGetters }: any) {
    return $http.get("/api/trade/directorders").then(({ data }) => {
      commit("SET_ORDERS", orderParser(data, rootGetters["userModule/exhangesPairs"], rootState.userModule.keys));
      dispatch("changeUnreadOrders", false);
    });
  },

  removeOrder({ commit }, payload): void {
    // TODO: remove this (there is no delete order)
    // commit('SET_REMOVE_ORDER', payload);
  },

  setAssets({ commit }, assets): void {
    commit("SET_ASSETS", assets);
  },

  changeUnreadOrders({ commit }, payload: boolean) {
    commit("SET_UNREAD_STATUS", payload);
  },
};

export const orderModule: Module<OrderState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
