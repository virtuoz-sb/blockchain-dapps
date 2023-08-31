<template>
  <div class="bot-performances-cards__wrap flex flex-col justify-around flex-shrink-0 w-full overflow-y-auto custom-scrollbar">
    <div class="flex items-center justify-between w-full md:bg-tiber py-8 pl-20 pr-15">
      <span class="text-white text-base leading-md mr-4">Total perf</span>
      <AppPercentageSpan class="text-base leading-md" :data="data.allmonths" />
    </div>

    <div class="flex items-center justify-between w-full md:bg-tiber py-8 pl-20 pr-15">
      <span class="text-white text-base leading-md mr-4">6 months</span>
      <AppPercentageSpan class="text-base leading-md" :data="data.month6" />
    </div>

    <div class="flex items-center justify-between w-full md:bg-tiber py-8 pl-20 pr-15">
      <span class="text-white text-base leading-md mr-4">3 months</span>
      <AppPercentageSpan class="text-base leading-md" :data="data.month3" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "MyPerformancesStatistics" })
export default class MyPerformancesStatistics extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;
}
</script>

<style lang="scss" scoped>
.bot-performances-cards {
  &__wrap {
    max-width: 160px;
  }
}
</style>
