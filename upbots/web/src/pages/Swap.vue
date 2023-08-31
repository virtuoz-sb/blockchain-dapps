<template>
  <GeneralLayout title="Swap" content-custom-classes="md:flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" :class="!isComingSoon && 'overflow-y-auto custom-scrollbar'" class="flex flex-col w-full relative">
      <div
        class="flex flex-shrink-0 w-full"
        :class="[currentTab && currentTab.componentName === 'OrderBook' && 'overflow-y-auto custom-scrollbar']"
      >
        <!-- APP TABS -->
        <div
          class="tabs w-full h-auto bg-dark-200 rounded-3 mr-20 lg:mr-30 xl:mr-40 overflow-y-auto custom-scrollbar"
          :class="isShowOrders ? 'long' : 'short'"
        >
          <AppTabs :tabs="tabs" @change="changeTab">
            <template v-slot="{ currentTab }">
              <!-- FIND TRADE -->
              <template v-if="currentTab.componentName === 'FindTrade'">
                <FindTrade :isSearch.sync="isSearch" />
              </template>

              <!-- ORDER BOOK -->
              <template v-if="currentTab.componentName === 'OrderBook'">
                <OrderBook :isShowOrders.sync="isShowOrders" />
              </template>
            </template>
          </AppTabs>
        </div>

        <!-- METAMASK -->
        <Card class="wallet-card__inner flex flex-col flex-shrink-0 bg-dark-200 rounded-3 p-20" :header="false">
          <SwapMetamask slot="content" class="mb-40 md:mb-0" @setError="metamaskSetError" />
        </Card>
      </div>

      <!-- SEARCH CONTENT -->
      <div v-if="isSearch" class="flex flex-shrink-0 mt-20 lg:mt-30 xl:mt-40">
        <!-- EXCHANGES -->
        <Card
          class="cards__inner flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 mr-20 lg:mr-30 xl:mr-40 overflow-y-auto custom-scrollbar"
          header-classes="flex items-center justify-between"
        >
          <template slot="header-left">
            <span class="leading-md text-iceberg">Exchanges</span>
          </template>
          <template slot="header-right">
            <span class="text-sm leading-xs text-turquoise-blue cursor-pointer" @click="toggleAllExchangesChecked">
              {{ allExchangesChecked ? "Unselect All" : "Select all" }}
            </span>
          </template>

          <Exchanges slot="content" :data="getExchangesData" :exchangeImages="exchangeImages" class="flex flex-col" />
        </Card>

        <!-- TABLE -->
        <div v-loading="isPending" class="table__inner flex flex-col flex-1 bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar">
          <div class="table__header flex items-center py-15 px-20 md:px-10 lg:px-20">
            <div class="table__header-col-1 text-sm leading-xs pr-10 xl:pr-20 text-hidden-sea-glass">Name</div>
            <div class="table__header-col-2 text-sm leading-xs pr-10 xl:pr-20 text-hidden-sea-glass">Price ({{ tableCoin }})</div>
            <div class="table__header-col-3 text-sm leading-xs pr-10 xl:pr-20 text-hidden-sea-glass">Total ({{ tableCoin }})</div>
            <div class="table__header-col-4 text-sm leading-xs pr-10 xl:pr-20 text-hidden-sea-glass">Markup</div>
            <div class="table__header-col-5" />
          </div>
          <div class="flex flex-col mb-20 overflow-y-auto custom-scrollbar">
            <TableItem
              v-for="(item, index) in getTableData"
              :key="index"
              :data="getTableData"
              :item="item"
              :exchangeImages="exchangeImages"
              :index="index"
            />
          </div>
        </div>
      </div>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div class="w-full flex flex-col relative bg-dark-200 rounded-t-15">
        <!-- CONTENT -->
        <AppTabs :tabs="mobileTabs">
          <template v-slot="{ currentTab }">
            <!-- FIND TRADE TAB -->
            <template v-if="currentTab.componentName === 'FindTrade'">
              <div class="flex flex-col h-full overflow-y-auto custom-scrollbar">
                <!-- SWAP FILTERS -->
                <SwapFilters
                  :exchangesData="getExchangesData"
                  :exchangeImages="exchangeImages"
                  :allExchangesChecked="allExchangesChecked"
                  class="flex-shrink-0"
                  @toggleAllExchangesChecked="toggleAllExchangesChecked"
                  @toggleExchange="toggleExchange"
                />

                <!-- FIND TRADE -->
                <FindTrade :isSearch.sync="isSearch" />

                <!-- METAMASK -->
                <SwapMetamask class="mb-40 md:mb-0" @setError="metamaskSetError" />

                <!-- TABLE -->
                <div class="flex flex-col table__inner flex-shrink-0">
                  <div v-loading="isPending" class="flex flex-col flex-1 bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar">
                    <div class="table__inner flex flex-col flex-shrink-0">
                      <div class="table__header flex justify-between items-center py-15 px-20">
                        <div class="table__header-col-1 text-xs leading-xs text-hidden-sea-glass">Name</div>
                        <div class="table__header-col-2 text-xs leading-xs text-hidden-sea-glass">Price ({{ tableCoin }})</div>
                        <div class="table__header-col-3 text-xs leading-xs text-hidden-sea-glass">Total ({{ tableCoin }})</div>
                        <div class="table__header-col-4 text-xs leading-xs text-hidden-sea-glass">Markup</div>
                        <div class="table__header-col-5" />
                      </div>
                      <div class="flex flex-col overflow-y-auto custom-scrollbar">
                        <TableItem
                          v-for="(item, index) in getTableData"
                          :key="index"
                          :data="getTableData"
                          :item="item"
                          :exchangeImages="exchangeImages"
                          :index="index"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ORDER BOOK TAB -->
            <template v-if="currentTab.componentName === 'OrderBook'">
              <div class="flex flex-col pb-40 overflow-y-auto custom-scrollbar">
                <OrderBook :isShowOrders.sync="isShowOrders" class="flex-shrink-0 mb-20" />

                <!-- METAMASK -->
                <SwapMetamask slot="content" @setError="metamaskSetError" />
              </div>
            </template>

            <!-- EXCHANGES TAB -->
            <template v-if="currentTab.componentName === 'Exchanges'">
              <div class="flex flex-col pt-20 pb-40 overflow-y-auto custom-scrollbar">
                <!-- EXCHANGES -->
                <div class="flex flex-col flex-shrink-0 mb-40">
                  <p class="text-sm leading-xs text-blue-cl-100 cursor-pointer mb-24 px-20" @click="toggleAllExchangesChecked">
                    {{ allExchangesChecked ? "Unselect All" : "Select all" }}
                  </p>

                  <Exchanges :data="getExchangesData" :exchangeImages="exchangeImages" class="flex flex-col" />
                </div>

                <!-- METAMASK -->
                <SwapMetamask slot="content" @setError="metamaskSetError" />
              </div>
            </template>
          </template>
        </AppTabs>

        <!-- COMING SOON -->
        <ComingSoonDesktop v-if="isComingSoon" />
      </div>
    </template>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ComingSoon } from "@/core/mixins/coming-soon";
