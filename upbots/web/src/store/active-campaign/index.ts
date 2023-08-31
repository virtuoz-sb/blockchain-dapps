import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { AxiosError } from "axios";
import $http from "@/core/api.config";
import { ActiveCampaignUser, ActiveCampaignState } from "./types";

const namespaced: boolean = true;

// STATE
export const state: ActiveCampaignState = {
  error: null,
};

// MUTATIONS
export const mutations: MutationTree<ActiveCampaignState> = {
  setError(state: ActiveCampaignState, payload: AxiosError) {
    state.error = payload;
  },
};
// ACTIONS
export const actions: ActionTree<ActiveCampaignState, RootState> = {
  addUserToUserList({ commit }, payload: ActiveCampaignUser): any {
    return $http.post<ActiveCampaignUser>(`/api/active-campaign/add-user-list`, payload).catch((error: AxiosError) => {
      const res = error && error.response && error.response.data;
      commit("setError", res);
    });
  },
  addUserToMasterList({ commit }, payload: ActiveCampaignUser): any {
    return $http.post<ActiveCampaignUser>(`/api/active-campaign/add-marketing-list`, payload).catch((error: AxiosError) => {
      const res = error && error.response && error.response.data;
      commit("setError", res);
    });
  },
};

export const activeCampaignModule: Module<ActiveCampaignState, RootState> = {
  namespaced,
  state,
  actions,
  mutations,
};
