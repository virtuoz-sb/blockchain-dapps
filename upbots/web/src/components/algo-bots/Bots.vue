<template>
  <div class="flex flex-col w-full overflow-y-auto custom-scrollbar">
    <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
      <!-- Algobots Widgets -->
      <BotWidgets v-if="!$breakpoint.mdAndDown" class="my-20" />

      <!-- FILTERS -->
      <BotFilters
        :show-button="false"
        @onTextChange="handleTextChange"
        @onStratagyChange="handleStratagyChange"
        @onExchangeChange="handleExchangeChange"
        @onSortedValueChange="handleSortedValueChange"
        @onPairsChange="handlePairsChange"
      />

      <!-- CARDS -->
      <div class="algo-bots__card-wrap grid grid-cols-4 row-gap-25 col-gap-43 flex-grow px-20 md:px-0 pb-80 sm:pb-120 cursor-pointer pt-18">
        <router-link
          v-for="algobot in algobotsList"
          :key="algobot.id"
          :to="{ name: 'algo-bot-detailed', params: { id: algobot.id, name: algobot.name } }"
          tag="div"
          class="flex flex-col flex-grow"
          exact
        >
          <BotCard :chart-option="chartOptions" :bot-data="algobot" chart-classes="h-120" class="flex flex-col flex-grow py-20">
            <div slot="header" class="flex justify-between">
              <div class="flex items-center px-20 mb-15">
                <div class="flex flex-shrink-0 w-35 h-35 rounded-full mr-15">
                  <img :src="botLogoImage(algobot)" alt="img" class="h-full w-full object-cover rounded-full" />
                </div>

                <div class="flex flex-col">
                  <div class="flex items-center mb-4">
                    <div
                      v-for="(token, index) in [algobot.base, algobot.quote]"
                      :key="index"
                      class="flex-shrink-0 rounded-full overflow-hidden"
                      :class="index > 0 && ($breakpoint.smAndDown ? '-ml-8' : '-ml-6')"
                      :style="`z-index: ${index};`"
                    >
                      <CryptoCoinChecker :data="token">
                        <template slot-scope="{ isExist, coinName, srcCoin }">
                          <img
                            v-if="isExist"
                            :src="require(`@/assets/icons/${srcCoin}.png`)"
                            :alt="srcCoin"
                            class="w-20 md:w-24 h-20 md:h-24"
                          />

                          <cryptoicon v-else :symbol="coinName" :size="$breakpoint.width > 767 ? '24' : '20'" generic />
                        </template>
                      </CryptoCoinChecker>
                    </div>

                    <span class="leading-xs text-iceberg font-semibold mr-4 ml-4">{{ algobot.name }}</span>

                    <span class="leading-xs text-iceberg font-semibold">{{ algobot.symbol }}</span>
                  </div>

                  <div class="flex items-center">
                    <div class="flex flex-col">
                      <p class="text-iceberg text-sm leading-xs mr-15 mb-4">{{ algobot.creator }}</p>
                      <p v-if="getEnablePerfFees" class="text-iceberg text-sm leading-xs mr-15">
                        {{ (algobot.perfFees && algobot.perfFees.percent) || 0 }}% Fees
                      </p>
                    </div>
                    <!--
                    <div class="flex items-center" v-if="algobot.ratings">
                      <AppRating :value="algobot.ratings" class="text-xs" />
                      <p class="text-grey-cl-920 text-xs leading-xs ml-10">{{ algobot.ratings }}</p>
                    </div>
                    -->
                  </div>
                </div>
              </div>

              <div v-if="activeBotsIds.includes(algobot.id)" class="text-green-cl-100 text-xl mr-20 text-shadow-2">ACTIVE</div>
              <div v-else-if="pausedBotsIds.includes(algobot.id)" class="text-red-cl-100 text-xl mr-20 text-shadow-2">PAUSED</div>
            </div>
          </BotCard>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AlgoBot, AlgoBotSubscription } from "../../store/algo-bots/types/algo-bots.payload";
