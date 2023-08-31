import { ActionTree } from "vuex";
import { AxiosError } from "axios";

import {
  GET_BOTS_LIST_BEGIN,
  GET_BOTS_LIST_SUCCESS,
  GET_BOTS_LIST_ERROR,
  FOLLOW_BOT_BEGIN,
  FOLLOW_BOT_SUCCESS,
  FOLLOW_BOT_ERROR,
  GET_BOTS_SUBSCRIPTIONS_LIST_BEGIN,
  GET_BOTS_SUBSCRIPTIONS_LIST_SUCCESS,
  GET_BOTS_SUBSCRIPTIONS_LIST_ERROR,
  PAUSE_RESUME_BOT_SUBSCRIPTION_BEGIN,
  PAUSE_RESUME_BOT_SUBSCRIPTION_SUCCESS,
  PAUSE_RESUME_BOT_SUBSCRIPTION_ERROR,
  GET_BOT_HISTORY_BEGIN,
  GET_BOT_HISTORY_SUCCESS,
  GET_BOT_HISTORY_ERROR,
  GET_BOT_SEED_HISTORY_BEGIN,
  GET_BOT_SEED_HISTORY_SUCCESS,
  GET_BOT_SEED_HISTORY_ERROR,
  GET_BOT_SUBSCRIPTION_SNAPSHOT_BEGIN,
  GET_BOT_SUBSCRIPTION_SNAPSHOT_SUCCESS,
  GET_BOT_SUBSCRIPTION_SNAPSHOT_ERROR,
  GET_BOT_SUBSCRIPTION_CYCLES_BEGIN,
  GET_BOT_SUBSCRIPTION_CYCLES_SUCCESS,
  GET_BOT_SUBSCRIPTION_CYCLES_ERROR,
  GET_BOT_SUBSCRIPTION_AUDITS_BEGIN,
  GET_BOT_SUBSCRIPTION_AUDITS_SUCCESS,
  GET_BOT_SUBSCRIPTION_AUDITS_ERROR,
  GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_BEGIN,
  GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_SUCCESS,
  GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_ERROR,
  GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_BEGIN,
  GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_SUCCESS,
  GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_ERROR,
  GET_BOTS_STATS_BEGIN,
  GET_BOTS_STATS_SUCCESS,
  GET_BOTS_STATS_ERROR,
} from "./algo-bots.mutations";
import {
  AlgoBot,
  AlgoBotSubscription,
  SubscriptionBotPause,
  FollowBotRequest,
  FollowBotResponse,
  BotOrder,
  BotPerformanceSnapshotDto,
  BotPerformanceCycleDto,
  BotSubscriptionCycle,
  BotSubscriptionEventPayload,
} from "./types/algo-bots.payload";
import $http from "@/core/api.config";
import { state } from "../auth";
import { AdminAlgoBotSubscription } from "./types/admin-algo-bots.payload";
import { ALGOBOT_SUBSCRIPTION_EVENT_ACTION, ALGOBOT_PERFORMANCE_CYCLES_EVENT_ACTION } from "./types/action-types";
import { AlgoBotsStats } from "./types/algo-bots-stats.payload";

