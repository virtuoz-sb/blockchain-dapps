<template>
  <div class="flex flex-col flex-grow p-20">
    <div class="flex items-center mb-24">
      <span class="text-sm leading-xs text-grey-cl-920 mr-8">Active since:</span>
      <span class="text-sm leading-xs text-white">{{ data.activeSince }}</span>
    </div>
    <div class="flex items-center mb-24">
      <span class="text-sm leading-xs text-grey-cl-920 mr-8">Account:</span>
      <span class="text-sm leading-xs text-white">{{ data.account }}</span>
    </div>
    <div class="flex items-center mb-24">
      <div class="flex mr-8">
        <span class="text-sm leading-xs text-grey-cl-920">Pair:</span>
      </div>
      <div class="flex items-center">
        <span class="text-sm leading-xs text-white border-r border-solid border-grey-cl-400 mr-12 pr-12">{{ data.pair[0] }}</span>
        <span class="text-sm leading-xs text-white">{{ data.pair[1] }}</span>
      </div>
    </div>
    <div>
      <span class="text-sm leading-xs text-grey-cl-920 mr-8">Allocated capital:</span>
      <span class="text-sm leading-xs text-blue-cl-500 text-shadow-3">{{ data.allocatedCapital }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "BotParameters" })
export default class BotParameters extends Vue {
  /* DATA */
  data: any = {
    activeSince: "19.05.2020",
    account: "Binance 1",
    pair: ["LINK", "USDT"],
    allocatedCapital: "3.000",
  };
}
</script>
