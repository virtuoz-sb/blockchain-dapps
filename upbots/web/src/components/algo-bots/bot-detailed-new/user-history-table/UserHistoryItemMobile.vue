<template>
  <div class="user-histiry-card__mobile-wrap bg-tiber shadow-140 rounded-5 p-15 mb-10 last:mb-0">
    <!-- PAIR -->
    <div class="flex flex-col mb-14">
      <p class="text-iceberg text-xs leading-xs mb-5">Pair</p>
      <div class="flex items-center">
        <div class="flex mr-14">
          <span v-if="data.sbl" class="text-white text-sm leading-xs">{{ data.sbl }}</span>
          <span v-else class="flex bg-white h-px w-70" />
        </div>

        <div class="flex">
          <div v-if="data.hasOwnProperty('open')" class="flex items-center">
            <span class="cicle w-8 h-8 rounded-full mr-10" :class="statusStyle(data.open)" />
            <span class="text-grey-cl-920 text-xs leading-xs">{{ data.open ? "OPEN" : "CLOSED" }}</span>
          </div>
          <span v-else class="flex bg-white w-full h-px" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 col-gap-20 mb-14">
      <!-- ENTRY PRICE -->
      <div class="flex flex-col">
        <div class="flex mb-5">
          <span class="text-iceberg text-xs leading-xs">Entry Price</span>
        </div>

        <div class="flex">
          <span v-if="data.entryPrice" class="text-white text-xs leading-xs">{{ data.entryPrice.toFixed(2) }}</span>
          <span v-else class="flex bg-white w-full h-px" />
        </div>
      </div>

      <!-- CLOSE PRICE -->
      <div class="flex flex-col">
        <div class="flex mb-5">
          <span class="text-iceberg text-xs leading-xs">Close price</span>
        </div>

        <div class="flex">
          <span v-if="data.closePrice" class="text-white text-xs leading-xs">{{ data.closePrice.toFixed(2) }}</span>
          <span v-else class="flex bg-white w-full h-px mr-20" />
        </div>
      </div>

      <!-- SIDE -->
      <div class="flex flex-col">
        <div class="flex mb-5">
          <span class="text-iceberg text-xs leading-xs">Side</span>
        </div>

        <div class="flex">
          <div v-if="data.stratType" class="flex items-center">
            <span class="icon-arrow-expand" :class="sideStyle(data.stratType)" />
            <span class="text-grey-cl-920 text-xs leading-xs ml-10">{{ data.stratType }}</span>
          </div>
          <span v-else class="flex bg-white w-full h-px" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 col-gap-20">
      <!-- SIGNAL -->
      <div class="flex flex-col">
        <div class="flex mb-5">
          <span class="text-iceberg text-xs leading-xs">Signal</span>
        </div>

        <div class="flex">
          <span v-if="data.openAt" class="text-white text-xs leading-xs">{{ data.openAt | dateLocal }}</span>
          <span v-else class="flex bg-white w-full h-px" />
        </div>
      </div>

      <!-- COMPLETED -->
      <div class="flex flex-col">
        <div class="flex mb-5">
          <span class="text-iceberg text-xs leading-xs">Completed</span>
        </div>

        <div class="flex">
          <span v-if="data.closeAt" class="text-white text-xs leading-xs">{{ data.closeAt | dateLocal }}</span>
          <span v-else class="flex bg-white w-full h-px" />
        </div>
      </div>

      <!-- PRIFIT/LOSS -->
      <div class="flex flex-col">
        <div class="flex mb-5">
          <span class="text-iceberg text-xs leading-xs">Profit/Loss</span>
        </div>

        <div class="flex">
          <span v-if="data.profitPercentage" class="text-xs leading-xs" :class="profitStyle(data.profitPercentage)">
            {{ data.profitPercentage | toProfit }}
          </span>
          <span v-else class="flex bg-white w-full h-px mr-20" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

@Component({ name: "UserHistoryItemMobile" })
export default class UserHistoryItemMobile extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: BotPerformanceCycleDto;

  /* METHODS */
  statusStyle(status: string) {
    return status ? "green" : "grey";
  }

  sideStyle(side: string) {
    return side && side.toLowerCase() === "long" ? "green" : "red";
  }

  profitStyle(profit: number) {
    return profit > 0 ? "text-green-cl-100 text-shadow-2" : "text-red-cl-100 text-shadow-6";
  }
}
</script>

<style lang="scss" scoped>
.cicle {
  &.grey {
    @apply bg-grey-cl-400;
  }
  &.green {
    @apply bg-green-cl-100 shadow-70;
  }
}

.icon-arrow-expand {
  font-size: 6px;
  &.red {
    @apply text-red-cl-100;
    background-blend-mode: normal, overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(255, 49, 34, 0.5);
  }
  &.green {
    @apply text-green-cl-100 transform rotate-180;
    background-blend-mode: overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(89, 167, 51, 0.5);
  }
}
</style>
