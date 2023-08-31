<template>
  <div class="flex">
    <div class="relative text-grey-cl-400">
      <span v-for="item in 5" :key="item" aria-hidden="true" class="icon-star mr-3 last:mr-0" />
      <div class="front-stars absolute top-0 overflow-hidden gradient-1" :style="calculateRating">
        <span v-for="item in 5" :key="item" aria-hidden="true" class="icon-star mr-3 last:mr-0" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppRating" })
export default class AppRating extends Vue {
  /* PROPS */
  @Prop({ required: true, validator: (prop) => prop <= 5 && prop >= 0 }) value: number;

  /* COMPUTED */
  get calculateRating() {
    const val = (100 * this.value) / 5;
    return { width: `${val}%` };
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/_star";
</style>
