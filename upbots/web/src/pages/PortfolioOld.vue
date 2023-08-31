<template>
  <GeneralLayout title="Portfolio Monitoring (CEXs)">
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex h-full w-full relative">
      <div class="flex flex-col min-w-200 xl:min-w-280 max-w-200 xl:max-w-280 w-full mr-20 lg:mr-30 xl:mr-40">
        <!-- PORTFOLIO BALANCE -->
        <Card
          class="flex flex-col relative min-h-165 gradient-2 shadow-110 rounded-5 mb-20 lg:mb-30 xl:mb-40"
          header-classes="flex items-center"
        >
          <template slot="header-left">
            <span class="leading-md text-white">Portfolio Balance</span>
          </template>

          <PortfolioBalance slot="content" :data="balance" :currency-key="favoriteCurrency && favoriteCurrency.value" />
        </Card>

        <!-- MY WALLETS -->
        <Card
          class="flex flex-col h-full relative gradient-2 shadow-110 rounded-5 overflow-y-auto custom-scrollbar"
          header-classes="flex items-center"
        >
          <template slot="header-left">
            <span class="leading-md text-white">My Wallets</span>
          </template>

          <MyWallets
            slot="content"
            :wallets="accounts"
            :currency-key="favoriteCurrency && favoriteCurrency.value"
            @select-all="selectAllWallets(true)"
          />
        </Card>
      </div>

      <div class="portfolio__right-side flex flex-col w-full h-full">
        <div class="portfolio-distribution__wrap flex justify-between w-full mb-20 lg:mb-30 xl:mb-40">
          <!-- PORTFOLIO DISTRIBUTION CHART -->
          <Card class="flex flex-col w-2/5 relative gradient-2 shadow-110 rounded-5" header-classes="flex items-center justify-between">
            <template slot="header-left">
              <span class="leading-md text-white">Portfolio Distribution Chart</span>
            </template>
            <template slot="header-right">
              <span class="text-sm leading-xs text-blue-cl-400 text-right cursor-pointer">{{ activeCurrenciesNames }}</span>
            </template>

            <PortfolioDistributionChart
              slot="content"
              :is-rerender="isRerenderChart"
              :key="selectedWallets.length"
              :portfolio-distribution-data="getPortfolioPercentageData"
              class="flex justify-center items-center w-full h-full overflow-y-hidden overflow-x-hidden p-20"
            />
          </Card>

          <!-- PORTFOLIO DISTRIBUTION TABLE -->
          <Card
            class="flex flex-col w-3/5 relative gradient-2 shadow-110 rounded-5 ml-20 lg:ml-30 xl:ml-40 overflow-y-auto custom-scrollbar"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <span class="leading-md text-white">Portfolio Distribution Table</span>
            </template>
            <template slot="header-right">
              <span class="text-sm leading-xs text-blue-cl-400 text-right cursor-pointer">{{ activeCurrenciesNames }}</span>
            </template>

            <PortfolioDistributionTable
              slot="content"
              :portfolio-distribution-table-data="getDistributionTableData"
              :currency="favoriteCurrency"
            />
          </Card>
        </div>

        <!-- PORTFOLIO EVOLUTION -->
        <div class="portfolio-evolution__inner">
          <PortfolioEvolution
            :key="$breakpoint.width"
            class="flex flex-col justify-between w-full h-full relative gradient-2 shadow-110 rounded-3 overflow-y-auto md:overflow-visible custom-scrollbar"
            :portfolio-evolution-data="portfolioEvolutionData"
            :active-currencies-names="activeCurrenciesNames"
          />
        </div>
      </div>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="!isComingSoon" class="flex flex-col w-full relative gradient-2 shadow-110 rounded-t-15">
        <!-- APP TABS -->
        <AppTabs :tabs="tabs" shrink>
          <template v-slot="{ currentTab }">
            <template v-if="currentTab.componentName === 'MyWalletsMobile'">
              <MyWalletsMobile :balance="balance" :wallets="accounts" :currency-key="favoriteCurrency && favoriteCurrency.value" />
            </template>

            <template v-if="currentTab.componentName === 'ChartTableMobile'">
              <ChartTableMobile
                ref="tab"
                :portfolio-distribution-data="getPortfolioPercentageData"
                :portfolio-distribution-table-data="getDistributionTableData"
                :portfolio-evolution-data="portfolioEvolutionData"
                :active-currencies-names="activeCurrenciesNames"
                :currency="favoriteCurrency"
                :selected-wallets="selectedWallets"
                :wallets="accounts"
                message="No Data Available"
              />
            </template>
          </template>
        </AppTabs>
      </div>

      <!-- COMING SOON -->
      <div v-if="isComingSoon" class="flex flex-col w-full">
        <ComingSoonWithoutDesign />
      </div>
    </template>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Mutation, State, namespace } from "vuex-class";
