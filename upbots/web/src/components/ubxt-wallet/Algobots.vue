<template>
  <div class="flex flex-col pt-27 pb-20 px-20">
    <div class="flex mb-10">
      <!-- EARNED -->
      <div class="flex flex-col items-center justify-center w-1/2">
        <span class="text-white text-xl text-center mb-10">Earned</span>
        <span class="text-center text-blue-cl-500 text-shadow-3 text-xl">-</span>
      </div>

      <!-- PAID -->
      <div class="divider flex w-px flex-shrink-0" />
      <div class="flex flex-col items-center justify-center w-1/2">
        <span class="text-white text-xl text-center mb-10">Paid</span>
        <span class="text-center text-blue-cl-500 text-shadow-3 text-xl">-</span>
      </div>
    </div>

    <div class="flex w-full">
      <app-button type="primary" size="sm" class="w-full">View more</app-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "Algobots" })
export default class Algobots extends Vue {}
</script>

<style lang="scss" scoped>
.divider {
  min-height: 108px;
  background: linear-gradient(#929cb2 0%, rgba(71, 76, 87, 0) 100%);
}
</style>
