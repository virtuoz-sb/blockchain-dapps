<template>
  <div class="flex md:h-full w-full mb-50 md:mb-0">
    <!-- PERFORMANCES CARD -->
    <template v-if="!$breakpoint.smAndDown">
      <div v-if="snapshot" class="flex md:flex-col justify-around md:max-w-200 w-full flex-shrink-0 md:py-20 px-20 md:px-0 mb-40 md:mb-0">
        <div
          class="card flex flex-col md:flex-row md:items-center justify-between md:w-full md:py-8 md:pl-20 md:pr-15 md:mb-10 lg:mb-20 last:mb-0 mr-30 md:mr-0 last:mr-0"
        >
          <span class="text-iceberg text-base leading-md mb-3 md:mb-0">Total perf:</span>
          <AppPercentageSpan class="text-base leading-md" :data="snapshot.allmonths" />
        </div>

        <div
          class="card flex flex-col md:flex-row md:items-center justify-between md:w-full md:py-8 md:pl-20 md:pr-15 md:mb-10 lg:mb-20 last:mb-0 mr-30 md:mr-0 last:mr-0"
        >
          <span class="text-iceberg text-base leading-md mb-3 md:mb-0">6 months:</span>
          <AppPercentageSpan class="text-base leading-md" :data="snapshot.month6" />
        </div>

        <div
          class="card flex flex-col md:flex-row md:items-center justify-between md:w-full md:py-8 md:pl-20 md:pr-15 md:mb-10 lg:mb-20 last:mb-0 mr-30 md:mr-0 last:mr-0"
        >
          <span class="text-iceberg text-base leading-md mb-3 md:mb-0">3 months:</span>
          <AppPercentageSpan class="text-base leading-md" :data="snapshot.month3" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 row-gap-14 w-full px-20 mb-30">
        <!-- TODO -->
        <!-- <div class="grid grid-cols-2 col-gap-20 w-full">
          <span class="text-iceberg text-base leading-md mb-3 md:mb-0">Total profit:</span>
          <AppPercentageSpan class="text-base leading-md" :data="totalProfit" />
        </div> -->

        <div class="grid grid-cols-2 col-gap-20 w-full">
          <span class="text-iceberg text-base leading-md mb-3 md:mb-0">Total perf:</span>
          <AppPercentageSpan class="text-base leading-md" :data="snapshot && snapshot.allmonths" />
        </div>

        <div class="grid grid-cols-2 col-gap-20 w-full">
          <span class="text-iceberg text-base leading-md mb-3 md:mb-0">6 months:</span>
          <AppPercentageSpan class="text-base leading-md" :data="snapshot && snapshot.month6" />
        </div>

        <div class="grid grid-cols-2 col-gap-20 w-full">
          <span class="text-iceberg text-base leading-md mb-3 md:mb-0">3 months:</span>
          <AppPercentageSpan class="text-base leading-md" :data="snapshot && snapshot.month3" />
        </div>
      </div>
    </template>

    <!-- SLOT FOR CHART FILTER -->
    <slot name="chart-filter" />

    <!-- PERFORMANCES CHART -->
    <PerformancesChart :data="chartData" class="performances-chart__wrap" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import PerformancesChart from "@/components/algo-bots/bot-detailed-new/PerformancesChart.vue";
import PerformancesCard from "@/components/algo-bots/bot-detailed-new/PerformancesCard.vue";

@Component({ name: "Performances", components: { PerformancesChart, PerformancesCard } })
export default class Performances extends Vue {
  /* PROPS */
  @Prop({ required: true }) chartData: any[];
  @Prop({ required: true }) snapshot: any;
  @Prop({ required: true }) botCycleData: any;

  /* COMPUTED */
  get totalProfit() {
    if (this.botCycleData) {
      return this.botCycleData.reduce((acc: number, cur: any) => Number(cur.profitPercentage) + acc, 0);
    } else {
      return null;
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  @media (min-width: 768px) {
    background: #0d0e14;
  }
}

.performances-chart {
  &__wrap {
    @media (max-width: 767px) {
      @apply flex flex-col flex-shrink-0;
      height: 300px;
    }
  }
}
</style>
