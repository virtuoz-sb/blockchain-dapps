import { MutationTree } from "vuex";
import { AssetsSummary, DexMonitoringState, DexWallet, ProjectsData, TokenData } from "./types";

export const UPDATE_WALLETS = "UPDATE_WALLETS";
export const UPDATE_ASSETS_EVOLUTION = "UPDATE_ASSETS_EVOLUTION";
export const UPDATE_CONVERSIONS_RATE = "UPDATE_CONVERSIONS_RATE";
export const UPDATE_SELECTED_WALLET = "UPDATE_SELECTED_WALLET";
export const UPDATE_TOKENS_DATA = "UPDATE_TOKENS_DATA";
export const UPDATE_PROJECTS_DATA_LIST = "UPDATE_PROJECTS_DATA_LIST";
export const UPDATE_PROJECTS_DATA = "UPDATE_PROJECTS_DATA";

export const mutations: MutationTree<DexMonitoringState> = {
  [UPDATE_WALLETS]: (state: DexMonitoringState, wallets: DexWallet[]) => {
    state.wallets = wallets;
  },

  [UPDATE_ASSETS_EVOLUTION]: (state: DexMonitoringState, assetsEvolution: AssetsSummary[]) => {
    state.assetsEvolution = assetsEvolution;
  },

  [UPDATE_CONVERSIONS_RATE]: (state: DexMonitoringState, usdConversionRates: { btc: number; eur: number }) => {
    state.usdConversionRates = usdConversionRates;
  },

  [UPDATE_SELECTED_WALLET]: (state: DexMonitoringState, wallet: DexWallet) => {
    state.selectedWallet = wallet;
  },

  [UPDATE_TOKENS_DATA]: (state: DexMonitoringState, tokens: TokenData[]) => {
    state.tokensData = tokens;
  },

  [UPDATE_PROJECTS_DATA_LIST]: (state: DexMonitoringState, projectsList: ProjectsData[]) => {
    state.projectsDataList = projectsList;
  },

  [UPDATE_PROJECTS_DATA]: (state: DexMonitoringState, projects: ProjectsData) => {
    state.projectsData = projects;
  },
};
