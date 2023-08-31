<template>
  <div class="widget flex flex-row flex-shrink-0 justify-around">
    <div v-for="(item, index) in botsImg" :key="item" class="flex flex-1 bg-dark-200">
      <div class="flex items-center m-15 pl-20 pr-20">
        <img :src="require(`@/assets/images/algobots/${item}`)" class="w-70 h-80 xl:w-100 xl:h-112" />
        <div class="ml-4 pt-25 pl-4">
          <span class="leading-xs text-blue-cl-400 font-semibold pr-4">{{ botsTitle[index] }}</span>
          <span class="leading-xs text-iceberg font-semibold">{{ botsDesc[index] }}</span>
        </div>
      </div>
      <div v-if="index !== 3" class="flex flex-center dashed-line" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "BotWidgets" })
export default class BotWidgets extends Vue {
  /* DATA */
  botsImg: string[] = ["make_tour.svg", "select.svg", "config.svg", "enjoy.svg"];
  botsTitle: string[] = ["Allocate", "Check out", "Select", "Pay"];
  botsDesc: string[] = [
    "UBXT to your UpBots wallet",
    "our trading bots below",
    ", configure and activate a bot",
    "when you are in profit, Earn virtual credits when you are in loss",
  ];
}
</script>

<style lang="scss" scoped>
.dashed-line {
  @media (min-width: 1100px) {
    @apply inline-block w-3/5 border-t border-t-2 border-blue-cl-400 mt-70 -mr-24 -ml-27;
  }
}
</style>
