<template>
  <div class="flex items-center justify-between border-b border-grey-cl-400">
    <span
      v-for="(label, index) in data"
      :key="index"
      class="text-hidden-sea-glass text-sm md:text-xs leading-xs"
      :class="`title__col-${index + 1}`"
    >
      {{ label }}
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({ name: "MyOrdersLabels" })
export default class MyOrdersLabels extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: string[];
}
</script>

<style lang="scss" scoped>
.title {
  &__col-1 {
    @apply w-90;
  }
  &__col-2 {
    @apply w-60;
  }
  &__col-3 {
    @apply w-60;
  }
  &__col-4 {
    @apply w-36;
  }
  &__col-5 {
    @apply w-14;
  }
}
</style>
