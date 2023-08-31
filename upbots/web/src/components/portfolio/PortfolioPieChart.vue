<template>
  <div
    class="flex flex-wrap justify-center w-full h-full text-iceberg"
    :class="portfolioDistributionData && portfolioDistributionData.length > 12 && 'overflow-y-auto custom-scrollbar'"
  >
    <div class="legend flex flex-wrap justify-around text-sm">
      <div v-for="(label, index) in chartData.labels" :key="index" class="legend__item flex h-20">
        <div class="legend__item__color self-center w-16 h-16 mr-6" :style="getLabelbgColor(index)" />
        <div class="legend__item__main flex items-center">
          <CryptoCoinChecker :data="label" class="legend__item__main__logo">
            <template slot-scope="{ isExist, coinName, srcCoin }">
              <img v-if="isExist" :src="require(`@/assets/icons/${srcCoin}.png`)" :alt="srcCoin" class="w-18 h-18" />
              <cryptoicon v-else :symbol="coinName" size="18" generic />
            </template>
          </CryptoCoinChecker>

          <div class="legend__item__main__text ml-5">{{ label }}</div>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <DoughnutChart :chartData="chartData" :options="chartOptions" class="w-full h-full" />
    </div>
  </div>
</template>

<script lang="ts">
const dummyData: any[] = [
  {
    x: "USDT",
    labels: "USDT",
    value: "83357.05",
    valueEur: "70414.66",
    currencyAmount: "83307.0627",
  },
  {
    x: "SOL",
    labels: "SOL",
    value: "5691.65",
    valueEur: "4807.94",
    currencyAmount: "2200.3740",
  },
  {
    x: "BTC",
    labels: "BTC",
    value: "3709.03",
    valueEur: "3133.15",
    currencyAmount: "0.3215",
  },
  {
    x: "ETH",
    labels: "ETH",
    value: "0.01",
    valueEur: "0.01",
    currencyAmount: "0.0000",
  },
  {
    x: "BNB",
    labels: "BNB",
    value: "0.00",
    valueEur: "0.00",
    currencyAmount: "0.0001",
  },
];
const chartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  borderWidth: 1.5,
};
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({ name: "PortfolioPieChart", components: { DoughnutChart } })
export default class PortfolioPieChart extends Vue {
  /* PROPS */
  @Prop({ required: true }) portfolioDistributionData: string[];

  /* DATA */
  chartData: { datasets: any[]; labels: any[] } = {
    datasets: [],
    labels: [],
  };
  chartOptions: any = {};
  chartColorList: string[] = [];

  /* WATCHERS */
  @Watch("portfolioDistributionData", { deep: true })
  handleChartRender() {
    this.renderChart();
  }

  /* HOOKS */
  mounted() {
    this.renderChart();
  }

  /* METHODS */
  renderChart() {
    const data = this.portfolioDistributionData ? this.portfolioDistributionData : dummyData;
    this.getChartColorList(data.length);
    this.getChartData(data);
  }

  getChartData(data: any) {
    const sortedData = data.sort((a: any, b: any) => b.value - a.value);
    const sum: number = data.map((coin: any) => parseFloat(coin.value)).reduce((a: number, b: number) => a + b, 0);
    this.chartData = {
      labels: sortedData.map((coin: any) => coin.labels),
      datasets: [
        {
          data: sortedData.map((coin: any) => this.getPercent(parseFloat(coin.value), sum)),
          backgroundColor: this.chartColorList,
          borderColor: "#D5F2F2",
        },
      ],
    };
    this.chartOptions = {
      ...chartConfig,
      tooltips: {
        enabled: true,
        callbacks: {
          label: (tooltipItem: any, data: any) => {
            const allData = data.datasets[tooltipItem.datasetIndex].data;
            const tooltipLabel = data.labels[tooltipItem.index];
            const tooltipData = allData[tooltipItem.index];
            return `${tooltipLabel}: ${tooltipData}%`;
          },
        },
      },
    };
  }

  getPercent(value: number, sum: number) {
    const percent = (value * 100) / sum;
    return percent.toFixed(2);
  }

  getLabelbgColor(idx: number) {
    return {
      "background-color": this.chartColorList[idx],
    };
  }

  getChartColorList(numItem: number) {
    const palette = ["#008074", "#47bbd1", "#FEC5E5", "#e5fffd", "#6a7ed5", "#ffae42", "#ffcc88", "#c79a7c", "#a2ad9c"];
    const numExtraColor = numItem - palette.length;
    this.chartColorList = numExtraColor <= 0 ? palette : [...palette, ...this.genNewColors(numExtraColor)];
  }

  genNewColors(numColors: number) {
    const letters = "0123456789abcdef";
    let hastag = ["#", "#", "#", "#", "#", "#"];
    for (let i = 0; i < numColors; i++) {
      for (let j = 0; j < 6; j++) {
        hastag[i] += letters[Math.floor(Math.random() * 16)];
      }
    }
    return hastag;
  }
}
</script>

<style lang="scss" scoped>
.legend {
  width: 90%;
  @media (max-width: 1400px) {
    @apply w-1/2;
  }

  &__item {
    width: 7rem;

    &__main {
      width: 5rem;
      border-radius: 2px;

      &__logo {
        margin-left: 0.3rem;
      }
    }

    &__color {
      border-radius: 2px;
    }
  }
}

.chart-container {
  width: 80%;
  height: 80%;
  margin: 1rem 0;
  @media (max-width: 1600px) {
    width: 70%;
    height: 70%;
  }
  @media (max-width: 1400px) {
    @apply w-1/2;
  }
}
</style>
