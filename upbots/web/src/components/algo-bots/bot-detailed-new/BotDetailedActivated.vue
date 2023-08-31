<template>
  <!-- DESKTOP CONTENT -->
  <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full relative">
    <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
      <div class="flex flex-col">
        <div class="flex mb-20">
          <!-- BOT DETAILED DESCRIPTION -->
          <div
            class="bot-detailed-active__description-card custom-blur-card m-8 flex flex-col flex-grow flex-shrink-0 bg-dark-200 px-20 py-20 lg:py-40 rounded-3 mr-20 lg:mr-40 overflow-y-auto custom-scrollbar"
          >
            <BotDetailedDescription
              :breakpointXL="getBreakpointXL"
              :bot-name="algobotData && algobotData.name"
              :botAllocation="botAllocation"
            />
          </div>
          <!-- <ConfigureActivated
              :breakpointXL="getBreakpointXL"
              :bot-name="algobotData && algobotData.name"
              class="flex flex-col h-full relative my-20 overflow-y-auto custom-scrollbar"
            /> -->

          <div
            v-if="algobotData"
            class="bot-detailed__right-side flex flex-col flex-grow overflow-x-hidden overflow-y-auto xl:overflow-y-auto custom-scrollbar"
          >
            <!-- MY PERFORMANCES GRAPH -->

            <div class="custom-blur-card flex-shrink-0 m-8 flex flex-col bg-dark-200 rounded-3 mb-24">
              <PerformanceOverview :algobot="algobotData" :algoBotSubscription="algoBotSubscription" :botAllocation="botAllocation" />
            </div>

            <!-- MY PERFORMANCES GRAPH -->
            <div class="flex flex-col flex-shrink-0 bg-dark-200 rounded-3 mb-24">
              <MyPerformancesGraph :chart-data="chartData" :algobot="algobotData" graph-wrap-classes="bot-detailed-activated__graph-wrap" />
            </div>

            <!-- PERFORMANCES TABLES -->
            <div class="flex flex-col flex-shrink-0 bg-dark-200 rounded-3">
              <AppTabs :tabs="tabs">
                <template v-slot="{ currentTab }">
                  <!-- MY PERFORMANCES HISTORY TABLE -->
                  <template v-if="currentTab.componentName === 'MyPerformancesHistory'">
                    <MyPerformancesHistory
                      :chart-data="chartData"
                      :algobot="algobotData"
                      hideTitle
                      class="bot-detailed-activated__table-wrap"
                    />
                  </template>

                  <!-- BOT PERFORMANCES HISTORY TABLE -->
                  <template v-if="currentTab.componentName === 'BotActivity'">
                    <BotActivity
                      :botSubscriptionAudits="getBotSubscriptionAudtis"
                      :botCycleData="getBotSubscriptionCycles"
                      :algoBotSubscription="algoBotSubscription"
                      class="bot-detailed-activated__bot-activity-table-wrap p-20 overflow-y-auto custom-scrollbar"
                    />
                  </template>
                </template>
              </AppTabs>
            </div>
          </div>
        </div>
      </div>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>
  </div>

  <!-- MOBILE CONTENT -->
  <div v-else class="flex flex-col w-full relative">
    <div v-if="!isComingSoon" class="flex flex-col flex-grow relative w-full bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
      <!-- APP TABS -->
      <AppTabs :tabs="mobileTabs" shrink>
        <template v-slot="{ currentTab }">
          <!-- CONFIGURE AND FAQ MOBILE -->
          <template v-if="currentTab.componentName === 'ConfigureAndFAQMobile'">
            <div class="flex flex-col flex-grow relative overflow-y-auto custom-scrollbar">
              <!-- CONFIGURE -->
              <div class="flex flex-col flex-grow relative py-20 overflow-y-auto custom-scrollbar">
                <!-- CONFIGURE COMING SOON -->
                <ComingSoon v-if="!hasCouponsWithCorrectPromo && !getStakingAmountSuccess" class="top-0 z-100" />
                <!-- v-if="selectedView.value === 'Configure'" -->
                <ConfigureActivated
                  :bot-name="algobotData && algobotData.name"
                  class="flex flex-col flex-grow relative overflow-y-auto custom-scrollbar"
                />
              </div>
            </div>
          </template>

          <!-- PERFORMANCES MOBILE -->
          <template v-if="currentTab.componentName === 'PerformancesMobile'">
            <PerformancesMobile
              :chart-data="chartData"
              :algobotData="algobotData"
              :selectedChartView="{ value: 'MyPerformance' }"
              :selectedHistoryView="{ value: 'MyTradeHistory' }"
              class="flex flex-col flex-grow my-20 overflow-y-auto custom-scrollbar"
            />
          </template>

          <!-- SUMMARY MOBILE -->
          <template v-if="currentTab.componentName === 'Summary'">
            <div class="flex flex-col flex-grow pt-20 overflow-y-auto custom-scrollbar">
              <!-- SELECT SUMMARY TAB -->
              <div class="flex flex-col flex-shrink-0 w-full mb-20 px-20">
                <AppDropdownBasic v-model="selectedSummaryTab" :options="summaryStateTabs" dark />
              </div>

              <div class="flex flex-col w-full pb-20 px-20 overflow-y-auto custom-scrollbar">
                <!-- PERFORMANCES -->
                <template v-if="selectedSummaryTab.value === 'performances'">
                  <MyPerformances :algobot="algobotData" class="mb-40" />
                  <PerformanceFees :algobot="algobotData" :botAllocation="botAllocation" />
                </template>

                <!-- BOT ACTIVITY -->
                <template v-if="selectedSummaryTab.value === 'botActivity'">
                  <BotActivity
                    :botSubscriptionAudits="getBotSubscriptionAudtis"
                    :botCycleData="getBotSubscriptionCycles"
                    :algoBotSubscription="algoBotSubscription"
                  />
                </template>
              </div>
            </div>
          </template>

          <!-- HOW IT WORKS MOBILE -->
          <!-- <template v-if="currentTab.componentName === 'HowItWorks'">
              <div class="flex flex-col flex-grow pt-20 pb-20 overflow-y-auto custom-scrollbar">
                <p class="flex flex-shrink-0 items-center text-iceberg text-xxl px-20 mb-20">How It Works</p>

                <HowItWorks class="flex-grow" />
              </div>
            </template> -->
        </template>
      </AppTabs>
    </div>

    <!-- COMING SOON -->
    <div v-if="isComingSoon" class="w-full flex flex-col">
      <ComingSoonWithoutDesign />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { State, namespace } from "vuex-class"; // hasCouponsWithCorrectPromo
