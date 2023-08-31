<template>
  <div class="flex flex-col">
    <div class="flex items-center flex-shrink-0 mb-30">
      <div class="flex items-center justify-center w-60 h-60 rounded-full overflow-hidden">
        <img :src="botLogoImage" alt="Exchange Logo" class="h-full w-full object-cover" />
      </div>

      <div class="flex flex-col ml-18">
        <span class="text-hidden-sea-glass text-md font-bold">{{ algoBot && algoBot.name }}</span>
        <span class="text-white text-md font-bold">{{ algoBot && algoBot.creator }}</span>
      </div>
    </div>

    <div class="flex-shrink-0 w-full mb-28">
      <span class="text-white text-md font-medium">{{ algoBot && algoBot.description }}</span>
    </div>

    <div v-if="algoBot" class="grid grid-cols-2 col-gap-20 row-gap-20 flex-shrink-0 mb-28">
      <span
        v-for="(item, index) in discriptionTagData"
        :key="index"
        class="bot-detailed-inactive__description-card-tag flex items-center justify-center text-base text-white leading-xs font-bold py-8 px-6 rounded-full"
      >
        {{ item }}
      </span>
    </div>

    <ul class="flex flex-col flex-shrink-0 mb-28">
      <li class="grid grid-cols-2 col-gap-20 items-center mb-15">
        <span class="text-base leading-xs text-white">Trade / month</span>
        <span class="text-tradewind text-xl leading-xs font-medium">{{ algoBot && algoBot.lastMonthTrades }}</span>
        <!-- <span class="text-tradewind text-xl leading-xs font-medium">{{ algoBot && algoBot.avgtrades }}</span> -->
      </li>

      <li class="grid grid-cols-2 col-gap-20 items-center mb-15">
        <span class="text-base leading-xs text-white">Max Drawdown</span>
        <span class="text-tradewind text-xl leading-xs font-medium">
          {{ algoBot.perfSnapshots && algoBot.perfSnapshots.maxDrawdown && algoBot.perfSnapshots.maxDrawdown.toFixed(1) }}
        </span>
      </li>

      <li v-if="getEnablePerfFees" class="grid grid-cols-2 col-gap-20 items-center mb-15">
        <span class="text-base leading-xs text-white">Fees rate</span>
        <span class="text-tradewind text-xl leading-xs font-medium">{{ getBotPerfFees }}%</span>
      </li>

      <!-- TODO -->
      <!-- <li class="grid grid-cols-2 col-gap-20 items-center">
        <span class="text-base leading-xs text-white">Total profit</span>
        <AppPercentageSpan class="text-xl leading-xs font-medium" :data="totalProfit" />
      </li> -->
    </ul>

    <BotDetailedStatistics v-if="algoBot" :statistics-data="algoBot.perfSnapshots" class="flex-shrink-0 mb-16" />

    <a v-if="!$breakpoint.smAndDown" href="#configure" class="flex items-center flex-shrink-0 cursor-pointer mt-auto">
      <AppButton type="light-green" size="xs" class="w-2/5 mx-auto">Configure</AppButton>
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace, Getter } from "vuex-class";
import { AlgobotsData } from "@/store/algo-bots/types/algo-bots.const";

const algoBotsInactive = namespace("algoBotsInactiveModule");

const dummyTagsData = AlgobotsData;

import BotDetailedStatistics from "@/components/algo-bots/bot-detailed-new/BotDetailedStatistics.vue";

@Component({ name: "BotDetailedInactiveDescription", components: { BotDetailedStatistics } })
export default class BotDetailedInactiveDescription extends Vue {
  /* VUEX */
  @Getter getEnablePerfFees: boolean;
  @algoBotsInactive.State botHistoryData: any;
  @algoBotsInactive.Getter totalProfit: string;

  /* PROPS */
  @Prop({ required: true }) algoBot: any;

  /* COMPUTED */
  get discriptionTagData() {
    if (this.$route.params.id) {
      const baseQuoteCurrency = (this.algoBot.base + this.algoBot.quote).toUpperCase();
      const startType = this.algoBot.stratType.toUpperCase();
      return [baseQuoteCurrency, startType, ...this.filteredDummyTagsData];
    } else {
      return null;
    }
  }

  get filteredDummyTagsData() {
    const exEl = dummyTagsData.find((tag: any) => {
      return tag.botRef === this.algoBot.botRef;
    });

    return exEl.exchangesType.map((el: any) => {
      return el;
    });
  }

  get botLogoImage() {
    if (this.algoBot) {
      if (this.algoBot.creator === "I-Robot") {
        return require("@/assets/images/IRobot-logo.jpg");
      } else if (this.algoBot.botRef === "FRAMAV2ETH") {
        return require("@/assets/images/gravity-logo.jpeg");
      } else if (this.algoBot.botRef === "ETHINFINITY") {
        return require("@/assets/images/xpr-logo.png");
      } else if (this.algoBot.creator === "Pure Gold Crypto Signals") {
        return require("@/assets/images/PG-logo-white.png");
      } else if (this.algoBot.creator === "Wave Trader") {
        return require("@/assets/images/wt-logo.png");
      }
    }
    return require("@/assets/images/4c_logo.png");
  }

  get getBotPerfFees() {
    if (!this.algoBot) {
      return 0;
    }
    if (this.algoBot.botRef === "AVAXUSDT1" || this.algoBot.botRef === "TOMOLO1") {
      return 0;
    }
    return this.algoBot.perfFees.percent;
  }
}
</script>

<style lang="scss" scoped>
.bot-detailed-inactive {
  &__description-card-tag {
    width: 110px;
    background: rgba(66, 128, 128, 0.55);
  }

  &__description-perf-card {
    background: rgba(14, 19, 26, 0.28);
  }
}
</style>
