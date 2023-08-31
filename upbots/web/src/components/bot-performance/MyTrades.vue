<template>
  <div class="my-trades__table-wrap flex flex-col flex-grow md:h-full md:pb-18 md:pt-12 overflow-y-auto custom-scrollbar">
    <div class="flex flex-col overflow-y-auto custom-scrollbar mb-40 md:mb-14">
      <!-- TABLE LABELS -->
      <div class="flex items-center sticky w-full top-0 z-20">
        <div class="my-trades__label my-trades__label-1 w-full text-grey-cl-300 text-xs leading-xs py-8 md:ml-20 pl-20 pr-10">Pair</div>
        <div class="my-trades__label my-trades__label-2 w-full text-grey-cl-300 text-xs leading-xs py-8 pr-10">Status</div>
        <div class="my-trades__label my-trades__label-3 w-full text-grey-cl-300 text-xs leading-xs py-8 pr-10">Side</div>
        <div class="my-trades__label my-trades__label-4 w-full text-grey-cl-300 text-xs leading-xs py-8 pr-10">Entry Price</div>
        <div class="my-trades__label my-trades__label-5 w-full text-grey-cl-300 text-xs leading-xs py-8 pr-10">Close Pair</div>
        <div class="my-trades__label my-trades__label-6 w-full text-grey-cl-300 text-xs leading-xs py-8 pr-10">Profit/Loss</div>
        <div class="my-trades__label my-trades__label-7 w-full text-grey-cl-300 text-xs leading-xs py-8 pr-10">Signal</div>
        <div class="my-trades__label my-trades__label-8 w-full text-grey-cl-300 text-xs leading-xs py-8 md:mr-20 pr-20">Completed</div>
      </div>

      <!-- TABLE ITEM -->
      <MyTradesItem v-for="(item, index) in data" :key="index" :data="item" :class="index === 0 && 'mt-10'" />
    </div>

    <!-- ACTION BUTTON -->
    <div
      class="flex items-center justify-end w-full text-blue-cl-100 text-shadow-5 leading-xs ml-auto px-40 cursor-pointer mt-auto z-40"
      @click="loadMore"
    >
      Load More
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import MyTradesItem from "@/components/bot-performance/MyTradesItem.vue";

@Component({ name: "MyTrades", components: { MyTradesItem } })
export default class MyTrades extends Vue {
  /* DATA */
  data: any[] = [
    { pair: "USD/BTC", status: "Active", side: "", entryPrice: "", closePrice: "", profit: "", signal: "", completed: "" },
    { pair: "USD/BTC", status: "Closed", side: "", entryPrice: "", closePrice: "", profit: "", signal: "", completed: "" },
    {
      pair: "USD/BTC",
      status: "Closed",
      side: "Long",
      entryPrice: "USD 9,796.50",
      closePrice: "USD 9,304.00",
      profit: -5.03,
      signal: "May 15th, 3:00 AM",
      completed: "May 16th, 3:02 AM",
    },
    {
      pair: "USD/BTC",
      status: "Closed",
      side: "Long",
      entryPrice: "USD 9,796.50",
      closePrice: "USD 9,304.00",
      profit: 18.21,
      signal: "May 15th, 3:00 AM",
      completed: "May 16th, 3:02 AM",
    },
    {
      pair: "USD/BTC",
      status: "Closed",
      side: "Short",
      entryPrice: "USD 9,796.50",
      closePrice: "USD 9,304.00",
      profit: -5.03,
      signal: "May 15th, 3:00 AM",
      completed: "April 22nd, 7:37 PM",
    },
  ];

  loadData: any[] = [
    { pair: "USD/BTC", status: "Active", side: "", entryPrice: "", closePrice: "", profit: "", signal: "", completed: "" },
    { pair: "USD/BTC", status: "Closed", side: "", entryPrice: "", closePrice: "", profit: "", signal: "", completed: "" },
    {
      pair: "USD/BTC",
      status: "Closed",
      side: "Long",
      entryPrice: "USD 9,796.50",
      closePrice: "USD 9,304.00",
      profit: -5.03,
      signal: "May 15th, 3:00 AM",
      completed: "May 16th, 3:02 AM",
    },
    {
      pair: "USD/BTC",
      status: "Closed",
      side: "Long",
      entryPrice: "USD 9,796.50",
      closePrice: "USD 9,304.00",
      profit: 18.21,
      signal: "May 15th, 3:00 AM",
      completed: "May 16th, 3:02 AM",
    },
    {
      pair: "USD/BTC",
      status: "Closed",
      side: "Short",
      entryPrice: "USD 9,796.50",
      closePrice: "USD 9,304.00",
      profit: -5.03,
      signal: "May 15th, 3:00 AM",
      completed: "April 22nd, 7:37 PM",
    },
  ];

  /* METHODS */
  loadMore() {
    this.data.push(...this.loadData);
  }
}
</script>

<style lang="scss" scoped>
.my-trades {
  &__label {
    background: #2e2f33;
  }
  &__label-1 {
    width: 13%;
    min-width: 109px;
  }
  &__label-2 {
    width: 11.1%;
    min-width: 92px;
  }
  &__label-3 {
    width: 10.6%;
    min-width: 88px;
  }
  &__label-4 {
    width: 14.1%;
    min-width: 117px;
  }
  &__label-5 {
    width: 14.2%;
    min-width: 118px;
  }
  &__label-6 {
    width: 11.2%;
    min-width: 93px;
  }
  &__label-7 {
    width: 13.2%;
    min-width: 110px;
  }
  &__label-8 {
    width: 13%;
    min-width: 109px;
  }

  @media (max-width: 767px) {
    &__label {
      background: #18191c;
    }
    &__table-wrap {
      @apply relative;
      &:before {
        content: "";
        @apply absolute left-0 top-0 z-30;
        width: 55px;
        height: 85%;
        background: linear-gradient(270deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
      }
      &:after {
        content: "";
        @apply absolute right-0 top-0 z-30;
        width: 55px;
        height: 85%;
        background: linear-gradient(90deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
      }
    }
  }
}
</style>