import { AxiosError } from "axios";
import { Tab } from "@/models/interfaces";
import { walletChartOption } from "@/models/default-models";
import { ComingSoon } from "@/core/mixins/coming-soon";
import { UserWallet, UserTransaction, BotWallet } from "@/store/perfees/types";
import { ErrorResponse } from "@/store/error-response";
import { AlgoBot, AlgoBotSubscription, BotPerformanceSnapshotDto, BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";
import { GroupItems } from "@/models/interfaces";

const user = namespace("userModule");
const algobots = namespace("algobotsModule");
const perfees = namespace("perfeesModule");
const staking = namespace("stakingModule");

import GeneralLayout from "@/views/GeneralLayout.vue";

import MyPerformances from "@/components/algo-bots/bot-detailed-new/MyPerformances.vue";
import PerformanceFees from "@/components/algo-bots/bot-detailed-new/PerformanceFees.vue";
import PerformanceOverview from "@/components/algo-bots/bot-detailed-new/PerformanceOverview.vue";
import BotPerformancesHistory from "@/components/algo-bots/bot-detailed-new/BotPerformancesHistory.vue";

import ConfigureActivated from "@/components/algo-bots/bot-detailed-new/ConfigureActivated.vue";

import MyPerformancesGraph from "@/components/algo-bots/bot-detailed-new/MyPerformancesGraph.vue";
import MyPerformancesHistory from "@/components/algo-bots/bot-detailed-new/MyPerformancesHistory.vue";
import BotDetailedDescription from "@/components/algo-bots/bot-detailed-new/BotDetailedDescription.vue";

import ConfigureAndFAQMobile from "@/components/algo-bots/bot-detailed-new/mobile/ConfigureAndFAQMobile.vue";
import PerformancesMobile from "@/components/algo-bots/bot-detailed-new/mobile/PerformancesMobile.vue";

import FAQ from "@/components/algo-bots/bot-detailed-new/FAQ.vue";
import HowItWorks from "@/components/algo-bots/bot-detailed-new/HowItWorks.vue";

import BotActivity from "@/components/algo-bots/bot-detailed-new/bot-activity-tab/BotActivity.vue";

import ComingSoonOverlay from "@/components/algo-bots/bot-detailed-new/ComingSoon.vue";

@Component({
  name: "BotDetailedActivated",
  components: {
    GeneralLayout,

    MyPerformances,
    PerformanceFees,
    PerformanceOverview,
    BotPerformancesHistory,

    ConfigureActivated,

    MyPerformancesGraph,
    MyPerformancesHistory,

    ConfigureAndFAQMobile,
    PerformancesMobile,
    BotDetailedDescription,
    BotActivity,

    FAQ,
    HowItWorks,

    ComingSoon: ComingSoonOverlay,
  },
  mixins: [ComingSoon],
})
export default class BotDetailedActivated extends Vue {
  /* VUEX */
  @State isLoading: boolean;
  @user.Getter hasCouponsWithCorrectPromo: boolean;

  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Action fetchBotSubscriptionSnapshotAction!: any;
  @algobots.Action fetchBotSubscriptionCyclesAction!: any;
  @algobots.Action fetchBotSubscriptionAuditsAction!: any;

  @algobots.Mutation setSelectedBotSubId: any;
  @algobots.Mutation setSelectedBotId: any;

  @algobots.Getter getAlgoBotById: any;
  @algobots.Getter getSubscribedAlgoBotById: any;
  @algobots.Getter getBotSubscriptionSnapshot: BotPerformanceSnapshotDto;
  @algobots.Getter getBotSubscriptionCycles: BotPerformanceCycleDto[];
  @algobots.Getter getBotSubscriptionAudtis: any[];
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];

  @perfees.State error: ErrorResponse;
  @perfees.Getter getUserWallet!: UserWallet;
  // @perfees.Getter getUserTransactions!: UserTransaction[];
  // @perfees.Getter getBotWallets!: BotWallet[];
  @perfees.Getter getBotWalletById!: any;
  @perfees.Action fetchUserWallet!: any;
  // @perfees.Action fetchUserTransactions!: any;
  @perfees.Action fetchBotWallets!: any;
  @perfees.Action transferBotWallet!: any;

  @staking.Getter getStakingAmountSuccess: any;
  @staking.Action fetchStakingAmount: any;

  /* PROPS */

  /* DATA */
  mobileTabs: Tab[] = [
    { value: "Configure", componentName: "ConfigureAndFAQMobile" },
    { value: "Performances", componentName: "PerformancesMobile" },
    { value: "Summary", componentName: "Summary" },
    // { value: "How it works", componentName: "HowItWorks" },
  ];

  tabs: Tab[] = [
    { value: "My Trade History", componentName: "MyPerformancesHistory" },
    { value: "Bot Activity", componentName: "BotActivity" },
  ];

  algoBotSubscription: any = null;
  // botSubscriptionAudits: any[] = [];
  // botCycleData: BotPerformanceCycleDto[] = null;
  // botSnapshotData: BotPerformanceSnapshotDto = null;

  selectedSummaryTab: GroupItems = { value: "botActivity", label: "Bot Activity" };
  summaryStateTabs: GroupItems[] = [
    { value: "botActivity", label: "Bot Activity" },
    { value: "performances", label: "Performances" },
  ];

  /* COMPUTED */
  get algobotData() {
    return this.getAlgoBotById(this.$route.params.id);
  }

  get botAllocation() {
    return this.getBotWalletById(this.$route.params.id);
  }

  get getBreakpointXL() {
    return this.$breakpoint.width <= 1280 ? true : false;
  }

  get chartData() {
    if (!this.algobotData) return { datasets: [], labels: [] };

    return {
      datasets: [
        {
          borderColor: "#60BCB5",
          backgroundColor: "rgba(96, 188, 181, 0.2)",
          ...walletChartOption,
          data: (this.algobotData.charts && this.algobotData.charts.weeklyChart.data) || [],
        },
      ],
      labels: (this.algobotData.charts && this.algobotData.charts.weeklyChart.labels) || [],
    };
  }

  /* HOOKS */
  async mounted() {
    this.fetchBotData();
    this.fetchStakingAmount();
  }

  /* WATCHERS */
  @Watch("getBotsSubcriptions", { immediate: true })
  handleOnChangeBotsSubcriptions(val: any) {
    this.getActiveSubscription();
  }

  /* METHODS */
  getActiveSubscription() {
    this.algoBotSubscription = this.getBotsSubcriptions.filter((sub) => sub.botId === this.$route.params.id)[0];
  }

  async fetchBotData() {
    await this.fetchAlgoBotsAction();
    await this.fetchBotWallets();

    this.setSelectedBotId(this.$route.params.id);
    this.fetchBotActivityData();

    await this.fetchAlgoBotsSubscriptionsAction()
      .then(() => {
        this.algoBotSubscription = this.getSubscribedAlgoBotById(this.$route.params.id);
        this.setSelectedBotSubId(this.algoBotSubscription.id);
        if (this.algoBotSubscription) {
          // this.fetchBotSnapshotData(this.algoBotSubscription.id);
          this.fetchBotCyclesData(this.algoBotSubscription.id);
        } else {
          this.$notify({ text: "You haven't subscribed to the bot yet", type: "warning" });
        }
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  fetchBotActivityData() {
    this.fetchBotSubscriptionAuditsAction(this.$route.params.id);
    // return this.$http
    //   .get(`/api/algobots/subscriptionaudits`, { params: { b: this.$route.params.id } })
    //   .then(({ data }) => {
    //     this.botSubscriptionAudits = data;
    //   })
    //   .catch(({ response }: any) => {
    //     if (response.data.message) {
    //       this.$notify({ text: response.data.message, type: "error" });
    //     }
    //   });
  }

  fetchBotSnapshotData(subId: string) {
    this.fetchBotSubscriptionSnapshotAction(subId);
    // return this.$http
    //   .get<BotPerformanceSnapshotDto>(`/api/performance/subscription/${subId}/snapshot/six-months`)
    //   .then(({ data }) => {
    //     this.botSnapshotData = data;
    //   })
    //   .catch(({ response }: AxiosError) => {
    //     if (response.data.message) {
    //       this.$notify({ text: response.data.message, type: "error" });
    //     }
    //   });
  }

  fetchBotCyclesData(subId: string) {
    this.fetchBotSubscriptionCyclesAction(subId);
    // return this.$http
    //   .get<BotPerformanceCycleDto[]>(`/api/performance/subscription/${subId}/cycles/six-months`)
    //   .then(({ data }) => {
    //     this.botCycleData = data;

    //     if (!data.length) {
    //       this.$notify({ text: "You haven't any orders yet", type: "warning" });
    //     }
    //   })
    //   .catch(({ response }: AxiosError) => {
    //     if (response.data.message) {
    //       this.$notify({ text: response.data.message, type: "error" });
    //     }
    //   });
  }
}
</script>

<style lang="scss" scoped>
.bot-detailed {
  &__left-side-tabs {
    height: 598px;
    max-width: 370px;

    &.shadow {
      &:after {
        content: "";
        bottom: -1px;
        height: 55px;
        background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
        @apply absolute left-0 w-full;
      }
    }
  }
  &__chart {
    height: 280px;
  }

  &__right-side-tabs {
    height: 278px;
  }
}

.bot-detailed-description {
  &__wrap {
    min-height: 130px;
  }
}

.bot-detailed-active {
  &__top {
    height: 704px;
  }

  &__description-card {
    min-width: 390px;
    width: 390px;
  }

  &__bottom {
    height: 420px;
  }

  &__perf-fee-card {
    width: 450px;
    background: rgba(26, 48, 57, 0.37);
  }

  @media (max-width: 1023px) {
    &__description-card {
      min-width: 280px;
      width: 280px;
    }
  }
}

::v-deep .bot-detailed-activated {
  &__table-wrap {
    .table__body-wrapper {
      height: 272px;
    }
  }
}

.bot-detailed-activated {
  &__bot-activity-table-wrap {
    height: 341px;
  }
}

::v-deep .bot-detailed-activated__graph-wrap {
  height: 263px;
}
</style>
