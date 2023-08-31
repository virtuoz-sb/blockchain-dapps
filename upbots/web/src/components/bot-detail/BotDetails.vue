<template>
  <div
    class="grid h-auto md:overflow-y-auto custom-scrollbar px-20 md:my-20"
    :class="[
      $breakpoint.width < 414 && 'grid-cols-1 row-gap-30',
      $breakpoint.width >= 414 && $breakpoint.width < 768 && 'grid-cols-2 row-gap-30 col-gap-20',
      $breakpoint.width > 767 && $breakpoint.width <= 1279 && 'grid-cols-1 row-gap-40',
      $breakpoint.width > 1279 && 'grid-cols-3 row-gap-40 col-gap-30',
    ]"
  >
    <!-- BOT PARAMETERS -->
    <div class="flex flex-col">
      <div class="flex items-center mb-10">
        <span class="icon-shadow icon-list text-xl1 text-blue-cl-400 mr-12" />
        <span class="leading-md text-white">Bot Parameters</span>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Your account:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botParameters.yourAccount ? data.botParameters.yourAccount : "-" }}
          </span>
        </div>
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Exchange:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botParameters.exchange ? data.botParameters.exchange : "-" }}
          </span>
        </div>
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Pair:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botParameters.pair ? data.botParameters.pair : "-" }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Strategy:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botParameters.strategy ? data.botParameters.strategy : "-" }}
          </span>
        </div>
      </div>
    </div>

    <!-- BOT ENTRY LONG POSITION -->
    <div class="flex flex-col" v-if="data.botParameters.strategy !== 'Short'">
      <div class="flex items-center mb-10">
        <div class="flex items-center">
          <span class="icon-shadow icon-power text-xl1 text-blue-cl-400 mr-12" />
          <span class="leading-md text-white mr-15">Bot Entry</span>
        </div>
        <div class="flex">
          <span class="text-sm leading-xs text-grey-cl-400">Long Order</span>
        </div>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Entry Trigger:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryLong ? data.botEntryLong.entryTrigger : "-" }}
          </span>
        </div>
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Order Type:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryLong.orderType ? data.botEntryLong.orderType : "-" }}
          </span>
        </div>
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Size Position:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryLong.sizePosition ? data.botEntryLong.sizePosition : "-" }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Leverage:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryLong.leverage ? data.botEntryLong.leverage : "-" }}
          </span>
        </div>
      </div>
    </div>

    <!-- BOT ENTRY SHORT POSITION -->
    <div class="flex flex-col" v-if="data.botParameters.strategy !== 'Long'">
      <div class="flex items-center mb-10">
        <div class="flex items-center">
          <span class="icon-shadow icon-power text-xl1 text-blue-cl-400 mr-12" />
          <span class="leading-md text-white mr-15">Bot Entry</span>
        </div>
        <div class="flex">
          <span class="text-sm leading-xs text-grey-cl-400">Short Order</span>
        </div>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Entry Trigger:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryShort ? data.botEntryShort.entryTrigger : "-" }}
          </span>
        </div>
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Order Type:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryShort.orderType ? data.botEntryShort.orderType : "-" }}
          </span>
        </div>
        <div class="flex items-center mb-12">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Size Position:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryShort.sizePosition ? data.botEntryShort.sizePosition : "-" }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="text-sm leading-xs text-grey-cl-100 mr-4">Leverage:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botEntryShort.leverage ? data.botEntryShort.leverage : "-" }}
          </span>
        </div>
      </div>
    </div>

    <!-- AVERAGE DOWN -->
    <div class="flex flex-col">
      <div class="flex items-center justify-between mb-10">
        <div class="flex items-center">
          <span class="icon-shadow icon-triangle text-xl1 text-blue-cl-400 mr-12" />
          <span class="leading-md text-white">Average Down</span>
        </div>
      </div>
      <div class="flex flex-col mb-10">
        <p class="text-sm leading-xs text-grey-cl-400 mb-15">Level 1</p>
        <div class="flex flex-col">
          <div class="flex items-center mb-12">
            <span class="text-sm leading-xs text-grey-cl-100 mr-4">% below price:</span>
            <span class="text-sm leading-xs text-white text-right">
              {{ data && data.averageDown.level1.belowPrice ? data.averageDown.level1.belowPrice : "-" }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-sm leading-xs text-grey-cl-100 mr-4">Size position regarding initial order (%):</span>
            <span class="text-sm leading-xs text-white">
              {{ data && data.averageDown.level1.sizePosition ? data.averageDown.level1.sizePosition : "-" }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex flex-col">
        <p class="text-sm leading-xs text-grey-cl-400 mb-15">Level 2</p>
        <div class="flex flex-col">
          <div class="flex items-center mb-12">
            <span class="text-sm leading-xs text-grey-cl-100 mr-4">% below price:</span>
            <span class="text-sm leading-xs text-white text-right">
              {{ data && data.averageDown.level2.belowPrice ? data.averageDown.level2.belowPrice : "-" }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-sm leading-xs text-grey-cl-100 mr-4">Size position regarding initial order (%):</span>
            <span class="text-sm leading-xs text-white">
              {{ data && data.averageDown.level2.sizePosition ? data.averageDown.level2.sizePosition : "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTS EXIT -->
    <div class="flex flex-col">
      <div class="flex items-center mb-10">
        <span class="icon-shadow icon-power-1 text-xl1 text-blue-cl-400 mr-12" />
        <span class="leading-md text-white">Bot Exit</span>
      </div>
      <div class="flex items-center mb-20">
        <span class="text-sm leading-xs text-grey-cl-100 mr-4">Trigger:</span>
        <span class="text-sm leading-xs text-white">
          {{ data && data.botsExit.trigger ? data.botsExit.trigger : "-" }}
        </span>
      </div>
      <p class="text-sm leading-xs text-grey-cl-400 mb-10">Target</p>
      <div v-if="data && data.botsExit.target">
        <div class="flex flex-col mb-20" v-for="(item, index) in data.botsExit.target" :key="index">
          <div class="flex items-center">
            <p class="text-grey-cl-100 text-xs leading-md mr-2">{{ index + 1 }}</p>
            <div class="flex">
              <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item && item.type ? item.type : "-" }}
              </div>
              <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item && item.targetType ? item.targetType : "-" }}
              </div>
              <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item && item.profit ? item.profit : "-" }}
              </div>
              <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item && item.profitPercentage ? item.profitPercentage : "-" }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-grey-cl-100 text-xs leading-md mb-20">None</p>
      <div class="flex flex-col">
        <p class="text-sm leading-xs text-grey-cl-400 mb-10">Stop/Loss</p>
        <div v-if="data && data.botsExit.stopLoss" class="flex items-center">
          <div class="flex">
            <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
              {{ data && data.botsExit.stopLoss.stopType ? data.botsExit.stopLoss.stopType : "-" }}
            </div>
            <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
            <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
              {{ data && data.botsExit.stopLoss.entryPrice ? data.botsExit.stopLoss.entryPrice : "-" }}
            </div>
            <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
            <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">
              {{ data && data.botsExit.stopLoss.profitPercentage ? data.botsExit.stopLoss.profitPercentage : "-" }}
            </div>
          </div>
        </div>
        <p v-else class="text-grey-cl-100 text-xs leading-md">None</p>
      </div>
    </div>

    <!-- BOTS SAFETIES -->
    <div class="flex flex-col">
      <div class="flex items-center mb-10">
        <span class="icon-shadow icon-shield text-xl1 text-blue-cl-400 mr-12" />
        <span class="leading-md text-white">Bot Safeties</span>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center text-sm leading-xs mb-12">
          <span class="text-grey-cl-100 mr-4">Stop the bot after losses:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botSafeties.losses ? data.botSafeties.losses : "-" }}
          </span>
        </div>
        <div class="flex items-center text-sm leading-xs mb-12">
          <span class="text-grey-cl-100 mr-4">Activate the bot for trades:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botSafeties.trades ? data.botSafeties.trades : "-" }}
          </span>
        </div>
        <div class="flex items-center text-sm leading-xs">
          <span class="text-grey-cl-100 pr-4">Stop the bot after profit:</span>
          <span class="text-sm leading-xs text-white">
            {{ data && data.botSafeties.profit ? data.botSafeties.profit : "-" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "BotDetails" })
export default class BotDetails extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;
}
</script>
