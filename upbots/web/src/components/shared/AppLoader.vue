<template>
  <div class="loader is-loading" :style="`width: ${size}px; height: ${size}px;`">
    <svg :width="`${size}px`" :height="`${size}px`" viewBox="0 0 56 56">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-91.000000, -4.000000)" stroke-width="5">
          <g transform="translate(94.000000, 7.000000)">
            <circle :stroke="colorInside" cx="25" cy="25" r="25" />
            <circle class="loader__moving-line" :stroke="colorOutside" cx="25" cy="25" r="25" />
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({ name: "AppLoader" })
export default class AppLoader extends Vue {
  /* PROPS */
  @Prop({ type: String, default: "22" }) size: string;
  @Prop({ type: String, default: "#ffffff" }) colorInside: string;
  @Prop({ type: String, default: "#27ADC5" }) colorOutside: string;
}
</script>

<style lang="scss" scoped>
.loader {
  opacity: 0;
  transition: all 0.5s;
  &.is-loading {
    opacity: 1;
  }
  &__moving-line {
    stroke-dasharray: 157;
    animation: dash 60000s infinite linear forwards;
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 700000;
  }
  10% {
    stroke-dashoffset: 0;
  }
}
</style>
