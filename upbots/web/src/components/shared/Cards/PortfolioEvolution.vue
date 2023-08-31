<template>
  <div class="relative" :class="(loading.portfolioEvolution && 'loading') || (!portfolioEvolutionData && 'disabled')">
    <div
      v-if="!$breakpoint.smAndDown"
      class="flex flex-wrap items-center justify-between flex-shrink-0 h-40 border-b border-grey-cl-300 px-20"
    >
      <div class="flex items-center mr-10">
        <span class="icon-marketing text-xl1 text-astral mr-10" />
        <span class="leading-md text-iceberg">Portfolio Evolution</span>
      </div>
      <span v-if="dataSets" class="text-sm text-astral cursor-pointer">{{ activeCurrenciesNames }}</span>
    </div>

    <!-- PORTFOLIO EVOLUTION -->
    <div ref="wrap" class="line-chart-wrap h-full w-full mb-10" :class="chartClasses">
      <!-- LINE CHART -->
      <template v-if="isMounted">
        <LineChart v-if="dataSets" class="relative" :style="wrapStyles" :chart-data="dataSets" :options="options" />

        <p v-else class="flex items-center justify-center w-full h-full text-iceberg">
          <span>No Data Available</span>
        </p>
      </template>
    </div>

    <div v-if="dataSets" class="flex flex-shrink-0 w-full px-20 md:px-12 pb-10">
      <AppFilter v-model="portfolioSelectedQuantity" :items="quantityValues" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { GroupItems } from "@/models/interfaces";
import moment from "moment";

const user = namespace("userModule");

import LineChart from "@/components/charts/LineChart.vue";

@Component({ name: "PortfolioEvolution", components: { LineChart } })
export default class PortfolioEvolution extends Vue {
  /* VUEX */
  @user.State selectedQuantity!: string;
  @user.Mutation setSelectedQuantity!: any;
  @user.Action fetchPortfolioEvolution!: any;
  @user.State loading: Object;

  /* PROPS */
  @Prop({ required: true }) portfolioEvolutionData: any;
  @Prop({ required: true }) activeCurrenciesNames: any[];
  @Prop({ default: "" }) chartClasses: string;

  /* REFS */
  $refs!: {
    wrap: HTMLElement;
  };

  /* DATA */
  isMounted = false;

  quantityValues: GroupItems[] = [
    { value: "all", label: "ALL" },
    { value: "1,year", label: "1Y" },
    { value: "6,months", label: "6M" },
    { value: "3,months", label: "3M" },
    { value: "1,month", label: "1M" },
    { value: "2,weeks", label: "2W" },
    { value: "1,week", label: "W" },
    { value: "1,day", label: "1D" },
  ];

  // CHART FAKE DATA START //
  chartFakeData: any[] = [
    {
      id: 1,
      borderColor: "#32DAF5",
      backgroundColor: "rgba(50, 218, 245, 0.1)",
      pointBackgroundColor: "#32DAF5",
      pointBorderColor: "transparent",
      isActive: true,
      data: [20, 15, 30, 45, 40, 20, 25, 30, 50, 70, 25, 40],
      label: "EUR",
      value: "EUR",
      yAxisID: "money",
      lineTension: 0.4,
      borderWidth: 2,
      pointBorderWidth: 0,
      pointHoverRadius: 0,
      pointHoverBackgroundColor: "transparent",
      pointHoverBorderColor: "transparent",
      pointHoverBorderWidth: 0,
      pointRadius: 0,
      pointHitRadius: 0,
    },
    {
      id: 2,
      borderColor: "#8482D2",
      backgroundColor: "rgba(132, 130, 210, 0.1)",
      pointBackgroundColor: "#8482D2",
      pointBorderColor: "transparent",
      isActive: true,
      data: [0.1432, 0.2242, 0.3673, 0.3563, 0.52135, 0.5246, 0.3473, 0.23534, 0.3525, 0.43243, 0.4352, 0.623423],
      label: "BTC",
      value: "BTC",
      yAxisID: "BTC",
      lineTension: 0.4,
      borderWidth: 2,
      pointBorderWidth: 0,
      pointHoverRadius: 0,
      pointHoverBackgroundColor: "transparent",
      pointHoverBorderColor: "transparent",
      pointHoverBorderWidth: 0,
      pointRadius: 0,
      pointHitRadius: 0,
    },
  ];
  chartFakeFakeLabels: string[] = [
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
  // CHART FAKE DATA END //

  // CHART OPTIONS //
  get options() {
    return {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [
          {
            id: "BTC",
            type: "linear",
            position: "right",
            ticks: {
              padding: 0,
              fontColor: "#427E7E",
            },
            gridLines: {
              color: "#1A2E37",
            },
          },
          {
            id: "money",
            type: "linear",
            position: "left",
            ticks: {
              padding: 0,
              fontColor: "#6DD3C9",
            },
            gridLines: {
              color: "#1A2E37",
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              fontColor: "#427E7E",
            },
            gridLines: {
              color: "#1A2E37",
            },
          },
        ],
      },
      legend: {
        labels: {
          usePointStyle: true,
          fontSize: 10,
          // This more specific font property overrides the global property
          fontColor: "#6DD3C9",
        },
      },
      plugins: {
        datalabels: {
          display: false,
        },
      },
      tooltips: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(50, 75, 86, 0.9)",
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
    };
  }

  /* COMPUTED */
  get dataSets() {
    if (this.portfolioEvolutionData) {
      return {
        datasets: this.portfolioEvolutionData.datasets,
        labels: this.portfolioEvolutionData.labels.map((el: any) => {
          return moment(el).format("DD-MMM");
        }),
      };
    } else {
      return { datasets: this.chartFakeData, labels: this.chartFakeFakeLabels };
    }
  }

  get wrapStyles() {
    return this.isMounted ? { height: `${this.$refs.wrap.offsetHeight}px` } : null;
  }

  get portfolioSelectedQuantity() {
    return this.selectedQuantity;
  }

  set portfolioSelectedQuantity(value) {
    this.setSelectedQuantity(value);
    // fetch evolution data with new DateRange
    this.fetchPortfolioEvolution();
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }
}
</script>

<style lang="scss" scoped>
.line-chart-wrap {
  height: calc(100% - 34px);
}

.disabled {
  &:after {
    content: "No Data Available";
    @apply absolute left-0 bottom-0 flex items-center justify-center w-full h-full text-iceberg select-none cursor-not-allowed;
    background: rgba(27, 49, 58, 0.8);
  }
}

.loading {
  &:after {
    content: "Loading Data...";
    @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full text-iceberg select-none cursor-not-allowed;
    background: rgba(27, 49, 58, 0.8);
  }
}
</style>
