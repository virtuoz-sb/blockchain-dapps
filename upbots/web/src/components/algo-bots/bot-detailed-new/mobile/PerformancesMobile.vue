<template>
  <div>
    <!-- CHART SELECT VIEW -->

    <!-- PERFORMANCES -->
    <Performances
      v-if="selectedChartView.value === 'BotPerformance'"
      :chart-data="botDatasets"
      :snapshot="botSnapshotData"
      :botCycleData="botCycleData"
      class="flex flex-col flex-shrink-0 w-full"
    >
      <div slot="chart-filter" class="flex flex-col flex-shrink-0 mb-20 px-20">
        <AppDropdownBasic v-model="selectedPeriod" :options="availablePredios" dark />
      </div>
    </Performances>

    <!-- MY ORDERS PERFORMANCES -->
    <MyOrdersPerformances
      v-if="selectedChartView.value === 'MyPerformance'"
      :chart-data="userDatasets"
      :snapshot="userSnapshotData"
      class="flex flex-col flex-shrink-0 w-full"
    >
      <div slot="chart-filter" class="flex flex-col flex-shrink-0 mb-20 px-20">
        <AppDropdownBasic v-model="selectedPeriod" :options="availablePredios" dark />
      </div>
    </MyOrdersPerformances>

    <!-- BOT HISTORY SELECT VIEW -->
    <!-- <div class="flex flex-shrink-0 items-center px-20 mb-20">
      <div class="text-grey-cl-920 text-sm leading-xs mr-8">History View:</div>
      <AppDropdownBasic v-model="selectedHistoryView" :options="historyViewData" dark />
    </div> -->

    <!-- BOT HISTORY VIEW -->
    <BotHistory v-if="selectedHistoryView.value === 'BotTradeHistory'" :bot-cycle-data="botCycleData" class="flex-shrink-0" />

    <!-- USER HISTORY VIEW -->
    <UserHistory v-if="selectedHistoryView.value === 'MyTradeHistory'" :bot-cycle-data="userCycleData" class="flex-shrink-0" />
  </div>
</template>

