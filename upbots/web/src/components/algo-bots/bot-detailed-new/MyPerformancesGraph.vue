<template>
  <div class="flex flex-col justify-between flex-grow pt-20 pb-20">
    <div class="flex justify-end pr-20">
      <AppDropdownBasic v-model="selectedPeriod" :options="availablePredios" dark />
    </div>

    <div class="flex w-full" :class="graphWrapClasses">
      <!-- PERFORMANCES CHART -->
      <PerformancesChart :data="dataSets" :class="graphClasses" />
    </div>
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
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "#60BCB5",
    },
  ],
  // labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9"],
  labels: [],
};

import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { AxiosError } from "axios";
import { GroupItems } from "@/models/interfaces";
import { AlgoBot, BotPerformanceSnapshotDto, BotPerformanceCycleDto, AlgoBotSubscription } from "@/store/algo-bots/types/algo-bots.payload";

const algobots = namespace("algobotsModule");

import PerformancesChart from "@/components/algo-bots/bot-detailed-new/PerformancesChart.vue";

@Component({ name: "MyPerformancesGraph", components: { PerformancesChart } })
export default class MyPerformancesGraph extends Vue {
  /* VUEX */
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Getter getSubscribedAlgoBotById: any;

  /* PROPS */
  @Prop({ required: true }) algobot: AlgoBot;
  @Prop({ required: false, default: "" }) graphWrapClasses: string;
  @Prop({ required: false, default: "" }) graphClasses: string;

  /* DATA */
  selectedPeriod: GroupItems = { value: "weeklyChart", label: "Weekly" };
  availablePredios: GroupItems[] = [
    { value: "daylyChart", label: "Daily" },
    { value: "weeklyChart", label: "Weekly" },
    { value: "monthlyChart", label: "Monthly" },
  ];

  botSnapshotData: BotPerformanceSnapshotDto = null;
  botCycleData: BotPerformanceCycleDto[] = null;

  algoBotSubscription: AlgoBotSubscription | null = null;
  botId: string = null;

  /* COMPUTED */
  get hasSnapshotData() {
    return !(
      this.botSnapshotData &&
      this.botSnapshotData.charts &&
      this.botSnapshotData.charts.monthlyChart &&
      this.botSnapshotData.charts.monthlyChart.data.length
    );
  }

  get dataSets() {
    if (!this.hasSnapshotData) {
      return {
        datasets: [
          {
            data: (this.botSnapshotData.charts as any)[this.selectedPeriod.value].data.map((x: number) => x.toFixed(4)),
            backgroundColor: "rgba(96, 188, 181, 0.2)",
            borderColor: "#60BCB5",
            lineTension: 0.4,
            borderWidth: 2,
            pointBorderColor: "transparent",
            pointBackgroundColor: "transparent",
            pointBorderWidth: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "#60BCB5",
          },
        ],
        labels: (this.botSnapshotData.charts as any)[this.selectedPeriod.value].labels,
      };
    } else {
      return fakeData;
    }
  }
  /* METHODS */
  fetchBotSnapshotData(subId: string) {
    return this.$http
      .get<BotPerformanceSnapshotDto>(`/api/performance/subscription/${subId}/snapshot/six-months`)
      .then(({ data }) => {
        this.botSnapshotData = data;
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  fetchBotCyclesData(subId: string) {
    return this.$http
      .get<BotPerformanceCycleDto[]>(`/api/performance/subscription/${subId}/cycles/six-months`)
      .then(({ data }) => {
        this.botCycleData = data;

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

  /* HOOKS */
  created() {
    this.botId = this.$route.params.id;

    this.fetchAlgoBotsSubscriptionsAction()
      .then(() => {
        const algoBotSubscription = this.getSubscribedAlgoBotById(this.botId);

        if (algoBotSubscription) {
          this.fetchBotSnapshotData(algoBotSubscription.id);
          this.fetchBotCyclesData(algoBotSubscription.id);
        } else {
          this.$notify({ text: "You haven't subscribed to the bot yet", type: "warning" });
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
