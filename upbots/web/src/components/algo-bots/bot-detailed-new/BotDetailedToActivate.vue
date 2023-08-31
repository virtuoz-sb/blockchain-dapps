<template>
  <!-- DESKTOP CONTENT -->
  <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full relative">
    <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
      <!-- TOP CONTENT -->
      <div class="bot-detailed-inactive__top flex flex-grow flex-shrink-0 mb-60">
        <!-- DESCRIPTION CARD -->
        <BotDetailedInactiveDescription
          v-if="algoBot"
          :algo-bot="algoBot"
          class="bot-detailed-inactive__description-card custom-blur-card m-8 flex-grow flex-shrink-0 bg-dark-200 px-20 py-20 lg:py-40 rounded-3 mr-20 lg:mr-40 overflow-y-auto custom-scrollbar"
        />

        <div class="bot-detailed__chart-table-wrap flex flex-col flex-grow w-full overflow-x-hidden">
          <!-- BOT PERFORMANCE GRAPH -->
          <div class="bg-dark-200 rounded-3 mb-20 lg:mb-40">
            <BotDetailedInactiveBotPerfGraph :algobot="algobotData" graph-wrap-classes="bot-detailed-inactive__graph-wrap" />
          </div>

          <!-- PERFORMANCES HISTORY TABLE -->
          <div class="flex flex-col flex-grow bg-dark-200 rounded-3">
            <BotPerformancesHistory
              :chart-data="chartData"
              :algobot="algobotData"
              :table-data="botHistoryData"
              class="bot-detailed-inactive__table-wrap"
            />
          </div>
        </div>
      </div>

      <!-- BOTTOM CONTENT -->
      <div id="configure" class="bot-detailed-inactive__bottom flex flex-col flex-grow flex-shrink-0">
        <h2 class="text-iceberg text-xxl1 leading-xs mb-30">Configure</h2>
        <div class="flex flex-col items-center flex-shrink-0 xl:items-stretch xl:flex-row flex-grow px-8 xl:pb-8">
          <!-- CONFIGURE CARD -->
          <BotDetailedInactiveConfigureCard @onBaseValueChange="handleBaseValueChange" class="mb-40 xl:mb-0 custom-blur-card" />

          <!-- PERFORMANCE FEE CARD -->
          <BotDetailedInactivePerfFeeCard
            :algoBot="algoBot"
            :baseLimit="baseLimit"
            class="bot-detailed-inactive__perf-fee-card xl:ml-40 rounded-3"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- MOBILE CONTENT -->
  <div v-else class="flex flex-col w-full relative">
    <div v-if="!isComingSoon" class="flex flex-col flex-grow w-full relative overflow-y-auto custom-scrollbar">
      <!-- DESCRIPTION MOBILE -->
      <div class="px-20">
        <Description class="flex flex-col bg-dark-200 rounded-3 p-20" />
      </div>

      <div class="flex flex-col flex-grow w-full bg-dark-200 rounded-t-15 md:rounded-5 mt-30 overflow-y-auto custom-scrollbar">
        <!-- APP TABS -->
        <AppTabs :tabs="mobileTabs" shrink>
          <template v-slot="{ currentTab }">
            <!-- CONFIGURE MOBILE -->
            <template v-if="currentTab.componentName === 'ConfigureAndFAQMobile'">
              <div class="flex flex-col flex-grow relative overflow-y-auto custom-scrollbar">
                <!-- CONFIGURE -->
                <div class="flex flex-col flex-grow relative py-20 overflow-y-auto custom-scrollbar">
                  <!-- CONFIGURE -->
                  <BotDetailedInactiveConfigureCard @onBaseValueChange="handleBaseValueChange" class="mb-40 xl:mb-0" />
                </div>
              </div>
            </template>

            <!-- PERFORMANCES MOBILE -->
            <template v-if="currentTab.componentName === 'PerformancesMobile'">
              <PerformancesMobile
                :chart-data="chartData"
                :algobotData="algobotData"
                :selectedChartView="{ value: 'BotPerformance' }"
                :selectedHistoryView="{ value: 'BotTradeHistory' }"
                class="flex flex-col flex-grow overflow-y-auto custom-scrollbar my-20"
              />
            </template>

            <!-- HOW IT WORKS MOBILE -->
            <template v-if="currentTab.componentName === 'HowItWorks'">
              <div class="flex flex-col flex-grow pt-20 pb-20 overflow-y-auto custom-scrollbar">
                <p class="flex flex-shrink-0 items-center text-iceberg text-xxl px-20 mb-20">How It Works</p>

                <HowItWorks class="flex-grow" />
              </div>
            </template>
          </template>
        </AppTabs>
      </div>
    </div>

    <!-- COMING SOON -->
    <div v-if="isComingSoon" class="w-full flex flex-col">
      <ComingSoonWithoutDesign />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";
