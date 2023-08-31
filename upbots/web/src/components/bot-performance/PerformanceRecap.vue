<template>
  <div class="flex items-center px-44 py-18">
    <div class="performance-recap__month-select w-full mr-56">
      <h3 class="text-sm leading-xs text-grey-cl-920 mb-8">Month</h3>
      <AppSelect v-model="monthValue" :options="monthOptions" />
    </div>
    <div class="flex items-center mr-80">
      <span class="text-blue-cl-500 text-shadow-3 text-xxl2 leading-xs mr-14">{{ data.trades }}</span>
      <span class="text-white text-md leading-xs">Trades</span>
    </div>
    <div class="flex">
      <span class="text-blue-cl-500 text-shadow-3 text-xxl2 leading-xs">
        {{ data.percentage >= 0 ? `+${data.percentage}` : data.percentage }}%
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "PerformanceRecap" })
export default class PerformanceRecap extends Vue {
  /* DATA */
  data: any = {
    trades: 14,
    percentage: 15,
  };

  monthValue = { label: "January" };
  monthOptions: any[] = [
    { label: "January" },
    { label: "February" },
    { label: "March" },
    { label: "April" },
    { label: "May" },
    { label: "June" },
    { label: "July" },
    { label: "August" },
    { label: "September" },
    { label: "October" },
    { label: "November" },
    { label: "December" },
  ];
}
</script>

<style lang="scss" scoped>
.performance-recap {
  &__month-select {
    max-width: 380px;
  }
}
</style>
