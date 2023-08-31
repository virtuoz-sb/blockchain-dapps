<template>
  <div class="flex flex-col w-full h-full pt-20 pb-20 md:overflow-y-auto custom-scrollbar">
    <div class="flex flex-col md:flex-row items-center justify-between px-20 mb-25">
      <div class="select__inner flex flex-col w-full md:mr-10 xl:mr-0 mb-20 md:mb-0">
        <p class="text-grey-cl-100 text-sm leading-xs mb-8">Base token:</p>
        <AppSelect v-model="orderBookForm.baseToken" :options="baseTokenOptions" class="w-full" />
      </div>
      <div class="select__inner flex flex-col w-full md:ml-10 xl:ml-0">
        <p class="text-grey-cl-100 text-sm leading-xs mb-8">Quote token:</p>
        <AppSelect v-model="orderBookForm.quoteToken" :options="quoteTokenOptions" class="w-full" />
      </div>
    </div>
    <div class="px-20 md:mb-40">
      <AppButton type="light-green" class="w-full" :size="$breakpoint.smAndDown ? 'sm' : 'xs'" @click="$emit('update:isShowOrders', true)">
        Show orders
      </AppButton>
    </div>
    <div
      v-if="isShowOrders"
      class="order-book__table-wrap grid grid-cols-1 lg:grid-cols-2 row-gap-50 lg:row-gap-120 px-20 md:overflow-y-auto custom-scrollbar"
    >
      <OrderBookTable :data="bidsData" class="flex flex-col h-full lg:pr-40 xl:pr-0 overflow-y-auto custom-scrollbar" />
      <OrderBookTable :data="asksData" class="flex flex-col h-full lg:pl-40 xl:pr-0 overflow-y-auto custom-scrollbar" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import OrderBookTable from "@/components/swap/order-book/OrderBookTable.vue";

@Component({ name: "OrderBook", components: { OrderBookTable } })
export default class OrderBook extends Vue {
  /* PROPS */
  @Prop({ required: false }) isShowOrders: boolean;

  /* DATA */
  orderBookForm: any = {
    baseToken: { label: "DAI (DAI)" },
    quoteToken: { label: "ETH" },
  };

  baseTokenOptions: any[] = [{ label: "DAI (DAI)" }, { label: "DAI (DAI) 2" }, { label: "DAI (DAI) 3" }];

  quoteTokenOptions: any[] = [{ label: "ETH" }, { label: "ETH 2" }, { label: "ETH 3" }];

  bidsData: any[] = [
    {
      dex: "0x V3",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "0x V3",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
  ];

  asksData: any[] = [
    {
      dex: "0x V3",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "0x V3",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
    {
      dex: "Oasis",
      price: "0.0025552",
      volume: "1761.1214625",
    },
  ];
}
</script>

<style lang="scss" scoped>
.select {
  &__inner {
    @media (min-width: 768px) {
      max-width: 360px;
    }
  }
}

.order-book {
  &__table-wrap {
    grid-auto-rows: minmax(min-content, max-content);
  }
}
</style>
