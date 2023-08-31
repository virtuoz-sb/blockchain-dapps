<template>
  <div class="range-slider__wrap flex items-center w-full">
    <div v-if="sliderRange" class="text-grey-cl-100 text-xs leading-xs whitespace-no-wrap mr-18">{{ caption.left }}</div>
    <!-- VUE SLIDER -->
    <VueSlider
      class="range-slider w-full"
      :class="[single ? 'is-single' : 'is-multiple']"
      v-model="rangeList"
      v-bind="options"
      ref="slider"
      :tooltip="tooltip"
      :tooltip-formatter="formatter"
      :enable-cross="false"
      :dot-options="dotOptions"
      :disabled="disabled"
      @dragging="$emit('dragging', value)"
      @change="$emit('change', value)"
      @drag-end="$emit('dragged', value)"
    />
    <div v-if="sliderRange" class="text-bali-hai text-xs leading-xs whitespace-no-wrap ml-18">{{ caption.right }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import VueSlider from "vue-slider-component";

@Component({ name: "AppRangeSlider", components: { VueSlider } })
export default class AppRangeSlider extends Vue {
  /* PROPS */
  @Prop({ required: true }) value: any;
  @Prop({ default: () => ({}) }) options: object;
  @Prop({ default: "" }) labels: object;
  @Prop({ default: "none" }) tooltip: string;
  @Prop({ default: "" }) formatter: string;
  @Prop({ default: false, type: Boolean }) disabled: boolean;
  @Prop({ default: null }) disabledMax: number;

  /* REFS */
  $refs!: {
    slider: any;
  };

  /* DATA */
  isMounted = false;
  drag = false;

  /* COMPUTED */
  get single() {
    return typeof this.value === "number";
  }

  get rangeList() {
    return this.value;
  }

  set rangeList(value) {
    this.$emit("input", value);
  }

  get sliderRange() {
    // eslint-disable-next-line getter-return
    if (!this.isMounted) return;

    return {
      min: this.$refs.slider.min,
      max: this.$refs.slider.max,
    };
  }

  get caption() {
    // eslint-disable-next-line getter-return
    if (!this.isMounted) return;
    // TODO - refactore
    const [rMin, rMax] = this.single ? [this.rangeList] : this.rangeList;
    const { min, max } = this.sliderRange;

    const left = this.single ? (this.labels ? `${min} ${this.labels}` : min) : this.labels ? `${rMin} ${this.labels}` : rMin;
    const right = this.single ? (this.labels ? `${max} ${this.labels}` : max) : this.labels ? `${rMax} ${this.labels}` : rMax;

    return { left, right };
  }

  get dotOptions() {
    if (this.disabledMax) {
      return [{ max: this.disabledMax }];
    } else {
      return null;
    }
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }
}
</script>

<style lang="scss">
.range-slider {
  width: 100% !important;
  padding: 0 !important;
  &.is-single {
    .vue-slider-process {
      @apply shadow-30;
      top: 0px !important;
      height: 4px !important;
      background: linear-gradient(90deg, #1cb0c8 0%, #2fefe4 100%);
    }
    .vue-slider-rail {
      @apply h-4 bg-san-juan;
    }
  }
  &.is-multiple {
    height: 2px !important;
    .vue-slider-process {
      @apply shadow-30;
      top: -1px !important;
      height: 4px !important;
      background: linear-gradient(0deg, #6ed4ca 0%, #24819b 100%), #24819b;
    }
    .vue-slider-rail {
      @apply h-px bg-transparent;
      background-image: linear-gradient(to right, rgba(52, 56, 64, 0) 0%, #343840 12.36%, #343840 88.4%, rgba(52, 56, 64, 0) 100%);
    }
  }

  .vue-slider-dot {
    width: 20px !important;
    height: 20px !important;
    .vue-slider-dot-handle {
      @apply relative w-full h-full rounded-full cursor-pointer;
      background: #6dd3ca;
      &:after {
        content: "";
        @apply absolute top-1/2 left-1/2 w-30 h-30 rounded-full;
        background: #264654;
        box-shadow: 0px 4px 4px #132932;
        transform: translate(-50%, -50%);
        z-index: -1;
      }
      &.vue-slider-dot-handle-disabled {
        @apply cursor-not-allowed;
      }
    }
  }
  .vue-slider-dot-tooltip-text {
    font-size: 10px !important;
    line-height: 14px !important;
    color: #ffffff !important;
  }
  .vue-slider-dot-tooltip-top {
    top: -5px;
  }
}
</style>
