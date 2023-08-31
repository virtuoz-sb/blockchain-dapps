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
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "#60BCB5",
    },
  ],
  // labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9"],
  labels: [],
};

import { Component, Vue, Prop } from "vue-property-decorator";
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";
import { GroupItems } from "@/models/interfaces";

import PerformancesChart from "@/components/algo-bots/bot-detailed-new/PerformancesChart.vue";

@Component({ name: "BotDetailedInactiveBotPerfGraph", components: { PerformancesChart } })
export default class BotDetailedInactiveBotPerfGraph extends Vue {
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
            data: (this.algobot.perfSnapshots.charts as any)[this.selectedPeriod.value].data.map((x: number) => x.toFixed(4)),
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
        labels: (this.algobot.perfSnapshots.charts as any)[this.selectedPeriod.value].labels,
      };
    } else {
      return fakeData;
    }
  }
}
</script>
