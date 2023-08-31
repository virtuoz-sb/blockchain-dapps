<template>
  <div class="flex">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="flex items-center relative text-faded-jade rounded-15 mr-6 last:mr-0 cursor-pointer"
      :class="{ 'bg-coral-coast': activeValue === item.value }"
      @click="selectItem(item)"
    >
      <span
        class="flex items-center justify-center h-full text-sm md:text-base leading-md text-center"
        :class="activeValue === item.value ? 'text-iceberg py-4 px-22' : 'px-8'"
      >
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-property-decorator";

@Component({ name: "AppFilter" })
export default class AppFilter extends Vue {
  /* MODEL */
  @Model("value") activeValue!: string;

  /* PROPS */
  @Prop({ required: true, validator: (prop) => prop.length > 1 }) items!: string[];

  /* METHODS */
  selectItem(item: any) {
    this.$emit("value", item.value);
    this.$emit("click", item);
  }
}
</script>
