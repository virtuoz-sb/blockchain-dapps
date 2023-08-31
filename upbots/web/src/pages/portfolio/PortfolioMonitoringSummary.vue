<template>
  <div v-if="!$breakpoint.smAndDown" class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
    <!-- CURRENCY CARD -->
    <div class="grid grid-cols-3 md:col-gap-32 xl:col-gap-42 mb-40">
      <CurrencyCard title="Total Net Balance" :currency-key="favoriteCurrency && favoriteCurrency.value" :balanceData="totalBalance">
        <div slot="header-icon-left" class="flex cursor-pointer" @click="refreshBalances">
          <span class="icon-ubxt-wallet text-xl1 text-astral mr-10" />
        </div>
        <div slot="header-icon-right" class="flex w-full justify-end cursor-pointer" @click="refreshBalances">
          <span class="icon-refresh text-iceberg ml-4" />
        </div>
      </CurrencyCard>

      <CurrencyCard title="Total CEXs" :currency-key="favoriteCurrency && favoriteCurrency.value" :balanceData="cexBalance">
        <div slot="header-icon-left" class="flex cursor-pointer" @click="refreshBalances">
          <span class="icon-cex text-xl1 text-astral mr-10" />
        </div>
      </CurrencyCard>

      <CurrencyCard title="Total DEXs" :currency-key="favoriteCurrency && favoriteCurrency.value" :balanceData="getNetworth">
        <div slot="header-icon-left" class="flex cursor-pointer" @click="refreshBalances">
          <span class="icon-dex text-xl1 text-astral mr-10" />
        </div>
      </CurrencyCard>
    </div>

    <div class="flex flex-grow flex-shrink-0 w-full">
      <div class="flex flex-col w-full flex-grow">
        <!-- PORTFOLIO EVOLUTION CHART -->
        <PortfolioEvolution
          :key="$breakpoint.width"
          :portfolio-evolution-data="totalPortfolioEvolution"
          :active-currencies-names="activeCurrenciesNames"
          class="portfolio-evolution__wrap flex flex-col justify-between relative w-full h-full bg-dark-200 rounded-3 mb-40 overflow-y-auto md:overflow-visible custom-scrollbar"
        />

        <!-- PORTFOLIO DISGRIBUTION TABLE -->
        <Card class="flex flex-col relative bg-dark-200 rounded-3" header-classes="flex items-center justify-between">
          <template slot="header-left">
            <span class="icon-list text-xl1 text-astral mr-10" />
            <span class="leading-md text-iceberg">Portfolio Distribution Table</span>
          </template>
          <template slot="header-right">
            <span class="text-sm leading-xs text-astral text-right cursor-pointer">{{ activeCurrenciesNames }}</span>
          </template>

          <PortfolioDistributionTable
            slot="content"
            :portfolio-distribution-table-data="totalDistributionTable"
            :currency="favoriteCurrency"
          />
        </Card>
      </div>
    </div>

    <!-- COMING SOON -->
    <ComingSoonDesktop v-if="isComingSoon" />
  </div>

  <!-- MOBILE CONTENT -->
  <div v-else class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
    <div v-if="!isComingSoon" class="flex flex-col w-full flex-grow relative bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
      <AppTabs :tabs="mobileViewTabs" shrink>
        <template v-slot="{ currentTab }">
          <!-- CURRENCY CARD TAB -->
          <template v-if="currentTab.componentName === 'CurrencyCardMobile'">
            <div class="flex flex-col flex-grow mt-20 px-24 overflow-y-auto custom-scrollbar">
              <CurrencyCard
                title="Total Net Balance"
                :currency-key="favoriteCurrency && favoriteCurrency.value"
                :balanceData="totalBalance"
                class="flex-shrink-0 mb-20"
              >
                <div slot="header-icon" class="flex justify-end flex-grow cursor-pointer" @click="refreshBalances">
                  <span class="icon-refresh text-iceberg ml-4" />
                </div>
              </CurrencyCard>

              <CurrencyCard
                title="Total CEXs"
                :currency-key="favoriteCurrency && favoriteCurrency.value"
                :balanceData="cexBalance"
                class="flex-shrink-0 mb-20"
              />

              <CurrencyCard
                title="Total DEXs"
                :currency-key="favoriteCurrency && favoriteCurrency.value"
                :balanceData="getNetworth"
                class="flex-shrink-0 mb-20"
              />
            </div>
          </template>

          <!-- CHART & TABLE TAB -->
          <template v-if="currentTab.componentName === 'ChartTableMobile'">
            <div class="flex flex-col flex-grow relative my-20 overflow-y-auto custom-scrollbar">
              <!-- PORTFOLIO DISTRITUTION TABLE -->
              <div class="flex flex-col flex-shrink-0 relative mb-40">
                <p class="leading-md text-iceberg mb-20 px-10">Coin distribution table</p>
                <PortfolioDistributionTable
                  :portfolio-distribution-table-data="totalDistributionTable"
                  :currency="favoriteCurrency"
                  class="relative"
                />
              </div>

              <!-- PORTFOLIO EVOLUTION CHART -->
              <div class="portfolio-evolution__inner flex flex-col flex-shrink-0">
                <p class="w-full leading-md text-iceberg mb-20 px-20">Portfolio evolution</p>
                <PortfolioEvolution
                  :key="$breakpoint.width"
                  :portfolio-evolution-data="totalPortfolioEvolution"
                  :active-currencies-names="activeCurrenciesNames"
                  chart-classes="px-5"
                  class="portfolio-evolution__wrap h-full"
                />
              </div>
            </div>
          </template>
        </template>
      </AppTabs>
    </div>

    <!-- COMING SOON -->
    <div v-if="isComingSoon" class="flex flex-col flex-grow">
      <ComingSoonWithoutDesign />
    </div>
  </div>
