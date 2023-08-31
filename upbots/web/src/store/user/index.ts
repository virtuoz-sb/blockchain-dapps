import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $http from "@/core/api.config";
import moment from "moment";
import { maxFloatCharacters } from "@/core/helper-functions";
import { parseTotalEvolutionData, generateEvolutionChartData, portfolioFilterUrl } from "@/core/services/portfolio.service";
import { fixedDecimal } from "@/core/filters";
import {
  UserState,
  PortfolioSummaryResponse,
  ExchangeKey,
  AddExchangeKeyRequestPayload,
  EditExchangeKeyRequestPayload,
  PortfolioFilteredResponse,
  PageSettings,
  Coupons,
  Accounts,
  Summary,
  Keys,
  Exchanges,
  TradingSettings,
  KeyExtended,
  BtcAmount,
} from "./types";
import { AxiosError, AxiosResponse } from "axios";
import { FavoriteCurrency } from "@/components/portfolio/types/portfolio.types";

const namespaced: boolean = true;

export const PUT_EDIT_EXCHANGEKEYS_BEGIN = "GET_EDIT_EXCHANGEKEYS_BEGIN";
export const PUT_EDIT_EXCHANGEKEYS_SUCCESS = "GET_EDIT_EXCHANGEKEYS_SUCCESS";
export const PUT_EDIT_EXCHANGEKEYS_ERROR = "GET_EDIT_EXCHANGEKEYS_ERROR";

/* STATE */
export const state: UserState = {
  loading: {},
  /* Portfolio */
  accounts: [],
  distribution: null,
  portfolioDistributionChart: null,
  /* Portfolio Distribution */
  portfolioBalance: null,
  portfolioDistribution: null,
  /* Portfolio Evolution */
  portfolioEvolution: null,
  selectedQuantity: "2,weeks",
  /* Main Currency FIlter */
  favoriteCurrency: { value: "usd", label: "USD" },
  alerts: [],
  keys: [],
  exchanges: [],
  tradingSettings: [],
  selectedWallets: [],
  pageSettings: [],
  activeCoupons: [],
};

/* GETTERS */
export const getters: GetterTree<UserState, RootState> = {
  // Labels for card  e.g.: "USD, BTC"
  activeCurrenciesNames(state: UserState) {
    return state.favoriteCurrency.value === "eur" ? "EUR, BTC" : "USD, BTC";
  },

  cexBalance(state: UserState): BtcAmount {
    const selectedAccounts = state.selectedWallets.map((name) => state.accounts.find((account) => account.name === name));
    return selectedAccounts.reduce<BtcAmount>(
      (acc, { total }) => ({
        btc: acc.btc + total.btc,
        eur: acc.eur + total.eur,
        usd: acc.usd + total.usd,
        conversionDate: acc.conversionDate,
      }),
      {
        btc: 0,
        eur: 0,
        usd: 0,
        conversionDate: new Date(),
      }
    );
  },

  userWallets(state: UserState) {
    return state.accounts.map((el: Accounts) => {
      return {
        ...el,
        total: {
          base: `${maxFloatCharacters(el.total.btc, 8)} BTC`,
          favorite: `${maxFloatCharacters((el.total as any)[state.favoriteCurrency.value], 2)} ${state.favoriteCurrency.label}`,
        },
      };
    });
  },

  portfolioEvolutionData({ portfolioEvolution, keys, favoriteCurrency }: UserState) {
    if (!portfolioEvolution || !keys.length) return null;

    const { labels, parsedData } = portfolioEvolution;
    return generateEvolutionChartData({ labels, parsedData, favoriteCurrency });
  },

  disabledExchanges(state): string[] {
    return state.tradingSettings.filter((ex) => !ex.enabled).map((ex) => ex.name);
  },

  getExchangesFormatted(state: UserState) {
    return state.exchanges.map((ex: any) => ({
      img: require(`@/assets/images/${ex.name === "bitmex_test" ? "bitmex" : ex.name}.svg`),
      label: ex.label,
      value: ex.name,
      alt: ex.name,
    }));
  },

  enabledExchanges(state: UserState): TradingSettings[] {
    return state.tradingSettings.filter((s) => s.enabled);
  },

  exhangesPairs(state: UserState, getters) {
    const toReturn: any = {};
    getters.enabledExchanges.forEach((el: any) => {
      toReturn[el.name] = el.pairs;
    });

    return toReturn;
  },

  getKeyNamesWithExchange(state: UserState, getters): KeyExtended[] {
    const binanceAcc = state.keys.filter((el: any) => {
      if (el.exchange === "binance" || el.exchange === "binance-us" || el.exchange === "ftx" || el.exchange === "kucoin") {
        return { ...el };
      }
    });

    const allowedExchangesForTrading = state.tradingSettings.filter((ex) => ex.enabled).map((ex) => ex.name);
    return binanceAcc.map((el: Keys) => {
      const isComingSoon = getters.disabledExchanges.includes(el.exchange);
      const tradingAllowed = allowedExchangesForTrading.includes(el.exchange);

      return {
        ...el,
        img: require(`@/assets/images/${el.exchange === "bitmex_test" ? "bitmex" : el.exchange}.svg`),
        displayName: `${el.name} ${isComingSoon ? "(Coming soon)" : ""}`,
        tradingAllowed,
      };
    });
  },

  getDistributionTableData(state): any {
    if (!state || !state.portfolioDistribution) {
      return [];
    }
    return Object.keys(state.portfolioDistribution).map((key) => {
      return {
        coin: key,
        amount: state.portfolioDistribution[key].currencyAmount,
        btcValue: state.portfolioDistribution[key].btc,
        usdValue: state.portfolioDistribution[key].usd,
        eurValue: state.portfolioDistribution[key].eur,
      };
    });
  },

  getPortfolioPercentageData(state): any {
    if (!state.portfolioDistributionChart) {
      return [];
    }
    return Object.keys(state.portfolioDistributionChart).map((key) => ({
      x: key, // needed for anychart labels
      labels: key,
      value: fixedDecimal(state.portfolioDistributionChart[key] && state.portfolioDistributionChart[key].usd, 2, 0),
      valueEur: fixedDecimal(state.portfolioDistributionChart[key] && state.portfolioDistributionChart[key].eur, 2, 0),
      currencyAmount: fixedDecimal(state.portfolioDistributionChart[key] && state.portfolioDistributionChart[key].currencyAmount, 4, 0),
    }));
  },

  hasCoupons(state: UserState) {
    return !!state.activeCoupons.length;
  },

  hasCouponsWithCorrectPromo(state: UserState) {
    const algobotAccessOk = state.activeCoupons.some((c: Coupons) => c.promoName === process.env.VUE_APP_STAKING_PROMONAME);
    return algobotAccessOk;
  },
  getAccounts(state: UserState): Accounts[] {
    return state.accounts;
  },
  getAccountById: (state: UserState) => (id: string): any => {
    return state.accounts.find((account) => account.id === id);
  },
};

