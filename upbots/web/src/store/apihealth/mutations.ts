import { MutationTree } from "vuex";
import { ApiHealthState, ApiHealth } from "./types";

// mutation types:
export const API_HEALTH_SET = "setApiHealth";
export const API_HEALTH_ERROR = "apiHealthError";
export const API_HEALTH_LOADING = "apiHealthLoading";

// mutations are synchronous functions that update the state (akin to redux reducers..)
export const mutations: MutationTree<ApiHealthState> = {
  [API_HEALTH_LOADING]: function (state: ApiHealthState, payload: ApiHealth) {
    state.loading = true;
  },
  [API_HEALTH_SET]: function (state: ApiHealthState, payload: ApiHealth) {
    state.date = payload.date;
    state.isOn = true;
    state.error = false;
    state.loading = false;
  },
  [API_HEALTH_ERROR]: (state: ApiHealthState, error: Error) => {
    state.error = true;
    state.date = undefined;
    state.isOn = false;
    state.loading = false;
  },
};
