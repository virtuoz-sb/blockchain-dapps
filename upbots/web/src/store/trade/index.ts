import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { ExchangePairSettings } from "./types/echange-pair-settings.model";
import { CurrentPriceSummaryResult, GetCurrentPricePayload } from "./types";
import { AxiosError } from "axios";
import { AxiosResponse } from "axios";
import $http from "@/core/api.config";
import { KeyExtended, TradingSettings } from "../user/types";

export const FETCH_CURRENT_PRICE_BEGIN = "FETCH_CURRENT_PRICE_BEGIN";
export const FETCH_CURRENT_PRICE_SUCCESS = "FETCH_CURRENT_PRICE_SUCCESS";
export const FETCH_CURRENT_PRICE_ERROR = "FETCH_CURRENT_PRICE_ERROR";

const defaultPair: () => ExchangePairSettings = () => ({
  baseCurrency: "XBT",
  inverse: true,
  isFavourite: false,
  label: "BTC/USD",
  market: "BTC/USD",
  name: "XBT/USD",
  perpetualContract: true,
  quoteCurrency: "USD",
  symbol: "XBTUSD",
  symbolForData: "btcusd-perpetual-future-inverse",
  tradingAllowed: true,
});

const namespaced: boolean = true;

export interface TradeState {
  mode: string;
  exchange: KeyExtended;
  selectedCurrencyPair: ExchangePairSettings;
  apiKeyRef: string;
  symbol: string;
  side: string;
  tradingSettings: any;
  error: AxiosResponse;
  pending: boolean;
  currentQuotedPrice: number;
  formatPrecision: number;
  isPrice: boolean;
  isFormValidated: boolean;
}

// STATE
const state: TradeState = {
  mode: "basic",
  exchange: null, // selectedAccount
  selectedCurrencyPair: defaultPair(),
  // availablePairs: null, //TODO: remove unused
  apiKeyRef: null,
  symbol: null,
  side: null,
  tradingSettings: null,
  error: null,
  pending: false,
  currentQuotedPrice: 1,
  formatPrecision: 2,
  isPrice: false,
  isFormValidated: false,
};

// GETTERS
export const getters: GetterTree<TradeState, RootState> = {
  // Symbol for MT widgets
  widgetSymbol(state) {
    if (state.exchange) {
      let exchange = state.exchange.exchange === "bitmex_test" ? "bitmex" : state.exchange.exchange;
      const currencyPair: any = state.selectedCurrencyPair;
      const pairSymbol = `${currencyPair.baseCurrency}${currencyPair.quoteCurrency}`;

      exchange = exchange === "binance-us" ? "binanceus" : exchange;
      return `${exchange.toUpperCase()}:${pairSymbol}`;
    } else {
      return "BITMEX:XBTUSD";
    }
  },

  getExchange(state): string {
    return state.exchange.exchange;
  },

  //returns allowed pairs for trading related to the currently selected exchange (state.exchange)
  getAvailablePairs(state, getters, rootState: any, rootGetters): ExchangePairSettings[] {
    const tradingSettings = rootState.userModule.tradingSettings as TradingSettings[];

    const favouritePairs = rootGetters["userSettingsModule/getFavouritePairs"];

    if (!tradingSettings || !state.exchange) return null;

    const pairsByExchange = tradingSettings.find((ex) => ex.name === state.exchange.exchange);

    if (pairsByExchange) {
      const pairs = pairsByExchange.pairs
        .map((pair: ExchangePairSettings) => {
          // toggle isFavourite Pairs
          const pairSymbol = `${pair.baseCurrency}${pair.quoteCurrency}`;
          const favourite = favouritePairs.includes(pairSymbol);

          // manual trade widgets (buy sentiments , orderbook is wired to the label property created here)
          const basePair = pair.baseCurrency === "XBT" ? "BTC" : pair.baseCurrency; //for bitmex XBT is BTC
          return {
            ...pair,
            isFavourite: favourite,
            // TODO remove "label" and "name"
            label: `${basePair}/${pair.quoteCurrency}`,
            name: `${pair.baseCurrency}/${pair.quoteCurrency}`,
          };
        })
        .filter((p: any) => p.tradingAllowed);

      return pairs;
    } else {
      return null;
    }
  },

  getCurrentQuotedPrice(state: TradeState): number {
    return state.currentQuotedPrice;
  },
};

// MUTATIONS
export const mutations: MutationTree<TradeState> = {
  setMode(state, payload) {
    state.mode = payload;
  },

  setExchange(state: TradeState, payload: any) {
    state.exchange = payload;
  },
  // TODO: remove unused ?
  // setAvailablePairs(state: TradeState, payload) {
  //   state.availablePairs = payload;
  // },

  selectPair(state: TradeState, payload: ExchangePairSettings) {
    state.selectedCurrencyPair = payload;
  },

  setFormatPrecision(state: TradeState, payload: number) {
    state.formatPrecision = payload;
  },

  setPriceAvailable(state: TradeState, payload: boolean) {
    state.isPrice = payload;
  },

  [FETCH_CURRENT_PRICE_BEGIN]: (state: TradeState) => {
    state.pending = true;
    state.error = null;
  },
  [FETCH_CURRENT_PRICE_SUCCESS]: (state: TradeState, response: CurrentPriceSummaryResult) => {
    state.currentQuotedPrice = response.result.price.last;
    state.pending = false;
    state.error = null;
  },
  [FETCH_CURRENT_PRICE_ERROR]: (state: TradeState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },

  SET_FORM_VALIDATION_STATUS(state: TradeState, payload: boolean) {
    state.isFormValidated = payload;
  },
};

// ACTIONS
export const actions: ActionTree<TradeState, RootState> = {
  fetchCurrentPriceAction({ commit }, payload: any) {
    const nonTestExchange = payload.exchange.exchange.replace("_test", "");
    let pairSymbol = payload.symbol;

    if (nonTestExchange === "ftx") {
      pairSymbol = pairSymbol.replace("/", "_");
    }

    commit(FETCH_CURRENT_PRICE_BEGIN, payload);
    commit("setPriceAvailable", false);
    return $http
      .get<CurrentPriceSummaryResult>(`/api/price/${nonTestExchange}/${pairSymbol}`)
      .then((response) => {
        const res = response && response.data;
        commit(FETCH_CURRENT_PRICE_SUCCESS, res);
        commit("setPriceAvailable", true);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(FETCH_CURRENT_PRICE_ERROR, res);
        throw error;
      });
  },

  fetchTradesFormats({ state, commit }) {
    const { market } = state.selectedCurrencyPair;
    const currentExchange = (state.exchange && state.exchange.exchange) || "bitmex";
    const exchange = currentExchange === "bitmex_test" ? "bitmex" : currentExchange;

    return $http.get(`/api/settings/trades/formats/${exchange}`).then(({ data }) => {
      const currentMarket = data.formatRules[market];
      const [_, price] = currentMarket.precision.price.toString().split(".");

      let formatPrice: number;

      formatPrice = price ? price.length : 2;

      commit("setFormatPrecision", formatPrice);
    });
  },

  changeFormValidationStatus({ commit }, payload: boolean) {
    commit("SET_FORM_VALIDATION_STATUS", payload);
  },
};

export const tradeModule: Module<TradeState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
