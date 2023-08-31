<template>
  <div class="flex flex-col justify-between flex-grow pt-20 pb-20">
    <div class="flex flex-col">
      <h2 v-if="!hideTitle && !isV2Bot" class="flex-shrink-0 text-iceberg leading-xs mb-0 px-20" :class="{ 'mb-24': !isV2Bot }">
        Bot history
      </h2>
      <BotHistory v-if="!isV2Bot" :bot-cycle-data="tableData" />
      <AppTabs v-else :tabs="tabs">
        <template v-slot="{ currentTab }">
          <template v-if="currentTab.componentName === 'V2'">
            <BotHistory :bot-cycle-data="v2History" />
          </template>
          <template v-if="currentTab.componentName === 'V1'">
            <BotHistory :bot-cycle-data="v1History" />
          </template>
        </template>
      </AppTabs>
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
import { AlgoBot, BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";
import { GroupItems } from "@/models/interfaces";
import { Tab } from "@/models/interfaces";
import BotHistory from "@/components/algo-bots/bot-detailed-new/bot-history-table/BotHistory.vue";

@Component({ name: "BotPerformancesHistory", components: { BotHistory } })
export default class BotPerformancesHistory extends Vue {
  /* PROPS */
  @Prop({ required: true }) algobot: AlgoBot;
  @Prop({ type: Boolean, default: false }) hideTitle: boolean;
  @Prop({ required: true }) tableData: any[];

  /* DATA */
  selectedPeriod: GroupItems = { value: "weeklyChart", label: "Weekly" };
  botCycleData: BotPerformanceCycleDto[] = null;

  tabs: Tab[] = [
    { value: "Bot history V2", componentName: "V2" },
    { value: "Bot history V1", componentName: "V1" },
  ];

  /* COMPUTED */
  get v1History() {
    if (!this.tableData) {
      return [];
    }
    return this.tableData.filter((item) => item.botVer === "1");
  }
  get v2History() {
    if (!this.tableData) {
      return [];
    }
    return this.tableData.filter((item) => item.botVer === "2");
  }
  get isV2Bot() {
    if (!this.algobot) {
      return false;
    }
    return this.algobot.botVer === "2";
  }
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
}
</script>
