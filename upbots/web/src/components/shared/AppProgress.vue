<template>
  <div class="progress-line w-full">
    <span :class="customLineClass" :style="progressStyle" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppProgress" })
export default class AppProgress extends Vue {
  /* PROPS */
  @Prop({ required: true }) customLineClass: string;
  @Prop({ required: true }) value: number | string;

  /* COMPUTED */
  get progressStyle() {
    return `width:${this.value}%`;
  }
}
</script>

<style lang="scss" scoped>
.progress-line {
  background-blend-mode: overlay, normal;
}
</style>
