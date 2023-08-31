<template>
  <div class="flex w-full h-full">
    <div class="trade-history__list-wrap flex flex-col w-full md:px-56 md:pt-11 overflow-y-auto custom-scrollbar md:overflow-y-visible">
      <ul class="grid grid-cols-3 col-gap-20 items-center px-10 md:px-0">
        <li v-for="(item, index) in labels" :key="index" class="md:text-xxs xl:text-xs leading-md text-hidden-sea-glass">{{ item }}</li>
      </ul>
      <div
        v-if="tradeHistoryData"
        class="grid row-gap-10 h-full mt-10 px-10 md:px-0 overflow-y-auto custom-scrollbar md:overflow-y-visible"
      >
        <VirtualList
          class="items-wrap overflow-y-auto custom-scrollbar"
          :data-key="'id'"
          :data-sources="tradeHistoryData"
          :data-component="Item"
          :estimate-size="50"
          :extra-props="{ tradeHistoryData }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ExchangePairSettings } from "@/store/trade/types";

const trade = namespace("tradeModule");

import TradeHistoryItem from "@/components/manual-trade/trade-card/TradeHistoryItem.vue";
import VirtualList from "vue-virtual-scroll-list";
import moment from "moment";

@Component({ name: "TradeHistory", components: { TradeHistoryItem, VirtualList } })
export default class TradeHistory extends Vue {
  /* VUEX */
  @trade.State selectedCurrencyPair: ExchangePairSettings;
  @trade.State exchange: any;

  /* DATA */
  Item: Object = TradeHistoryItem;
  data: any = null;
  labels: any[] = ["Price", "Amount", "Time"];
  fetchAllowed: boolean = true;

  /* COMPUTED */
  get selectedPair() {
    return this.selectedCurrencyPair.symbolForData;
  }

  get tradeHistoryData() {
    return this.data ? this.tradeHistoryInfo(this.data) : null;
  }

  /* WATCHERS */
  @Watch("selectedPair", { immediate: true })
  handler() {
    this.fetchAllowed = true;
    this.fetchTradeHistoryData();
  }

  /* HOOKS */
  beforeDestroy() {
    this.fetchAllowed = false;
  }

  /* METHODS */
  tradeHistoryInfo(data: any) {
    const dataWithoutPercentage = data.map((el: number[], index: number) => {
      return {
        id: index,
        time: moment.unix(el[1]).format("YYYY-MM-DD HH:MM"),
        price: el[2],
        amount: el[3],
      };
    });
    return dataWithoutPercentage;
  }

  fetchTradeHistoryData() {
    if (!this.fetchAllowed) return;

    const exchangeValue = (this.exchange && this.exchange.exchange) || "bitmex";
    const exchange = exchangeValue === "bitmex_test" ? "bitmex" : exchangeValue;

    let apiUrl = `/api/tradehistory/${exchange}/${this.selectedPair}`;
    if (exchange === "kucoin" || exchange === "ftx") {
      let pairSymbol = this.selectedPair;
      if (exchange === "ftx") {
        pairSymbol = pairSymbol.replace("/", "_");
      }
      apiUrl = `/api/price/orderhistories/${exchange}/${pairSymbol}`;
    }
    this.$http
      .get<any>(apiUrl)
      .then(({ data: { result } }: any) => {
        this.data = result;

        setTimeout(() => {
          this.fetchTradeHistoryData();
        }, 60000);
      })
      .catch(({ response: { data } }) => {
        this.$notify({ text: data.error, type: "error" });
      });
  }
}
</script>

<style lang="scss" scoped>
.trade-history {
  &__list-wrap {
    @apply relative;
    &::after {
      content: "";
      @apply absolute left-0 bottom-0 h-10 w-full opacity-70 z-10;
      background: linear-gradient(#1b313a);
    }
  }
}

.items-wrap {
  @media (min-width: 768px) {
    height: 130px;
  }
}
</style>
