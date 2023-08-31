import { Module } from "vuex";
import { getters } from "./algo-bots.getters";
import { actions } from "./algo-bots.actions";
import { mutations } from "./algo-bots.mutations";
import { AxiosResponse } from "axios";
import { RootState } from "../root.store";
import {
  AlgoBot,
  AlgoBotSubscription,
  FollowBotResponse,
  BotOrder,
  BotPerformanceSnapshotDto,
  BotPerformanceCycleDto,
  BotSubscriptionCycle,
} from "./types/algo-bots.payload";
import { AdminAlgoBotSubscription } from "./types/admin-algo-bots.payload";
import { AlgoBotsStats } from "./types/algo-bots-stats.payload";

const namespaced: boolean = true; // when true, avoids action name collision between different modules

export interface AlgoBotsState {
  pending: boolean;
  error: AxiosResponse;
  algobots: AlgoBot[];
  followedbots: FollowBotResponse[];
  botssubscriptions: AlgoBotSubscription[];
  botorders: BotOrder[];
  botseedorders: BotOrder[];
  botsubscriptionsnapshot: BotPerformanceSnapshotDto;
  botsubscriptioncycles: BotPerformanceCycleDto[];
  botsubscriptionaudits: any[];
  botssubscriptionsAdmin: AdminAlgoBotSubscription[];
  botsubscriptioncyclesAdmin: unknown[];
  selectedBotSubId: string;
  selectedBotId: string;
  botsStats: AlgoBotsStats[];
}

export const state: AlgoBotsState = {
  pending: false,
  error: null,
  algobots: [],
  followedbots: [],
  botssubscriptions: [],
  botorders: [],
  botseedorders: [],
  botsubscriptionsnapshot: null,
  botsubscriptionaudits: [],
  botsubscriptioncycles: [],
  botssubscriptionsAdmin: [],
  botsubscriptioncyclesAdmin: [],
  selectedBotSubId: "",
  selectedBotId: "",
  botsStats: [],
};

export const algobotsModule: Module<AlgoBotsState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