/* MUTATIONS */
export const mutations: MutationTree<UserState> = {
  toggleLoading(state: UserState, payload: string) {
    if (state.loading[payload]) {
      state.loading = {
        ...state.loading,
        [payload]: false,
      };
    } else {
      state.loading = {
        ...state.loading,
        [payload]: true,
      };
    }
  },
  // Alert
  setAlert(state: UserState, payload: any) {
    state.alerts.push(payload);
  },

  removeAlert(state: UserState, payload: any[]) {
    state.alerts = payload;
  },

  editAlert(state: UserState, payload: any) {
    state.alerts[payload.index] = payload.form;
  },

  // Summary
  setSummary(state: UserState, payload: Summary) {
    state.accounts = [...payload.accounts];
    state.distribution = payload.distribution;
  },

  // Coupons
  setActiveCoupons(state: UserState, payload: Coupons[]) {
    const data = payload.filter((coupon) => coupon.activated);
    state.activeCoupons = data.map((coupon) => {
      return {
        code: coupon.code,
        promoName: coupon.promoName,
        description: coupon.description,
        couponType: coupon.couponType,
        activated: coupon.activated,
      };
    });
  },

  // Currency
  setFavoriteCurrency(state: UserState, payload: FavoriteCurrency) {
    state.favoriteCurrency = payload;
  },

  // Portfolio Evolution
  setPortfolioEvolution(state: UserState, payload: any) {
    state.portfolioEvolution = payload;
  },

  setSelectedQuantity(state: UserState, payload: string) {
    state.selectedQuantity = payload;
  },

  // Exchange keys
  setExchangeKeys(state: UserState, payload: ExchangeKey[]) {
    state.keys = payload;
  },

  // Portfolio filter
  portfolioFilter(state: UserState, payload: PortfolioFilteredResponse) {
    state.portfolioBalance = payload.aggregated;
    state.portfolioDistribution = payload.distribution;
  },

  setPortfolioDistributionChart(state: UserState, payload: Summary) {
    state.portfolioDistributionChart = payload.distribution;
  },

  portfolioSelected(state: UserState, payload: string[]) {
    state.selectedWallets = payload;
  },

  // Exchange settings
  setTradingSettings(state: UserState, payload: Array<TradingSettings>) {
    state.tradingSettings = payload;
  },

  setCompatibleExchanges(state: UserState, payload: Array<Exchanges>) {
    state.exchanges = payload;
  },

  setPageSettings(state: UserState, payload: PageSettings[]) {
    state.pageSettings = payload;
  },

  [PUT_EDIT_EXCHANGEKEYS_BEGIN]: (state: UserState) => {
    // NOTHING IS FORSEEN CURRENTLY ...
  },
  [PUT_EDIT_EXCHANGEKEYS_SUCCESS]: (state: UserState, payload: ExchangeKey[]) => {
    state.keys = payload;
  },
  [PUT_EDIT_EXCHANGEKEYS_ERROR]: (state: UserState, error: AxiosResponse) => {
    // NOTHING IS FORSEEN CURRENTLY ...
  },
};

