<template>
  <div v-if="!$breakpoint.smAndDown" class="my-performance flex flex-col p-20">
    <!-- TITLE -->
    <h2 class="text-iceberg text-md leading-xs mb-10">My Performance</h2>

    <div class="flex items-start justify-around h-full">
      <div class="flex flex-col flex-grow justify-around items-center h-full">
        <span class="text-iceberg">Total profit %</span>
        <AppPercentageSpan class="text-xl leading-xs font-bold" :data="totalProfit" />
        <!-- <span class="text-green-cl-100 text-xl leading-xs font-bold">{{ totalProfit | toTwoDecimalDigitFixed }} %</span> -->
      </div>

      <!-- DIVIDER -->
      <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

      <div class="flex flex-col flex-grow justify-around items-center h-full">
        <p class="text-iceberg">Total USDT profit</p>
        <div class="flex items-center text-white text-xl leading-xs font-bold">
          {{ totalRealisedGain | toTwoDecimalDigitFixed }}
          <span class="ml-4 pt-2 text-sm">USDT</span>
        </div>
      </div>

      <!-- DIVIDER -->
      <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

      <div class="flex flex-col flex-grow justify-around items-center h-full">
        <span class="text-iceberg">Activation days</span>
        <span class="text-white text-xl leading-xs font-bold">{{ daysRunning }}</span>
      </div>
    </div>
  </div>

  <div class="flex flex-col" v-else>
    <h2 class="text-iceberg text-md leading-xs mb-20">My Performance</h2>

    <div class="grid grid-cols-3 col-gap-10">
      <div class="flex flex-col items-center border-r border-solid border-hei-se-black pr-10">
        <p class="text-iceberg leading-xs mb-10">Total profit %</p>
        <AppPercentageSpan class="text-xl leading-xs font-bold" :data="totalProfit" />
      </div>

      <div class="flex flex-col items-center border-r border-solid border-hei-se-black pr-10">
        <p class="text-iceberg leading-xs mb-10">Total USDT profit</p>
        <div class="flex items-center text-white text-xl leading-xs font-bold">
          {{ totalRealisedGain | toTwoDecimalDigitFixed }}
          <span class="ml-4 pt-2 text-sm">USDT</span>
        </div>
      </div>

      <div class="flex flex-col items-center pr-10">
        <span class="text-iceberg leading-xs mb-10">Activation days</span>
        <span class="text-white text-xl leading-xs font-bold">{{ daysRunning }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import moment from "moment";

import { AlgoBot, BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

const algobots = namespace("algobotsModule");

@Component({ name: "MyPerformances" })
export default class MyPerformances extends Vue {
  /* VUEX */
  @algobots.Getter getBotSubscriptionCycles: BotPerformanceCycleDto[];
  @algobots.Getter getSubscribedAlgoBotById: any;

  /* PROPS */
  @Prop({ required: true }) algobot: AlgoBot;

  /* DATA */

  /* COMPUTED */
  get totalProfit() {
    let total = 0;
    this.getBotSubscriptionCycles.forEach((cycle) => {
      if (cycle.profitPercentage) {
        total = total + cycle.profitPercentage;
      }
    });
    return total;
  }

  get totalRealisedGain() {
    let total = 0;
    this.getBotSubscriptionCycles.forEach((cycle) => {
      if (cycle.realisedGain) {
        total = total + cycle.realisedGain.usd;
      }
    });
    return total;
  }

  get daysRunning() {
    const subscription = this.getSubscribedAlgoBotById(this.algobot.id);
    if (subscription && subscription.createdAt) {
      let subscriptionCreatedDate = subscription.createdAt;
      let formatedData = moment(new Date()).diff(moment(subscriptionCreatedDate), "day");

      return formatedData < 1 ? "-" : `${formatedData} d`;
    } else {
      return null;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.my-performance {
  height: 130px;
}
</style>
