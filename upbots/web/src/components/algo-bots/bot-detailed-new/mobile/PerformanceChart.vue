<template>
  <div>
    <div class="flex flex-col flex-shrink-0 mb-30">
      <!-- PERFORMANCES CARDS -->
      <div class="flex items-center overflow-x-auto custom-scrollbar mx-20">
        <div class="flex w-full flex-shrink-0">
          <div
            class="card flex flex-col md:flex-row md:items-center justify-between md:w-full md:py-8 md:pl-20 md:pr-15 md:mb-10 lg:mb-20 last:mb-0 mr-30 md:mr-0 last:mr-0"
          >
            <span class="text-grey-cl-200 text-sm leading-md mb-3 md:mb-0">6 months perfs:</span>
            <span
              class="text-sm leading-md"
              :class="algobot.perfMonth6 >= 0 ? 'text-green-cl-100 text-shadow-2 ' : 'text-red-cl-100 text-shadow-6'"
            >
              {{ algobot.perfMonth6 ? (algobot.perfMonth6 >= 0 ? `+${algobot.perfMonth6}%` : `${algobot.perfMonth6}%`) : "-" }}
            </span>
          </div>

          <div
            class="card flex flex-col md:flex-row md:items-center justify-between md:w-full md:py-8 md:pl-20 md:pr-15 md:mb-10 lg:mb-20 last:mb-0 mr-30 md:mr-0 last:mr-0"
          >
            <span class="text-grey-cl-200 text-sm leading-md mb-3 md:mb-0">3 months perfs:</span>
            <span
              class="text-sm leading-md"
              :class="algobot.perfMonth3 >= 0 ? 'text-green-cl-100 text-shadow-2 ' : 'text-red-cl-100 text-shadow-6'"
            >
              {{ algobot.perfMonth3 ? (algobot.perfMonth3 >= 0 ? `+${algobot.perfMonth3}%` : `${algobot.perfMonth3}%`) : "-" }}
            </span>
          </div>

          <div
            class="card flex flex-col md:flex-row md:items-center justify-between md:w-full md:py-8 md:pl-20 md:pr-15 md:mb-10 lg:mb-20 last:mb-0 mr-30 md:mr-0 last:mr-0"
          >
            <span class="text-grey-cl-200 text-sm leading-md mb-3 md:mb-0">1 month perfs:</span>
            <span
              class="text-sm leading-md"
              :class="algobot.perfMonth1 >= 0 ? 'text-green-cl-100 text-shadow-2 ' : 'text-red-cl-100 text-shadow-6'"
            >
              {{ algobot.perfMonth1 ? (algobot.perfMonth1 >= 0 ? `+${algobot.perfMonth1}%` : `${algobot.perfMonth1}%`) : "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- PERFORMANCES CHART -->
    <div class="performances-chart__wrap flex flex-col flex-shrink-0 mb-50">
      <PerformancesChart :data="chartData" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import PerformancesChart from "@/components/algo-bots/bot-detailed-new/PerformancesChart.vue";

@Component({ name: "PerformanceChart", components: { PerformancesChart } })
export default class PerformanceChart extends Vue {
  /* PROPS */
  @Prop({ required: true }) chartData: any;
  @Prop({ required: true }) algobot: any;
}
</script>

<style lang="scss" scoped>
.performances-chart {
  &__wrap {
    height: 300px;
  }
}
</style>
