<template>
  <div v-if="priceDataReady" class="widget justify-around">
    <MarketChartLine v-for="item in cryptoList" :key="item.name" :item="item" :fiat="fiat" class="widget__item flex flex-row w-1/4" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { CryptoItems } from "@/store/cryptoPrice/types";

const cryptoModule = namespace("cryptoPrice");

import MarketChartLine from "@/components/homepage/MarketChartLine.vue";

@Component({ name: "MarketValueWidget", components: { MarketChartLine } })
export default class MarketValueWidget extends Vue {
  /* VUEX */
  @cryptoModule.Getter getLoaded!: { [pair: string]: boolean };
  @cryptoModule.Action fetchCryptoPriceCoinGecko: any;
  // See https://www.coingecko.com/en/api#explore-api

  /* DATA */
  priceDataReady: boolean = false;
  fiat: string = "usd";
  cryptoList: CryptoItems = [
    { title: "Bitcoin (BTC)", name: "bitcoin", symbol: "BTC", srcCoin: null },
    { title: "Ethereum (ETH)", name: "ethereum", symbol: "ETH", srcCoin: null },
    { title: "UpBots (UBXT)", name: "upbots", symbol: "UBXT", srcCoin: "ubxt-logo" },
  ];

  /* HOOKS */
  async mounted() {
    await Promise.all(
      this.cryptoList.map((pair) =>
        this.fetchCryptoPriceCoinGecko({
          cryptoSymbol: pair.name,
          fiatSymbol: this.fiat,
        })
      )
    );
    this.priceDataReady = !this.cryptoList.find((pair: { name: string }) => this.getLoaded[`${pair.name}/${this.fiat}`] === false);
  }
}
</script>

<style lang="scss" scoped>
.widget {
  &__item {
    &:after {
      @apply absolute right-0 w-2 h-100 bg-hei-se-black;
      content: "";
      top: 25px;
    }
    &:last-child {
      &:after {
        content: none;
      }
    }
  }
}
</style>