<script lang="ts">
const fakeData: any = {
  datasets: [
    {
      // data: [12, 27, 36, 36, 55, 41, 56, 81, 125],
      data: [],
      backgroundColor: "rgba(96, 188, 181, 0.2)",
      borderColor: "#60BCB5",
      tag: "",
      lineTension: 0.4,
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
  ],
  // labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9"],
  labels: [],
};

const datasetsDefault = (data: number[]) => ({
  data: [...data],
  backgroundColor: "rgba(96, 188, 181, 0.2)",
  borderColor: "#60BCB5",
  lineTension: 0.4,
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
});

import { Component, Vue, Prop } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";
import { AxiosError } from "axios";
import { BotPerformanceSnapshotDto, BotPerformanceCycleDto, AlgoBotSubscription } from "@/store/algo-bots/types/algo-bots.payload";

import { namespace } from "vuex-class";
const algobots = namespace("algobotsModule");

import BotHistory from "@/components/algo-bots/bot-detailed-new/bot-history-table/BotHistory.vue";
import UserHistory from "@/components/algo-bots/bot-detailed-new/user-history-table/UserHistory.vue";
import Performances from "@/components/algo-bots/bot-detailed-new/Performances.vue";
import MyOrdersPerformances from "@/components/algo-bots/bot-detailed-new/MyOrdersPerformances.vue";

@Component({ name: "PerformancesMobile", components: { BotHistory, UserHistory, Performances, MyOrdersPerformances } })
export default class PerformancesMobile extends Vue {
  /* VUEX */
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Getter getSubscribedAlgoBotById: any;

  /* PROPS */
  @Prop({ required: true }) chartData: any;
  @Prop({ required: true }) algobotData: any;
  @Prop({ required: true }) selectedChartView: any;
  @Prop({ required: true }) selectedHistoryView: any;

  /* DATA */
  selectedPeriod: GroupItems = { value: "weeklyChart", label: "Weekly" };
  availablePredios: GroupItems[] = [
    { value: "daylyChart", label: "Daily" },
    { value: "weeklyChart", label: "Weekly" },
    { value: "monthlyChart", label: "Monthly" },
  ];

  // selectedChartView: object = { value: "BotPerformance", label: "Bot performance" };
  chartViewData: GroupItems[] = [
    { value: "BotPerformance", label: "Bot performance" },
    { value: "MyPerformance", label: "My performance" },
  ];

  // selectedHistoryView: object = { value: "BotTradeHistory", label: "Bot trade history" };
  historyViewData: GroupItems[] = [
    { value: "BotTradeHistory", label: "Bot trade history" },
    { value: "MyTradeHistory", label: "My trade history" },
  ];

  botSnapshotData: BotPerformanceSnapshotDto = null;
  botCycleData: BotPerformanceCycleDto[] = null;

  userSnapshotData: BotPerformanceSnapshotDto = null;
  userCycleData: BotPerformanceCycleDto[] = null;

  algoBotSubscription: AlgoBotSubscription | null = null;
  botId: string = null;

  /* COMPUTED */
  get hasSnapshotBotData() {
    return !(
      this.botSnapshotData &&
      this.botSnapshotData.charts &&
      this.botSnapshotData.charts.monthlyChart &&
      this.botSnapshotData.charts.monthlyChart.data.length
    );
  }

  get hasSnapshotUserData() {
    return !(
      this.userSnapshotData &&
      this.userSnapshotData.charts &&
      this.userSnapshotData.charts.monthlyChart &&
      this.userSnapshotData.charts.monthlyChart.data.length
    );
  }

  get botDatasets() {
    if (!this.hasSnapshotBotData) {
      return {
        datasets: [datasetsDefault((this.botSnapshotData.charts as any)[this.selectedPeriod.value].data)],
        labels: (this.botSnapshotData.charts as any)[this.selectedPeriod.value].labels,
      };
    } else {
      return fakeData;
    }
  }

  get userDatasets() {
    if (!this.hasSnapshotUserData) {
      return {
        datasets: [datasetsDefault((this.userSnapshotData.charts as any)[this.selectedPeriod.value].data)],
        labels: (this.userSnapshotData.charts as any)[this.selectedPeriod.value].labels,
      };
    } else {
      return fakeData;
    }
  }

  /* DATA */
  created() {
    this.fetchInitData();
  }

  /* METHODS */
  fetchBotSnapshotData(botId: string) {
    return this.$http
      .get<BotPerformanceSnapshotDto>(`/api/performance/bot/${botId}/snapshot/six-months`)
      .then(({ data }) => {
        this.botSnapshotData = data;
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  fetchBotCyclesData(botId: string) {
    return this.$http
      .get<BotPerformanceCycleDto[]>(`/api/performance/bot/${botId}/cycles/six-months`)
      .then(({ data }) => {
        this.botCycleData = data;
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  fetchMySnapshotData(subId: string) {
    return this.$http
      .get<BotPerformanceSnapshotDto>(`/api/performance/subscription/${subId}/snapshot/six-months`)
      .then(({ data }) => {
        this.userSnapshotData = data;
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  fetchMyCyclesData(subId: string) {
    return this.$http
      .get<BotPerformanceCycleDto[]>(`/api/performance/subscription/${subId}/cycles/six-months`)
      .then(({ data }) => {
        this.userCycleData = data;

        if (!data.length) {
          this.$notify({ text: "You haven't any orders yet", type: "warning" });
        }
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  fetchInitData() {
    const botId = this.$route.params.id;

    return this.fetchAlgoBotsSubscriptionsAction()
      .then((res) => {
        return Promise.all([this.fetchBotSnapshotData(botId), this.fetchBotCyclesData(botId)]);
      })
      .then(() => {
        const algoBotSubscription = this.getSubscribedAlgoBotById(botId);

        if (algoBotSubscription) {
          return Promise.all([this.fetchMySnapshotData(algoBotSubscription.id), this.fetchMyCyclesData(algoBotSubscription.id)]);
        } else {
          this.$notify({ text: "You haven't subscribed to the bot yet", type: "warning" });
          return Promise.resolve() as any;
        }
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }
}
</script>
