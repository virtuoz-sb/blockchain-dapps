<template>
  <div class="relative grid grid-cols-3 items-center mb-6 px-5">
    <div class="relative text-base md:text-xs leading-xs text-iceberg truncate">{{ source.amount }}</div>
    <div class="relative text-base md:text-xs leading-xs text-iceberg truncate">{{ source.total }}</div>
    <div class="relative text-base md:text-sm leading-xs truncate" :class="`text-${this.source.progressBarColor}-cl-100`">
      {{ source.price }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "OrderBookItem" })
export default class OrderBookItem extends Vue {
  /* PROPS */
  @Prop({ default: () => ({}) }) source!: any;
}
</script>
