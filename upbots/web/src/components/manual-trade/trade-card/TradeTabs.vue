<template>
  <AppTabs :tabs="tabs" shrink :key="selectedCurrencyPair.label" class="flex flex-col bg-dark-200 rounded-3">
    <template v-slot="{ currentTab }">
      <!-- ORDER BOOK -->
      <div v-if="currentTab.value === `Order Book ${selectedCurrencyPair.label}`" class="flex h-full overflow-hidden">
        <OrderBook />
      </div>

      <!-- TRADE HISTORY -->
      <div v-if="currentTab.value === 'Trade History'" class="flex h-full overflow-hidden">
        <TradeHistory />
      </div>
    </template>
  </AppTabs>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";

const trade = namespace("tradeModule");

import OrderBook from "@/components/manual-trade/trade-card/OrderBook.vue";
import TradeHistory from "@/components/manual-trade/trade-card/TradeHistory.vue";

@Component({ name: "TradeTabs", components: { OrderBook, TradeHistory } })
export default class TradeTabs extends Vue {
  /* VUEX */
  @trade.State selectedCurrencyPair: any;

  /* COMPUTED */
  get tabs() {
    return [{ value: `Order Book ${this.selectedCurrencyPair.label}` }, { value: "Trade History" }];
  }
}
</script>

<style lang="scss" scoped>
::v-deep .trade-card {
  &__divider {
    background: linear-gradient(#929cb2 0%, rgba(71, 76, 87, 0) 100%);
    height: 85%;
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
