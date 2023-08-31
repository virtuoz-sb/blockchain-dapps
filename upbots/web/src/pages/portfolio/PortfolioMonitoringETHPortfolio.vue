<template>
  <div class="flex flex-col w-full h-full overflow-y-auto custom-scrollbar">
    <!-- TABLET, DESKTOP VIEWS -->
    <template v-if="!$breakpoint.smAndDown">
      <div class="balance__card-wrap grid grid-cols-4 md:col-gap-30 mb-20 lg:mb-30">
        <!-- SELECT WALLET -->
        <Card class="flex flex-col flex-grow bg-dark-200 rounded-3" header-classes="flex items-center">
          <template slot="header-left">
            <span class="leading-md text-iceberg">Select your wallet</span>
          </template>

          <DexWallets slot="content" class="flex flex-col flex-grow" />
        </Card>

        <!-- NET WORTH -->
        <CurrencyCard
          :title="getNetworth.title"
          :currency-key="favoriteCurrency && favoriteCurrency.value"
          :balanceData="getNetworth"
          currency-value-class="text-bright-turquoise"
        >
          <div slot="header-icon" class="flex items-center">
            <span class="icon-info text-iceberg ml-4 tooltip">
              <span class="tooltiptext">Networth on projects supported by the api of our partner Covalent.</span>
            </span>
          </div>
        </CurrencyCard>

        <!-- TOTAL ASSETS -->
        <CurrencyCard
          :title="getAssets.title"
          :currency-key="favoriteCurrency && favoriteCurrency.value"
          :balanceData="getAssets"
          currency-value-class="text-green-cl-200"
        >
          <span class="icon-accordion-plus text-xxl1 text-green-cl-200 mr-16" />
        </CurrencyCard>

        <!-- TOTAL DEBTS -->
        <CurrencyCard
          :title="getDebts.title"
          :currency-key="favoriteCurrency && favoriteCurrency.value"
          :balanceData="getDebts"
          currencyValueClass="text-red-cl-100"
        >
          <span class="icon-accordion-minus text-xxl1 text-red-cl-100 mr-16" />
        </CurrencyCard>
      </div>

      <div class="flex flex-col flex-shrink-0 lg:flex-row lg:grid lg:grid-cols-2 lg:col-gap-30 mb-20 lg:mb-30">
        <!-- PORTFOLIO DISTRIBUTION -->
        <Card
          class="flex flex-col flex-shrink-0 h-full relative bg-dark-200 rounded-3 max-h-300 min-h-300 mb-20 lg:mb-0 overflow-y-auto custom-scrollbar"
          header-classes="flex items-center justify-between"
        >
          <template slot="header-left">
            <span class="leading-md text-iceberg">Portfolio Distribution</span>
            <div class="flex items-center ml-4">
              <span class="icon-info text-red-cl-200 ml-4 tooltip">
                <span class="tooltiptext">Portfolio distribution by the api of our partner Covalent.</span>
              </span>
            </div>
          </template>

          <PortfolioDistributionTable
            slot="content"
            :portfolio-distribution-table-data="getPortfolioDistribution"
            :currency="favoriteCurrency"
          />
        </Card>

        <!-- PORTFOLIO EVOLUTION -->
        <PortfolioEvolution
          :key="$breakpoint.width"
          :portfolio-evolution-data="getPortfolioEvolution"
          :active-currencies-names="activeCurrenciesNames"
          class="portfolio-evolution__wrap flex flex-col flex-shrink-0 justify-between h-full bg-dark-200 rounded-3 overflow-y-auto md:overflow-visible custom-scrollbar"
        />
      </div>

      <!-- PROJECT DETAILS -->
      <ProjectsDetails class="flex flex-col flex-shrink-0" />

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </template>

    <!-- MOBILE VIEW -->
    <template v-else>
      <div v-if="!isComingSoon" class="flex flex-col w-full flex-grow relative bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
        <AppTabs :tabs="mobileViewTabs" shrink>
          <template v-slot="{ currentTab }">
            <!-- MY PORTFOLIOS TAB -->
            <template v-if="currentTab.componentName === 'MyPortfolios'">
              <div class="flex flex-col flex-grow my-20 px-24 overflow-y-auto custom-scrollbar">
                <!-- SELECT WALLET -->
                <Card class="flex flex-col flex-grow flex-shrink-0 bg-dark-200 rounded-3 mb-20" header-classes="flex items-center">
                  <template slot="header-left">
                    <span class="leading-md text-iceberg">Select your wallet</span>
                  </template>

                  <DexWallets slot="content" class="flex flex-col flex-grow" />
                </Card>

                <!-- NET WORTH -->
                <CurrencyCard
                  :title="getNetworth.title"
                  :currency-key="favoriteCurrency && favoriteCurrency.value"
                  :balanceData="getNetworth"
                  class="flex-shrink-0 mb-20"
                />

                <!-- TOTAL ASSETS -->
                <CurrencyCard
                  :title="getAssets.title"
                  :currency-key="favoriteCurrency && favoriteCurrency.value"
                  :balanceData="getAssets"
                  class="flex-shrink-0 mb-20"
                >
                  <i class="icon-accordion-plus text-xxl1 text-green-cl-200 mr-16" />
                </CurrencyCard>

                <!-- TOTAL DEBTS -->
                <CurrencyCard
                  :title="getDebts.title"
                  :currency-key="favoriteCurrency && favoriteCurrency.value"
                  :balanceData="getDebts"
                  class="flex-shrink-0"
                >
                  <i class="icon-accordion-minus text-xxl1 text-red-cl-100 mr-16" />
                </CurrencyCard>
              </div>
            </template>

            <!-- CHART & TABLE TAB -->
            <template v-if="currentTab.componentName === 'Chart/Tables'">
              <div class="flex flex-col flex-grow relative my-20 overflow-y-auto custom-scrollbar">
                <!-- PORTFOLIO DISTRITUTION TABLE -->
                <div class="flex flex-col flex-shrink-0 relative mb-40">
                  <p class="leading-md text-iceberg mb-20 px-10">Coin distribution table</p>
                  <PortfolioDistributionTable
                    :portfolio-distribution-table-data="getPortfolioDistribution"
                    :currency="favoriteCurrency"
                    class="relative"
                  />
                </div>

                <!-- PORTFOLIO EVOLUTION CHART -->
                <div class="portfolio-evolution__inner flex flex-col flex-shrink-0">
                  <p class="w-full leading-md text-iceberg mb-20 px-20">Portfolio evolution</p>
                  <PortfolioEvolution
                    :key="$breakpoint.width"
                    :portfolio-evolution-data="getPortfolioEvolution"
                    :active-currencies-names="activeCurrenciesNames"
                    chart-classes="px-5"
                    class="portfolio-evolution__wrap h-full"
                  />
                </div>
              </div>
            </template>

            <!-- PROJECTS DETAILS -->
            <template v-if="currentTab.componentName === 'ProjectsDetails'">
              <ProjectsDetails class="flex flex-col mt-10 overflow-y-auto custom-scrollbar" />
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
import { Tab } from "@/models/interfaces";
import { FavoriteCurrency, DistributionTable, PortfolioEvolution } from "@/components/portfolio/types/portfolio.types";
import { DexWallet } from "@/store/dex-monitoring/types";
import { ComingSoon } from "@/core/mixins/coming-soon";
import debounce from "@/core/debounce";

