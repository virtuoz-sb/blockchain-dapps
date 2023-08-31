<template>
  <div class="flex flex-col justify-between flex-grow pt-20 pb-20">
    <div class="flex justify-end pr-20">
      <AppDropdownBasic v-model="selectedPeriod" :options="availablePredios" dark />
    </div>

    <div class="w-full">
      <div class="bot-performances-chart-view flex mb-20">
        <!-- BOT PERFORMANCES STATISTICS -->
        <BotPerformancesStatistics v-if="algobot" :data="algobot.perfSnapshots" class="mr-20 xl:mr-50" />

        <!-- PERFORMANCES CHART -->
        <PerformancesChart :data="dataSets" class="performances-chart__wrap" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const fakeData: any = {
  datasets: [
    {
      data: [],
      // data: [12, 27, 36, 36, 55, 41, 56, 81, 125],
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

import { Component, Vue, Prop } from "vue-property-decorator";
import { AxiosError } from "axios";
import { AlgoBot, BotPerformanceSnapshotDto, BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";
import { GroupItems } from "@/models/interfaces";

import BotHistory from "@/components/algo-bots/bot-detailed-new/bot-history-table/BotHistory.vue";
import BotPerformancesStatistics from "@/components/algo-bots/bot-detailed-new/BotPerformancesStatistics.vue";
import PerformancesChart from "@/components/algo-bots/bot-detailed-new/PerformancesChart.vue";

@Component({ name: "BotPerformancesGraph", components: { BotPerformancesStatistics, PerformancesChart, BotHistory } })
export default class BotPerformancesGraph extends Vue {
  /* PROPS */
  @Prop({ required: true }) algobot: AlgoBot;

  /* DATA */
  selectedPeriod: GroupItems = { value: "weeklyChart", label: "Weekly" };
  availablePredios: GroupItems[] = [
    { value: "daylyChart", label: "Daily" },
    { value: "weeklyChart", label: "Weekly" },
    { value: "monthlyChart", label: "Monthly" },
  ];

  botCycleData: BotPerformanceCycleDto[] = null;

  /* COMPUTED */
  get hasSnapshotData() {
    return !(
      this.algobot &&
      this.algobot.perfSnapshots.charts &&
      this.algobot.perfSnapshots.charts.monthlyChart &&
      this.algobot.perfSnapshots.charts.monthlyChart.data.length
    );
  }

  get dataSets() {
    if (!this.hasSnapshotData) {
      return {
        datasets: [
          {
            data: (this.algobot.perfSnapshots.charts as any)[this.selectedPeriod.value].data,
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
          },
        ],
        labels: (this.algobot.perfSnapshots.charts as any)[this.selectedPeriod.value].labels,
      };
    } else {
      return fakeData;
    }
  }

  /* HOOKS */
  created() {
    this.fetchBotCyclesData();
  }

  /* METHODS */
  fetchBotCyclesData() {
    return this.$http
      .get<BotPerformanceCycleDto[]>(`/api/performance/bot/${this.algobot.id}/cycles/six-months`)
      .then(({ data }) => {
        this.botCycleData = data;
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }
}
</script>

<style lang="scss" scoped>
::v-deep .bot-history {
  &__table-wrap {
    height: 210px;
  }
}

.bot-performances-chart-view {
  height: 210px;
}
</style>
