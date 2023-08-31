<template>
  <div class="tag" :class="tagStyle">
    <!-- SLOT -->
    <slot />
    <span v-if="icon" :class="icon" class="text-xs ml-2 cursor-pointer" />
  </div>
</template>

<script lang="ts">
/* Tag types */
const types = Object.freeze({
  secondary: "is-secondary border border-iceberg text-sm text-iceberg rounded-5",
  "blue-filled": "is-blue-filled shadow-90 rounded-5 text-white text-sm ",
});

import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppTag" })
export default class AppTag extends Vue {
  /* PROPS */
  @Prop({ default: "" }) icon!: string;
  @Prop({ default: "secondary" }) type: string;

  /* DATA */
  types: { [key: string]: string } = types;

  /* COMPUTED */
  get tagStyle() {
    return this.types[this.type];
  }
}
</script>

<style lang="scss" scoped>
.tag {
  &.is-blue-filled {
    background: linear-gradient(224.51deg, rgba(255, 255, 255, 0.1) 15.01%, rgba(255, 255, 255, 0) 88.14%),
      linear-gradient(0deg, #213f7b, #213f7b);
    background-blend-mode: overlay, normal;
  }
}
</style>
