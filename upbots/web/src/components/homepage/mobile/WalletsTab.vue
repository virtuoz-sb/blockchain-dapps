<template>
  <div class="flex flex-col flex-grow mt-20 overflow-y-auto custom-scrollbar">
    <!-- HOME CAROUSEL -->
    <HomepageCarousel class="flex items-center justify-center flex-shrink-0 shadow-110 text-white rounded-5 mb-40" />

    <!-- MY WALLETS -->
    <div class="flex flex-col flex-shrink-0 px-20 mb-40">
      <p class="text-iceberg leading-xs mb-20">My Portfolios</p>

      <MyWallets
        :data="myWalletsData"
        :sortField="sortField"
        :sortType="sortType"
        :balance="myWalletsBalance"
        class="flex flex-col flex-grow overflow-y-auto custom-scrollbar"
      />
    </div>

    <!-- STAKING -->
    <div class="flex flex-col flex-shrink-0 px-20 mb-40">
      <p class="text-iceberg leading-xs mb-20">Staking</p>

      <Staking class="flex flex-col" />
    </div>

    <!-- PORTFOLIO EVOLUTION -->
    <div class="portfolio-evolution-chart__wrap flex flex-col flex-shrink-0">
      <p class="text-iceberg leading-xs mb-20 px-20">Portfolio Evolution</p>
      <PortfolioEvolution
        :key="$breakpoint.width && $breakpoint.height"
        :portfolio-evolution-data="portfolioEvolutionData"
        :active-currencies-names="activeCurrenciesNames"
        :line-chart-labels="lineChartLabels"
        class="h-full"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import MyWallets from "@/components/homepage/MyWallets.vue";
import Balances from "@/components/homepage/Balances.vue";
import HomepageCarousel from "@/components/homepage/HomepageCarousel.vue";
import Staking from "@/components/homepage/StakingNew.vue";

@Component({ name: "WalletsTab", components: { HomepageCarousel, MyWallets, Balances, Staking } })
export default class WalletsTab extends Vue {
  /* PROPS */
  @Prop({ required: true }) myWalletsData: any;
  @Prop({ required: true }) myWalletsBalance: any;
  @Prop({ required: true }) balancesWallet: any;
  @Prop({ required: true }) portfolioEvolutionData: any;
  @Prop({ required: true }) activeCurrenciesNames: any;
  @Prop({ required: true }) lineChartLabels: any;
  @Prop() sortField: string;
  @Prop() sortType: string;
}
</script>

<style lang="scss" scoped>
.portfolio-evolution-chart {
  &__wrap {
    height: 400px;
  }
}

::v-deep .baances {
  &__list-wrap {
    height: 214px;
  }
}
</style>