export const actions: ActionTree<any, any> = {
  fetchAlgoBotsAction({ commit, state }) {
    let config: any = null;
    let url = "/api/performance/bots/snapshot/six-months";
    commit(GET_BOTS_LIST_BEGIN);
    return $http
      .get<AlgoBot[]>(url)
      .then((response) => {
        const res = response && response.data;
        commit(GET_BOTS_LIST_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOTS_LIST_ERROR, res);
      });
  },
  async followBotAction({ commit }, payload: Partial<FollowBotRequest>) {
    commit(FOLLOW_BOT_BEGIN, payload);
    try {
      const response = await $http.post<FollowBotResponse>("/api/algobots/subscribe", payload);
      const res = response && response.data;
      commit(FOLLOW_BOT_SUCCESS, res);
    } catch (error) {
      const res_1 = error && error.response && error.response.data;
      commit(FOLLOW_BOT_ERROR, res_1);
      throw error;
    }
  },
  fetchBotOrdersAction({ commit }, botId: string) {
    let url = `/api/algobots/${botId}/details`;
    commit(GET_BOT_HISTORY_BEGIN);
    return $http
      .get<BotOrder[]>(url)
      .then((response) => {
        const res = response && response.data;
        commit(GET_BOT_HISTORY_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOT_HISTORY_ERROR, res);
      });
  },
  fetchBotSeedOrdersAction({ commit }, botRef: string) {
    let url = `/api/algobots/${botRef}/seeddetails`;
    commit(GET_BOT_SEED_HISTORY_BEGIN);
    return $http
      .get<BotOrder[]>(url)
      .then((response) => {
        const res = response && response.data;
        commit(GET_BOT_SEED_HISTORY_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOT_SEED_HISTORY_ERROR, res);
      });
  },
  fetchAlgoBotsSubscriptionsAction({ commit, state }) {
    let config: any = null;
    let url = "/api/algobots/subscriptions";
    commit(GET_BOTS_SUBSCRIPTIONS_LIST_BEGIN);
    return $http
      .get<AlgoBotSubscription[]>(url)
      .then((response) => {
        let res = response && response.data;
        res = res
          ? res.sort((one: AlgoBotSubscription, two: AlgoBotSubscription) => {
              const b = one.createdAt;
              const a = two.createdAt;
              if (a < b) return -1;
              if (a > b) return 1;
              return 0;
            })
          : res;
        commit(GET_BOTS_SUBSCRIPTIONS_LIST_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOTS_SUBSCRIPTIONS_LIST_ERROR, res);
      });
  },

  pauseResumeBotAction({ commit, dispatch, state }, payload: Partial<SubscriptionBotPause>) {
    commit(PAUSE_RESUME_BOT_SUBSCRIPTION_BEGIN);
    const index = state.botssubscriptions.findIndex((data: any) => data.id === payload.subId);
    const url = state.botssubscriptions[index].enabled == false ? "/api/algobots/subscription/resume" : "/api/algobots/subscription/pause";
    return $http
      .put<SubscriptionBotPause>(url, payload)
      .then((response) => {
        const res = response && response.data;
        commit(PAUSE_RESUME_BOT_SUBSCRIPTION_SUCCESS, res);
        dispatch("fetchAlgoBotsSubscriptionsAction");
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(PAUSE_RESUME_BOT_SUBSCRIPTION_ERROR, res);
      });
  },
  updateSubscriptionAccountPercent({ commit, dispatch, state }, payload: { subscriptionId: string; percentage: number }) {
    const url = "/api/algobots/subscription/accountpercent";
    return $http
      .put<any>(url, payload)
      .then((response) => {
        dispatch("fetchAlgoBotsSubscriptionsAction");
      })
      .catch((error: AxiosError) => {});
  },
  deleteSubscriptionActionAsync({ dispatch }, payload: { id: string }) {
    return $http.delete(`/api/algobots/subscription/` + payload.id).then(() => {
      dispatch("fetchAlgoBotsSubscriptionsAction");
    });
  },
  fetchBotSubscriptionSnapshotAction({ commit }, botSubId: string) {
    let url = `/api/performance/subscription/${botSubId}/snapshot/six-months`;
    commit(GET_BOT_SUBSCRIPTION_SNAPSHOT_BEGIN);
    return $http
      .get<BotPerformanceSnapshotDto>(url)
      .then((response) => {
        let res = response && response.data;
        commit(GET_BOT_SUBSCRIPTION_SNAPSHOT_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOT_SUBSCRIPTION_SNAPSHOT_ERROR, res);
      });
  },
  fetchBotSubscriptionCyclesAction({ commit }, botSubId: string) {
    let url = `/api/performance/subscription/${botSubId}/cycles/six-months`;
    commit(GET_BOT_SUBSCRIPTION_CYCLES_BEGIN);
    return $http
      .get<BotPerformanceCycleDto[]>(url)
      .then((response) => {
        let res = response && response.data;
        res = res
          ? res.sort((one: BotPerformanceCycleDto, two: BotPerformanceCycleDto) => {
              const b = one.openAt;
              const a = two.openAt;
              if (a < b) return -1;
              if (a > b) return 1;
              return 0;
            })
          : res;
        commit(GET_BOT_SUBSCRIPTION_CYCLES_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOT_SUBSCRIPTION_CYCLES_ERROR, res);
      });
  },
  fetchAdminAlgoBotsSubscriptionsAction({ commit, state }) {
    let config: any = null;
    let url = "/api/algobots/admin/subscriptions";
    commit(GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_BEGIN);
    return $http
      .get<AdminAlgoBotSubscription[]>(url)
      .then((response) => {
        let res = response && response.data;
        res = res
          ? res.sort((one: AdminAlgoBotSubscription, two: AdminAlgoBotSubscription) => {
              const b = one.createdAt;
              const a = two.createdAt;
              if (a < b) return -1;
              if (a > b) return 1;
              return 0;
            })
          : res;
        commit(GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_ADMIN_BOTS_SUBSCRIPTIONS_LIST_ERROR, res);
      });
  },
  fetchBotSubscriptionAuditsAction({ commit }, botId: string) {
    let url = `/api/algobots/subscriptionaudits`;
    let config = {
      params: {
        b: botId,
      },
    };
    commit(GET_BOT_SUBSCRIPTION_AUDITS_BEGIN);
    return $http
      .get<any[]>(url, config)
      .then((response) => {
        let res = response && response.data;
        commit(GET_BOT_SUBSCRIPTION_AUDITS_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOT_SUBSCRIPTION_AUDITS_ERROR, res);
      });
  },
  fetchAdminBotSubscriptionCyclesAction({ commit }) {
    let url = `/api/performance/admin/cycles/six-months`;
    commit(GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_BEGIN);
    return $http
      .get<unknown[]>(url)
      .then((response) => {
        let res = response && response.data;
        commit(GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_ADMIN_BOT_SUBSCRIPTION_CYCLES_ERROR, res);
      });
  },
  async fetchBotSubscriptionSnapshotCyclesAction({ state, dispatch }) {
    if (state.selectedBotSubId) {
      dispatch("fetchBotSubscriptionSnapshotAction", state.selectedBotSubId);
      dispatch("fetchBotSubscriptionCyclesAction", state.selectedBotSubId);
      dispatch("fetchAlgoBotsSubscriptionsAction");
      dispatch("fetchBotSubscriptionAuditsAction", state.selectedBotId);
    }
  },
  [ALGOBOT_SUBSCRIPTION_EVENT_ACTION]: function ({ dispatch }, message: BotSubscriptionEventPayload) {
    if (message && message.initiator === "algobot") {
      dispatch("fetchBotSubscriptionSnapshotCyclesAction");
    }
  },
  [ALGOBOT_PERFORMANCE_CYCLES_EVENT_ACTION]: function ({ dispatch }, message: any) {
    dispatch("fetchBotSubscriptionSnapshotCyclesAction");
  },
  fetchBotsStats({ commit }) {
    const url = `/api/performance/user-bots-stats`;
    commit(GET_BOTS_STATS_BEGIN);
    return $http
      .get<AlgoBotsStats[]>(url)
      .then((response) => {
        const res = response && response.data;
        commit(GET_BOTS_STATS_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_BOTS_STATS_ERROR, res);
      });
  },
};
