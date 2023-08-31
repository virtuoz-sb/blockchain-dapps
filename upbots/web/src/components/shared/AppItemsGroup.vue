<template>
  <div class="toggle-wrap flex justify-center w-full text-faded-jade" :class="borderClasses">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="relative flex items-center justify-center w-full py-15 cursor-pointer"
      :class="[{ 'is-active': activeValue === item.value }, highlightClasses]"
      @click="selectItem(item)"
    >
      <div class="flex items-center justify-center w-full text-center px-8" :class="{ 'border-l': index !== 0 }">
        <span class="text text-xs leading-xs">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-property-decorator";

@Component({ name: "AppItemsGroup" })
export default class AppItemsGroup extends Vue {
  /* MODEL */
  @Model("value") activeValue!: string;

  /* PROPS */
  @Prop({ required: true, validator: (prop) => prop.length > 1 }) items!: string[];
  @Prop({ type: Boolean, default: false }) noTopBorder: boolean;
  @Prop({ type: Boolean, default: false }) noBottomBorder: boolean;
  @Prop({ type: Boolean, default: false }) noTopHighlight: boolean;
  @Prop({ type: Boolean, default: false }) noBottomHighlight: boolean;

  /* COMPUTED */
  get borderClasses() {
    return `${this.noBottomBorder || "border-b"} ${this.noTopBorder || "border-t"}`;
  }

  get highlightClasses() {
    return `${this.noBottomHighlight || "is-bottom-highlight"} ${this.noTopHighlight || "is-top-highlight"}`;
  }

  /* METHODS */
  selectItem(item: any) {
    this.$emit("value", item.value);
    this.$emit("click", item);
  }
}
</script>

<style lang="scss" scoped>
.toggle-wrap {
  border-image: linear-gradient(to right, rgba(52, 56, 64, 0) 0%, #343840 12.36%, #343840 88.4%, rgba(52, 56, 64, 0) 100%);
  border-image-slice: 1;
}

.is-active {
  background: linear-gradient(0deg, rgba(246, 246, 247, 0) 0%, rgba(0, 212, 255, 0.1) 100%);
  .text {
    @apply text-iceberg;
  }
}

.is-active.is-top-highlight {
  &::before {
    content: "";
    @apply top-0 bg-gradient-r-10 w-full absolute shadow-40 left-0 h-px;
  }
}

.is-active.is-bottom-highlight {
  &::after {
    content: "";
    @apply absolute -bottom-1 bg-gradient-r-30 w-full shadow-40 left-0 h-px;
  }
}
</style>
