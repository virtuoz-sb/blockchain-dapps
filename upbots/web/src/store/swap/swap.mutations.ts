import { MutationTree } from "vuex";
import { DexagRequest, SwapState, TableColumn } from "./types";

export const GET_PROVIDER_SDK = "GET_PROVIDER_SDK";
export const GET_ERROR_MESSAGE = "GET_ERROR_MESSAGE";
export const GET_TABLE_DATA_BEGIN = "GET_TABLE_DATA_BEGIN";
export const GET_TABLE_DATA_SUCCESS = "GET_TABLE_DATA_SUCCESS";
export const GET_PROVIDER_REQUEST = "GET_PROVIDER_REQUEST";
export const TOGGLE_EXCHANGE = "TOGGLE_EXCHANGE";
export const TOGGLE_ALL_EXCHANGES = "UNSELECT_ALL_EXCHANGES";

export const mutations: MutationTree<SwapState> = {
  [GET_PROVIDER_SDK]: (state: SwapState, providerSdk: any) => {
    state.providerSdk = providerSdk;
  },
  [GET_ERROR_MESSAGE]: (state: SwapState, error: string) => {
    state.pending = false;
    state.error = error;
  },
  [GET_TABLE_DATA_BEGIN]: (state: SwapState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_TABLE_DATA_SUCCESS]: (state: SwapState, tableData: TableColumn[]) => {
    state.pending = false;
    state.error = null;
    state.tableData = tableData;
  },
  [GET_PROVIDER_REQUEST]: (state: SwapState, providerRequest: DexagRequest) => {
    state.providerRequest = providerRequest;
  },
  [TOGGLE_EXCHANGE]: (state: SwapState, id: string) => {
    state.exchangesData = state.exchangesData.map((exchange) => ({
      ...exchange,
      checked: exchange.id === id ? !exchange.checked : exchange.checked,
    }));
  },
  [TOGGLE_ALL_EXCHANGES]: (state: SwapState, checked: boolean) => {
    state.exchangesData = state.exchangesData.map((exchange) => ({
      ...exchange,
      checked,
    }));
  },
};
