//@ts-ignore
import DEXAG from "dexag-sdk";
import { ActionTree } from "vuex";
import { RootState } from "../root.store";
import { dexagStatusNotification, exchangesList, SwapErrors } from "./const";
import {
  GET_ERROR_MESSAGE,
  GET_PROVIDER_REQUEST,
  GET_PROVIDER_SDK,
  GET_TABLE_DATA_BEGIN,
  GET_TABLE_DATA_SUCCESS,
  TOGGLE_ALL_EXCHANGES,
  TOGGLE_EXCHANGE,
} from "./swap.mutations";
import { DexagRequest, SwapState, TableColumn } from "./types";
const fixedTo = (number: number, fractionDigits: number) => {
  const k = Math.pow(10, fractionDigits);
  return (Math.ceil(number * k) / k).toFixed(fractionDigits);
};

export const actions: ActionTree<SwapState, RootState> = {
  initProviderSdk({ commit }, payload: { provider: any; callback: Function }) {
    const sdk = DEXAG.fromProvider(payload.provider);
    if (payload.provider) {
      sdk.registerStatusHandler((status: string) => {
        //@ts-ignore
        payload.callback(dexagStatusNotification[status]);
      });
    }
    commit(GET_PROVIDER_SDK, sdk);
  },
  setErrorMessage({ commit }, payload: string) {
    commit(GET_ERROR_MESSAGE, payload);
  },
  async fetchTableData({ commit, dispatch, state }, payload: DexagRequest) {
    if (payload.from === payload.to) {
      return dispatch("setErrorMessage", `You have the same buy and with coin`);
    }
    if (payload.toAmount === 0) {
      return dispatch("setErrorMessage", `You can't search for a trade with an amount of zero`);
    }
    if (!state.exchangesData.find(({ checked }) => checked)) {
      return commit(GET_TABLE_DATA_SUCCESS, []);
    }
    commit(GET_TABLE_DATA_BEGIN);
    try {
      const discluded = state.exchangesData
        .filter(({ checked }) => !checked)
        .map(({ id }) => id)
        .join(",");
      const data: any[] = await state.providerSdk.getPrice({ ...payload, discluded });
      const quantity = payload.toAmount;
      const bestPrice = parseFloat(data.find(({ dex }) => dex === "ag").price);
      const res: TableColumn[] = data
        .map(({ dex, price }: { dex: string; price: string }) => {
          const exchange = exchangesList.find(({ id }) => id === dex);
          const name = dex === "ag" ? "X Blaster" : exchange ? exchange.label : dex;
          return {
            dex,
            name,
            nameDesc: dex === "ag" ? "Multiple Aggregators" : undefined,
            price: parseFloat(price).toFixed(7),
            total: (parseFloat(price) * quantity).toFixed(7),
            markup: dex === "ag" ? "Best trade" : fixedTo((parseFloat(price) - bestPrice) / bestPrice, 3),
          };
        })
        .sort((a, b) => {
          if (a.nameDesc) return -1;
          else if (b.nameDesc) return 1;
          else return parseFloat(a.markup) - parseFloat(b.markup);
        });
      commit(GET_TABLE_DATA_SUCCESS, res);
    } catch {
      commit(GET_TABLE_DATA_SUCCESS, []);
      dispatch("setErrorMessage", SwapErrors.FETCH_TABLE_DATA_ERROR);
    }
    commit(GET_PROVIDER_REQUEST, payload);
  },
  toggleExchange({ commit, dispatch, state }, payload) {
    commit(TOGGLE_EXCHANGE, payload.id);
    dispatch("fetchTableData", state.providerRequest);
  },
  toggleAllExchanges({ commit, dispatch, state }, payload: boolean) {
    commit(TOGGLE_ALL_EXCHANGES, payload);
    dispatch("fetchTableData", state.providerRequest);
  },
};
