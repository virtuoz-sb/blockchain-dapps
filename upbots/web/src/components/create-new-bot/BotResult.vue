<template>
  <div class="flex flex-col h-full overflow-y-auto custom-scrollbar py-20 px-20">
    <div class="bot-result__items-wrap h-full overflow-y-auto custom-scrollbar">
      <!-- BOT PARAMETERS -->
      <div class="flex flex-col">
        <div class="flex items-center mb-12">
          <span class="icon-shadow icon-list text-xl1 text-blue-cl-400 mr-12" />
          <span class="leading-md text-white">Bot Parameters</span>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Your account:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botParameters.selectYourAccount ? data.botParameters.selectYourAccount.label : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Exchange:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botParameters.exchange ? data.botParameters.exchange : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Pair:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botParameters.selectPairToTrade ? data.botParameters.selectPairToTrade.label : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Strategy:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botParameters.botType ? data.botParameters.botType : "-" }}
            </span>
          </div>
        </div>
      </div>

      <!-- BOT ENTRY -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center">
            <span class="icon-shadow icon-power text-xl1 text-blue-cl-400 mr-12" />
            <span class="leading-md text-white mr-15">Bot Entry</span>
          </div>
          <div class="h-23 flex items-center">
            <div v-if="data.botParameters.botType === 'Long'" class="flex">
              <span class="text-xs text-grey-cl-100">Long</span>
            </div>
            <div v-if="data.botParameters.botType === 'Short'" class="flex">
              <span class="text-xs text-grey-cl-100">Short</span>
            </div>
            <AppButtonsGroup
              v-if="data.botParameters.botType === 'Long & Short'"
              class="entry__group-btn"
              v-model="botEntryType"
              :items="botEntryData"
              customClasses="hidden md:flex max-w-full text-grey-cl-200 text-xs py-2"
            />
          </div>
        </div>

        <div v-if="entryType" class="flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Entry Trigger:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.longEntryTrigger ? data.botEntry.longEntryTrigger : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Order Type:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.longOrderType ? data.botEntry.longOrderType.label : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Position Size:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.longSizePositionPercentage ? data.botEntry.longSizePositionPercentage : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Leverage:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.longDefineLeverageValue ? data.botEntry.longDefineLeverageValue : "-" }}
            </span>
          </div>
        </div>

        <div v-else class="flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Entry Trigger:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.shortEntryTrigger ? data.botEntry.shortEntryTrigger : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Order Type:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.shortOrderType ? data.botEntry.shortOrderType.label : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-8">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Position Size:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.shortSizePositionPercentage ? data.botEntry.shortSizePositionPercentage : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm leading-xs text-grey-cl-100 mr-20">Leverage:</span>
            <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
              {{ data && data.botEntry.shortDefineLeverageValue ? data.botEntry.shortDefineLeverageValue : "-" }}
            </span>
          </div>
        </div>
      </div>

      <!-- AVERAGE DOWN -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center">
            <span class="icon-shadow icon-triangle text-xl1 text-blue-cl-400 mr-12" />
            <span class="leading-md text-white">Average Down</span>
          </div>
          <AppDropdownBasic v-model="averageDownLvlValue" :options="dropDownData" dark />
        </div>
        <div class="flex flex-col mb-10 last:mb-0">
          <p class="text-sm leading-xs text-grey-cl-400 mb-6">{{ averageDownLvlValue.label }}</p>
          <div class="flex flex-col">
            <div class="flex items-center justify-between mb-8">
              <span class="text-sm leading-xs text-grey-cl-100 mr-20">% below price:</span>
              <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
                {{ averageDownData && averageDownData.belowPrice ? averageDownData.belowPrice : "-" }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm leading-xs text-grey-cl-100 max-w-120 w-full mr-20">Size position regarding initial order (%):</span>
              <span class="w-1/2 truncate text-sm leading-xs text-white text-right">
                {{ averageDownData && averageDownData.sizePosition ? averageDownData.sizePosition : "-" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTS EXIT -->
      <div class="flex flex-col">
        <div class="flex items-center mb-12">
          <span class="icon-shadow icon-power-1 text-xl1 text-blue-cl-400 mr-12" />
          <span class="leading-md text-white">Bot Exit</span>
        </div>
        <div class="flex items-center justify-between mb-8">
          <span class="text-sm leading-xs text-grey-cl-100 mr-6">Trigger:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botsExit.trigger ? data.botsExit.trigger : "-" }}
          </span>
        </div>
        <p class="text-sm leading-xs text-grey-cl-400 mb-8">Target</p>
        <div v-if="data.botsExit.target && data.botsExit.target.length">
          <div class="flex flex-col mb-8" v-for="(item, index) in data.botsExit.target" :key="index">
            <div class="flex items-center">
              <p class="text-grey-cl-100 text-xs leading-md mr-2">{{ index + 1 }}.</p>
              <div class="flex">
                <div class="max-w-47 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                  {{ item && item.limit.label ? item.limit.label : "-" }}
                </div>
                <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
                <div class="max-w-47 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                  {{ item && item.targetType.label ? item.targetType.label : "-" }}
                </div>
                <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
                <div class="max-w-47 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                  {{ item && item.profit ? item.targetType.label : "-" }}
                </div>
                <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
                <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                  {{ item && item.percentageValue ? `${item.percentageValue}%` : "-" }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-grey-cl-100 text-xs leading-md mb-8">None</p>
        <p class="text-sm leading-xs text-grey-cl-400 mb-8">Stop/Loss</p>
        <div v-if="data.botsExit.stopLoss && data.botsExit.stopLoss.length">
          <div class="flex flex-col mb-8" v-for="(item, index) in data.botsExit.stopLoss" :key="index">
            <div class="flex items-center">
              <p class="text-grey-cl-100 text-xs leading-md mr-2">{{ index + 1 }}.</p>
              <div class="flex">
                <div class="max-w-50 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                  {{ item && item.stopLossValue.label ? item.stopLossValue.label : "-" }}
                </div>
                <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
                <div class="max-w-100 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                  {{ item && item.entryPrice ? item.entryPrice : "-" }}
                </div>
                <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
                <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                  {{ item && item.percentageValue ? `${item.percentageValue}%` : "-" }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-grey-cl-100 text-xs leading-md mb-8">None</p>
      </div>

      <!-- BOTS SAFETIES -->
      <div class="flex flex-col">
        <div class="flex items-center mb-12">
          <span class="icon-shadow icon-shield text-xl1 text-blue-cl-400 mr-12" />
          <span class="leading-md text-white">Bot Safeties</span>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center justify-between text-sm leading-xs mb-8">
            <span class="w-7/10 text-grey-cl-100 pr-10">Stop the bot after losses</span>
            <span class="w-3/10 truncate text-sm leading-xs text-white text-right">
              {{ data && data.addBotsSafeties.numerOfLossesValue ? data.addBotsSafeties.numerOfLossesValue : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm leading-xs mb-8">
            <span class="w-7/10 text-grey-cl-100 pr-10">Activate the bot for trades</span>
            <span class="w-3/10 truncate text-sm leading-xs text-white text-right">
              {{ data && data.addBotsSafeties.numerOfTradesValue ? data.addBotsSafeties.numerOfTradesValue : "-" }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm leading-xs">
            <span class="w-7/10 text-grey-cl-100 pr-10">Stop the bot after profit</span>
            <span class="w-3/10 truncate text-sm leading-xs text-white text-right">
              {{ data && data.addBotsSafeties.percentOfProfit ? data.addBotsSafeties.percentOfProfit : "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";

@Component({ name: "BotResult" })
export default class BotResult extends Vue {
  /* PROPS */
  @Prop({ required: true }) data!: any;

  /* DATA */
  botEntryType: string = "Long";

  botEntryData: GroupItems[] = [
    { label: "Long", value: "Long" },
    { label: "Short", value: "Short" },
  ];

  averageDownLvlValue: GroupItems = { label: "Level 1", value: 0 };

  /* COMPUTED */
  get dropDownData() {
    if (this.data && this.data.averageDown.length) {
      const length = this.data.averageDown.length;
      return Array.from({ length }, (v, k) => {
        return { label: `Level ${k + 1}`, value: k };
      });
    }
    return this.data;
  }

  get averageDownData() {
    return this.data.averageDown[this.averageDownLvlValue.value];
  }

  /* it is for bot entry type (long or short) */
  get entryType() {
    return (
      this.data.botParameters.botType === "Long" || (this.data.botParameters.botType === "Long & Short" && this.botEntryType === "Long")
    );
  }
}
</script>

<style lang="scss" scoped>
.bot-result {
  &__items-wrap {
    @apply grid grid-cols-1 row-gap-15;
    grid-auto-rows: minmax(min-content, max-content);
  }
  @media (min-width: 1440px) {
    &__items-wrap {
      @apply grid grid-cols-2 row-gap-50 col-gap-30;
    }
  }
}
.entry {
  &__group-btn {
    width: 96px;
  }
}

.average {
  &__group-btn {
    width: 70px;
  }
}
</style>
