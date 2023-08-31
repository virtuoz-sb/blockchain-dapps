<template>
  <div class="flex items-center justify-center">
    <v-popover
      trigger="click"
      :placement="$breakpoint.smAndDown ? 'auto-start' : 'auto-start'"
      offset="10"
      container="body"
      :open="isOpen"
      :auto-hide="false"
    >
      <span class="icon-info flex text-iceberg text-xl ml-4 cursor-pointer" @click.stop="isOpen = true" />

      <template slot="popover">
        <div class="bg-dark-cl-100 text-white text-center border border-solid border-blue-cl-500 rounded-6 py-8 px-4">
          <div class="flex flex-col p-10">
            <div class="flex mb-30">
              <span class="text-xxl text-iceberg">UBXT</span>
              <div class="ml-auto flex items-center">
                <ChainTokenIcon :chainName="srcChainName" customClasses="mr-10 transform scale-75" />
                <i class="icon-arrow-back transform rotate-180" />
                <ChainTokenIcon :chainName="dstChainName" customClasses="ml-10 transform scale-75" />
              </div>
            </div>

            <div class="flex py-15 border-b border-solid border-grey-cl-200">
              <span class="text-lg text-iceberg">Max Swap Amount</span>
              <span v-if="data" class="ml-auto text-lg text-iceberg">{{ data.MaximumSwap | numberWithCommas }} UBXT</span>
            </div>

            <div class="flex py-15 border-b border-solid border-grey-cl-200">
              <span class="text-lg text-iceberg">Min Swap Amount</span>
              <span v-if="data" class="ml-auto text-lg text-iceberg">{{ data.MinimumSwap | numberWithCommas }} UBXT</span>
            </div>

            <div class="flex py-15 border-b border-solid border-grey-cl-200">
              <span class="text-lg text-iceberg">Swap Fee</span>
              <span v-if="data" class="ml-auto text-lg text-iceberg">{{ data.SwapFeeRate | toDefaultFixed }} %</span>
            </div>

            <div class="flex py-15 border-b border-solid border-grey-cl-200">
              <span class="text-lg text-iceberg">Max Fee Amount</span>
              <span v-if="data" class="ml-auto text-lg text-iceberg">{{ data.MaximumSwapFee | toDefaultFixed }} UBXT</span>
            </div>

            <div class="flex py-15 border-b border-solid border-grey-cl-200">
              <span class="text-lg text-iceberg">Min Fee Amount</span>
              <span v-if="data" class="ml-auto text-lg text-iceberg">{{ data.MinimumSwapFee | toDefaultFixed }} UBXT</span>
            </div>

            <div class="flex py-15">
              <span v-if="data" class="text-base text-grey-cl-100">
                Deposits > {{ data.BigValueThreshold | numberWithCommas }} UBXT could take up 12 hours
              </span>
            </div>
          </div>
        </div>
      </template>

      <div v-if="isOpen" class="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-110" @click.stop="isOpen = false" />
    </v-popover>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import ChainTokenIcon from "@/components/ubxt-bridge/ChainTokenIcon.vue";

@Component({ name: "SwapInfo", components: { ChainTokenIcon } })
export default class SwapInfo extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;
  @Prop({ default: "eth" }) srcChainName: string; // eth, bsc
  @Prop({ default: "bsc" }) dstChainName: string; // eth, bsc
  @Prop({ default: "" }) customClasses: string;

  /* DATA */
  isOpen: boolean = false;
}
</script>