import { Tab } from "@/models/interfaces";
import { DexagRequest, ExchangeData, TableColumn } from "@/store/swap/types";
import { SwapErrors } from "@/store/swap/const";
import { namespace } from "vuex-class";

const swap = namespace("swapModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import FindTrade from "@/components/swap/FindTrade.vue";
import OrderBook from "@/components/swap/OrderBook.vue";
import Exchanges from "@/components/swap/Exchanges.vue";
import TableItem from "@/components/swap/TableItem.vue";
import SwapMetamask from "@/components/swap/SwapMetamask.vue";
import SwapFilters from "@/components/swap/SwapFilters.vue";

@Component({
  name: "Swap",
  components: { GeneralLayout, FindTrade, OrderBook, Exchanges, TableItem, SwapMetamask, SwapFilters },
  mixins: [ComingSoon],
})
export default class Swap extends Vue {
  /* VUEX */
  @swap.Getter isPending: boolean;
  @swap.Getter getProviderRequest: DexagRequest;
  @swap.Getter getTableData: TableColumn[];
  @swap.Getter getExchangesData: ExchangeData[];
  @swap.Action initProviderSdk: (payload: { provider: any; callback: (status: string) => void }) => void;
  @swap.Action toggleAllExchanges: (checked: boolean) => void;
  @swap.Action setErrorMessage: (payload: string) => void;
  @swap.Action toggleExchange: (payload: { id: string; label: string; checked: boolean }) => void;

  /* DATA */
  isSearch: boolean = true;
  isShowOrders: boolean = false;
  allExchangesChecked: boolean = true;

  currentTab: any = null;
  tabs: Tab[] = [
    { value: "Find a trade", componentName: "FindTrade" },
    // { value: "Order Book", componentName: "OrderBook" },
  ];

  mobileTabs: Tab[] = [
    { value: "Find a trade", componentName: "FindTrade" },
    // { value: "Order Book", componentName: "OrderBook" },
    // { value: "Exchanges", componentName: "Exchanges" },
  ];

  exchangeImages = {
    uniswap: require("@/assets/images/trade-images/uniswap.png"),
    oasis: require("@/assets/images/trade-images/oasis.png"),
    zero_x: require("@/assets/images/trade-images/zero-x.png"),
    kyber: require("@/assets/images/trade-images/kyber.svg"),
    bancor: require("@/assets/images/trade-images/bancor.svg"),
    synthetix: require("@/assets/images/trade-images/synthetix.svg"),
    balancer: require("@/assets/images/trade-images/balancer.svg"),
    curve: require("@/assets/images/trade-images/curve.svg"),
    curve_susd: require("@/assets/images/trade-images/curve.svg"),
    curve_btc: require("@/assets/images/trade-images/curve.svg"),
    coumpound: require("@/assets/images/trade-images/coumpound.svg"),
    chai: require("@/assets/images/trade-images/chai.png"),
    aave: require("@/assets/images/trade-images/aave.svg"),
    mstable: require("@/assets/images/trade-images/mstable.png"),
    uniswap_v2: require("@/assets/images/trade-images/uniswap.png"),
    zero_x_v2: require("@/assets/images/trade-images/zero-x.png"),
    sushiswap: require("@/assets/images/trade-images/sushiswap.png"),
    swerve: require("@/assets/images/trade-images/swerve.png"),
  };

  /* COMPUTED */
  get tableCoin() {
    if (!this.getProviderRequest) return "";
    return this.getProviderRequest.from;
  }

  /* HOOKS */
  mounted() {
    this.initProviderSdk({ provider: window.ethereum, callback: this.$notify });
  }

  /* METHODS */
  toggleAllExchangesChecked() {
    this.allExchangesChecked = !this.allExchangesChecked;
    this.toggleAllExchanges(this.allExchangesChecked);
  }

  changeTab(tab: any) {
    if (tab.componentName === "FindTrade") {
      this.isShowOrders = false;
    } else {
      this.isSearch = false;
    }
    this.currentTab = tab;
  }

  metamaskSetError() {
    this.setErrorMessage(SwapErrors.METAMASK_MISSING_ERROR);
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  &.short {
    min-height: 312px;
  }
  &.long {
    @apply flex flex-col h-auto;
  }
}

.wallet-card {
  &__inner {
    width: 274px;
    min-height: 312px;
    @media (max-width: 1279px) {
      width: 192px;
      min-height: auto;
    }
  }
}

.cards {
  &__inner {
    width: 280px;
    height: 416px;
    @media (max-width: 1279px) {
      width: 220px;
    }
    @media (max-width: 1023px) {
      width: 190px;
    }
  }
}

.table {
  &__inner {
    height: 416px;
    @media (max-width: 767px) {
      @apply h-auto;
      max-height: 416px;
    }
  }
  &__header-col-1 {
    width: 26.3%;
    @media (max-width: 1279px) {
      width: 25.3%;
    }
    @media (max-width: 767px) {
      width: 23.5%;
    }
  }
  &__header-col-2 {
    width: 22%;
    @media (max-width: 1279px) {
      width: 19%;
    }
    @media (max-width: 767px) {
      width: 23.7%;
    }
  }
  &__header-col-3 {
    width: 22%;
    @media (max-width: 1279px) {
      width: 19%;
    }
    @media (max-width: 767px) {
      width: 24.8%;
    }
  }
  &__header-col-4 {
    width: 15.4%;
    @media (max-width: 1279px) {
      width: 13.4%;
    }
    @media (max-width: 767px) {
      width: 24%;
    }
  }
  &__header-col-5 {
    width: 16.3%;
    @media (max-width: 1279px) {
      width: 26.4%;
    }
    @media (max-width: 998px) {
      width: 14%;
    }
    @media (max-width: 767px) {
      width: 4%;
    }
  }
}
</style>
