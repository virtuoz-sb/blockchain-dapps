<template>
  <div class="flex flex-col w-full">
    <div
      class="flex flex-row md:flex-col xl:flex-row items-center justify-evenly md:justify-between mb-22 md:mb-15 md:mb-0 py-0 pt-22 md:pt-14 xl:pt-22 px-20"
    >
      <div class="flex items-center md:mb-14 xl:mb-22">
        <p class="text-xl leading-xs text-white mr-7">$</p>
        <p class="flex items-center">
          <span class="text-xl leading-xs text-blue-cl-500 text-shadow-3">135 696.</span>
          <span class="flex self-end leading-md text-blue-cl-500 text-shadow-3">44</span>
        </p>
      </div>
      <div class="flex items-center md:mb-14 xl:mb-22">
        <p class="text-xl leading-xs text-white mr-7">€</p>
        <p class="flex items-center">
          <span class="text-xl leading-xs text-blue-cl-400 text-shadow-4">132 500.</span>
          <span class="flex self-end leading-md text-blue-cl-400 text-shadow-4">44</span>
        </p>
      </div>
    </div>

    <div class="mt-auto">
      <div class="py-18 px-20 bg-dark-cl-300 md:rounded-b-3">
        <span class="flex justify-center w-full text-sm leading-xs text-white">3.02503503 BTC</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "MyBalance" })
export default class MyBalance extends Vue {}
</script>
