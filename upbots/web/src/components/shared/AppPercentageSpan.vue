<template>
  <span :class="classes">
    {{ valueToDisplay }}
  </span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppPercentageSpan" })
export default class AppPercentageSpan extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: string | number | null;
  @Prop({ type: Boolean, default: true }) isColored: boolean;
  @Prop({ default: "text-green-cl-100 text-shadow-2" }) positiveClasses: string;
  @Prop({ default: "text-red-cl-100 text-shadow-6" }) negativeClasses: string;

  /* COMPUTED */
  get classes() {
    if (this.isColored) {
      if (this.data === null || !this.data) {
        return "text-grey-cl-920";
      } else {
        return Number(this.data) >= 0 ? this.positiveClasses : this.negativeClasses;
      }
    } else {
      return null;
    }
  }

  get valueToDisplay() {
    if (this.data === null || !this.data) {
      return "-";
    } else {
      return Number(this.data) >= 0 ? `+${this.$options.filters.fixed(this.data)}%` : `${this.$options.filters.fixed(this.data)}%`;
    }
  }
}
</script>
