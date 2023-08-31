<template>
  <figure v-lazyload class="image-wrapper w-full overflow-hidden">
    <img :alt="alt" :class="[imgClass, isAnimation]" :src="getEmptySrc" :data-url="src" />
  </figure>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "ImageItem" })
export default class ImageItem extends Vue {
  /* PROPS */
  @Prop({ type: String, required: true }) src: string;
  @Prop({ type: String }) emptySrc: string;
  @Prop({ type: Object }) size: any;
  @Prop({ type: String }) imgClass: string;
  @Prop({ type: String }) alt: string;
  @Prop({ default: "animate-blur-in" }) isAnimation: string;

  /* COMPUTED */
  get getEmptySrc() {
    return this.size ? this.$emptySvgTemplate(this.size.width, this.size.height) : require("@/assets/images/empty-placeholder.png");
  }
}
</script>

<style scoped lang="scss">
.image-wrapper {
  .animate-blur-in,
  .animate-opacity {
    opacity: 0;
  }
  .animate-opacity {
    transition: all 0.25s ease;
  }

  &.loaded {
    .animate-blur-in {
      animation: roll-in-blurred-left 0.9s cubic-bezier(0.23, 1, 0.32, 1) both;
    }
    .animate-opacity {
      opacity: 1;
    }
  }
}

@keyframes roll-in-blurred-left {
  0% {
    -webkit-filter: blur(50px);
    filter: blur(50px);
    opacity: 0;
  }
  100% {
    -webkit-filter: blur(0);
    filter: blur(0);
    opacity: 1;
  }
}
</style>
