<template>
  <!-- BOT ENTRY STEP 1 -->
  <div class="flex flex-col flex-shrink-0 mb-30 md:mb-0">
    <!-- TITLE -->
    <!-- <h2 class="text-sm leading-xs text-grey-cl-100 mb-30">
      Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based
      price methods while optimizing your automated trading strategies.
    </h2> -->

    <!-- BOT ENTRY ORDER TYPE -->
    <div class="bot-entry__order-btn-group flex items-center flex-shrink-0 h-40 mb-30 md:mb-40">
      <div v-if="botType === 'Long'" class="flex">
        <span class="text-base text-white">Long Order</span>
      </div>
      <div v-if="botType === 'Short'" class="flex">
        <span class="text-base text-white">Short Order</span>
      </div>

      <AppButtonsGroup
        v-if="botType === 'Long & Short'"
        v-model="botEntryOrderType"
        :items="botEntryOrderTypeData"
        class="w-full"
        customClasses="max-w-100 text-grey-cl-200 py-7 px-5"
      />
    </div>

    <!-- LONG ORDER -->
    <div
      v-if="botType === 'Long' || (botType === 'Long & Short' && botEntryOrderType === 'longOrder')"
      class="w-full flex flex-col lg:flex-row mb-30 md:mb-50 lg:mb-55 xl:mb-100"
    >
      <div class="lg:max-w-240 w-full lg:mr-140 mb-30 md:mb-50 lg:mb-0">
        <h3 class="leading-md text-white mb-20">Entry Trigger</h3>
        <p class="text-sm leading-md text-grey-cl-100">{{ stepData.longEntryTrigger }}</p>
      </div>
      <div class="lg:max-w-240 w-full">
        <h3 class="leading-md text-white mb-20">Select Order Type</h3>
        <div class="flex flex-col items-start w-full">
          <p class="text-grey-cl-100 text-sm leading-xs mb-8">Order Type</p>
          <AppSelect v-model="stepData.longOrderType" :options="longOrderTypeData" class="w-full" />
        </div>
      </div>
    </div>

    <!-- ROW -->
    <div
      v-if="botType === 'Long' || (botType === 'Long & Short' && botEntryOrderType === 'longOrder')"
      class="w-full flex flex-col lg:flex-row md:mb-50 lg:mb-55 xl:mb-100"
    >
      <div class="flex flex-col lg:max-w-240 w-full lg:mr-140 mb-30 md:mb-50 lg:mb-0">
        <h3 class="text-white leading-md mb-22">Position Size</h3>
        <AppItemsGroup v-model="stepData.longSizePositionPercentage" :items="longSizePositionPercentageData" class="mb-18 md:mb-15" />
        <div class="flex flex-col">
          <p class="text-grey-cl-100 text-sm leading-xs mb-8">Or Amount</p>
          <AppInput v-model="stepData.longSizePositionAmount" type="text" size="sm" />
        </div>
      </div>
      <div class="flex flex-col lg:max-w-240 w-full">
        <div class="flex items-center justify-between mb-40">
          <p class="text-white leading-md">Define Leverage</p>
          <AppCheckbox v-model="longDefineLeverageChecked">Cross</AppCheckbox>
        </div>
        <AppRangeSlider
          :disabled="longDefineLeverageChecked"
          :options="{ min: 1, max: 100 }"
          v-model="stepData.longDefineLeverageValue"
          labels="x"
          tooltip="active"
          :formatter="`${stepData.longDefineLeverageValue}x`"
        />
      </div>
    </div>

    <!-- SHORT ORDER -->
    <div
      v-if="botType === 'Short' || (botType === 'Long & Short' && botEntryOrderType === 'shortOrder')"
      class="w-full flex flex-col lg:flex-row mb-30 md:mb-50 lg:mb-55 xl:mb-100"
    >
      <div class="flex flex-col lg:max-w-240 w-full lg:mr-140 mb-30 md:mb-50 lg:mb-0">
        <h3 class="leading-md text-white mb-20">Entry Trigger</h3>
        <p class="text-sm leading-md text-grey-cl-100">{{ stepData.shortEntryTrigger }}</p>
      </div>
      <div class="lg:max-w-240 w-full">
        <h3 class="leading-md text-white mb-20">Select Order Type</h3>
        <div class="flex flex-col items-start w-full">
          <p class="text-grey-cl-100 text-sm leading-xs mb-8">Order Type</p>
          <AppSelect v-model="stepData.shortOrderType" :options="shortOrderTypeData" class="w-full" />
        </div>
      </div>
    </div>

    <!-- ROW -->
    <div
      v-if="botType === 'Short' || (botType === 'Long & Short' && botEntryOrderType === 'shortOrder')"
      class="w-full flex flex-col lg:flex-row md:mb-50 lg:mb-55 xl:mb-100"
    >
      <div class="flex flex-col lg:max-w-240 w-full lg:mr-140 mb-30 md:mb-50 lg:mb-0">
        <h3 class="text-white leading-md mb-22">Position Size</h3>
        <AppItemsGroup v-model="stepData.shortSizePositionPercentage" :items="shortSizePositionPercentageData" class="mb-15" />
        <div class="flex flex-col mb-25">
          <p class="text-grey-cl-100 text-sm leading-xs mb-8">Or Amount</p>
          <AppInput v-model="stepData.shortSizePositionAmount" type="text" size="sm" />
        </div>
      </div>
      <div class="flex flex-col lg:max-w-240 w-full">
        <div class="flex items-center justify-between mb-40">
          <p class="text-white leading-md">Define Leverage</p>
          <AppCheckbox v-model="shortDefineLeverageChecked">Cross</AppCheckbox>
        </div>
        <AppRangeSlider
          :disabled="shortDefineLeverageChecked"
          :options="{ min: 1, max: 100 }"
          v-model="stepData.shortDefineLeverageValue"
          labels="x"
          tooltip="active"
          :formatter="`${stepData.shortDefineLeverageValue}x`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";

@Component({ name: "BotEntry" })
export default class BotEntry extends Vue {
  /* PROPS */
  @Prop({ required: true }) botType: any;

  /* DATA */
  stepName: string = "botEntry";

  /* Bot entry type */
  botEntryOrderType: string = "longOrder" || this.botType;

  botEntryOrderTypeData: GroupItems[] = [
    { value: "longOrder", label: "Long order" },
    { value: "shortOrder", label: "Short order" },
  ];

  /* bot entry stepData long/short */
  stepData: any = {
    longEntryTrigger: "TradingView",
    longOrderType: { label: "Adaptive Limit" },
    longSizePositionPercentage: "50",
    longSizePositionAmount: "",
    longDefineLeverageValue: 33,

    shortEntryTrigger: "TradingView",
    shortOrderType: { label: "Select" },
    shortSizePositionPercentage: "50",
    shortSizePositionAmount: "",
    shortDefineLeverageValue: 33,
  };

  shortDefineLeverageChecked: boolean = false;
  longDefineLeverageChecked: boolean = false;

  longOrderTypeData: any[] = [{ label: "Adaptive Limit" }, { label: "Limit order" }, { label: "Market order" }];
  shortOrderTypeData: any[] = [{ label: "Adaptive Limit" }, { label: "Limit order" }, { label: "Market order" }];

  longSizePositionPercentageData: GroupItems[] = [
    { value: "25", label: "25%" },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
  ];

  shortSizePositionPercentageData: GroupItems[] = [
    { value: "25", label: "25%" },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
  ];
}
</script>