import { namespace, Getter } from "vuex-class";
const algobots = namespace("algobotsModule");

@Component({ name: "Bots" })
export default class Bots extends Vue {
  /* VUEX */
  @Getter getEnablePerfFees: boolean;
  @algobots.Getter getAlgoBots: AlgoBot[];
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;

  /* DATA */
  currentMvpPhase: number = 1;
  activeBotsIds: string[] = [];
  pausedBotsIds: string[] = [];
  chartOptions = {
    scales: {
      xAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            callback: function (value: any) {
              return value + "%";
            },
            fontColor: "#427E7E",
          },
        },
      ],
    },
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
    hover: {
      mode: "index",
      intersect: false,
    },
  };
  searchText: string = "";
  stratType: string = "";
  sortedBy: string = "";
  pairValue: string = "";
  selectedExchange: string[] = [];

  /* COMPUTED */
  get algobotsList() {
    // native js search method (includes).
    const botLst = this.getAlgoBots.filter((i: AlgoBot) => {
      return (
        i.name.toLowerCase().includes(this.searchText) &&
        (i.stratType.toLowerCase() === this.stratType.toLowerCase() || this.stratType === "all" || this.stratType === "") &&
        (this.pairValue === i.base + i.quote || this.pairValue === "all" || this.pairValue === "") &&
        this.selectedExchange.includes(i.name)
      );
    });
    return this.sortBotsList(botLst);
  }

  /* HOOKS */
  async mounted() {
    await this.fetchAlgoBotsAction();
    await this.fetchAlgoBotsSubscriptionsAction();

    this.activeBotsIds = this.getBotsSubcriptions.filter((sub) => sub.enabled).map((sub) => sub.botId);
    this.pausedBotsIds = this.getBotsSubcriptions.filter((sub) => !sub.enabled).map((sub) => sub.botId);
  }

  /* METHODS */
  handleTextChange(text: string) {
    this.searchText = text;
  }

  sortBotsList(list: AlgoBot[]) {
    if (this.sortedBy === "performance") {
      return list.sort((a, b) => b.perfSnapshots.allmonths - a.perfSnapshots.allmonths);
    } else if (this.sortedBy === "performance_6m") {
      return list.sort((a, b) => b.perfSnapshots.month6 - a.perfSnapshots.month6);
    } else if (this.sortedBy === "performance_3m") {
      return list.sort((a, b) => b.perfSnapshots.month3 - a.perfSnapshots.month3);
    }
    return list;
  }

  handleStratagyChange(text: string) {
    this.stratType = text;
  }

  handleExchangeChange(botNames: string[]) {
    this.selectedExchange = [...botNames];
  }

  handleSortedValueChange(sortedBy: string) {
    this.sortedBy = sortedBy;
  }

  handlePairsChange(pairValue: string) {
    this.pairValue = pairValue;
  }

  botLogoImage(algobot: AlgoBot) {
    if (algobot.creator === "I-Robot") {
      return require("@/assets/images/IRobot-logo.jpg");
    } else if (algobot.botRef === "FRAMAV2ETH") {
      return require("@/assets/images/gravity-logo.jpeg");
    } else if (algobot.botRef === "ETHINFINITY") {
      return require("@/assets/images/xpr-logo.png");
    } else if (algobot.creator === "Pure Gold Crypto Signals") {
      return require("@/assets/images/PG-logo-white.png");
    } else if (algobot.creator === "Wave Trader") {
      return require("@/assets/images/wt-logo.png");
    }
    return require("@/assets/images/4c_logo.png");
  }
}
</script>

<style lang="scss" scoped>
.algo-bots {
  &__card-wrap {
    grid-auto-rows: minmax(min-content, max-content);

    @media (max-width: 1400px) {
      @apply grid-cols-3;
    }

    @media (max-width: 1200px) {
      @apply grid-cols-2;
    }

    @media (max-width: 800px) {
      @apply grid-cols-1;
    }
  }
}

.bg-blur {
  backdrop-filter: blur(4px);
}
</style>
