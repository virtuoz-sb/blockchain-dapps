<template>
  <GeneralLayout title="Manual Trade" content-custom-classes="flex-col md:flex-row overflow-y-auto md:overflow-y-visible">
    <!-- HEADER LEFT -->
    <!-- <div slot="header-nav-left-end" class="hidden md:flex ml-20">
      <AppButtonsGroup
        class="w-150"
        v-model="tradingType"
        :items="tradingValues"
        customClasses="hidden md:flex max-w-75 text-grey-cl-200 py-7 px-5"
      />
    </div> -->

    <!-- HEADER BOTTOM -->
    <!-- <div v-if="isComingSoon && tradingStage === 'Manual Trade'" slot="header-bottom" class="md:hidden w-full mt-10">
      <AppButtonsGroup v-model="tradingType" :items="tradingValues" customClasses="text-grey-cl-200 py-7 px-5" />
    </div> -->

    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-1 relative">
      <!-- LEFT PART -->
      <div class="w-full md:max-w-200 lg:max-w-240 xl:max-w-280 bg-dark-200 rounded-3">
        <div class="flex flex-col justify-between w-full h-full">
          <!-- TABS CARD  (NEW ORDER | MY ORDERS) -->
          <AppTabs
            ref="tradeTabs"
            :tabs="tabs"
            class="md:flex md:flex-col md:h-full w-full pb-10 md:pb-0 md:overflow-y-auto custom-scrollbar"
            shrink
          >
            <!-- notification for My Orders tab -->
            <span v-if="isUnreadOrders" slot="MyOrders" class="my-orders__notify absolute w-8 h-8 bg-blue-cl-100 rounded-full" />

            <template v-slot="{ currentTab }">
              <!-- NEW ORDER -->
              <template v-if="currentTab.componentName === 'NewOrder'">
                <NewOrder :trading-type="tradingType" :current-pair.sync="currentPair" @switchToOrder="swithToOrders" />
              </template>

              <!-- MY ORDERS -->
              <template v-if="currentTab.componentName === 'MyOrders'">
                <!-- MY ORDERS -->
                <MyOrders />
              </template>
            </template>
          </AppTabs>
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="flex flex-col w-full ml-20 lg:ml-30 xl:ml-40">
        <div class="flex flex-col w-full h-full">
          <div class="flex-1 flex flex-col overflow-y-auto custom-scrollbar h-full pb-0 md:pb-30 xl:pb-40 rounded-5">
            <!-- TRADING CONTROL -->
            <TradingControlPanel :widget-symbol="widgetSymbol" />
          </div>

          <div class="trading-widgets__wrap hidden md:flex flex-no-wrap items-center justify-between h-210">
            <!-- SPEED GAUGE CARD -->
            <Card
              class="buy-sentiment__card flex flex-col flex-shrink-0 order-first h-full bg-dark-200 rounded-3 mr-20 mt-0"
              header-classes="flex items-center"
            >
              <template slot="header-left">
                <span class="leading-xxs text-iceberg">Buy Sentiment</span>
              </template>

              <SpeedGauge slot="content" :symbol="selectedCurrencyPair.label" class="overflow-hidden" />
            </Card>

            <!-- TRADE CARD -->
            <TradeTabs class="trade__card w-full h-full order-2" />

            <!-- NEWS CARD -->
            <Card class="news__card flex flex-col flex-shrink-0 h-full order-last bg-dark-200 rounded-3 ml-20 mt-0" :header="false">
              <NewsWidget slot="content" />
            </Card>
          </div>
        </div>
      </div>

      <!-- COMING SOON DESKTOP -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div class="flex flex-col flex-grow relative w-full bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
        <AppTabs :tabs="mobileTabs" shrink class="flex-grow">
          <template v-slot="{ currentTab }">
            <!-- NEW ORDER MOBILE -->
            <template v-if="currentTab.componentName === 'NewOrder'">
              <NewOrder :trading-type="tradingType" :current-pair.sync="currentPair" class="flex-grow" @switchToOrder="swithToOrders" />
            </template>

            <!-- TRADING VIEW MOBILE -->
            <template v-if="currentTab.componentName === 'TradingViewMobile'">
              <TradingViewMobile />
            </template>

            <!-- MY ORDERS MOBILE -->
            <template v-if="currentTab.componentName === 'MyOrders'">
              <div class="flex flex-col flex-grow mt-20 overflow-y-auto custom-scrollbar">
                <MyOrders />
              </div>
            </template>
          </template>
        </AppTabs>
      </div>
    </template>

    <!-- ACCOUNT MODAL -->
    <AppModal v-if="!isLoading" v-model="accountDetectModal" max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20 md:px-85">
        <h2 class="font-raleway text-white text-xxl text-center mb-20">No API key detected</h2>
        <p class="account-detect-modal__desc text-grey-cl-920 text-center mx-auto mb-20">
          Hey, please connect your exchange API keys to start trading on Upbots
        </p>
        <AppButton type="light-green" class="account-detect-modal__btn" @click="$router.push('/keys')">Add API key</AppButton>
      </div>
    </AppModal>

    <!-- COMING SOON MODAL -->
    <AppModal v-model="comingsoonModalOpen" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Manual Trading: Coming Soon</h2>
          <div class="comingsoon-popup__modal-desc flex flex-col items-center justify-center text-center text-base mb-30">
            <p class="text-grey-cl-100 leading-xs">
              Trading is the very core of UpBots. Here you will be able to trade via any wallet/exchange you have integrated. Specific entry
              points, trailing stop losses and multiple take profits and more...
            </p>
          </div>
          <AppButton type="light-green" class="comingsoon-popup__modal-btn" @click="handleComingSoonModal">Continue</AppButton>
        </div>
      </div>
    </AppModal>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { State, namespace } from "vuex-class";
