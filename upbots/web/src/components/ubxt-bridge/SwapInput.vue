<template>
  <div class="flex flex-col w-full border border-solid border-grey-cl-200 rounded-5">
    <div class="flex items-center p-10 md:p-20">
      <ChainTokenIcon :chainName="chainName" class="flex-shrink-0" />

      <div class="flex-grow ml-20">
        <AppInput
          :readonly="readonly"
          :value="value"
          @input="
            (value) => {
              $emit('input', value);
            }
          "
          :min="minAmount"
          :max="maxAmount"
          :placeholder="placeholder"
          custom-class="text-md md:text-xxl bg-transparent"
          is-number
        />
      </div>
    </div>

    <div class="w-full flex border-t border-solid border-grey-cl-200 p-10 md:p-20">
      <span v-if="address" class="text-iceberg">{{ address }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import ChainTokenIcon from "@/components/ubxt-bridge/ChainTokenIcon.vue";

@Component({ name: "SwapInput", components: { ChainTokenIcon } })
export default class SwapInput extends Vue {
  /* PROPS */
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: "eth" }) chainName: string; // eth, bsc
  @Prop({ default: "0.00" }) placeholder: any;
  @Prop({ default: 0 }) value: any;
  @Prop({ default: 0 }) minAmount: number;
  @Prop({ default: 0 }) maxAmount: number;
  @Prop({ default: "" }) address: string;
  @Prop({ default: "" }) customClasses: string;
}
</script>
