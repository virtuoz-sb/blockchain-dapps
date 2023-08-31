<template>
  <button
    class="app-button flex justify-center items-center"
    :class="buttonStyle"
    :disabled="disabled"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <span v-if="icon" :class="icon" />
    <!-- SLOT -->
    <slot />
  </button>
</template>

<script lang="ts">
/* BUTTONS TYPES */
const types = Object.freeze({
  primary: "is-primary",
  "blue-bordered": "is-blue-bordered",
  "blue-rounded": "is-blue-rounded",
  yellow: "is-yellow",
  grey: "is-grey",
  red: "is-red",
  circle: "is-circle",
  "light-green": "is-light-green",
  "light-green-reverse-bordered": "is-light-green-bordered",
  "light-green-bordered": "is-light-green-bordered",
});

import { Vue, Component, Prop } from "vue-property-decorator";

@Component({ name: "AppButton" })
export default class AppButton extends Vue {
  /* PROPS */
  @Prop({ default: "" }) icon?: string;
  @Prop({ default: "primary" }) type: string;
  @Prop({ default: false, type: Boolean }) disabled: boolean;
  @Prop({ default: "" }) size: string;
  @Prop({ default: "4" }) rounded: string;

  /* DATA */
  types: { [key: string]: string } = types;

  /* COMPUTED */
  get buttonTypes() {
    return this.types[this.type];
  }

  get buttonSize() {
    if (this.size === "xxs") {
      return "app-button--xxs py-7";
    } else if (this.size === "xs") {
      return "app-button--xs py-7";
    } else if (this.size === "sm") {
      return this.$breakpoint.mdAndDown ? "app-button--sm py-12" : "app-button--sm py-11";
    } else if (this.size === "md") {
      return "app-button--md py-14";
    } else {
      return "app-button--lg py-15";
    }
  }

  get roundedStyle() {
    return `rounded-${this.rounded}`;
  }

  get isDisabled() {
    return this.disabled && "is-disabled  opacity-50 cursor-not-allowed";
  }

  get buttonStyle() {
    return [this.buttonTypes, this.buttonSize, this.roundedStyle, this.isDisabled];
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/_app-button";
</style>
