import { ActionTree } from "vuex";
import { AxiosError } from "axios";
import { Strategy, StrategyDetailsDto } from "../types/types";

import {
  CREATE_ORDER_BEGIN,
  ASSETS_SET_ASSETS,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_ERROR,
  SET_STRATEGIES,
  SET_STRATEGIES_DETAILS,
} from "./orders.mutations";

import { CreateStrategyOrderDto, StrategyOrderCreationResponse } from "../types/create-order-strategy.payload";
import $http from "@/core/api.config";

export const actions: ActionTree<any, any> = {
  createNewStrategyOrderAction({ commit }, payload: CreateStrategyOrderDto) {
    commit(CREATE_ORDER_BEGIN, payload);
    return $http
      .post<StrategyOrderCreationResponse>("/api/trade", payload)
      .then((response) => {
        const res = response && response.data;
        commit(CREATE_ORDER_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        //TODO: handle 422 error and display validation error message console.log("createNewStrategyOrderAction error: ", error);
        const res = error && error.response && error.response.data;
        commit(CREATE_ORDER_ERROR, res);

        throw error;
      });
  },

  fetchStrategies({ commit }) {
    return $http.get<Strategy[]>("/api/trade/all").then(({ data }) => {
      commit(SET_STRATEGIES, data);
    });
  },

  fetchStrategyDetails({ state, commit }, id: string) {
    return $http.get<StrategyDetailsDto[]>(`/api/trade/${id}/details`).then(({ data }) => {
      if (data.length) {
        const strategyDetail = { id: data[0].stratId, data };
        commit(SET_STRATEGIES_DETAILS, strategyDetail);
      }
    });
  },

  removeOrder({ commit }, payload): void {
    // TODO: remove this (there is no delete order)
    // commit(REMOVE_ORDER, payload);
  },

  setAssets({ commit }, assets): void {
    commit(ASSETS_SET_ASSETS, assets);
  },
};
