<template>
  <div class="flex flex-col pt-20 h-full overflow-y-auto custom-scrollbar">
    <div class="flex items-center flex-shrink-0 px-20 mb-20">
      <div class="text-iceberg text-md leading-md mr-12 md:mr-8">Wallets:</div>
      <AppDropdownMultiple
        :value="selectedWallets"
        :options="wallets"
        placeholder="Select your wallet"
        key-label="name"
        multiple
        dark
        @change="handleWalletSelection"
      />
    </div>

    <div class="chart-tables__wrap flex flex-col h-full relative overflow-y-auto custom-scrollbar">
      <!-- PORTFOLIO DISTRIBUTION CHART -->
      <PortfolioDistributionChart
        :key="selectedWallets.length"
        :portfolio-distribution-data="portfolioDistributionData"
        class="portfolio-distribution-chart-mobile relative px-20 mb-20"
      />

      <!-- PORTFOLIO DISTRITUTION TABLE -->
      <div class="flex flex-col flex-shrink-0 mb-40">
        <p class="leading-md text-iceberg mb-20 px-10">Coin distribution table</p>
        <PortfolioDistributionTable
          :portfolio-distribution-table-data="portfolioDistributionTableData"
          :currency="currency"
          class="relative"
        />
      </div>

      <!-- PORTFOLIO EVOLUTION -->
      <div class="portfolio-evolution-chart-mobile__wrap flex flex-col flex-shrink-0">
        <p class="w-full leading-md text-iceberg mb-20 px-20">Portfolio evolution</p>
        <PortfolioEvolution
          :key="$breakpoint.width"
          :portfolio-evolution-data="portfolioEvolutionData"
          :active-currencies-names="activeCurrenciesNames"
          chart-classes="px-5"
          class="portfolio-evolution-chart-mobile"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { FavoriteCurrency, DistributionTable, PortfolioPercentage, PortfolioEvolution } from "@/components/portfolio/types/portfolio.types";
import { AccountTotal } from "@/store/portfolio/types";
import { namespace } from "vuex-class";

const user = namespace("userModule");

import PortfolioDistributionChart from "@/components/portfolio/PortfolioDistributionChart.vue";
import PortfolioDistributionTable from "@/components/portfolio/PortfolioDistributionTable.vue";

@Component({
  name: "ChartTableMobile",
  components: { PortfolioDistributionChart, PortfolioDistributionTable },
})
export default class ChartTableMobile extends Vue {
  /* VUEX */
  @user.Action handleWalletSelection!: any;

  /* PROPS */
  @Prop({ required: true }) portfolioDistributionData: PortfolioPercentage[];
  @Prop({ required: true }) portfolioDistributionTableData: DistributionTable[];
  @Prop({ required: true }) portfolioEvolutionData: PortfolioEvolution[];
  @Prop({ required: true }) activeCurrenciesNames: string;
  @Prop({ required: true }) currency: FavoriteCurrency;
  @Prop({ required: true }) selectedWallets: string;
  @Prop({ required: true }) wallets: AccountTotal[];
}
</script>

<style lang="scss" scoped>
::v-deep .portfolio-evolution-chart {
  @apply h-full;
}

.portfolio-distribution-chart-mobile {
  height: 300px;
}

.portfolio-evolution-chart-mobile {
  @apply h-full;
  &__wrap {
    height: 400px;
  }
}
</style>
