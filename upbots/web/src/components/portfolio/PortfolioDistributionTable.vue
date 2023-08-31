<template>
  <div
    class="portfolio-distribution-table__wrap flex flex-col h-full md:px-20 md:py-8 overflow-y-auto custom-scrollbar"
    :class="(loading.portfolioDistributionTable && 'loading') || (!portfolioDistributionTableData.length && 'disabled')"
  >
    <div class="flex flex-col h-full">
      <div class="grid grid-cols-4 col-gap-15 bg-gable-green mb-10 px-10 md:px-20">
        <span class="truncate text-md leading-xs text-hidden-sea-glass py-4">Coin</span>
        <span class="truncate text-md leading-xs text-hidden-sea-glass py-4">Amount</span>
        <span class="truncate text-md leading-xs text-hidden-sea-glass py-4">Value BTC</span>
        <span class="truncate text-md leading-xs text-hidden-sea-glass py-4">
          Value {{ (currency && currency.value) || "usd" | Upper }}
        </span>
      </div>
      <!-- PORTFOLIO DISTRIBUTION TABLE ROWS -->
      <div class="portfolio-distribution-table__items-wrap flex flex-col w-full px-10 md:px-20 overflow-y-auto custom-scrollbar">
        <PortfolioDistributionTableRow
          v-for="(item, index) in tableData"
          :key="index"
          :data="item"
          :currency="currency && currency.value"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const dummyData: DistributionTable[] = [
  {
    coin: "USDT",
    amount: 83307.06269212,
    btcValue: 7.225944185035739,
    usdValue: 83357.04692973527,
    eurValue: 70414.65829991776,
  },
  {
    coin: "SOL",
    amount: 2200.374,
    btcValue: 0.49338986201999996,
    usdValue: 5691.6467702903155,
    eurValue: 4807.936188426294,
  },
  {
    coin: "BTC",
    amount: 0.32152341,
    btcValue: 0.32152341,
    usdValue: 3709.029753078,
    eurValue: 3133.1491734270003,
  },
  {
    coin: "ETH",
    amount: 0.000018599999999999998,
    btcValue: 6.234905999999999e-7,
    usdValue: 0.007192462863479999,
    eurValue: 0.00607572884982,
  },
  {
    coin: "BNB",
    amount: 0.00010156000000000001,
    btcValue: 2.6985507600000004e-7,
    usdValue: 0.0031129941857208003,
    eurValue: 0.0026296567590972006,
  },
];

import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { DistributionTable, FavoriteCurrency } from "@/components/portfolio/types/portfolio.types";
import PortfolioDistributionTableRow from "@/components/portfolio/PortfolioDistributionTableRow.vue";

const user = namespace("userModule");

@Component({ name: "PortfolioDistributionTable", components: { PortfolioDistributionTableRow } })
export default class PortfolioDistributionTable extends Vue {
  @user.State loading: Object;

  /* PROPS */
  @Prop({ required: true }) portfolioDistributionTableData: DistributionTable[];
  @Prop({ required: true }) currency: FavoriteCurrency;

  /* COMPUTED */
  get tableData() {
    return this.portfolioDistributionTableData.length ? this.portfolioDistributionTableData : dummyData;
  }
}
</script>

<style lang="scss" scoped>
.portfolio-distribution-table {
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
  &__items-wrap {
    @media (max-width: 767px) {
      height: 110px;
    }
  }
}
</style>
