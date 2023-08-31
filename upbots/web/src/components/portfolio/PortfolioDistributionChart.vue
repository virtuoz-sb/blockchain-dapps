<template>
  <!-- FAKE CHART -->
  <div v-if="loading.portfolioDistributionChart" class="portfolio-distribution-chart__wrap w-full h-full text-grey-cl-100 loading">
    <PortfolioPieChart :portfolioDistributionData="null" />
  </div>

  <div v-else-if="!portfolioDistributionData.length" class="portfolio-distribution-chart__wrap w-full h-full text-grey-cl-100 disabled">
    <PortfolioPieChart :portfolioDistributionData="null" />
  </div>

  <!-- REAL CHART -->
  <div v-else class="portfolio-distribution-chart__wrap w-full h-full text-grey-cl-100">
    <PortfolioPieChart :portfolioDistributionData="portfolioDistributionData" :key="chartKey" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import PortfolioPieChart from "@/components/portfolio/PortfolioPieChart.vue";

const user = namespace("userModule");

@Component({ name: "PortfolioDistributionChart", components: { DoughnutChart, PortfolioPieChart } })
export default class PortfolioDistributionChart extends Vue {
  /* VUEX */
  @user.State loading: Object;

  /* PROPS */
  @Prop({ required: true }) portfolioDistributionData: string[];
  @Prop({ type: Boolean, default: false }) isRerender: boolean;

  /* DATA */
  renderChart = false;
  chartKey = 0;

  /* WATCHERS */
  @Watch("portfolioDistributionData", { deep: true })
  handleChartRender() {
    this.chartKey++;
  }

  @Watch("isRerender", { deep: true })
  handleChartRerender() {
    this.chartKey++;
  }
}
</script>

<style lang="scss" scoped>
.portfolio-distribution-chart {
  &__wrap {
    &.disabled {
      &:after {
        content: "No Data Available";
        @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg;
        background: rgba(27, 49, 58, 0.8);
      }
    }
    &.loading {
      &:after {
        content: "Loading Data...";
        @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg;
        background: rgba(27, 49, 58, 0.8);
      }
    }
  }
}
</style>
