<template>
  <div class="flex flex-col md:flex-row w-full md:h-full overflow-y-auto custom-scrollbar md:overflow-y-visible">
    <!-- POSITIVE -->
    <div class="order-book__list-wrap flex flex-col w-full overflow-y-auto custom-scrollbar md:overflow-y-visible">
      <ul class="grid grid-cols-3 items-center py-15 md:py-11 px-5 border-b border-solid border-grey-cl-400 md:border-none">
        <li v-for="(item, index) in labels" :key="index" class="text-base md:text-xxs xl:text-xs leading-md text-hidden-sea-glass">
          {{ item }}
        </li>
      </ul>

      <div class="flex flex-col md:h-full mt-20 md:mt-0 overflow-y-auto custom-scrollbar md:overflow-y-visible">
        <virtual-list
          v-if="bidsOrderBook"
          class="md:h-200 overflow-y-auto custom-scrollbar"
          :data-key="'id'"
          :data-sources="bidsOrderBook"
          :data-component="Item"
          :estimate-size="50"
        />
      </div>
    </div>

    <!-- DIVIDER -->
    <div v-if="!$breakpoint.smAndDown" class="trade-card__divider w-px flex flex-shrink-0 self-end" />

    <!-- NEGATIVE -->
    <div class="order-book__list-wrap flex flex-col w-full overflow-y-auto custom-scrollbar md:overflow-y-visible">
      <ul class="grid grid-cols-3 items-center py-15 md:py-11 px-5 border-b border-solid border-grey-cl-400 md:border-none">
        <li
          v-for="(item, index) in labels"
          :key="index"
          class="text-base md:text-xxs xl:text-xs leading-md text-hidden-sea-glass mr-0 md:mr-4 md:last:mr-0"
        >
          {{ item }}
        </li>
      </ul>

      <div class="flex flex-col md:h-full mt-20 md:mt-0 overflow-y-auto custom-scrollbar md:overflow-y-visible">
        <VirtualList
          v-if="asksOrderBook"
          class="h-200 overflow-y-auto custom-scrollbar"
          :data-key="'id'"
          :data-sources="asksOrderBook"
          :data-component="Item"
          :estimate-size="50"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { IOrderBookItem } from "@/models/interfaces";
import { ExchangePairSettings } from "@/store/trade/types";

const trade = namespace("tradeModule");
const orderBook = namespace("orderBookModule");

import OrderBookItem from "./OrderBookItem.vue";
import VirtualList from "vue-virtual-scroll-list";

@Component({ name: "OrderBook", components: { VirtualList } })
export default class OrderBook extends Vue {
  /* VUEX */
  @trade.State selectedCurrencyPair: ExchangePairSettings;
  @trade.State exchange: any;
  @trade.State formatPrecision: any;
  @orderBook.State orderBook: any;
  @orderBook.Action fetchOrderBook: any;

  /* PROPS */
  @Prop({ default: () => ["Amount", "Total", "Price"] }) labels: string[];
  @Prop({ default: false }) orderState: boolean;

  /* DATA */
  Item: Object = OrderBookItem;
  fetchAllowed: boolean = true;

  /* COMPUTED */
  get bidsOrderBook() {
    return this.orderBook ? this.orderBookInfo(this.orderBook.bids, "green") : null;
  }

  get asksOrderBook() {
    return this.orderBook ? this.orderBookInfo(this.orderBook.asks, "red") : null;
  }

  get selectedPair() {
    const currencyPair: any = this.selectedCurrencyPair;
    let pairSymbol = currencyPair.symbol;
    // `${currencyPair.baseCurrency}${currencyPair.quoteCurrency}`;
    return pairSymbol;
  }

  /* WATCHERS */
  @Watch("selectedPair", { immediate: true })
  handler() {
    this.fetchAllowed = true;
    this.fetchOrderBookData();
  }

  /* HOOKS */
  beforeDestroy() {
    this.fetchAllowed = false;
  }

  /* METHODS */
  orderBookInfo(data: any, progressCollor: string) {
    const dataWithoutPercentage = data.map((el: number[], index: number) => {
      return {
        id: index,
        amount: this.formatPrice(Number(el[1])),
        price: this.formatPrice(Number(el[0])),
        total: this.formatPrice(Number(el[0]) * Number(el[1])),
        progressBarColor: progressCollor,
      };
    });
    return this.orderBookWithPercentages(dataWithoutPercentage);
  }

  // Set percentage to OrderBook data
  orderBookWithPercentages(data: IOrderBookItem[]) {
    const max = Math.max(...data.map((i: IOrderBookItem) => i.total));
    return data.map((el: IOrderBookItem) => {
      return {
        ...el,
        percentage: (100 * el.total) / max,
      };
    });
  }

  fetchOrderBookData() {
    if (!this.fetchAllowed) return;
    if (!this.exchange || !this.exchange.exchange) return;
    const exchangeValue = (this.exchange && this.exchange.exchange) || "bitmex";
    const exchange = exchangeValue === "bitmex_test" ? "bitmex" : exchangeValue;
    this.fetchOrderBook({ exchange: exchange, selectedPair: this.selectedPair, pairSetting: this.selectedCurrencyPair })
      .then(() => {
        setTimeout(() => {
          this.fetchOrderBookData();
        }, 3000);
      })
      .catch(({ response: { data } }: any) => {
        this.$notify({ text: data.error, type: "error" });
      });
  }

  formatPrice(price: number) {
    if (!price) {
      return "N/A";
    } else if (parseFloat(price.toFixed(2)) !== 0) {
      return price.toFixed(2);
    } else {
      let i = 3;
      while (parseFloat(price.toFixed(i)) === 0) i++;
      return price.toFixed(i);
    }
  }
}
</script>

<style lang="scss" scoped>
.order-book {
  &__list-wrap {
    @apply relative;
    @media (min-width: 768px) {
      &::after {
        content: "";
        @apply absolute left-0 bottom-0 h-10 w-full opacity-70 z-10;
        background: linear-gradient(#1b313a);
      }
    }
    @media (max-width: 767px) {
      height: 50%;
    }
  }
}

.trade-card {
  &__divider {
    @media (min-width: 768px) {
      background: linear-gradient(#929cb2 0%, rgba(71, 76, 87, 0) 100%);
      height: 85%;
    }
  }
  &__expand-icon {
    font-size: 6px;
    &.green {
      background-blend-mode: overlay, normal, normal;
      text-shadow: 0px 0px 7px rgba(89, 167, 51, 0.5);
    }
    &.red {
      background-blend-mode: normal, overlay, normal, normal;
      text-shadow: 0px 0px 7px rgba(255, 49, 34, 0.5);
    }
  }
}
</style>