</template>

<script lang="ts">
import moment from "moment";
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { AccountTotal, BtcAmount } from "@/store/portfolio/types";
import { FavoriteCurrency, DistributionTable, PortfolioEvolution } from "@/components/portfolio/types/portfolio.types";
import { ComingSoon } from "@/core/mixins/coming-soon";
import { Tab } from "@/models/interfaces";
import { cloneDeep } from "@/core/helper-functions";

const user = namespace("userModule");
const dexMonitoring = namespace("dexMonitoringModule");

import CurrencyCard from "@/components/portfolio/CurrencyCard.vue";
import PortfolioDistributionTable from "@/components/portfolio/PortfolioDistributionTable.vue";

@Component({
  name: "PortfolioMonitoringSummary",
  components: { CurrencyCard, PortfolioDistributionTable },
  mixins: [ComingSoon],
})
export default class PortfolioMonitoringSummary extends Vue {
  /* VUEX */
  @user.State accounts: AccountTotal[];
  @user.State favoriteCurrency: FavoriteCurrency;
  @user.Getter cexBalance!: BtcAmount;
  @user.Getter activeCurrenciesNames!: string;
  @user.Getter getDistributionTableData!: DistributionTable[];
  @user.Getter portfolioEvolutionData: PortfolioEvolution;
  @user.Mutation portfolioSelected!: any;
  @user.Action fetchFilteredPortfolio!: any;
  @user.Action fetchPortfolioEvolution!: any;
  @dexMonitoring.Getter getPortfolioDistribution: DistributionTable[];
  @dexMonitoring.Getter getNetworth: BtcAmount;
  @dexMonitoring.Getter isLoading: boolean;
  @dexMonitoring.Getter getPortfolioEvolution: PortfolioEvolution;
  @dexMonitoring.Action fetchBalances: (payload: { liveFetch: boolean }) => Promise<void>;

  /* DATA */
  mobileViewTabs: Tab[] = [
    { value: "Total Balance", componentName: "CurrencyCardMobile" },
    { value: "Chart Tables", componentName: "ChartTableMobile" },
  ];

