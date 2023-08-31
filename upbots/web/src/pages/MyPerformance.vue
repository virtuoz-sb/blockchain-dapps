<template>
  <GeneralLayout title="My Performance">
    <!-- DESKTOP CONTENT -->
    <div v-if="!isComingSoon" class="block w-full h-full overflow-auto custom-scrollbar">
      <!-- RECAP -->
      <div class="flex flex-col w-full bg-dark-200 rounded-3">
        <div class="flex items-center flex-shrink-0 min-h-40 border-b border-grey-cl-300 px-20 py-12">
          <span class="leading-md text-white">Recap</span>
        </div>

        <Recap />
      </div>

      <div class="flex mt-40">
        <!-- CARDS -->
        <div class="cards__inner relative flex flex-col bg-dark-200 rounded-3 mr-40">
          <div class="flex items-center flex-shrink-0 min-h-40 border-b border-grey-cl-300 px-20 py-12">
            <span class="leading-md text-white">Cards</span>
          </div>
          <div class="cards__wrap p-20 overflow-y-auto custom-scrollbar">
            <Card v-for="item in cardsData" :key="item.id" :data="item" />
          </div>
        </div>

        <!-- RADAR CHART -->
        <div class="flex flex-1 flex-col bg-dark-200 rounded-3">
          <div class="flex items-center flex-shrink-0 min-h-40 border-b border-grey-cl-300 px-20 py-12">
            <span class="leading-md text-white">Test chart</span>
          </div>
          <div class="h-full w-full py-20" ref="wrap">
            <RadarChart v-if="isMounted" :chart-data="dataSets" :options="options" :style="wrapStyles" class="relative" />
          </div>
        </div>
      </div>

      <!-- PORTFOLIO EVOLUTION CHART -->
      <div class="portfolio-evolution__wrap">
        <!-- <portfolio-evolution
          class="flex flex-col justify-between w-full bg-dark-200 rounded-3 mt-40"
          :line-chart-labels="lineChartLabels"
        /> -->
      </div>
    </div>

    <!-- COMING SOON -->
    <ComingSoonWithoutDesign v-else />
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";
import Recap from "@/components/my-performance/Recap.vue";
import Card from "@/components/my-performance/Card.vue";
import RadarChart from "@/components/charts/RadarChart.vue";

@Component({ name: "MyPerformance", components: { GeneralLayout, Recap, Card, RadarChart }, mixins: [ComingSoon] })
export default class MyPerformance extends Vue {
  /* REFS */
  $refs!: {
    wrap: HTMLElement;
  };

  /* DATA */
  isMounted: boolean = false;

  cardsData: { id: number; amount: number; percentage: number; desc: string }[] = [
    { id: 1, amount: 14, percentage: 25, desc: "Lorem ipsum profit in USD" },
    { id: 2, amount: 14, percentage: 25, desc: "Lorem ipsum profit in USD" },
    { id: 3, amount: 14, percentage: 25, desc: "Lorem ipsum profit in USD" },
    { id: 4, amount: 14, percentage: 25, desc: "Lorem ipsum profit in USD" },
    { id: 5, amount: 14, percentage: 25, desc: "Lorem ipsum profit in USD" },
    { id: 6, amount: 14, percentage: 25, desc: "Lorem ipsum profit in USD" },
  ];

  dataSets: object = {
    labels: ["Option 1", "Option 2", "Option 3", "Option 4"],
    datasets: [
      {
        data: [50, 2, 38, 80],
        borderColor: "#9DAC3F",
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
  };

  // CHART OPTIONS
  options = {
    maintainAspectRatio: false,
    responsive: true,
    legend: { display: false },
    plugins: {
      datalabels: {
        display: false,
      },
    },
    scale: {
      gridLines: {
        color: "#606675",
      },
      ticks: {
        fontColor: "#6ED4CA",
        backdropColor: "transparent",
        // callback has 3 param (value, index, values)
        callback(value: any) {
          return value + "%";
        },
        fontSize: 10,
      },
      pointLabels: {
        fontSize: 14,
        fontColor: "#fff",
      },
    },
  };

  lineChartLabels: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* COMPUTED */
  get wrapStyles() {
    return this.isMounted ? { height: `${this.$refs.wrap.offsetHeight - 40}px` } : null;
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }
}
</script>

<style lang="scss" scoped>
.cards {
  &__inner {
    &:after {
      content: "";
      bottom: -1px;
      height: 55px;
      background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
      @apply absolute left-0 w-full;
    }
  }
  &__wrap {
    max-height: 400px;
  }
}

.portfolio-evolution {
  &__wrap {
    height: 440px;
  }
}
</style>
