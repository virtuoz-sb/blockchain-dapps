<template>
  <div class="my-orders-item__wrap flex flex-col relative mb-10 last:mb-0">
    <!-- PREVIEW -->
    <div class="my-orders-item__preview flex items-center justify-between py-15 px-10 cursor-pointer" @click="isOpen = !isOpen">
      <!-- PAIR -->
      <div class="my-orders-item__col-1 flex items-center">
        <div class="flex items-center">
          <!-- TODO -->
          <!-- <CryptoCoinChecker :data="data.coin">
            <template slot-scope="{ isExist, coinName, srcCoin }">
              <img v-if="isExist" :src="require(`@/assets/icons/${srcCoin}.png`)" :alt="srcCoin" class="w-14 h-14 mr-5" />
              <cryptoicon v-else :symbol="coinName" size="14" generic class="mr-5" />
            </template>
          </CryptoCoinChecker> -->
          <!-- <img src="@/assets/images/binance.svg" alt="binance" class="mr-6" /> -->
          <img :src="getExchangeImage(data.exch)" alt="binance" class="mr-6 w-14 max-w-14 h-14" />
          <span class="text-iceberg text-xs leading-xs truncate">{{ data.sbl }}</span>
        </div>
      </div>

      <!-- ORDER PRICE -->
      <div v-if="orderPrice" class="my-orders-item__col-2 text-xs leading-xs text-iceberg">
        {{ Number.isInteger(Number(orderPrice)) ? orderPrice : Number.parseFloat(orderPrice).toFixed(3) }}
      </div>

      <!-- QTY BASE ASKED -->
      <div v-if="data.qtyBaseAsked" class="my-orders-item__col-3 text-xs leading-xs text-iceberg">
        {{ data.qtyBaseAsked | toDefaultFixed }}
      </div>

      <!-- STATUS -->
      <div class="my-orders-item__col-4 flex">
        <span class="w-12 h-12 rounded-full" :class="`bg-${statusColor}`"></span>
      </div>

      <!-- ARROW -->
      <div class="my-orders-item__col-5 flex">
        <i class="icon-arrow-expand text-iceberg" :class="{ 'transform rotate-180': isOpen }" />
      </div>
    </div>

    <!-- CONTENT -->
    <transition name="fade">
      <div v-if="isOpen" class="flex flex-col mt-15 pb-15">
        <div class="grid grid-cols-3 col-gap-5 px-10 mb-20">
          <!-- ORDER TYPE -->
          <div class="flex flex-col mr-10">
            <span class="text-sm md:text-xs leading-xs text-iceberg mb-5">Order Type</span>
            <span v-if="data.orderType" class="text-sm leading-xs text-white">{{ data.orderType }}</span>
          </div>

          <!-- ACCOUNT -->
          <div class="flex flex-col mr-10">
            <span class="text-sm md:text-xs leading-xs text-iceberg mb-5">Account</span>
            <span class="text-sm leading-xs text-white">{{ data.accountName ? data.accountName : "-" }}</span>
          </div>

          <!-- DATE -->
          <div class="flex flex-col">
            <span class="text-sm md:text-xs leading-xs text-iceberg mb-5">Date</span>
            <span v-if="data.created_at" class="text-sm leading-xs text-white">{{ data.created_at | date }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 col-gap-10 px-10 mb-20">
          <!-- ORDER PRICE -->
          <div class="flex flex-col mr-10">
            <span class="text-sm md:text-xs leading-xs text-iceberg mb-5">Order Price ({{ data.quoteCurrency }})</span>
            <span class="text-sm leading-xs text-white">
              {{ Number.isInteger(Number(orderPrice)) ? orderPrice : Number.parseFloat(orderPrice).toFixed(4) }}
            </span>
          </div>

          <!-- AMOUNT -->
          <div class="flex flex-col mr-10">
            <span class="text-sm md:text-xs leading-xs text-iceberg mb-5">Amount ({{ data.baseCurrency }})</span>
            <span v-if="amount" class="text-sm leading-xs text-white">
              {{ Number.isInteger(Number(amount)) ? amount : Number.parseFloat(amount).toFixed(4) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-3 col-gap-0 px-10">
          <!-- TOTAL -->
          <div class="flex flex-col mr-10">
            <span class="text-xs leading-xs text-iceberg mb-5">Total ({{ data.quoteCurrency }})</span>
            <span v-if="total" class="text-sm leading-xs text-white break-all">
              {{ Number.isInteger(Number(total)) ? total : Number.parseFloat(total).toFixed(4) }}
            </span>
          </div>

          <!-- STATUS -->
          <div class="flex flex-col mr-10">
            <span class="text-sm md:text-xs leading-xs text-iceberg mb-5">Status</span>
            <span class="text-sm leading-xs text-white">{{ data.userOrderStatus.toUpperCase() }}</span>
          </div>

          <!-- ACTION BTN -->
          <AppButton
            v-if="data.userOrderStatus.toUpperCase() == 'WAITING'"
            type="light-green"
            size="xs"
            class="w-60"
            @click="$emit('cancelOrder', data)"
          >
            <span class="text-sm">Cancel</span>
          </AppButton>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { IMyOrder } from "../types/manul-trade.types";

@Component({ name: "MyOrdersItem" })
export default class MyOrdersItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: IMyOrder;

  /* DATA */
  isOpen: boolean = false;

  /* COMPUTED */
  get orderPrice() {
    if (this.data.userOrderStatus === "filled") {
      return this.data.completion.pExec;
    } else {
      return this.data.priceAsked;
    }
  }

  get amount() {
    if (this.data.userOrderStatus === "filled") {
      return this.data.completion.qExec;
    } else {
      return this.data.qtyBaseAsked;
    }
  }

  get total() {
    if (this.data.userOrderStatus === "filled") {
      return this.data.completion.cumulQuoteCost;
    } else {
      return this.data.qtyBaseAsked * this.data.priceAsked;
    }
  }

  get statusColor() {
    if (this.data.userOrderStatus === "failed" || this.data.userOrderStatus === "cancelled") {
      return "red-cl-100";
    } else if (this.data.userOrderStatus === "filled" || this.data.userOrderStatus === "partial") {
      return "green-cl-100";
    } else if (this.data.userOrderStatus === "waiting") {
      return "grey-cl-920";
    } else {
      return "grey-cl-920";
    }
  }

  /* METHODS */
  getExchangeImage(exchange: string) {
    return require(`@/assets/images/${exchange === "bitmex_test" ? "bitmex" : exchange}.svg`);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.my-orders-item {
  &__wrap {
    background: #c4c4c416;
    &::after {
      content: "";
      @apply absolute left-0 top-0 w-2 h-full;
      background: linear-gradient(0deg, #6ed4ca 0%, #24819b 100%);
      box-shadow: 0px 0px 5px rgba(74, 172, 179, 0.5);
    }
  }

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

.icon-arrow-expand {
  font-size: 8px;
  transition: all 0.5s;
}
</style>
