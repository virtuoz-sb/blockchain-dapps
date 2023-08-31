<template>
  <div
    class="card flex flex-col md:flex-row md:items-center justify-between md:w-full md:py-8 md:pl-20 md:pr-15 md:mb-10 lg:mb-20 last:mb-0 mr-30 md:mr-0 last:mr-0"
  >
    <span class="text-grey-cl-200 text-sm leading-md mb-3 md:mb-0">{{ data.title }}</span>
    <span class="text-sm leading-md" :class="percentageStyle">{{ percentage }}%</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "PerformancesCard" })
export default class PerformancesCard extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;

  /* COMPUTED  */
  get percentageStyle() {
    return this.data.percentage >= 0 ? "text-green-cl-100 text-shadow-2" : "text-red-cl-100 text-shadow-6";
  }

  get percentage() {
    return this.data.percentage >= 0 ? `+${this.data.percentage}` : this.data.percentage;
  }
}
</script>
