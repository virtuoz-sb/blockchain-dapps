<template>
  <div class="flex flex-col flex-grow">
    <div class="flex flex-col w-full pt-20 px-20 mb-15">
      <div class="flex mb-6">
        <span class="text-white leading-xs">{{ data.cardData.title }}</span>
      </div>
      <div class="flex items-center">
        <div class="flex items-center mr-15">
          <span class="text-grey-cl-920 text-sm leading-xs">{{ data.cardData.subtitle }}</span>
        </div>
        <AppRating :value="data.cardData.rating" class="text-base mr-10" />
        <div class="flex items-center">
          <span class="text-grey-cl-300 text-sm leading-xs">{{ data.cardData.rating }}</span>
        </div>
      </div>
    </div>
    <div ref="wrap" class="line-chart__inner flex flex-col flex-grow relative">
      <!-- LINE CHART -->
      <LineChart v-if="isMounted" :chart-data="dataSets" :options="chartOptions" :style="wrapStyles" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import LineChart from "@/components/charts/LineChart.vue";

@Component({ name: "BotChart", components: { LineChart } })
export default class BotChart extends Vue {
  /* REFS */
  $refs!: {
    wrap: HTMLElement;
  };

  /* DATA */
  isMounted = false;

  data: any = {
    cardData: {
      title: "Fast Growth BTC / USD",
      subtitle: "Mark Spencer",
      rating: 4.2,
    },
    chartData: {
      borderColor: "#6E4498",
      backgroundColor: "#1D1F31",
      data: [12, 27, 36, 36, 55, 41, 56, 81, 125],
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
    lineChartLabels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9"],
  };

  // CHART OPTIONS
  chartOptions = {
    scales: {
      xAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    tooltips: {
      enabled: false,
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
  };

  /* COMPUTED */
  get wrapStyles() {
    return this.isMounted ? { height: `${this.$refs.wrap.offsetHeight}px` } : null;
  }

  get dataSets() {
    return {
      datasets: [
        {
          data: this.data.chartData.data,
          backgroundColor: this.data.chartData.backgroundColor,
          borderColor: this.data.chartData.borderColor,
          ...this.data.chartData,
        },
      ],
      labels: this.data.lineChartLabels,
    };
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }
}
</script>
