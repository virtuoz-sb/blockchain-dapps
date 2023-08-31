<template>
  <div class="flex flex-col md:py-20">
    <!-- TOTAL BALANCE -->
    <div class="flex flex-col items-center justify-center md:pb-20 md:px-20">
      <p class="flex text-iceberg text-md leading-xs mb-20">Total Available</p>
      <p class="flex text-white text-xl leading-xs font-bold">
        <span class="block truncate">{{ Number.isInteger(balance) ? balance : balance.toFixed(4) }}</span>
        &nbsp;
        <span class="font-light text-iceberg">UBXT</span>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UBXTAvailable" })
export default class UBXTAvailable extends Vue {
  /* PROPS */
  @Prop({ required: true }) balance: number;
}
</script>