import { GroupItems, Tab, AlertForm } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";
import { ExchangePairSettings } from "@/store/trade/types";

const user = namespace("userModule");
const trade = namespace("tradeModule");
const order = namespace("orderModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import TradingChart from "@/components/charts/TradingChart.vue";
import TradeTabs from "@/components/manual-trade/trade-card/TradeTabs.vue";
import OrderBook from "@/components/manual-trade/trade-card/OrderBook.vue";
import TradingControlPanel from "@/components/manual-trade/TradingControlPanel.vue";
import Alert from "@/components/alert/Alert.vue";
import NewsWidget from "@/components/manual-trade/widgets/NewsWidget.vue";
import SpeedGauge from "@/components/manual-trade/widgets/SpeedGauge.vue";
const NewOrder = () => import("@/components/manual-trade/orders/NewOrder.vue");
// const MyOrders = () => import("@/components/manual-trade/orders/MyOrders.vue");
const MyOrders = () => import("@/components/manual-trade/my-orders-tab/MyOrders.vue");
import TradingViewMobile from "@/components/manual-trade/mobile/TradingViewMobile.vue";

Component.registerHooks(["beforeRouteLeave"]);

@Component({
  name: "ManualTrade",
  components: {
    GeneralLayout,
    TradingChart,
    TradeTabs,
    MyOrders,
    NewOrder,
    OrderBook,
    TradingControlPanel,
    Alert,
    NewsWidget,
    SpeedGauge,
    TradingViewMobile,
  },
  mixins: [ComingSoon],
})
export default class ManualTrade extends Vue {
  /* VUEX */
  @trade.State exchange: any;
  @trade.State selectedCurrencyPair: any;
  @trade.State mode: any;
  @trade.Mutation setMode: any;
  @trade.Getter widgetSymbol: any;
  @user.State keys: any;
  @user.Action fetchTradingSettings!: any;
  @user.Action addNewAlert: any;
  @order.State isUnreadOrders: boolean;
  @State isLoading: boolean;

  /* REFS */
  $refs!: {
    tradeTabs: any;
  };

  /* DATA */
  currentPair: ExchangePairSettings = null;

  isBack: boolean = false;

  accountDetectModal: boolean = false;

  tradingStage: string = "Manual Trade";

  selectedView: GroupItems = { label: "Trading View", value: "tradingView" };

  isShowAlert: boolean = false;

  isCreateAlert: boolean = false;

  views: GroupItems[] = [
    { label: "Trading View", value: "tradingView" },
    { label: "My Orders", value: "myOrders" },
    { label: "Order Book", value: "orderBook" },
  ];

  orderBookLabels: any[] = ["Amount", "Total", "Price"];

  orderBookData: any[] = [
    { percentage: "100", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "90", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "80", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "70", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "60", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "50", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "40", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "30", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "20", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
    { percentage: "10", amount: "0.5625.3", total: "0.7358", price: "0.00245" },
  ];

  tradingValues: GroupItems[] = [
    { label: "Basic", value: "basic" },
    { label: "Advanced", value: "advanced" },
  ];

  tabs: Tab[] = [
    { value: "New Order", componentName: "NewOrder" },
    { value: "My Orders", componentName: "MyOrders" },
  ];

  mobileTabs: Tab[] = [
    { value: "New Order", componentName: "NewOrder" },
    { value: "Trading View", componentName: "TradingViewMobile" },
    { value: "My Orders", componentName: "MyOrders" },
  ];

  orderBookState: boolean = false;

  comingsoonModalOpen: boolean = false;

  isNewOrderValidated: boolean = false;

  created() {
    this.fetchTradingSettings();
  }

  /* COMPUTED */
  get tradingType() {
    return this.mode;
  }

  set tradingType(value) {
    this.setMode(value);
  }

  get contentClasses() {
    return this.tradingStage !== "Manual Trade" || "gradient-2 md:pt-20 rounded-t-15 shadow-110";
  }

  get mobileMyOrderClasses() {
    return this.selectedView.value === "myOrders" && this.tradingStage === "Manual Trade" ? "my-orders-mobile relative" : "";
  }

  /* W A T C H E R S */
  // commented out no wallet key popup
  // @Watch("keys", { immediate: true })
  // handleAccountExistence(val: any) {
  //   setTimeout(() => {
  //     if (!val.length) {
  //       this.accountDetectModal = true;
  //     } else {
  //       this.accountDetectModal = false;
  //     }
  //   }, 1000);
  // }

  // beforeRouteLeave(to: any, from: any, next: any) {
  //   if (to.name !== "manual-trade") {
  //     console.log("here");
  //     this.isNewOrderValidated = false;
  //     next();
  //   } else {
  //     next();
  //   }
  // }

  /* METHODS */
  createAlert(alert: AlertForm) {
    this.addNewAlert(alert);
    this.isCreateAlert = false;
  }

  createNewOrder() {
    this.tradingStage = "Create New Order";
    this.isBack = true;
  }

  swithToOrders() {
    this.$refs.tradeTabs.selectTab({ value: "My Orders", componentName: "MyOrders" });
  }

  handleComingSoonModal() {
    this.comingsoonModalOpen = !this.comingsoonModalOpen;
  }
}
</script>

<style lang="scss" scoped>
.my-orders-mobile {
  &::after {
    content: "";
    @apply absolute bottom-0 left-0 w-full flex-shrink-0;
    height: 55px;
    background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
  }
}

.account-detect-modal {
  &__desc {
    max-width: 330px;
  }
  &__btn {
    min-width: 240px;
  }
}

.comingsoon-popup {
  &__modal-desc {
    max-width: 330px;
  }
  &__modal-btn {
    min-width: 240px;
  }
}

.trading-widgets {
  &__wrap {
    @media (max-width: 1400px) {
      @apply flex-wrap h-auto;
    }
  }
}

.buy-sentiment {
  &__card {
    max-width: 216px;
    @media (min-width: 1600px) {
      @apply max-w-full;
      width: 21%;
    }
    @media (max-width: 1430px) {
      @apply mr-15;
    }
    @media (max-width: 1400px) {
      @apply h-165 max-w-full w-2/5 order-2 mt-20;
    }
  }
}

.trade {
  &__card {
    @media (min-width: 1600px) {
      @apply max-w-full;
      width: 40%;
    }
    @media (max-width: 1400px) {
      @apply h-165 order-first;
    }
    @media (max-width: 1279px) {
      height: 165px;
    }
  }
}

.news {
  &__card {
    max-width: 225px;
    @media (min-width: 1600px) {
      @apply max-w-full;
      width: 32%;
    }
    @media (max-width: 1430px) {
      @apply ml-15;
    }
    @media (max-width: 1400px) {
      @apply h-165 max-w-full w-2/5 mt-20;
    }
  }
}

::v-deep .create-order {
  &__mobile-btn {
    .icon-plus {
      font-size: 28px;
    }
  }
}

.my-orders {
  &__notify {
    top: 8px;
    right: 8px;
    box-shadow: 0 0 0 0 rgba(0, 131, 184, 1);
    transform: scale(1);
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 131, 184, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(0, 131, 184, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 131, 184, 0);
  }
}
</style>
