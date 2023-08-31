<template>
  <div ref="wrap" class="h-full md:flex-1 overflow-x-hidden">
    <LineChart
      v-if="isMounted"
      class="evolution-line-chart__wrap relative"
      :style="wrapStyles"
      :chart-data="chartData"
      :options="options"
    />
  </div>
</template>

<script lang="ts">
const dummyData = {
  datasets: [
    {
      borderColor: "#60BCB5",
      backgroundColor: "#60BCB5",
      lineTension: 0.4,
      borderWidth: 2,
      pointBorderColor: "transparent",
      pointBackgroundColor: "transparent",
      pointBorderWidth: 0,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "#60BCB5",
      data: [0, -0.69, -0.4, -2.11, -3.02, 14.9, 16.88, 13.19, 12.3, 11.46, 11.69, 7.91, 12.28, 12.15, 9.6, 9.21, 9.68, 9.68, 22.55],
    },
  ],
  labels: [
    "June-26",
    "July-27",
    "July-28",
    "July-29",
    "July-30",
    "July-31",
    "August-32",
    "August-33",
    "August-34",
    "August-35",
    "September-36",
    "September-37",
    "September-38",
    "September-39",
    "October-40",
    "October-41",
    "October-42",
    "October-43",
    "October-44",
  ],
};

import { Component, Vue, Prop } from "vue-property-decorator";

import LineChart from "@/components/charts/LineChart.vue";

@Component({ name: "PerformanceChart", components: { LineChart } })
export default class PerformanceChart extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;

  /* REFS */
  $refs!: {
    wrap: HTMLElement;
  };

  /* DATA */
  isMounted = false;

  /* CHART OPTIONS */
  options = {
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            padding: 0,
            callback: function (value: any) {
              return value + "%";
            },
            fontColor: "#427E7E",
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            fontColor: "#427E7E",
          },
        },
      ],
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
    hover: {
      mode: "index",
      intersect: false,
    },
    tooltips: {
      enabled: true,
      callbacks: {
        label: (tooltipItem: any, data: any) => {
          const allData = data.datasets[tooltipItem.datasetIndex].data;
          const tooltipData = allData[tooltipItem.index];
          return `${tooltipData}%`;
        },
      },
    },
  };

  /* COMPUTED */
  get wrapStyles() {
    return this.isMounted ? { height: `${this.$refs.wrap.offsetHeight}px` } : null;
  }

  get chartData() {
    return this.data ? this.data : dummyData;
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }
}
</script>

<style lang="scss" scoped>
.evolution-line-chart {
  &__wrap {
    &.disabled {
      &:after {
        content: "No Data Available";
        background: rgba(27, 49, 58, 0.8);
        @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg;
      }
    }
  }
}
</style>
