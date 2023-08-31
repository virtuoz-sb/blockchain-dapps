<template>
  <div class="flex items-center border-l-2 border-solid border-iceberg px-10 mr-auto">
    <div class="text-iceberg text-sm leading-xl">
      <p class="text-md mb-8">Move your UBXT from one blockchain to the other with UBXT Bridge</p>

      <ul class="flex flex-col ml-10 md:ml-24">
        <li class="point-white relative text-sm leadning-xs pl-15 mb-8">
          Convert your UBXT from Ethereum or BSC and receive them on same wallet
          <a class="italic underline" target="_blank" href="https://upbots.gitbook.io/upbots/getting-started/ubxt-bridge">
            More info
          </a>
        </li>

        <li class="point-white relative text-sm leadning-xs pl-15">
          From BSC to ETH: Multichain deducts 200 UBXT to pay for network gas fees
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "SwapDescription" })
export default class SwapDescription extends Vue {}
</script>

<style lang="scss" scoped>
.point-white {
  &:before {
    @apply absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full;
    content: "";
  }
}
</style>
