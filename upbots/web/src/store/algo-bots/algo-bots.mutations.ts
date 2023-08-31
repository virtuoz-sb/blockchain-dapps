import { MutationTree } from "vuex";
import { AxiosResponse } from "axios";
import { AlgoBotsState } from "./algo-bots.module";
import {
  AlgoBot,
  AlgoBotSubscription,
  SubscriptionBotPause,
  FollowBotResponse,
  BotOrder,
  BotPerformanceSnapshotDto,
  BotPerformanceCycleDto,
  BotSubscriptionCycle,
} from "./types/algo-bots.payload";
import { AdminAlgoBotSubscription } from "./types/admin-algo-bots.payload";
import { AlgoBotsStats } from "./types/algo-bots-stats.payload";
export const GET_BOTS_LIST_BEGIN = "GET_BOTS_LIST_BEGIN";
export const GET_BOTS_LIST_SUCCESS = "GET_BOTS_LIST_SUCCESS";
export const GET_BOTS_LIST_ERROR = "GET_BOTS_LIST_ERROR";
export const FOLLOW_BOT_BEGIN = "FOLLOW_BOT_BEGIN";
export const FOLLOW_BOT_SUCCESS = "FOLLOW_BOT_SUCCESS";
export const FOLLOW_BOT_ERROR = "FOLLOW_BOT_ERROR";
export const GET_BOTS_SUBSCRIPTIONS_LIST_BEGIN = "GET_BOTS_SUBSCRIPTIONS_LIST_BEGIN";
export const GET_BOTS_SUBSCRIPTIONS_LIST_SUCCESS = "GET_BOTS_SUBSCRIPTIONS_LIST_SUCCESS";
export const GET_BOTS_SUBSCRIPTIONS_LIST_ERROR = "GET_BOTS_SUBSCRIPTIONS_LIST_ERROR";
export const PAUSE_RESUME_BOT_SUBSCRIPTION_BEGIN = "PAUSE_RESUME_BOT_SUBSCRIPTION_BEGIN";
export const PAUSE_RESUME_BOT_SUBSCRIPTION_SUCCESS = "PAUSE_RESUME_BOT_SUBSCRIPTION_SUCCESS";
export const PAUSE_RESUME_BOT_SUBSCRIPTION_ERROR = "PAUSE_RESUME_BOT_SUBSCRIPTION_ERROR";
export const GET_BOT_HISTORY_BEGIN = "GET_BOT_HISTORY_BEGIN";
export const GET_BOT_HISTORY_SUCCESS = "GET_BOT_HISTORY_SUCCESS";
export const GET_BOT_HISTORY_ERROR = "GET_BOT_HISTORY_ERROR";
export const GET_BOT_SEED_HISTORY_BEGIN = "GET_BOT_SEED_HISTORY_BEGIN";
export const GET_BOT_SEED_HISTORY_SUCCESS = "GET_BOT_SEED_HISTORY_SUCCESS";
export const GET_BOT_SEED_HISTORY_ERROR = "GET_BOT_SEED_HISTORY_ERROR";
export const GET_BOT_SUBSCRIPTION_SNAPSHOT_BEGIN = "GET_BOT_SUBSCRIPTION_SNAPSHOT_BEGIN";
export const GET_BOT_SUBSCRIPTION_SNAPSHOT_SUCCESS = "GET_BOT_SUBSCRIPTION_SNAPSHOT_SUCCESS";
export const GET_BOT_SUBSCRIPTION_SNAPSHOT_ERROR = "GET_BOT_SUBSCRIPTION_SNAPSHOT_ERROR";
export const GET_BOT_SUBSCRIPTION_CYCLES_BEGIN = "GET_BOT_SUBSCRIPTION_CYCLES_BEGIN";
export const GET_BOT_SUBSCRIPTION_CYCLES_SUCCESS = "GET_BOT_SUBSCRIPTION_CYCLES_SUCCESS";
export const GET_BOT_SUBSCRIPTION_CYCLES_ERROR = "GET_BOT_SUBSCRIPTION_CYCLES_ERROR";
export const GET_BOT_SUBSCRIPTION_AUDITS_BEGIN = "GET_BOT_SUBSCRIPTION_AUDITS_BEGIN";
export const GET_BOT_SUBSCRIPTION_AUDITS_SUCCESS = "GET_BOT_SUBSCRIPTION_AUDITS_SUCCESS";
export const GET_BOT_SUBSCRIPTION_AUDITS_ERROR = "GET_BOT_SUBSCRIPTION_AUDITS_ERROR";
export const GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_BEGIN = "GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_BEGIN";
export const GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_SUCCESS = "GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_SUCCESS";
export const GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_ERROR = "GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_ERROR";
export const GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_BEGIN = "GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_BEGIN";
export const GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_SUCCESS = "GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_SUCCESS";
export const GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_ERROR = "GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_ERROR";
export const GET_BOTS_STATS_BEGIN = "GET_BOTS_STATS_BEGIN";
export const GET_BOTS_STATS_SUCCESS = "GET_BOTS_STATS_SUCCESS";
export const GET_BOTS_STATS_ERROR = "GET_BOTS_STATS_ERROR";

