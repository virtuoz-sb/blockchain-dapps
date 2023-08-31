import { MutationTree } from "vuex";
import { AxiosResponse } from "axios";
import { OrderState } from "./orders.module";
import { StrategyOrderCreationResponse } from "../types/create-order-strategy.payload";
import { Strategy, StrategyDetailsDto, StrategyDetailsVuex } from "../types/types";
export const CREATE_ORDER_BEGIN = "CREATE_ORDER_BEGIN";
export const CREATE_ORDER_SUCCESS = "CREATE_ORDER_SUCCESS";
export const CREATE_ORDER_ERROR = "CREATE_ORDER_ERROR";

export const REMOVE_ORDER = "REMOVE_ORDER";
export const ASSETS_SET_ASSETS = "ASSETS_SET_ASSETS";

export const SET_STRATEGIES = "SET_STRATEGIES";
export const SET_SHORT_STRATEGIES = "SET_SHORT_STRATEGIES";
export const SET_STRATEGIES_DETAILS = "SET_STRATEGIES_DETAILS";

export const mutations: MutationTree<OrderState> = {
  [CREATE_ORDER_BEGIN]: (state: OrderState) => {
    // state.orders.push(payload);
    state.pending = true;
    state.error = null;
  },
  [CREATE_ORDER_SUCCESS]: (state: OrderState, payload: StrategyOrderCreationResponse) => {
    state.pending = false;
    state.error = null;
    state.orderStrategyIds.push(payload.id);
  },
  [CREATE_ORDER_ERROR]: (state: OrderState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  // TODO: remove dead code: there is no such thing as delete order
  // [REMOVE_ORDER]: (state: OrderState, payload: any) => {
  //   state.orders = state.orders
  //     .map((el: any) => {
  //       if (el.id === payload.orderId) return { ...el, order: el.order.filter((item: any) => item.form.optionId !== payload.operationId) };
  //       return el;
  //     })
  //     .filter((el: any) => el.order.length);
  // },
  [ASSETS_SET_ASSETS]: (state: OrderState, assets: string) => {
    state.currentAssets = assets;
  },

  [SET_STRATEGIES]: (state: OrderState, payload: Strategy[]) => {
    state.strategies = payload;
  },

  [SET_STRATEGIES_DETAILS]: (state: OrderState, payload: StrategyDetailsDto[]) => {
    state.strategiesDetails = [...state.strategiesDetails, payload] as StrategyDetailsVuex[];
  },
};
