import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $http from "@/core/api.config";
import { encodedRouteQuery } from "@/core/services/training.service.ts";

import { TrainingState } from "./types";

import {} from "./types";

const namespaced: boolean = true;

export const state: TrainingState = {
  error: null,
  search: "",
  loading: false,
  training: [],
  activeFilters: {
    languages: [],
    topics: [],
    levels: [],
    formats: [],
  },
  availableFilters: {
    languages: [],
    topics: [],
    levels: [],
    formats: [],
  },
};

export const getters: GetterTree<TrainingState, RootState> = {};

export const mutations: MutationTree<TrainingState> = {
  trainings(state: any, payload: any[]) {
    state.training = payload;
  },

  filters(state: any, payload) {
    state.availableFilters = payload;
  },

  addFilters(state: any, payload) {
    state.activeFilters = payload;
  },

  setSearch(state: any, payload) {
    state.search = payload;
  },
};

export const actions: ActionTree<TrainingState, RootState> = {
  initialFillDatabase({ commit }) {
    return $http.get<any>("/api/training/seed");
  },

  fetchTrainings({ commit, state }, payload) {
    const params = payload;
    return $http
      .get<any>("/api/training?limit=100", { params })
      .then(({ data: { trainings } }) => {
        commit("trainings", trainings);
        commit("setSearch", payload.search);
        commit("addFilters", encodedRouteQuery(payload, state.availableFilters));
      });
  },

  fetchFilters({ commit }) {
    return Promise.all([
      $http.get<any>("/api/training/languages"),
      $http.get<any>("/api/training/topics"),
      $http.get<any>("/api/training/levels"),
      $http.get<any>("/api/training/formats"),
    ]).then((res) => {
      const languages = res[0].data.languages;
      const topics = res[1].data.topics;
      const levels = res[2].data.levels;
      const formats = res[3].data.formats;
      commit("filters", { languages, topics, levels, formats });
    });
  },
};

export const trainingModule: Module<TrainingState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
