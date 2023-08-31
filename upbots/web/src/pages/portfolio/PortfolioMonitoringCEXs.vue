<template>
  <div class="flex flex-col h-full w-full relative overflow-y-auto custom-scrollbar">
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex xl:h-full w-full relative">
      <!-- LEFT SIDE -->
      <div
        class="portfolio-monitoring-cexs__left-side flex flex-col flex-shrink-0 xl:min-w-280 xl:max-w-280 w-full mr-20 lg:mr-30 xl:mr-40"
      >
        <!-- TOTAL BALANCE -->
        <CurrencyCard
          title="Total Balance"
          :currency-key="favoriteCurrency && favoriteCurrency.value"
          :balanceData="cexBalance"
          class="mb-20 lg:mb-30 xl:mb-40"
        />

        <!-- MY WALLETS -->
        <Card
          class="flex flex-col flex-grow relative bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar"
          header-classes="flex items-center justify-between"
        >
          <template slot="header-left">
            <span class="leading-md text-iceberg">My Wallets</span>
          </template>
          <template slot="header-right">
            <span class="text-astral leading-md cursor-pointer" @click="changeSelectWallets">
              {{ selectUnselectWallet ? "Select All" : "Unselect All" }}
            </span>
          </template>

          <MyWallets slot="content" :wallets="accounts" :currency-key="favoriteCurrency && favoriteCurrency.value" />
        </Card>
      </div>

      <!-- RIGHT SIDE -->
      <div class="flex flex-col w-full flex-grow">
        <div class="portfolio-distribution__wrap flex flex-col xl:flex-row xl:justify-between w-full mb-20 xl:mb-40">
          <!-- PORTFOLIO DISTRIBUTION CHART -->
          <Card
            class="portfolio-distribution-chart__inner flex flex-col w-full xl:w-2/5 relative bg-dark-200 rounded-3 mb-20 xl:mb-0"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <span class="leading-md text-iceberg">Portfolio Distribution Chart</span>
            </template>
            <template slot="header-right">
              <span class="text-sm leading-xs text-astral text-right cursor-pointer">{{ activeCurrenciesNames }}</span>
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
            class="portfolio-distribution-table__inner flex flex-col w-full xl:w-3/5 relative bg-dark-200 rounded-3 xl:ml-40 overflow-y-auto custom-scrollbar"
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
            :portfolio-evolution-data="portfolioEvolutionData"
            :active-currencies-names="activeCurrenciesNames"
            class="flex flex-col justify-between relative w-full h-full bg-dark-200 rounded-3 overflow-y-auto md:overflow-visible custom-scrollbar"
          />
        </div>
      </div>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="!isComingSoon" class="flex flex-col w-full flex-grow relative bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
        <AppTabs :tabs="mobileViewTabs" shrink>
          <template v-slot="{ currentTab }">
            <!-- MY WALLETS TAB -->
            <template v-if="currentTab.componentName === 'MyWalletsMobile'">
              <MyWalletsMobile :balance="cexBalance" :wallets="accounts" :currency-key="favoriteCurrency && favoriteCurrency.value">
                <div class="flex flex-col flex-shrink-0 p-20 mb-20 lg:mb-30 xl:mb-40">
                  <CurrencyCard
                    title="Total Balance"
                    :currency-key="favoriteCurrency && favoriteCurrency.value"
                    :balanceData="cexBalance"
                  />
                </div>
              </MyWalletsMobile>
            </template>

            <!-- CHART & TABLE TAB -->
            <template v-if="currentTab.componentName === 'ChartTableMobile'">
              <ChartTableMobile
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
      <div v-if="isComingSoon" class="flex flex-col flex-grow">
        <ComingSoonWithoutDesign />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { FavoriteCurrency, DistributionTable, PortfolioPercentage, PortfolioEvolution } from "@/components/portfolio/types/portfolio.types";
import { BtcAmount, AccountTotal } from "@/store/portfolio/types";
import { Tab } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";
import debounce from "@/core/debounce";

const user = namespace("userModule");

import CurrencyCard from "@/components/portfolio/CurrencyCard.vue";
import MyWallets from "@/components/portfolio/MyWallets.vue";
import PortfolioDistributionChart from "@/components/portfolio/PortfolioDistributionChart.vue";
import PortfolioDistributionTable from "@/components/portfolio/PortfolioDistributionTable.vue";
import MyWalletsMobile from "@/components/portfolio/MyWalletsMobile.vue";
import ChartTableMobile from "@/components/portfolio/ChartTableMobile.vue";

@Component({
  name: "PortfolioMonitoringCEXs",
  components: {
    CurrencyCard,
    MyWallets,
    PortfolioDistributionChart,
    PortfolioDistributionTable,
    MyWalletsMobile,
    ChartTableMobile,
  },
  mixins: [ComingSoon],
})
export default class PortfolioMonitoringCEXs extends Vue {
  /* VUEX */
  @user.State accounts: AccountTotal[];
  @user.State favoriteCurrency: FavoriteCurrency;
  @user.State selectedWallets: string;
  @user.Getter cexBalance!: BtcAmount;
  @user.Getter activeCurrenciesNames!: string;
  @user.Getter portfolioEvolutionData!: PortfolioEvolution[];
  @user.Getter getDistributionTableData!: DistributionTable[];
  @user.Getter getPortfolioPercentageData!: PortfolioPercentage[];
  @user.Mutation portfolioSelected!: any;
  @user.Action fetchPortfolioEvolution!: any;
  @user.Action fetchFilteredPortfolio!: any;

  /* DATA */
  mobileViewTabs: Tab[] = [
    { value: "My Wallets", componentName: "MyWalletsMobile" },
    { value: "Chart Tables", componentName: "ChartTableMobile" },
  ];
  isRerenderChart: boolean = false;

  selectUnselectWallet: boolean = false;

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

  async selectAllWallets(unselect: boolean = true) {
    const allWallets = unselect ? [] : this.accounts.map((w: AccountTotal) => w.name);
    this.portfolioSelected(allWallets);
    await this.fetchPortfolioEvolution();
    await this.fetchFilteredPortfolio();
  }

  changeSelectWallets() {
    this.selectUnselectWallet = !this.selectUnselectWallet;
    this.selectAllWallets(this.selectUnselectWallet);
  }
}
</script>

<style lang="scss" scoped>
.portfolio-monitoring-cexs {
  &__left-side {
    @media (max-width: 1279px) {
      min-width: 220px;
      max-width: 220px;
    }
  }
}
.portfolio-distribution {
  &__wrap {
    height: calc(100% - 385px);
    @media (max-width: 1279px) {
      height: calc(100% - 365px);
    }
  }
}

.portfolio-evolution {
  &__inner {
    height: 345px;
  }
}

.portfolio-distribution-chart {
  &__inner {
    @media (max-width: 1279px) {
      height: 300px;
    }
  }
}

.portfolio-distribution-table {
  &__inner {
    @media (max-width: 1279px) {
      height: 300px;
    }
  }
}
</style>
