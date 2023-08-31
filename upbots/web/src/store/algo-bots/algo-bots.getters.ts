import { GetterTree } from "vuex";
import { RootState } from "../root.store";
import { AlgoBotsState } from "./algo-bots.module";
import { AdminAlgoBotSubscription } from "./types/admin-algo-bots.payload";
import { AlgoBotsStats } from "./types/algo-bots-stats.payload";
import {
  AlgoBot,
  AlgoBotSubscription,
  FollowBotResponse,
  BotOrder,
  BotPerformanceSnapshotDto,
  BotPerformanceCycleDto,
  BotSubscriptionCycle,
  SubscribedBotChart,
} from "./types/algo-bots.payload";

export const getters: GetterTree<AlgoBotsState, RootState> = {
  getSelectedBotSubId(state): string {
    return state.selectedBotSubId;
  },
  getAdminBotsSubcriptions(state): AdminAlgoBotSubscription[] {
    return state.botssubscriptionsAdmin;
  },
  getAdminBotSubscriptionCycles(state): unknown[] {
    return state.botsubscriptioncyclesAdmin;
  },
  getAlgoBots(state): AlgoBot[] {
    return state.algobots;
  },
  getFollowedBots(state): FollowBotResponse[] {
    return state.followedbots;
  },
  getAlgoBotById: (state) => (id: string): AlgoBot => {
    return state.algobots.find((algobot) => algobot.id === id);
  },
  getBotsSubcriptions(state): AlgoBotSubscription[] {
    return state.botssubscriptions;
  },
  getFollowedBotById: (state) => (id: string): FollowBotResponse => {
    return state.followedbots.find((followedbot) => followedbot.botId === id);
  },
  getBotOrders(state): BotOrder[] {
    return state.botorders;
  },
  getBotSeedOrders(state): BotOrder[] {
    return state.botseedorders;
  },
  getSubscribedAlgoBotById: (state) => (id: string): AlgoBotSubscription => {
    return state.botssubscriptions.find((botsubscription) => botsubscription.botId === id);
  },
  getBotSubscriptionSnapshot(state): BotPerformanceSnapshotDto {
    return state.botsubscriptionsnapshot;
  },
  getBotSubscriptionAudtis(state): any[] {
    return state.botsubscriptionaudits;
  },
  getBotSubscriptionCycles(state): BotPerformanceCycleDto[] {
    return state.botsubscriptioncycles;
  },
  getBotSubscriptionChartData: (state) => (algoBotSubscription: AlgoBotSubscription): SubscribedBotChart => {
    // eslint-disable-next-line no-console
    // console.log("getBotSubscriptionChartData");
    // eslint-disable-next-line no-console
    // console.log(algoBotSubscription);
    // init chart data
    let chartDataUser: SubscribedBotChart = {
      datasets: [
        {
          borderColor: "#9277AF",
          backgroundColor: "#1A1B24",
          data: [],
        },
      ],
      labels: [
        "November-45",
        "November-46",
        "November-47",
        "November-48",
        "November-49",
        "December-50",
        "December-51",
        "December-52",
        "December-53",
        "January-01",
        "January-02",
        "January-03",
        "January-04",
        "February-05",
        "February-06",
        "February-07",
        "February-08",
        "March-09",
        "March-10",
      ],
    };
    const numberOfWeeks = 19; // chart abscisse count
    const startingWeek = 45; // NOVEMBER-45 2020
    const lastWeekOfYear = 53;

    // NO OVERLAP OF 2 YEARS YET AND LIMITED TO 19 MONTHS
    // THIS WILL BE REFACTOR THROUGH API

    let d = new Date();
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const currentWeek = Math.ceil(((<any>d - <any>yearStart) / 86400000 + 1) / 7);
    // eslint-disable-next-line no-console
    // console.log(startingWeek, currentWeek);

    //Init Data Subscribed and not subscribed charts
    const initCount = currentWeek - startingWeek;
    // eslint-disable-next-line no-console
    // console.log(initCount);
    let l = 0;
    for (l = 0; l <= initCount; l++) {
      chartDataUser.datasets[0].data.push(0);
    }

    if (algoBotSubscription) {
      let weekCycles: BotPerformanceCycleDto[] = [];
      let iWeek = startingWeek;
      let abcisseCount = startingWeek;
      let i = 0;
      for (i = 0; i < numberOfWeeks; i++) {
        weekCycles.splice(0, weekCycles.length);

        // eslint-disable-next-line no-console
        // console.log(i, iWeek, abcisseCount);

        if (abcisseCount > currentWeek) {
          // eslint-disable-next-line no-console
          // console.log("continue", i, iWeek, abcisseCount, currentWeek);
          continue;
        }

        // eslint-disable-next-line no-console
        // console.log("state.botsubscriptioncycles", state.botsubscriptioncycles);
        // eslint-disable-next-line no-console
        weekCycles = state.botsubscriptioncycles.filter((cycle) => !cycle.open && cycle.closePeriod.week === iWeek);
        // eslint-disable-next-line no-console
        // console.log("weekCycles", weekCycles, weekCycles.length);

        // current week in process
        let currentAggregation = 0;
        if (weekCycles.length > 0) {
          // cf. systematically push action
          let j = 0;
          for (j = 0; j < weekCycles.length; j++) {
            // eslint-disable-next-line no-console
            //console.log("forEach", weekCycles[j]);
            currentAggregation = currentAggregation + weekCycles[j].profitPercentage;
          }
        }
        // aggregate all previous days/weeks
        let compound = abcisseCount - startingWeek;
        // eslint-disable-next-line no-console
        // console.log("compound", compound, abcisseCount, startingWeek);
        if (compound > 0) {
          let k = 0;
          for (k = 0; k < compound; k++) {
            currentAggregation = currentAggregation + chartDataUser.datasets[0].data[k];
          }
        }

        chartDataUser.datasets[0].data[i] = currentAggregation;
        // eslint-disable-next-line no-console
        // console.log(i, chartDataUser.datasets[0].data[i]);

        iWeek = iWeek + 1;
        if (iWeek > lastWeekOfYear) {
          iWeek = 1;
        }
        abcisseCount = abcisseCount + 1;
      }
    }

    return chartDataUser;
  },
  getBotsStats(state): AlgoBotsStats[] {
    return state.botsStats;
  },
};