  totalDistributionTable: DistributionTable[] = [];
  totalPortfolioEvolution: PortfolioEvolution = null;

  /* COMPUTED */
  get totalBalance() {
    const cexBalance = this.cexBalance ? this.cexBalance : { usd: 0, btc: 0, eur: 0 };
    const dexBalance = this.getNetworth ? this.getNetworth : { usd: 0, btc: 0, eur: 0 };
    return {
      title: "Total Net Balance",
      usd: cexBalance.usd + dexBalance.usd,
      btc: cexBalance.btc + dexBalance.btc,
      eur: cexBalance.eur + dexBalance.eur,
    };
  }

  /* WATCHERS */
  @Watch("getPortfolioDistribution")
  @Watch("getDistributionTableData")
  updateTotalDistributionTable() {
    const res: DistributionTable[] = [];
    const formattedTokens: DistributionTable[] = cloneDeep(this.getDistributionTableData);

    formattedTokens.forEach((token) => {
      const existingToken = res.find(({ coin }) => token.coin === coin);
      if (existingToken) {
        existingToken.amount += token.amount;
        existingToken.usdValue += token.usdValue;
        existingToken.btcValue += token.btcValue;
        existingToken.eurValue += token.eurValue;
      } else {
        res.push({
          ...token,
          blockchain: "eth",
        });
      }
    });

    this.getPortfolioDistribution.forEach((token) => {
      const existingToken = res.find(({ coin, blockchain }) => token.coin === coin && token.blockchain === blockchain);
      if (existingToken) {
        existingToken.amount += token.amount;
        existingToken.usdValue += token.usdValue;
        existingToken.btcValue += token.btcValue;
        existingToken.eurValue += token.eurValue;
      } else {
        res.push(token);
      }
    });

    this.totalDistributionTable = res;
  }

  @Watch("portfolioEvolutionData")
  @Watch("getPortfolioEvolution")
  updateTotalPortfolioEvolution() {
    if (!this.getPortfolioEvolution) {
      this.totalPortfolioEvolution = cloneDeep(this.portfolioEvolutionData);
    } else if (!this.portfolioEvolutionData) {
      this.totalPortfolioEvolution = cloneDeep(this.getPortfolioEvolution);
    } else {
      const clonedEvolution: PortfolioEvolution = cloneDeep(this.portfolioEvolutionData);

      const datasets = clonedEvolution.datasets.map((dataset, i) => {
        return {
          ...dataset,
          data: dataset.data.map((cexNetworth, j) => {
            let index: number = -1;
            this.getPortfolioEvolution.labels.find((label, p) => {
              if (moment(clonedEvolution.labels[j]).isSame(moment(label), "day")) {
                index = p;
                return true;
              }
              return false;
            });

            return (parseFloat(cexNetworth) + (index >= 0 ? parseFloat(this.getPortfolioEvolution.datasets[i].data[index]) : 0)).toString();
          }),
        };
      });

      this.totalPortfolioEvolution = {
        labels: clonedEvolution.labels,
        datasets,
      };
    }
  }

  /* HOOKS */
  created() {
    this.selectAllWallets(false);
    this.updateTotalPortfolioEvolution();
    this.updateTotalDistributionTable();
  }

  /* METHODS */

  async selectAllWallets(unselect: boolean = true) {
    const allWallets = unselect ? [] : this.accounts.map((w: AccountTotal) => w.name);
    this.portfolioSelected(allWallets);
    await this.fetchPortfolioEvolution();
    await this.fetchFilteredPortfolio();
  }

  // manually balances refresh
  refreshBalances() {
    this.fetchPortfolioEvolution();
    this.fetchBalances({ liveFetch: true });
  }
}
</script>

<style lang="scss" scoped>
.portfolio-evolution {
  &__inner {
    @media (max-width: 767px) {
      height: 400px;
    }
  }
  &__wrap {
    @media (min-width: 768px) {
      height: 347px;
    }
  }
}
</style>