export const mutations: MutationTree<AlgoBotsState> = {
  [GET_BOTS_LIST_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOTS_LIST_SUCCESS]: (state: AlgoBotsState, algobots: AlgoBot[]) => {
    state.pending = false;
    state.error = null;
    state.algobots = algobots;
  },
  [GET_BOTS_LIST_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [FOLLOW_BOT_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [FOLLOW_BOT_SUCCESS]: (state: AlgoBotsState, followedbot: FollowBotResponse) => {
    state.pending = false;
    state.error = null;
    state.followedbots.push(followedbot);
  },
  [FOLLOW_BOT_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_BOTS_SUBSCRIPTIONS_LIST_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOTS_SUBSCRIPTIONS_LIST_SUCCESS]: (state: AlgoBotsState, botssubscriptions: AlgoBotSubscription[]) => {
    state.pending = false;
    state.error = null;
    state.botssubscriptions = botssubscriptions;
  },
  [GET_BOTS_SUBSCRIPTIONS_LIST_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [PAUSE_RESUME_BOT_SUBSCRIPTION_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [PAUSE_RESUME_BOT_SUBSCRIPTION_SUCCESS]: (state: AlgoBotsState, botpaused: SubscriptionBotPause) => {
    state.pending = false;
    state.error = null;
    const index = state.botssubscriptions.findIndex((data) => data.id === botpaused.subId);
    state.botssubscriptions[index].enabled = !state.botssubscriptions[index].enabled;
  },
  [PAUSE_RESUME_BOT_SUBSCRIPTION_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_BOT_HISTORY_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOT_HISTORY_SUCCESS]: (state: AlgoBotsState, botorders: BotOrder[]) => {
    state.pending = false;
    state.error = null;
    state.botorders = botorders;
  },
  [GET_BOT_HISTORY_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_BOT_SEED_HISTORY_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOT_SEED_HISTORY_SUCCESS]: (state: AlgoBotsState, botseedorders: BotOrder[]) => {
    state.pending = false;
    state.error = null;
    state.botseedorders = botseedorders;
  },
  [GET_BOT_SEED_HISTORY_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_BOT_SUBSCRIPTION_SNAPSHOT_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOT_SUBSCRIPTION_SNAPSHOT_SUCCESS]: (state: AlgoBotsState, botsubscriptionsnapshot: BotPerformanceSnapshotDto) => {
    state.pending = false;
    state.error = null;
    state.botsubscriptionsnapshot = botsubscriptionsnapshot;
  },
  [GET_BOT_SUBSCRIPTION_SNAPSHOT_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_BOT_SUBSCRIPTION_AUDITS_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOT_SUBSCRIPTION_AUDITS_SUCCESS]: (state: AlgoBotsState, botsubscriptionaudits: any[]) => {
    state.pending = false;
    state.error = null;
    state.botsubscriptionaudits = botsubscriptionaudits;
  },
  [GET_BOT_SUBSCRIPTION_AUDITS_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_BOT_SUBSCRIPTION_CYCLES_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOT_SUBSCRIPTION_CYCLES_SUCCESS]: (state: AlgoBotsState, botsubscriptioncycles: BotPerformanceCycleDto[]) => {
    state.pending = false;
    state.error = null;
    state.botsubscriptioncycles = botsubscriptioncycles;
  },
  [GET_BOT_SUBSCRIPTION_CYCLES_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_SUCCESS]: (state: AlgoBotsState, botssubscriptionsAdmin: AdminAlgoBotSubscription[]) => {
    state.pending = false;
    state.error = null;
    state.botssubscriptionsAdmin = botssubscriptionsAdmin;
  },
  [GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_SUCCESS]: (state: AlgoBotsState, botsubscriptioncyclesAdmin: unknown[]) => {
    state.pending = false;
    state.error = null;
    state.botsubscriptioncyclesAdmin = botsubscriptioncyclesAdmin;
  },
  [GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_BOTS_STATS_BEGIN]: (state: AlgoBotsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_BOTS_STATS_SUCCESS]: (state: AlgoBotsState, botsStats: AlgoBotsStats[]) => {
    state.pending = false;
    state.error = null;
    state.botsStats = botsStats;
  },
  [GET_BOTS_STATS_ERROR]: (state: AlgoBotsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  setSelectedBotSubId(state: AlgoBotsState, botSubId: string) {
    state.selectedBotSubId = botSubId;
  },
  setSelectedBotId(state: AlgoBotsState, botId: string) {
    state.selectedBotId = botId;
  },
};