import { BtcAmount, AccountTotal, DistributionChartData } from "@/store/portfolio/types";
import { Tab } from "@/models/interfaces";
import debounce from "@/core/debounce";
import { ComingSoon } from "@/core/mixins/coming-soon";

const user = namespace("userModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import PortfolioBalance from "@/components/portfolio/PortfolioBalance.vue";
import MyWallets from "@/components/portfolio/MyWallets.vue";
import PortfolioDistributionChart from "@/components/portfolio/PortfolioDistributionChart.vue";
import PortfolioDistributionTable from "@/components/portfolio/PortfolioDistributionTable.vue";
import MyWalletsMobile from "@/components/portfolio/MyWalletsMobile.vue";
import ChartTableMobile from "@/components/portfolio/ChartTableMobile.vue";

@Component({
  name: "Portfolio",
  components: {
    GeneralLayout,
    PortfolioBalance,
    MyWallets,
    PortfolioDistributionChart,
    PortfolioDistributionTable,
    MyWalletsMobile,
    ChartTableMobile,
  },
  mixins: [ComingSoon],
})
export default class Portfolio extends Vue {
  /* VUEX */
  @State isLoading: boolean;
  @user.State balance: BtcAmount;
  @user.State accounts: AccountTotal[];
  @user.State favoriteCurrency: any;
  @user.State selectedWallets: any;
  @user.Getter activeCurrenciesNames!: any;
  @user.Getter portfolioEvolutionData!: any;
  @user.Getter getDistributionTableData!: any;
  @user.Action fetchPortfolioEvolution!: any;
  @user.Getter getPortfolioPercentageData!: any;
  @user.Mutation portfolioSelected!: any;
  @user.Action fetchFilteredPortfolio!: any;

  /* REFS */
  $refs!: {
    tab: any;
  };

  /* DATA */
  tabs: Tab[] = [
    { value: "My Portfolios", componentName: "MyWalletsMobile" },
    { value: "Chart Tables", componentName: "ChartTableMobile" },
  ];

  isRerenderChart: boolean = false;

  /* WATCHERS */

  @debounce(300)
  @Watch("$breakpoint.smAndDown", { deep: true })
  handleChart() {
    if (!this.$breakpoint.smAndDown) {
      this.isRerenderChart = true;
    } else {
      this.isRerenderChart = false;
    }
  }

  /* HOOKS */
  created() {
    this.initialFetch();
  }

  /* METHODS */
  initialFetch() {
    Promise.all([this.fetchPortfolioEvolution(), this.selectAllWallets(false)]);
  }

  selectAllWallets(unselect: boolean = true) {
    const allWallets = unselect ? [] : this.accounts.map((w: any) => w.name);
    this.portfolioSelected(allWallets);
    return this.fetchFilteredPortfolio();
  }
}
</script>

<style lang="scss" scoped>
.portfolio-distribution {
  &__wrap {
    height: calc(100% - 385px);
    @media (max-width: 1023px) {
      height: calc(100% - 375px);
    }
  }
}

.portfolio-evolution {
  &__inner {
    height: 345px;
  }
}
</style>
