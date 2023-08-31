<template>
  <div class="bg-elite-teal shadow-140">
    <!-- SLOT HEADER -->
    <slot name="header" />

    <!-- LINE CHART -->
    <div ref="wrap" class="line-chart__inner relative" :class="chartClasses">
      <LineChart v-if="isMounted" class="relative" :chart-data="dataSets" :options="getChartOption" :style="wrapStyles" />
      <!-- TODO: figured out where TAG data comes from -->
      <!-- <div
        v-if="chartData && chartData.chartData && chartData.chartData.tag"
        class="absolute bottom-10 right-0 flex items-center justify-center h-30 bg-blue-cl-100 text-white text-sm leading-xs rounded-l-5 px-24"
      >
        {{ chartData.chartData.tag }}
      </div> -->

      <!-- No Data -->
      <div
        v-if="hasData"
        class="absolute chart-backdrop flex items-center justify-center left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg z-1"
      >
        <span>No Data Available</span>
      </div>
    </div>

    <!-- v-if="isFake" TEMPORARY solution for "MyBots" page - TO REMOVE once will be fixed -->
    <div class="flex flex-col flex-grow px-20 mt-15">
      <!-- BOT SUBSCRIPTION -->
      <p class="text-iceberg underline text-right mb-15">Discover more...</p>

      <!-- BOT TAGS -->
      <div class="flex flex-col w-full mt-auto">
        <div class="grid grid-rows-1 xxxl:grid-cols-2 row-gap-20 xxxl:row-gap-0 col-gap-20 xxxl:col-gap-35">
          <div class="grid grid-cols-3 xxxl:grid-cols-1 row-gap-15 justify-between">
            <!-- STRATEGY -->
            <div class="flex flex-col xxxl:flex-row items-center justify-between">
              <p class="text-xs text-iceberg mb-8 xxxl:mb-0 xxxl:mr-8">Strategy:</p>

              <div class="bot-card__tag">
                <span class="bot-card__tag-text text-white">{{ botData.stratType }}</span>
              </div>
            </div>

            <!-- MAX DRAWDOWN -->
            <div class="flex flex-col xxxl:flex-row items-center justify-between">
              <p class="text-xs text-iceberg mb-8 xxxl:mb-0 xxxl:mr-8">Max Drawdown:</p>

              <div class="bot-card__tag">
                <AppPercentageSpan
                  class="bot-card__tag-text text-white"
                  :is-colored="false"
                  :data="botData.perfSnapshots && botData.perfSnapshots.maxDrawdown"
                />
              </div>
            </div>

            <!-- TRADE / MONTH -->
            <div class="flex flex-col xxxl:flex-row items-center justify-between">
              <p class="text-xs text-iceberg mb-8 xxxl:mb-0 xxxl:mr-8"># trade / month:</p>

              <div class="bot-card__tag">
                <span class="bot-card__tag-text text-white">{{ botData.lastMonthTrades }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 xxxl:grid-cols-1 row-gap-15 justify-between">
            <!-- 1 MONTH PERF -->
            <div class="flex flex-col xxxl:flex-row items-center justify-between">
              <p class="text-xs text-iceberg mb-8 xxxl:mb-0 xxxl:mr-8">3 month perf %:</p>

              <div class="bot-card__tag">
                <AppPercentageSpan class="bot-card__tag-text" :data="botData.perfSnapshots && botData.perfSnapshots.month3" />
              </div>
            </div>

            <!-- 3 MONTHS PERF -->
            <div class="flex flex-col xxxl:flex-row items-center justify-between">
              <p class="text-xs text-iceberg mb-8 xxxl:mb-0 xxxl:mr-8">6 months perf %:</p>

              <div class="bot-card__tag">
                <AppPercentageSpan class="bot-card__tag-text" :data="botData.perfSnapshots && botData.perfSnapshots.month6" />
              </div>
            </div>

            <!-- 6 MONTHS PERF -->
            <div class="flex flex-col xxxl:flex-row items-center justify-between">
              <p class="text-xs text-iceberg mb-8 xxxl:mb-0 xxxl:mr-8">Total perf %:</p>

              <div class="bot-card__tag">
                <AppPercentageSpan class="bot-card__tag-text" :data="botData.perfSnapshots && botData.perfSnapshots.allmonths" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DISABLE
        <div class="flex items-center mb-10">
          <span class="flex-shrink-0 text-sm leading-xs text-white mr-8">Fast Reviews</span>
          <span class="reviews-line w-full h-px shadow-30 bg-gradient-r-10"></span>
        </div>
        <div class="flex items-center mb-10">
          <div class="w-25 h-25 rounded-full mr-10">
            <img :src="algobot.reviewerImg" alt="img" class="h-full w-full object-cover rounded-full" />
          </div>
          <p class="text-sm leading-xs text-iceberg mr-15">{{ algobot.reviewerName }}</p>
          <div class="flex items-center" v-if="algobot.reviewerBotRating">
            <AppRating :value="algobot.reviewerBotRating" class="text-xs" />
            <p class="text-iceberg text-xs leading-xs ml-10">{{ algobot.reviewerBotRating }}</p>
          </div> 
        </div>
        <p class="text-xs leading-xs text-iceberg">{{ algobot.updatedAt }}</p>
      -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";

import LineChart from "@/components/charts/LineChart.vue";

const fakeData = {
  datasets: [
    {
      data: [12, 27, 36, 36, 55, 41, 56, 81, 125],
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
  labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9"],
};

@Component({ name: "BotCard", components: { LineChart } })
export default class BotCard extends Vue {
  /* PROPS */
  @Prop({ type: String, default: "" }) chartClasses: any;
  @Prop({ required: true }) botData: AlgoBot;
  @Prop({ required: true }) chartOption: any;
  @Prop({ type: Boolean, default: false }) tag: boolean;
  @Prop({ type: Boolean, default: false }) isFake: boolean;

  /* REFS */
  $refs!: {
    wrap: HTMLElement;
  };

  /* DATA */
  fakeData = fakeData;
  isMounted: boolean = false;

  /* COMPUTED */
  get wrapStyles() {
    return this.isMounted ? { height: `${this.$refs.wrap.offsetHeight}px` } : null;
  }

  get hasData() {
    // TEMPORARY solution for "MyBots" page - TO REMOVE once will be fixed
    if (this.isFake) return false;

    return !(
      this.botData &&
      this.botData.perfSnapshots.charts &&
      this.botData.perfSnapshots.charts.monthlyChart &&
      this.botData.perfSnapshots.charts.monthlyChart.data.length
    );
  }

  get dataSets() {
    if (!this.hasData) {
      // TEMPORARY solution for "MyBots" page - TO REMOVE once will be fixed
      if (this.isFake) return fakeData;
      return {
        datasets: [
          {
            data: this.botData.perfSnapshots.charts.monthlyChart.data.map((x: number) => x.toFixed(2)),
            lineTension: 0.4,
            backgroundColor: "rgba(96, 188, 181, 0.2)",
            borderColor: "#60BCB5",
            borderWidth: 2,
            pointBorderColor: "transparent",
            pointBackgroundColor: "transparent",
            pointBorderWidth: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "#60BCB5",
          },
        ],
        labels: this.botData.perfSnapshots.charts.monthlyChart.labels,
      };
    } else {
      return fakeData;
    }
  }

  get getChartOption() {
    return {
      ...this.chartOption,
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
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }
}
</script>

<style lang="scss">
.chart-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.bot-card {
  &__tag {
    @apply flex items-center justify-center h-19 px-9 rounded-full;
    min-width: 70px;
    background: rgba(96, 188, 181, 0.2);
  }

  &__tag-text {
    @apply leading-1 text-sm font-bold;

    &::first-letter {
      @apply uppercase;
    }
  }
}
</style>
