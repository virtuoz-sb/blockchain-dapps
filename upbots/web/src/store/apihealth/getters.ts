import { GetterTree } from "vuex";
import { ApiHealthState } from "./types";
import { RootState } from "../root.store";

export const getters: GetterTree<ApiHealthState, RootState> = {
  getApiIsOn(state): boolean {
    return state.isOn;
  },
  getLoading(state): boolean {
    return state.loading;
  },
};
