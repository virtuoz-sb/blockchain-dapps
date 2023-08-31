<template>
  <div class="divider" :class="dividerDirection" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppDivider" })
export default class AppDivider extends Vue {
  /* PROPS */
  @Prop({ type: Boolean, default: false }) isVertical: boolean;

  /* COMPUTED */
  get dividerDirection() {
    return this.isVertical ? "w-px h-full" : "w-full h-px";
  }
}
</script>