import { walletChartOption } from "@/models/default-models";
import { ComingSoon } from "@/core/mixins/coming-soon";
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";
import { namespace } from "vuex-class";

const user = namespace("userModule");
const algobots = namespace("algobotsModule");
const algoBotsInactive = namespace("algoBotsInactiveModule");
const staking = namespace("stakingModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import Description from "@/components/algo-bots/bot-detailed-new/Description.vue";
import ConfigureToActivate from "@/components/algo-bots/bot-detailed-new/ConfigureToActivate.vue";
import BotPerformancesHistory from "@/components/algo-bots/bot-detailed-new/BotPerformancesHistory.vue";
import ConfigureAndFAQMobile from "@/components/algo-bots/bot-detailed-new/mobile/ConfigureAndFAQMobile.vue";
import PerformancesMobile from "@/components/algo-bots/bot-detailed-new/mobile/PerformancesMobile.vue";
import FAQ from "@/components/algo-bots/bot-detailed-new/FAQ.vue";
import HowItWorks from "@/components/algo-bots/bot-detailed-new/HowItWorks.vue";
import BotDetailedInactiveDescription from "@/components/algo-bots/bot-detailed-new/BotDetailedInactiveDescription.vue";
import BotDetailedInactiveBotPerfGraph from "@/components/algo-bots/bot-detailed-new/BotDetailedInactiveBotPerfGraph.vue";
import BotDetailedInactiveConfigureCard from "@/components/algo-bots/bot-detailed-new/BotDetailedInactiveConfigureCard.vue";
import BotDetailedInactivePerfFeeCard from "@/components/algo-bots/bot-detailed-new/BotDetailedInactivePerfFeeCard.vue";
import ComingSoonOverlay from "@/components/algo-bots/bot-detailed-new/ComingSoon.vue";

@Component({
  name: "BotDetailedToActivate",
  components: {
    GeneralLayout,
    Description,
    ConfigureToActivate,
    BotPerformancesHistory,
    BotDetailedInactiveDescription,
    BotDetailedInactiveBotPerfGraph,
    BotDetailedInactiveConfigureCard,
    BotDetailedInactivePerfFeeCard,
    ConfigureAndFAQMobile,
    PerformancesMobile,
    ComingSoonOverlay,
    FAQ,
    HowItWorks,
  },
  mixins: [ComingSoon],
})
export default class BotDetailedToActivate extends Vue {
  /* VUEX */
  @user.Getter hasCouponsWithCorrectPromo: boolean;
  @staking.Getter getStakingAmountSuccess: any;
  @algobots.Getter getAlgoBotById: any;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algoBotsInactive.State botHistoryData: any;
  @algoBotsInactive.Action fetchBotHistoryData: any;
  @staking.Action fetchStakingAmount: any;

  /* DATA */
  mobileTabs: Tab[] = [
    { value: "Configure", componentName: "ConfigureAndFAQMobile" },
    { value: "Performances", componentName: "PerformancesMobile" },
    { value: "How it works", componentName: "HowItWorks" },
  ];
  baseLimit: number = 0;
  algoBot: AlgoBot | null = null;

  /* COMPUTED */
  get algobotData() {
    if (this.$route.params.id) {
      return this.getAlgoBotById(this.$route.params.id);
    } else {
      return null;
    }
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
    if (this.$route.params.id) {
      this.fetchBotHistoryData(this.$route.params.id);
    }

    await this.fetchAlgoBotsAction();

    if (this.$route.params.id) {
      this.algoBot = this.getAlgoBotById(this.$route.params.id);
    }
    this.fetchStakingAmount();
  }

  handleBaseValueChange(value: number) {
    this.baseLimit = value;
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

  @media (max-width: 1280px) {
    &__left-side-tabs {
      max-width: 200px;
    }
    &__chart {
      height: 222px;
    }
    &__right-side-tabs {
      height: 228px;
    }
  }
}

.bot-detailed-description {
  &__wrap {
    min-height: 130px;
  }
}

.bot-detailed-inactive {
  &__top {
    min-height: 799px;
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

::v-deep .bot-detailed-inactive__graph-wrap {
  height: 293px;
}

::v-deep .bot-detailed-inactive {
  &__table-wrap {
    .table__body-wrapper {
      height: 367px;
    }
  }
}
</style>
