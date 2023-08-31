import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { userSettingsState } from "./types";
import { loadFavourites, saveFavourites } from "./helpers";

const namespaced: boolean = true;

// S T A T E
export const state: userSettingsState = {
  favourites: loadFavourites(),
};

// G E T T E R S
export const getters: GetterTree<userSettingsState, RootState> = {
  getFavouritePairs(state: any) {
    return state.favourites;
  },
};

// M U T A T I O N S
export const mutations: MutationTree<userSettingsState> = {
  setFavouritePairs(state: any, payload: string[]) {
    state.favourites = payload;
    saveFavourites(payload);
  },
};

// A C T I O N S
export const actions: ActionTree<userSettingsState, RootState> = {
  addFavouritePair({ state, commit }, { symbol }: { symbol: string }) {
    // add and remove pair
    const selected = state.favourites.includes(symbol)
      ? state.favourites.filter((i: string) => i !== symbol)
      : [...state.favourites, symbol];

    commit("setFavouritePairs", selected);
  },
};

export const userSettingsModule: Module<userSettingsState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
