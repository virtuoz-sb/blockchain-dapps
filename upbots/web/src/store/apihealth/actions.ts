import { ActionTree } from "vuex";
import axios, { AxiosError } from "axios";
import { ApiHealthState, ApiHealth } from "./types";
import { API_HEALTH_SET, API_HEALTH_ERROR, API_HEALTH_LOADING } from "./mutations";
import { RootState } from "../root.store";

export const actions: ActionTree<ApiHealthState, RootState> = {
  fetchApiHealthAction({ commit }): any {
    commit(API_HEALTH_LOADING);

    axios.get<ApiHealth>(process.env.VUE_APP_ROOT_API + "/api" || "").then(
      (response) => {
        const payload = response && response.data;
        commit(API_HEALTH_SET, payload);
      },
      (error: AxiosError) => {
        const payload = error && error.response && error.response.data;
        commit(API_HEALTH_ERROR, payload);
      }
    );
  },
};
