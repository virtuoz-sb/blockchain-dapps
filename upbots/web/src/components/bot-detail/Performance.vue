<template>
  <div class="flex flex-col h-auto md:h-full pt-20 overflow-y-auto custom-scrollbar">
    <div class="performance__content-inner flex flex-col flex-shrink-0 h-auto pb-40 md:pb-0 overflow-y-auto custom-scrollbar">
      <!-- HEADER -->
      <div class="grid grid-cols-3 px-15 md:px-20 mb-25 md:mb-30">
        <div class="flex" v-for="item in data.headerData" :key="item.id">
          <div class="flex flex-col w-full text-center md:py-3">
            <span class="text-base leading-xs md:text-xl1 md:leading-md text-white mb-8">{{ item.title }}</span>
            <span class="text-base leading-xs md:text-xl1 md:leading-md text-blue-cl-500 text-shadow-3">{{ item.subtitle }}</span>
          </div>
          <div v-if="data.headerData.length > item.id" class="gradient-7 w-px" />
        </div>
      </div>

      <!-- TABLE -->
      <div class="performance__table-inner flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
        <div class="flex flex-col overflow-y-auto custom-scrollbar">
          <!-- TABLE LABELS -->
          <div class="flex items-center justify-between sticky top-0 w-full mb-12">
            <div
              class="performance__table-label w-1/6 h-full flex items-center text-grey-cl-300 text-xs leading-xs py-10 ml-15 md:ml-10 xl:ml-20 pl-10 md:pl-5 xl:pl-20 pr-5 xl:pr-10"
            >
              Date
            </div>
            <div class="performance__table-label w-1/6 h-full flex items-center text-grey-cl-300 text-xs leading-xs py-10 pr-5 xl:pr-10">
              Trade
            </div>
            <div class="performance__table-label w-1/6 h-full flex items-center text-grey-cl-300 text-xs leading-xs py-10 pr-5 xl:pr-10">
              Exchange
            </div>
            <div class="performance__table-label w-1/6 h-full flex items-center text-grey-cl-300 text-xs leading-xs py-10 pr-5 xl:pr-10">
              Pair
            </div>
            <div class="performance__table-label w-1/6 h-full flex items-center text-grey-cl-300 text-xs leading-xs py-10 pr-5 xl:pr-10">
              Progress
            </div>
            <div
              class="performance__table-label w-1/6 h-full flex items-center text-grey-cl-300 text-xs leading-xs py-10 mr-15 md:mr-10 xl:mr-20 pr-5 xl:pr-10"
            >
              Profit
            </div>
          </div>

          <!-- TABLE ITEMS -->
          <div class="flex items-center justify-between mb-15 last:mb-0" v-for="(item, index) in data.tableData" :key="index">
            <div
              class="performance__table-item w-1/6 truncate text-grey-cl-300 text-xs leading-xs ml-15 md:ml-10 xl:ml-20 pl-10 md:pl-5 xl:pl-20 pr-5 xl:pr-10"
            >
              {{ item.created | dateLocal }}
            </div>
            <div class="performance__table-item w-1/6 text-grey-cl-300 text-xs leading-xs pr-5 xl:pr-10">{{ item.trade }}</div>
            <div class="performance__table-item w-1/6 text-grey-cl-300 text-xs leading-xs pr-5 xl:pr-10">{{ item.exchange }}</div>
            <div class="performance__table-item w-1/6 text-grey-cl-300 text-xs leading-xs pr-5 xl:pr-10">{{ item.pair }}</div>
            <div class="performance__table-item w-1/6 text-grey-cl-300 text-xs leading-xs pr-5 xl:pr-10">
              {{ item.progress }}
            </div>
            <div class="performance__table-item w-1/6 flex items-center mr-15 md:mr-10 xl:mr-20 pr-10">
              <span
                class="profit-circle flex flex-shrink-0 w-8 h-8 rounded-full mr-10"
                :class="item.profit >= 0 ? 'bg-green-cl-100 shadow-70' : 'bg-red-cl-100 shadow-80'"
              />
              <span class="text-grey-cl-300 text-xs leading-xs"> {{ item.profit >= 0 ? `+${item.profit}` : item.profit }}% </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CHART -->
    <div class="chart__wrap flex flex-shrink-0 md:flex-shrink flex-grow items-end">
      <LineChart v-if="isMounted" class="relative flex-grow h-full" :key="$breakpoint.width" :chart-data="dataSets" :options="options" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import LineChart from "@/components/charts/LineChart.vue";

@Component({ name: "Performance", components: { LineChart } })
export default class Performance extends Vue {
  /* DATA */
  @Prop({ required: true }) data: any;

  /* DATA */
  isMounted: boolean = false;

  options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            padding: 0,
          },
        },
      ],
    },
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

<style lang="scss" scoped>
.performance {
  &__table-inner {
    height: 210px;
  }

  &__table-label {
    background: #2e2f33;
  }

  @media (min-width: 768px) {
    &__content-inner {
      height: 363px;
    }
  }

  @media (max-width: 767px) {
    &__table-label,
    &__table-item {
      min-width: 90px;
    }
  }
}

.chart {
  &__wrap {
    @media (max-width: 767px) {
      height: 220px;
    }
  }
}

.profit-circle {
  background-blend-mode: overlay, normal;
}
</style>