const user = namespace("userModule");
const dexMonitoring = namespace("dexMonitoringModule");

import CurrencyCard from "@/components/portfolio/CurrencyCard.vue";
import DexWallets from "@/components/portfolio-monitoring-eth-wallet/DexWallets.vue";
import ProjectsDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/ProjectsDetails.vue";
import PortfolioDistributionTable from "@/components/portfolio/PortfolioDistributionTable.vue";
import { BtcAmount } from "@/store/portfolio/types";

@Component({
  name: "PortfolioMonitoringETHPortfolio",
  components: {
    CurrencyCard,
    DexWallets,
    ProjectsDetails,
    PortfolioDistributionTable,
  },
  mixins: [ComingSoon],
})
export default class PortfolioMonitoringETHPortfolio extends Vue {
  /* VUEWX */
  @user.State favoriteCurrency: FavoriteCurrency;
  @user.Getter activeCurrenciesNames!: string;
  @dexMonitoring.Getter isLoading: boolean;
  @dexMonitoring.Getter getAssets: BtcAmount;
  @dexMonitoring.Getter getDebts: BtcAmount;
  @dexMonitoring.Getter getNetworth: BtcAmount;
  @dexMonitoring.Getter getPortfolioDistribution: DistributionTable[];
  @dexMonitoring.Getter getPortfolioEvolution: PortfolioEvolution;
  @dexMonitoring.Getter getSelectedWallet: DexWallet;
  @dexMonitoring.Action loadWallets: () => Promise<void>;

  /* DATA */
  isRerenderChart: boolean = false;

  mobileViewTabs: Tab[] = [
    { value: "My Portfolios", componentName: "MyPortfolios" },
    { value: "Chart/Tables", componentName: "Chart/Tables" },
    { value: "Projects details", componentName: "ProjectsDetails" },
  ];

  @debounce(300)
  @Watch("$breakpoint.smAndDown", { deep: true })
  handleChart() {
    if (!this.$breakpoint.smAndDown) {
      this.isRerenderChart = true;
    } else {
      this.isRerenderChart = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.balance {
  &__card-wrap {
    @media (max-width: 1439px) {
      @apply col-gap-20;
    }
    @media (max-width: 997px) {
      @apply grid-cols-2 row-gap-20;
    }
  }
}

.portfolio-evolution {
  &__inner {
    @media (max-width: 767px) {
      height: 400px;
    }
  }
  &__wrap {
    @media (min-width: 768px) {
      height: 300px;
    }
  }
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 250px;
  font-family: "Lato", sans-serif;
  background-color: #2d3037;
  color: #fff;
  text-align: center;
  border: solid 3px #6ed4ca;
  border-radius: 6px;
  padding: 8px 4px;
  position: absolute;
  z-index: 1;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
