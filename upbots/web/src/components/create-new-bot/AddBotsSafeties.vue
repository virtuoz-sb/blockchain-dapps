<template>
  <div class="flex flex-col flex-shrink-0 mb-30 md:mb-0">
    <!-- TITLE -->
    <!-- <h4 class="text-sm leading-xs text-grey-cl-100 mb-30">
      Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based
      price methods while optimizing your automated trading strategies.
    </h4> -->

    <!-- ROW -->
    <div class="flex items-center justify-between md:justify-start mb-20">
      <p class="flex items-center mr-25">
        <span class="flex-shrink-0 text-sm leading-xs text-white mr-4">Safety 1:</span>
        <span class="text-sm leading-xs text-grey-cl-100">Stop the bot after X losses</span>
      </p>
      <AppSwitcher v-model="stepData.swither1" active-text="On" inactive-text="Off" />
    </div>

    <!-- ROW -->
    <div class="flex flex-col items-start mb-40">
      <p class="text-sm leading-xs text-grey-cl-100 mb-8">Number of losses</p>
      <div class="max-w-240 w-full">
        <AppInput v-model="stepData.numerOfLossesValue" type="text" size="sm" />
      </div>
    </div>

    <!-- ROW -->
    <div class="flex items-center justify-between md:justify-start mb-20">
      <p class="flex items-center mr-25">
        <span class="flex-shrink-0 text-sm leading-xs text-white mr-4">Safety 2:</span>
        <span class="text-sm leading-xs text-grey-cl-100">Activate the bot for X trades</span>
      </p>
      <AppSwitcher v-model="stepData.swither2" active-text="On" inactive-text="Off" />
    </div>

    <!-- ROW -->
    <div class="flex flex-col items-start mb-40">
      <p class="text-sm leading-xs text-grey-cl-100 mb-8">Number of trades</p>
      <div class="max-w-240 w-full">
        <AppInput v-model="stepData.numerOfTradesValue" type="text" size="sm" />
      </div>
    </div>

    <!-- ROW -->
    <div class="flex items-center justify-between md:justify-start mb-20">
      <p class="flex items-center mr-25">
        <span class="flex-shrink-0 text-sm leading-xs text-white mr-4">Safety 3:</span>
        <span class="text-sm leading-xs text-grey-cl-100">Stop the bot after X% of profit</span>
      </p>

      <AppSwitcher v-model="stepData.swither3" active-text="On" inactive-text="Off" />
    </div>

    <!-- ROW -->
    <div class="flex flex-col items-start">
      <p class="text-sm leading-xs text-grey-cl-100 mb-8">Percent of profit</p>
      <div class="max-w-240 w-full">
        <AppInput v-model="stepData.percentOfProfit" type="text" size="sm" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "AddBotsSafeties" })
export default class AddBotsSafeties extends Vue {
  /* DATA */
  stepName: string = "addBotsSafeties";

  stepData: any = {
    swither1: false,
    numerOfLossesValue: "",
    swither2: false,
    numerOfTradesValue: "",
    swither3: false,
    percentOfProfit: "",
  };
}
</script>
