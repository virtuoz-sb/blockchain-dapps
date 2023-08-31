<template>
  <div class="flex items-center">
    <!-- INACTIVE TEXT -->
    <div v-if="inactiveText" class="text-white leading-xs text-sm mr-8">{{ inactiveText }}</div>
    <!-- SWITCHER SECONDARY -->
    <div
      v-if="type === 'secondary'"
      class="flex items-center justify-between w-60 bg-dark-cl-300 py-2 rounded-full cursor-pointer"
      @click.stop="toggle"
    >
      <div
        class="checkbox-switch-secondary__active flex items-center w-34 h-22 p-2 rounded-full cursor-pointer"
        :class="[classes, value ? '1' : 'justify-end']"
      >
        <span class="flex w-14 h-14 rounded-full" :class="[value ? 'bg-red-cl-100 shadow-60' : 'bg-green-cl-100 shadow-70']" />
      </div>
      <div
        class="checkbox-switch-secondary__inactive w-8 h-8 rounded-full"
        :class="[classes, value ? 'bg-green-cl-100 shadow-70' : 'bg-red-cl-100 shadow-60']"
      />
    </div>
    <!-- SWITCHER PRIMARY -->
    <div v-else class="w-40 border border-solid border-grey-cl-300 p-2 rounded-10 cursor-pointer" @click.stop="toggle">
      <div
        class="checkbox-switch w-14 h-14 rounded-full cursor-pointer"
        :class="[classes, !value ? 'bg-red-cl-100 shadow-60' : 'bg-green-cl-100 shadow-70']"
      />
    </div>
    <!-- ACTIVE TEXT -->
    <div v-if="activeText" class="text-white leading-xs text-sm ml-8">{{ activeText }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppSwitcher" })
export default class AppSwitcher extends Vue {
  /* PROPS */
  @Prop({ default: false }) disabled!: boolean;
  @Prop({ required: true }) value!: boolean;
  @Prop({ default: "" }) activeText!: string;
  @Prop({ default: "" }) inactiveText!: string;
  @Prop({ default: "" }) type!: string;

  /* COMPUTED */
  get classes() {
    return {
      "is-checked": this.value,
      "is-unchecked": !this.value,
      disabled: this.disabled,
    };
  }

  /* METHODS */
  toggle() {
    if (this.disabled) return;

    this.$emit("input", !this.value);
    this.$emit("click");
  }
}
</script>

<style lang="scss" scoped>
.checkbox-switch {
  transition: all 350ms;
  background-blend-mode: overlay, normal;
  &.is-checked {
    transform: translateX(20px);
  }
}

.checkbox-switch-secondary {
  &__active {
    transition: all 350ms;
    background-blend-mode: overlay, normal;
    &.is-checked {
      transform: translateX(2px);
      background: linear-gradient(270deg, rgba(28, 22, 25, 0.7) 0%, rgba(25, 23, 25, 0) 66.67%), #474c57;
    }
    &.is-unchecked {
      transform: translateX(24px);
      background: linear-gradient(90deg, rgba(28, 22, 25, 0.7) 0%, rgba(25, 23, 25, 0) 66.67%), #474c57;
    }
  }
  &__inactive {
    background-blend-mode: overlay, normal;
    &.is-checked {
      transform: translateX(-11px);
    }
    &.is-unchecked {
      transform: translateX(-41px);
    }
  }
}
</style>
