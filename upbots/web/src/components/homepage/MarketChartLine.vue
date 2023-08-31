<template>
  <div v-if="dataSetReady" type="chart" class="relative flex flex-row justify-center w-full p-10">
    <div class="container relative">
      <div class="absolute top-0 left-0 flex flex-col w-full; text-white">
        <div class="title flex flex-row text-white mb-14 z-1">
          <CryptoCoinChecker :data="item.symbol" class="mr-5">
            <template>
              <div v-if="item.srcCoin" :class="metamaskEnabled && !ubxtSuccessfullyAdded ? 'cursor-pointer' : ''">
                <img
                  :src="require(`@/assets/icons/${item.srcCoin}.png`)"
                  :alt="item.srcCoin"
                  class="w-18 h-18"
                  @click="addUbxtTokenToMetaMask(require(`@/assets/icons/${item.srcCoin}.png`))"
                />
              </div>

              <cryptoicon v-else :symbol="item.symbol" size="18" generic />
            </template>
          </CryptoCoinChecker>

          <p class="leading-xs">{{ item.title }}</p>
        </div>

        <h3 v-if="latest" class="price mb-14">{{ `$${latest.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` }}</h3>

        <div v-if="percent" class="flex flex-row">
          <h3 class="inline-block" :class="percent >= 0 ? 'text-green-cl-200' : 'text-red-cl-200'">
            {{ percent >= 0 ? "+" : "-" }}
          </h3>

          <h3 class="ml-5">{{ `${Math.abs(percent.toFixed(2))}%` }}</h3>
        </div>
      </div>

      <div class="chart-container-mask absolute top-0 right-0 flex flex-row justify-end m-auto">
        <div v-if="chartData" class="chart-container w-full">
          <LineChart :chart-data="chartData" :options="chartOptions" class="chart w-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { CryptoPriceData, CryptoItem } from "@/store/cryptoPrice/types";
import moment from "moment";
import detectEthereumProvider from "@metamask/detect-provider";

const cryptoModule = namespace("cryptoPrice");

import LineChart from "@/components/charts/LineChart.vue";

@Component({ name: "MarketChartLine", components: { LineChart } })
export default class MarketChartLine extends Vue {
  /* VUEX */
  @cryptoModule.Getter getPriceData!: { [pair: string]: CryptoPriceData };

  /* PROPS */
  @Prop() fiat!: string;
  @Prop() item!: CryptoItem;

  /* DATA */
  pairData: any;
  latest: number = null;
  percent: number = null;
  dataSetReady: boolean = false;
  chartData: { datasets: any[]; labels: any[] } = {
    datasets: [],
    labels: [],
  };
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    lineTension: 0.1,
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
      yAxes: [
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
    legend: {
      display: false,
    },
  };
  contractAddress = process.env.VUE_APP_WEB3_UBXTOKEN_PROXY_CONTRACT_ADDRESS;
  metamaskEnabled: boolean = false;
  ubxtSuccessfullyAdded: boolean = false;

  /* HOOKS */
  mounted() {
    this.getCryptoDataset();
    this.checkMetamaskEnabled();
  }

  /* METHODS */
  getCryptoDataset(): any {
    this.pairData = this.getPriceData[`${this.item.name}/${this.fiat}`];
    if (this.pairData) {
      const latestPrice = this.pairData.prices[this.pairData.prices.length - 1][1];
      this.latest = this.item.name === "upbots" ? latestPrice.toFixed(3) : latestPrice.toFixed(2);
      this.percent = latestPrice / (this.pairData.prices[0][1] / 100) - 100;
      this.chartData = {
        labels: this.pairData.prices.map((c: any) => moment(c[0]).format("D-MMM, h:mm:ss A")),
        datasets: [
          {
            data:
              this.item.name === "upbots"
                ? this.pairData.prices.map((c: any) => c[1].toFixed(4))
                : this.pairData.prices.map((c: any) => c[1].toFixed(2)),
            fill: false,
            borderColor: "rgba(127, 134, 255, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(255,255,255,0)",
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: "rgba(255,255,255,0)",
          },
        ],
      };
      this.dataSetReady = true;
    }
  }

  async checkMetamaskEnabled() {
    const provider = await detectEthereumProvider();
    if (Object.prototype.hasOwnProperty.call(provider, "isMetaMask") && provider.isMetaMask) {
      this.metamaskEnabled = true;
    }
  }

  async addUbxtTokenToMetaMask(link: string) {
    // TODO: check if the ubxt already listed in MetaMask assets @metamask-extension/issues/7360
    if (this.metamaskEnabled && !this.ubxtSuccessfullyAdded) {
      this.ubxtSuccessfullyAdded = await (window.web3.currentProvider as any).request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: this.contractAddress,
            symbol: "UBXT",
            decimals: 18,
            image: window.location.origin + link,
          },
        },
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 85%;
  @media (min-width: 1025px) {
    @apply mt-28;
  }
}

.chart {
  height: 6rem;
  z-index: -1;
  @media (max-width: 1279px) {
    height: 4rem;
    width: 80%;
  }
  @media (max-width: 1024px) {
    @apply mt-28;
    height: 3rem;
    width: 70%;
  }
}

.chart-container {
  height: 6rem;
}

.chart-container-mask {
  mask-image: linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0)), linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  mask-size: 100% 50%;
  mask-repeat: no-repeat;
  mask-position: left top, left bottom;
  width: 70%;
}
</style>
