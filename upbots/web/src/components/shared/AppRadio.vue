<template>
  <div>
    <input class="custom-radio__input hidden" type="radio" :id="_uid" :checked="isChecked" @change="$emit('input', inputValue || label)" />
    <label class="custom-radio__label relative text-sm leading-xs text-grey-cl-200 pl-26 cursor-pointer" :for="_uid">
      {{ label }}
    </label>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({ name: "AppRadio" })
export default class AppRadio extends Vue {
  /* PROPS */
  @Prop({ default: null }) inputValue: string | number;
  @Prop({ default: null }) value: string | number;
  @Prop({ required: true }) label!: string;

  /* COMPUTED */
  get isChecked() {
    return this.inputValue ? this.value === this.inputValue : this.value === this.label;
  }
}
</script>

<style lang="scss" scoped>
.custom-radio__input:checked + .custom-radio__label:before {
  @apply shadow-30;
  background: linear-gradient(224.51deg, rgba(255, 255, 255, 0.2) 15.01%, rgba(255, 255, 255, 0) 88.14%), #27adc5;
}

.custom-radio {
  &__label {
    &:before {
      content: "";
      @apply absolute top-1/2 left-3 w-12 h-12 rounded-full transform -translate-y-1/2;
      transition: 0.3s;
    }
    &:after {
      content: "";
      @apply absolute top-1/2 left-0 w-18 h-18 rounded-full transform -translate-y-1/2 border border-solid border-grey-cl-400;
    }
  }
}
</style>
