import { Module } from "vuex";
import { getters } from "./getters";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { ApiHealthState } from "./types";
import { RootState } from "../root.store";

export const state: ApiHealthState = {
  isOn: false,
  error: false,
  loading: false,
}; // init state

const namespaced: boolean = true; // when true, avoids action name collision between different modules

// this is the module name (important for vuex namespacing)
export const apiHealth: Module<ApiHealthState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
