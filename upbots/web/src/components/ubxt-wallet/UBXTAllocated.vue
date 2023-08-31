<template>
  <div class="flex flex-col md:py-20">
    <!-- TOTAL BALANCE -->
    <div class="flex flex-col items-center justify-center pb-20 px-20">
      <p class="flex text-iceberg text-md leading-xs mb-20">Total Allocated</p>
      <p class="flex text-white text-xl leading-xs">
        <span class="font-bold block truncate">{{ balance == 0 ? 0 : balance.toFixed(4) }}</span>
        &nbsp;
        <span class="font-light text-iceberg">UBXT</span>
      </p>
    </div>

    <!-- <div class="text-green-cl-200 flex justify-center">+450 UBTX Credit</div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UBXTAllocated" })
export default class UBXTAllocated extends Vue {
  /* PROPS */
  @Prop({ required: true }) balance: number;
}
</script>
