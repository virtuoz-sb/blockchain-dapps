<template>
  <ul class="flex flex-col">
    <li
      class="bot-detailed-statistics__card grid grid-cols-2 col-gap-20 items-center py-20 px-14 mb-15"
      :class="{ 'grid-cols-3': displayUncomp }"
    >
      <div v-if="displayUncomp" class="col-span-2 flex flex-col">
        <div class="grid grid-cols-2 items-center">
          <AppPercentageSpan class="text-xl leading-xs" :data="statisticsData.month3" />
          <span class="text-iceberg text-sm">Comp</span>
        </div>
        <div class="grid grid-cols-2 items-center">
          <AppPercentageSpan class="text-xl leading-xs" :data="statisticsData.month3UC" />
          <span class="text-iceberg text-sm">Uncomp</span>
        </div>
      </div>
      <AppPercentageSpan v-else class="text-xl leading-xs" :data="statisticsData.month3" />
      <p class="flex flex-col">
        <span class="text-white leading-sm text-base">Perf 3 months</span>
      </p>
    </li>

    <li
      class="bot-detailed-statistics__card grid grid-cols-2 col-gap-20 items-center py-20 px-14 mb-15"
      :class="{ 'grid-cols-3': displayUncomp }"
    >
      <div v-if="displayUncomp" class="col-span-2 flex flex-col">
        <div class="grid grid-cols-2 items-center">
          <AppPercentageSpan class="text-xl leading-xs" :data="statisticsData.month6" />
          <span class="text-iceberg text-sm">Comp</span>
        </div>
        <div class="grid grid-cols-2 items-center">
          <AppPercentageSpan class="text-xl leading-xs" :data="statisticsData.month6UC" />
          <span class="text-iceberg text-sm">Uncomp</span>
        </div>
      </div>
      <AppPercentageSpan v-else class="text-xl leading-xs" :data="statisticsData.month6" />
      <p class="flex flex-col">
        <span class="text-white leading-sm text-base">Perf 6 months</span>
      </p>
    </li>

    <li
      class="bot-detailed-statistics__card grid grid-cols-2 col-gap-20 items-center py-20 px-14"
      :class="{ 'grid-cols-3': displayUncomp }"
    >
      <div v-if="displayUncomp" class="col-span-2 flex flex-col">
        <div class="grid grid-cols-2 items-center">
          <AppPercentageSpan class="text-xl leading-xs" :data="statisticsData.allmonths" />
          <span class="text-iceberg text-sm">Comp</span>
        </div>
        <div class="grid grid-cols-2 items-center">
          <AppPercentageSpan class="text-xl leading-xs" :data="statisticsData.allmonthsUC" />
          <span class="text-iceberg text-sm">Uncomp</span>
        </div>
      </div>
      <AppPercentageSpan v-else class="text-xl leading-xs" :data="statisticsData.allmonths" />
      <p class="flex flex-col">
        <span class="text-white leading-sm text-base">Total perf</span>
      </p>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "BotDetailedStatistics" })
export default class BotDetailedStatistics extends Vue {
  /* PROPS */
  @Prop({ required: false }) statisticsData: any;
  @Prop({ required: false }) displayUncomp: any;
}
</script>

<style lang="scss" scoped>
.bot-detailed-statistics {
  &__card {
    background: rgba(14, 19, 26, 0.28);
  }
}
</style>
