import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $http from "@/core/api.config";
import { PortfolioState, PortfolioFilteredResponse, AccountTotal } from "./types";

const namespaced: boolean = true;

// S T A T E
const state: PortfolioState = {
  balance: null,
  accounts: [],
  selectedWallets: [],
};

// G E T T E R S
export const getters: GetterTree<PortfolioState, RootState> = {
  selectedWallets(state): AccountTotal[] {
    return state.accounts.filter((acc: AccountTotal) => {
      return state.selectedWallets.some((a: string) => acc.name === a);
    });
  },
};

// M U T A T I O N S
export const mutations: MutationTree<PortfolioState> = {
  portfolioFilter(state: PortfolioState, payload: PortfolioFilteredResponse) {
    state.balance = payload.aggregated;
    // state.distribution = distributionTest as any;
  },

  portfolioSelected(state: PortfolioState, payload: string[]) {
    state.selectedWallets = payload;
  },
};

// A C T I O N S
export const actions: ActionTree<PortfolioState, RootState> = {
  handleWalletSelection({ state, commit, dispatch }, { name }: any) {
    const selected = state.selectedWallets.includes(name)
      ? state.selectedWallets.filter((i: string) => i !== name)
      : [...state.selectedWallets, name];

    commit("portfolioSelected", selected);
    dispatch("fetchFilteredPortfolioAction");
  },

  fetchFilteredPortfolioAction({ commit, state }) {
    let config: any = null;
    let url = "/api/portfolio/filter";
    if (state.selectedWallets.length > 0) {
      if (state.selectedWallets.includes("all")) {
        url += "/all";
      } else {
        config = {
          params: {
            q: state.selectedWallets.join(","),
          },
        };
      }
    }

    return $http.get<PortfolioFilteredResponse>(url, config).then(({ data }) => {
      commit("portfolioFilter", data);
    });
  },
};

export const portfolioModule: Module<PortfolioState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
