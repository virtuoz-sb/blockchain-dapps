import Vue from "vue";
import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { IAlgoBotsInactiveState } from "./types";
import { BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";
import { AxiosError } from "axios";
import $http from "@/core/api.config";

const namespaced: boolean = true;

/* STATE */
export const state: IAlgoBotsInactiveState = {
  botHistoryData: [],
};

/* GETTERS */
export const getters: GetterTree<IAlgoBotsInactiveState, RootState> = {
  totalProfit(state: IAlgoBotsInactiveState) {
    return state.botHistoryData.reduce((acc: number, cur: BotPerformanceCycleDto) => Number(cur.profitPercentage) + acc, 0);
  },
};

/* MUTATIONS */
export const mutations: MutationTree<IAlgoBotsInactiveState> = {
  setBotHistoryData(state: IAlgoBotsInactiveState, payload: BotPerformanceCycleDto[]) {
    state.botHistoryData = payload;
  },
};

/* ACTIONS */
export const actions: ActionTree<IAlgoBotsInactiveState, RootState> = {
  fetchBotHistoryData({ commit }, botId: string) {
    return $http
      .get<BotPerformanceCycleDto[]>(`/api/performance/bot/${botId}/cycles/six-months`)
      .then(({ data }) => {
        commit("setBotHistoryData", data);
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          Vue.notify({ text: response.data.message, type: "error" });
        }
      });
  },
};

export const algoBotsInactiveModule: Module<IAlgoBotsInactiveState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
