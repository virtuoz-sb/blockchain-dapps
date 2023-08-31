<template>
  <ul class="grid grid-cols-3 col-gap-20 items-center md:text-xxs xl:text-xs leading-md mb-10">
    <li :class="priceClasses" class="list-item text-iceberg">
      <span>{{ source.price }}</span>
    </li>
    <li class="list-item text-iceberg">
      <span>{{ source.amount }}</span>
    </li>
    <li class="list-item text-iceberg">
      <span>{{ source.time }}</span>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "TradeHistoryItem" })
export default class TradeHistoryItem extends Vue {
  /* PROPS */
  @Prop({ default: () => ({}) }) source!: any;
  @Prop({ type: Number }) index!: number;
  @Prop({}) tradeHistoryData!: any;

  /* COMPUTED */
  get priceClasses() {
    if (!this.tradeHistoryData[this.index + 1]) return "";

    return this.source.price <= this.tradeHistoryData[this.index + 1].price ? "is-red" : "is-green";
  }
}
</script>

<style lang="scss" scoped>
.list-item {
  &.is-red {
    @apply text-red-cl-100;
  }
  &.is-green {
    @apply text-green-cl-100;
  }
}
</style>
