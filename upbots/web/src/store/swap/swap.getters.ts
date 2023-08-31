import { GetterTree } from "vuex";
import { RootState } from "../root.store";
import { DexagRequest, ExchangeData, SwapState, TableColumn } from "./types";

export const getters: GetterTree<SwapState, RootState> = {
  isPending(state): boolean {
    return state.pending;
  },
  getError(state): string {
    return state.error;
  },
  getProvider(state): string {
    return state.provider;
  },
  getProviderSdk(state): any {
    return state.providerSdk;
  },
  getProviderRequest(state): DexagRequest {
    return state.providerRequest;
  },
  isWalletConnected(state): boolean {
    return state.walletConnected;
  },
  getExchangesData(state): ExchangeData[] {
    return state.exchangesData;
  },
  getTableData(state): TableColumn[] {
    return state.tableData;
  },
};
