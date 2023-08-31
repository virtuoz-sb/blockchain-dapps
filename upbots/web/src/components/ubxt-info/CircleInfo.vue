<template>
  <div class="flex flex-col items-center mr-10 md:mr-20 xl:mr-30 last:mr-0">
    <div
      class="flex items-center justify-center bg-blue-cl-400 rounded-full mb-12 md:mb-25"
      :style="`width: ${circleSize}px; height: ${circleSize}px`"
    >
      <span class="text-iceberg leading-md font-bold" :style="`font-size: ${titleSize}px`">{{ title }}</span>
    </div>
    <p class="text-blue-cl-400 text-sm md:text-xl1 leading-md font-bold text-center">{{ desc }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "CircleInfo" })
export default class CircleInfo extends Vue {
  /* PROPS */
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) desc: string;
  @Prop({ required: true }) titleSize: string;
  @Prop({ required: true }) circleSize: string;
}
</script>
