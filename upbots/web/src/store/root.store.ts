import Vue from "vue";
import Vuex, { GetterTree, MutationTree, StoreOptions } from "vuex";
import VuexPersistence from "vuex-persist";
// import { apiHealth } from "./apihealth";
import { authModule } from "./auth";
import { cryptoPrice } from "./cryptoPrice";
import { notificationsModule } from "./notifications";
import { orderModule } from "./orders";
import { swapModule } from "./swap";
import { dexMonitoringModule } from "./dex-monitoring";
import { tradeModule } from "./trade";
import { trainingModule } from "./training";
import { userModule } from "./user";
import { userSettingsModule } from "./user-settings";
import { algobotsModule } from "./algo-bots";
import { algoBotsInactiveModule } from "./algo-bots-inactive";
import { orderBookModule } from "./orderBook";
import { adminExtractModule } from "./admin-extract";
import { stakingModule } from "./staking";
import { ubxtBridgeModule } from "./ubxt-bridge";
import { ubxtWalletModule } from "./ubxt-wallet";
import { perfeesModule } from "./perfees";
import { activeCampaignModule } from "./active-campaign";

Vue.use(Vuex);

const state: RootState = {
  isLoading: false,
  isMobileMenu: false,
  isSidebarOpen: false,
  favCurrency: "EUR",
  isAppInitialized: false,
  // ----------------
  botDetailFakeData: [
    {
      id: "1",
      botData: {
        description: {
          title: "Ichimoku - ETH",
          switch: true,
          created: "07/03/2020",
          exchange: "FTX",
          strategy: "Long/Short",
          pair: "ETH/USD",
          position: "Open",
          botProfit: "43.7%",
        },
        chartData: {
          borderColor: "#6E4498",
          backgroundColor: "#1D1F31",
          data: [8, 17, 24, 19, 37, 43],
          lables: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
      ditailedData: {
        headerData: [
          { id: 1, title: "Active Since", subtitle: "6 Days" },
          { id: 2, title: "Trades", subtitle: "6" },
          { id: 3, title: "Success rate", subtitle: "83%" },
        ],
        tableData: [
          {
            number: 6,
            created: "07/10/2020",
            trade: 1,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: 8.1,
          },
          {
            number: 6,
            created: "08/10/2020",
            trade: 2,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 9.0,
          },
          {
            number: 6,
            created: "09/10/2020",
            trade: 3,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T1",
            profit: 5.8,
          },
          {
            number: 6,
            created: "10/10/2020",
            trade: 4,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "SL",
            profit: -4.2,
          },
          {
            number: 6,
            created: "11/10/2020",
            trade: 5,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 15,
          },
          {
            number: 6,
            created: "12/10/2020",
            trade: 6,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: 4.6,
          },
        ],
        chartData: {
          borderColor: "#4f9843",
          backgroundColor: "#1c2a22",
          data: [8, 17, 24, 19, 37, 43],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
    },
    {
      id: "2",
      botData: {
        description: {
          title: "Long/Short Btc",
          switch: true,
          created: "09/05/2020",
          exchange: "FTX",
          strategy: "Long/Short",
          pair: "BTC/USD",
          position: "Closed",
          botProfit: "18.8%",
        },
        chartData: {
          borderColor: "#6E4498",
          backgroundColor: "#1D1F31",
          data: [4, 11, 7, 17, 24, 18],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
      ditailedData: {
        headerData: [
          { id: 1, title: "Active Since", subtitle: "13 days" },
          { id: 2, title: "Trades", subtitle: "6" },
          { id: 3, title: "Success rate", subtitle: "67%" },
        ],
        tableData: [
          {
            number: 6,
            created: "07/10/2020",
            trade: 1,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: 4.5,
          },
          {
            number: 6,
            created: "08/10/2020",
            trade: 2,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 6.8,
          },
          {
            number: 6,
            created: "09/10/2020",
            trade: 3,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T1",
            profit: -3.4,
          },
          {
            number: 6,
            created: "10/10/2020",
            trade: 4,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "SL",
            profit: 8.7,
          },
          {
            number: 6,
            created: "11/10/2020",
            trade: 5,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 6.1,
          },
          {
            number: 6,
            created: "12/10/2020",
            trade: 6,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: -4.5,
          },
        ],
        chartData: {
          borderColor: "#4f9843",
          backgroundColor: "#1c2a22",
          data: [4, 11, 7, 17, 24, 18],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
    },
    {
      id: "3",
      botData: {
        description: {
          title: "MACD - 1h - XRP",
          switch: true,
          created: "01/02/2020",
          exchange: "FTX",
          strategy: "Long",
          pair: "XRP/USD",
          position: "Open",
          botProfit: "44.8%",
        },
        chartData: {
          borderColor: "#6E4498",
          backgroundColor: "#1D1F31",
          data: [7.3, 19.6, 18.1, 22.6, 30.6, 44.8],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
      ditailedData: {
        headerData: [
          { id: 1, title: "Active Since", subtitle: "21 days" },
          { id: 2, title: "Trades", subtitle: "6" },
          { id: 3, title: "Success rate", subtitle: "83%" },
        ],
        tableData: [
          {
            number: 6,
            created: "07/10/2020",
            trade: 1,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: 7,
          },
          {
            number: 6,
            created: "08/10/2020",
            trade: 2,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 11,
          },
          {
            number: 6,
            created: "09/10/2020",
            trade: 3,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T1",
            profit: -1,
          },
          {
            number: 6,
            created: "10/10/2020",
            trade: 4,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "SL",
            profit: 3,
          },
          {
            number: 6,
            created: "11/10/2020",
            trade: 5,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 6,
          },
          {
            number: 6,
            created: "12/10/2020",
            trade: 6,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: 10,
          },
        ],
        chartData: {
          borderColor: "#4f9843",
          backgroundColor: "#1c2a22",
          data: [7.3, 19.6, 18.1, 22.6, 30.6, 44.8],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
    },
    {
      id: "4",
      botData: {
        description: {
          title: "DeFi Index - MA",
          switch: true,
          created: "06/06/2020",
          exchange: "FTX",
          strategy: "Long",
          pair: "DEFI/USD",
          position: "Open",
          botProfit: "9.6%",
        },
        chartData: {
          borderColor: "#6E4498",
          backgroundColor: "#1D1F31",
          data: [3, 6, 8, 7, 12, 9.6],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
      ditailedData: {
        headerData: [
          { id: 1, title: "Active Since", subtitle: "45 days" },
          { id: 2, title: "Trades", subtitle: "6" },
          { id: 3, title: "Success rate", subtitle: "67%" },
        ],
        tableData: [
          {
            number: 6,
            created: "07/10/2020",
            trade: 1,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: 3.7,
          },
          {
            number: 6,
            created: "08/10/2020",
            trade: 2,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 2.25,
          },
          {
            number: 6,
            created: "09/10/2020",
            trade: 3,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T1",
            profit: 1.7,
          },
          {
            number: 6,
            created: "10/10/2020",
            trade: 4,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "SL",
            profit: -0.85,
          },
          {
            number: 6,
            created: "11/10/2020",
            trade: 5,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T3",
            profit: 5.9,
          },
          {
            number: 6,
            created: "12/10/2020",
            trade: 6,
            exchange: "FTX",
            pair: "ETH/USD",
            title: "Ichimoku - ETH",
            progress: "T2",
            profit: -3.2,
          },
        ],
        chartData: {
          borderColor: "#4f9843",
          backgroundColor: "#1c2a22",
          data: [3, 6, 8, 7, 12, 9.6],
          lineTension: 0.1,
          borderWidth: 2,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointBorderWidth: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: "transparent",
          pointHoverBorderColor: "transparent",
          pointHoverBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 0,
        },
        lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      },
    },
  ],
};

const getters: GetterTree<RootState, RootState> = {
  isBetaServer(state: RootState) {
    return process.env.VUE_APP_BETA_SERVER === "1";
  },
  getEnablePerfFees(state: RootState) {
    return process.env.VUE_APP_ENABLE_PERF_FEES_FEATURE === "1";
  },
};

const mutations: MutationTree<RootState> = {
  isLoading(state: RootState, payload: Boolean) {
    state.isLoading = payload;
  },

  setCurrency(state: RootState, payload: any) {
    state.favCurrency = payload.value;
  },

  appInitialized(state: RootState, payload: any) {
    state.isAppInitialized = payload;
  },

  toggleMobileMenu(state: RootState, payload: boolean) {
    state.isMobileMenu = payload;
  },
  toggleSidebar(state: RootState, payload: boolean) {
    state.isSidebarOpen = payload;
  },
};

const vuexLocal = new VuexPersistence<RootState>({
  key: "upbots_v1_store",
  storage: window.localStorage,
  reducer: (state: any) => ({
    authModule: {
      jwt: state.authModule.jwt, // only persist jwt
      user: state.authModule.user, // only persist jwt
    },
    userModule: {
      favoriteCurrency: state.userModule.favoriteCurrency,
    },
    userSettingsModule: {
      favourite: state.userSettingsModule.favourite,
    },
    orderModule: {
      isUnreadOrders: state.orderModule.isUnreadOrders,
    },
    stakingModule: {
      switcherCurrency: state.stakingModule.switcherCurrency,
    },
  }),
  //  reducer: (state) => ({ navigation: state.navigation }), //only save navigation module
});

export const storeOptions: StoreOptions<RootState> = {
  strict: process.env.NODE_ENV !== "production", // uncomment this to enable store freeze checks, not for production
  state,
  getters,
  mutations,
  modules: {
    // apiHealth,
    authModule,
    tradeModule,
    userModule,
    orderModule,
    trainingModule,
    cryptoPrice,
    notificationsModule,
    algobotsModule,
    algoBotsInactiveModule,
    userSettingsModule,
    swapModule,
    dexMonitoringModule,
    orderBookModule,
    adminExtractModule,
    stakingModule,
    ubxtBridgeModule,
    ubxtWalletModule,
    perfeesModule,
    activeCampaignModule,
  },
  plugins: [vuexLocal.plugin],
};

export interface RootState {
  isLoading: Boolean;
  isMobileMenu: Boolean;
  isSidebarOpen: Boolean;
  favCurrency: String;
  isAppInitialized: Boolean;
  botDetailFakeData: any;
  authModule?: any;
}
