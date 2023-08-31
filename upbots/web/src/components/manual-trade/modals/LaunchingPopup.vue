<template>
  <AppModal :value="isOpen" persistent max-width="700px" @close="cancel">
    <div class="modal__wrap relative flex flex-col pt-70 pb-35">
      <!-- TITLE -->
      <h2 class="flex items-center justify-center font-raleway text-xxl font-semibold mb-42">
        <span class="text-white">My Strategy </span>
        <span class="text-white mx-6">-</span>
        <span :class="side === 'buy' ? 'text-green-cl-100' : 'text-red-cl-100'" class="uppercase">{{ side }}</span>
      </h2>

      <!-- TABLE -->
      <div class="modal__table flex flex-col w-full border-t border-grey-cl-300 mx-auto pt-34">
        <!-- ACCOUNT -->
        <div class="flex items-center mb-20">
          <div class="modal__table-label-col flex w-full pr-20">
            <span class="block truncate text-grey-cl-920 text-sm leading-xs">Account:</span>
          </div>
          <div class="flex flex-grow">
            <span class="text-white text-sm leading-xs">{{ accountName }}</span>
          </div>
        </div>

        <!-- PAIR -->
        <div class="flex items-center mb-20">
          <div class="modal__table-label-col flex w-full pr-20">
            <span class="block truncate text-grey-cl-920 text-sm leading-xs">Pair:</span>
          </div>
          <div class="flex flex-grow">
            <span class="text-white text-sm leading-xs">{{ pair }}</span>
          </div>
        </div>

        <!-- ENTRY -->
        <div class="flex flex-col mb-20">
          <div v-for="(item, index) in entries" :key="index" class="flex items-center mb-10 last:mb-0">
            <div class="modal__table-label-col flex w-full pr-20">
              <span class="block truncate text-grey-cl-920 text-sm leading-xs">Entry {{ index + 1 }}. </span>
            </div>
            <div class="flex items-center flex-grow">
              <div class="flex border-r border-solid border-white pr-5 mr-5">
                <span class="text-white text-sm leading-xs">{{ !!(item.isLimit && !item.isMarket) ? "Limit" : "Market" }}</span>
              </div>
              <div class="flex border-r border-solid border-white pr-5 mr-5">
                <span class="text-white text-sm leading-xs">{{ item.price }}</span>
              </div>
              <div class="flex border-r border-solid border-white pr-5 mr-5">
                <span class="text-white text-sm leading-xs">{{ item.quantity }}</span>
              </div>
              <div class="flex">
                <span class="text-white text-sm leading-xs">{{ item.price * item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TARGET -->
        <div class="flex flex-col mb-20">
          <div v-for="(item, index) in targets" :key="index" class="flex items-center mb-10 last:mb-0">
            <div class="modal__table-label-col flex w-full pr-20">
              <span class="block truncate text-grey-cl-920 text-sm leading-xs">Target {{ index + 1 }}. </span>
            </div>
            <div class="flex items-center flex-grow">
              <div class="flex border-r border-solid border-white pr-5 mr-5">
                <span class="text-white text-sm leading-xs">Take Profit</span>
              </div>
              <div class="flex border-r border-solid border-white pr-5 mr-5">
                <span class="text-white text-sm leading-xs">{{ item.triggerPrice }}</span>
              </div>
              <div class="flex">
                <span class="text-white text-sm leading-xs">{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STOP -->
        <div class="flex items-center">
          <div class="modal__table-label-col flex w-full pr-20">
            <span class="block truncate text-grey-cl-920 text-sm leading-xs">Stop.</span>
          </div>
          <div class="flex items-center flex-grow">
            <div class="flex border-r border-solid border-white pr-5 mr-5">
              <span class="text-white text-sm leading-xs">Stop Loss</span>
            </div>
            <div class="flex border-r border-solid border-white pr-5 mr-5">
              <span class="text-white text-sm leading-xs">{{ stopLoss }}</span>
            </div>
            <div class="flex">
              <span class="text-white text-sm leading-xs">Sell 100%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DESCRIPTION -->
      <div class="modal__description w-full text-left text-white text-sm mt-50">
        <div v-for="(entry, i) in entries" :key="i" class="mb-10">
          I <span :class="side === 'buy' ? 'text-blue-cl-400' : 'text-red-cl-100'">{{ side }}</span> {{ entry.quantity }}
          {{ side === "buy" ? baseCurrency : quoteCurrency }}
          <template v-if="entry.isLimit && !entry.isMarket">
            at the price of
            <span class="text-blue-cl-400">{{ entry.triggerPrice }}</span>
          </template>
          <template v-else> at the market price of </template>
          {{ pair }}
          for a total of
          <span class="text-blue-cl-400">{{ entry.triggerPrice * entry.quantity }}</span>
          {{ side !== "buy" ? baseCurrency : quoteCurrency }}
        </div>

        <div v-for="(target, i) in targets" :key="i + 1" class="mb-10">
          If the price reache
          <span class="text-blue-cl-400">{{ target.triggerPrice }}</span>
          {{ side === "buy" ? baseCurrency : quoteCurrency }}
          then I sell
          <span class="text-green-cl-100">100%</span>
          of my position at this price
        </div>

        <div>
          If the price decreases to
          <span class="text-blue-cl-400">{{ stopLoss }}</span>
          {{ side !== "buy" ? baseCurrency : quoteCurrency }}
          then I sell
          <span class="text-red-cl-100">{{ data.description.val9 }}%</span>
          of my position at this price
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex items-center justify-between w-full mt-48">
        <AppButton type="grey" class="modal__btn" @click="cancel">Cancel</AppButton>
        <AppButton type="light-green" class="modal__btn" @click="confirm">Confirm</AppButton>
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { CreateStrategyOrderDto } from "@/store/orders/types";

@Component({ name: "launchingPopup" })
export default class launchingPopup extends Vue {
  /* DATA */
  isOpen: boolean = false;

  data: any = {
    account: "Binance1",
    pair: "BTC/USDT",
    entry: [{ val1: "lim/market", val2: "Price", val3: "Amount", val4: "Total" }],
    target: [{ val1: "Take profit", val2: "lim/market", val3: "x", val4: "x" }],
    stop: {
      val1: "Stop Loss",
      val2: "lim/market",
      val3: "-x",
      val4: "100",
    },

    description: {
      val1: "xx",
      val2: "xxx",
      val3: "xx",
      val4: "xxx",
      val5: "x",
      val6: "xx",
      val7: "xxx",
      val8: "-x",
      val9: "100",
    },
  };

  resolvePromise: any;

  rejectPromise: () => void;

  accountName: string = "";
  pair: string = "";
  entries: any[] = [];
  targets: any[] = [];
  stopLoss: any = null;
  side: string = "";
  baseCurrency: string = "";
  quoteCurrency: string = "";
  quantity: number = 0;

  /* METHODS */

  // show(order: CreateStrategyOrderDto, exchange: string, { baseCurrency, quoteCurrency }: any) {
  //   this.accountName = exchange;
  //   this.pair = order.symbol;
  //   this.entries = order.entries;
  //   this.targets = order.takeProfits;
  //   this.quantity = order.quantity;
  //   this.side = order.side.toLowerCase();
  //   this.stopLoss = order.stopLoss;
  //   this.baseCurrency = baseCurrency;
  //   this.quoteCurrency = quoteCurrency;

  //   this.isOpen = true;
  //   return new Promise((resolve, reject) => {
  //     this.resolvePromise = resolve;
  //     this.rejectPromise = reject;
  //   });
  // }

  cancel() {
    this.rejectPromise();
    this.isOpen = false;
  }

  confirm() {
    this.resolvePromise();
    this.isOpen = false;
  }
}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    padding-left: 130px;
    padding-right: 130px;
  }

  &__table {
    max-width: 370px;
  }
  &__table-label-col {
    max-width: 120px;
  }

  &__description {
    max-width: 440px;
  }

  &__btn {
    min-width: 150px;
  }
}
</style>
