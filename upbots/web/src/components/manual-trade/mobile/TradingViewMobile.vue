<template>
  <div class="flex flex-col flex-grow mt-20 overflow-y-auto custom-scrollbar">
    <div class="flex items-center justify-center flex-shrink-0 w-full px-20 mb-20">
      <AppDropdownBasic v-model="selectedMyOrdersComponent" :options="myOrdersComponents" dark />
    </div>

    <!-- ORDER BOOK -->
    <template v-if="selectedMyOrdersComponent.value === 'orderBook'">
      <OrderBook />
    </template>

    <!-- TRADE HISTORY -->
    <template v-if="selectedMyOrdersComponent.value === 'tradeHistory'">
      <TradeHistory class="flex-col overflow-y-auto custom-scrollbar" />
    </template>

    <!-- TRADING CHART -->
    <template v-if="selectedMyOrdersComponent.value === 'tradingView'">
      <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
        <TradingChart :symbol="widgetSymbol" class="flex-grow" />
      </div>
    </template>

    <!-- SENTIMENTS WIDGET -->
    <template v-if="selectedMyOrdersComponent.value === 'marketSentiments'">
      <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
        <SpeedGauge slot="content" :symbol="selectedCurrencyPair.label" class="flex flex-col flex-grow" />
      </div>
    </template>

    <!-- NEWS WIDGET -->
    <template v-if="selectedMyOrdersComponent.value === 'news'">
      <div class="flex flex-col flex-grow px-10 overflow-y-auto custom-scrollbar">
        <NewsWidget />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { GroupItems } from "@/models/interfaces";

const trade = namespace("tradeModule");

import TradingChart from "@/components/charts/TradingChart.vue";
import SpeedGauge from "@/components/manual-trade/widgets/SpeedGauge.vue";
import NewsWidget from "@/components/manual-trade/widgets/NewsWidget.vue";
import OrderBook from "@/components/manual-trade/trade-card/OrderBook.vue";
import TradeHistory from "@/components/manual-trade/trade-card/TradeHistory.vue";

@Component({ name: "TradingViewMobile", components: { TradingChart, SpeedGauge, NewsWidget, OrderBook, TradeHistory } })
export default class TradingViewMobile extends Vue {
  /* VUEX */
  @trade.State selectedCurrencyPair: any;
  @trade.Getter widgetSymbol: any;

  /* DATA */
  selectedMyOrdersComponent: GroupItems = { value: "tradingView", label: "Trading View" };
  myOrdersComponents: GroupItems[] = [
    { value: "tradingView", label: "Trading View" },
    { value: "orderBook", label: "Order Book" },
    { value: "tradeHistory", label: "Trade History" },
    { value: "marketSentiments", label: "Market Sentiments" },
    { value: "news", label: "News" },
  ];
}
</script>