/* ACTIONS */
export const actions: ActionTree<UserState, RootState> = {
  handleWalletSelection({ state, commit, dispatch }, { name }: any) {
    const selected = state.selectedWallets.includes(name)
      ? state.selectedWallets.filter((i: string) => i !== name)
      : [...state.selectedWallets, name];

    commit("portfolioSelected", selected);
    dispatch("fetchFilteredPortfolio");
    dispatch("fetchPortfolioEvolution");
  },

  fetchTradingSettings({ commit }) {
    return $http
      .get("/api/settings/exchanges")
      .then(({ data: { compatibleExchanges, tradingSettings, stableCoins, alts, fiats } }: any) => {
        commit("setCompatibleExchanges", compatibleExchanges);
        commit("setTradingSettings", tradingSettings);
      });
  },

  fetchFilteredPortfolio({ state, commit, dispatch }) {
    const { url, config } = portfolioFilterUrl(state.selectedWallets);

    commit("toggleLoading", "portfolioDistributionTable");
    $http.get<PortfolioFilteredResponse>(url, config).then(({ data }) => {
      commit("portfolioFilter", data);
      commit("toggleLoading", "portfolioDistributionTable");
    });

    const configForChart: any = config;
    configForChart.params.take = 8;
    commit("toggleLoading", "portfolioDistributionChart");
    $http.get<PortfolioFilteredResponse>(url, configForChart).then(({ data }) => {
      commit("setPortfolioDistributionChart", data);
      commit("toggleLoading", "portfolioDistributionChart");
    });
  },

  fetchPortfolioEvolution({ state, commit }) {
    const end = moment().format("YYYY-MM-DD");
    let start = "";

    if (state.selectedQuantity === "all") {
      start = "1970-01-01";
    } else {
      const [num, type]: any = state.selectedQuantity.split(",");
      start = moment().subtract(Number(num), type).format("YYYY-MM-DD");
    }

    commit("toggleLoading", "portfolioEvolution");
    return $http
      .get<any>("/api/portfolio/evolution", { params: { start, end } })
      .then(({ data }) => {
        commit("toggleLoading", "portfolioEvolution");
        if (state.selectedWallets.length) {
          const { parsedData, labels } = parseTotalEvolutionData({
            keys: state.keys,
            selectedWallets: state.selectedWallets,
            result: data.accounts,
          });

          commit("setPortfolioEvolution", { labels, parsedData });
        } else {
          commit("setPortfolioEvolution", null);
        }
      });
  },

  fetchUserSummary({ commit }) {
    return $http.get<PortfolioSummaryResponse>("/api/portfolio/summary").then(({ data }) => {
      commit("setSummary", data);
    });
  },

  // Exchaged keys Actions
  fetchKeysActionAsync({ commit }) {
    return $http.get<ExchangeKey>("/api/keys").then((response) => {
      const payload = response && response.data;
      commit("setExchangeKeys", payload);
    });
  },

  createExchangeKeyActionAsync({ commit, dispatch }, payload: AddExchangeKeyRequestPayload) {
    return $http
      .post<ExchangeKey>("/api/keys", payload)
      .then((response) => {
        const payload = response && response.data;
        commit("setExchangeKeys", payload);
        return response;
      })
      .then(() => {
        return dispatch("fetchUserSummary");
      });
  },

  editExchangeKeyActionAsync({ commit }, payload: EditExchangeKeyRequestPayload) {
    return $http.put<ExchangeKey>("/api/keys", payload).then((response) => {
      const payload = response && response.data;
      commit("setExchangeKeys", payload);
    });
  },
  editExchangeKeyAction({ commit, dispatch }, payload: EditExchangeKeyRequestPayload) {
    commit(PUT_EDIT_EXCHANGEKEYS_BEGIN);
    return $http
      .put<ExchangeKey>("/api/keys", payload)
      .then((response) => {
        const res = response && response.data;
        commit(PUT_EDIT_EXCHANGEKEYS_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(PUT_EDIT_EXCHANGEKEYS_ERROR, res);
      });
  },

  deleteKeyActionAsync({ commit, dispatch }, payload: { id: string }) {
    return $http
      .delete<ExchangeKey>(`/api/keys/` + payload.id)
      .then((response) => {
        const payload = response && response.data;
        commit("setExchangeKeys", payload);
      })
      .then(async () => {
        await dispatch("fetchUserSummary");
        return dispatch("fetchFilteredPortfolio");
      });
  },

  addNewAlert({ commit }, payload): void {
    commit("setAlert", payload);
  },

  removeAlert({ commit, state }, removeIndex: number): void {
    const alerts = state.alerts.filter((el: any, index: number) => index !== removeIndex);
    commit("removeAlert", alerts);
  },

  editAlert({ commit }, payload: any): void {
    commit("editAlert", payload);
  },

  // Page coming soon status
  fetchPagesStatus({ commit }) {
    return $http.get<PageSettings>("/api/settings/pages").then(({ data }) => {
      commit("setPageSettings", data);
    });
  },

  fetchUserCoupons({ commit }) {
    return $http.get<Coupons[]>("/api/coupons/user").then(({ data }) => {
      commit("setActiveCoupons", data);
    });
  },
};

export const userModule: Module<UserState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
