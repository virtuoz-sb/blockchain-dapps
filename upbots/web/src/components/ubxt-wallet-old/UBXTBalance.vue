<template>
  <div class="flex flex-col md:py-20">
    <!-- TOTAL BALANCE -->
    <div class="flex flex-col items-center justify-center md:pt-30 md:pb-60 md:px-20">
      <p class="flex text-grey-cl-920 text-xl leading-xs mb-10">Total balance</p>
      <p class="flex text-blue-cl-500 text-shadow-3 text-xl leading-xs font-bold">
        <span class="block truncate">{{ balance || "N/A" }}</span>
        &nbsp;
        <span>UBXT</span>
      </p>
    </div>

    <div class="grid row-gap-20 lg:grid-cols-3 col-gap-18 mt-20 md:px-20">
      <app-button type="light-green" size="sm" @click="$emit('withdraw')">Withdraw</app-button>
      <app-button type="light-green" size="sm" @click="$emit('click')">Deposit</app-button>
      <app-button type="light-green" size="sm" disabled>Buy</app-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UBXTBalance" })
export default class UBXTBalance extends Vue {
  /* PROPS */
  @Prop({ required: true }) balance: string;
}
</script>
