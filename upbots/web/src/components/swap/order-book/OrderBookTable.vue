<template>
  <div>
    <p class="text-xxl1 text-white leading-xs mb-32">Bids</p>
    <div class="flex items-center mb-22">
      <span class="table__lable-col-1 lg:w-full text-grey-cl-300 leading-xs text-left lg:text-left">DEX</span>
      <span class="table__lable-col-2 lg:w-full text-grey-cl-300 leading-xs text-center lg:text-left">PRICE (ETH)</span>
      <span class="table__lable-col-3 lg:w-full text-grey-cl-300 leading-xs text-right lg:text-left">VOLUME (DAI)</span>
    </div>
    <div class="order-book-table__item-wrap flex flex-col overflow-y-auto custom-scrollbar">
      <OrderBookCell v-for="item in data" :key="item.id" :data="item" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import OrderBookCell from "@/components/swap/order-book/OrderBookCell.vue";

@Component({ name: "OrderBookTable", components: { OrderBookCell } })
export default class OrderBookTable extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;
}
</script>

<style lang="scss" scoped>
.table {
  &__lable-col-1 {
    max-width: 127px;
    @media (max-width: 1279px) {
      max-width: 80px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full w-1/3;
    }
  }
  &__lable-col-2 {
    max-width: 140px;
    @media (max-width: 1279px) {
      max-width: 120px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full w-1/3;
    }
  }
  &__lable-col-3 {
    max-width: 140px;
    @media (max-width: 1279px) {
      max-width: 120px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full w-1/3;
    }
  }
}

.order-book-table {
  &__item-wrap {
    @media (max-width: 767px) {
      height: 400px;
    }
  }
}
</style>
