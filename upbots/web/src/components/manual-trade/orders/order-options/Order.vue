<template>
  <div v-loading="loading" class="order relative px-20 md:px-10 xl:px-20 py-15 cursor-pointer">
    <!-- Exhage | Pair | Executed price | Amount | Status | profit% -->
    <div class="flex w-full text-grey-cl-100" :class="{ 'mb-15': detailView }" @click="showOrder">
      <img class="max-w-14" :src="require(`@/assets/images/${data.market.exchange}.svg`)" :alt="data.market.exchange" />
      <span class="pl-10 ml-10 border-l text-xs leading-xs">{{ data.market.symbol }}</span>
      <span class="pl-10 ml-10 border-l text-xs leading-xs">{{ executedPrice }}</span>
      <span class="pl-10 ml-10 border-l text-xs leading-xs">{{ amount }}</span>
      <span class="pl-10 ml-10 border-l text-xs leading-xs">{{ data.phase }}</span>
      <span class="pl-10 ml-10 border-l text-xs leading-xs">{{ profit }}</span>
    </div>

    <!-- TODO remove after reive after 100% sure we don't need thiis any more -->
    <!-- <div v-if="!modal" class="flex items-center justify-between" :class="{ 'mb-16 xl:mb-25': isShowOrder }">
      <div class="flex w-20">
        <i class="icon-arrow-expand flex text-xs leading-md" :class="orderClasses" />
      </div>
      <div class="flex w-61 md:w-43" :class="orderClasses">
        <span class="truncate text-base md:text-xs leading-md">{{ operation.form.amount }}</span>
      </div>
      <div class="flex w-53 md:w-38">
        <span class="truncate text-base md:text-xs leading-md text-grey-cl-100">{{ totalAmount }}</span>
      </div>
      <div class="flex items-center w-85 md:w-61">
        <span class="truncate text-base md:text-xs leading-md text-grey-cl-100 mr-2">{{ price }}</span>
        <span class="text-base md:text-xs leading-md text-grey-cl-100">{{ baseAsset }}</span>
      </div>
    </div> -->

    <!-- TODO remove after reive after 100% sure we don't need thiis any more -->
    <!-- Header desktop section -->
    <!-- <div v-if="modal" class="px-20 flex justify-between items-center border-b border-solid border-grey-cl-400 pb-12">
      <i class="icon-arrow-expand text-xs" :class="orderClasses" />
      <span :class="orderClasses">{{ operation.form.amount }}</span>
      <span class="text-base md:text-xs leading-md text-grey-cl-100">{{ totalAmount }}</span>
      <span class="text-base md:text-xs leading-md text-grey-cl-100">{{ price }} {{ baseAsset }}</span>
    </div> -->

    <!-- Detail View -->
    <div v-if="detailView" class="flex flex-col px-20 pt-20 md:pt-0 md:px-6 xl:px-0">
      <div class="flex pb-15 md:pb-20">
        <p class="text-sm leading-xs text-grey-cl-300 mr-10">ID:</p>
        <p class="text-sm leading-xs text-white">{{ data.id }}</p>
      </div>
      <div class="flex pb-15 md:pb-20">
        <p class="text-sm leading-xs text-grey-cl-300 mr-10">Account:</p>
        <p class="text-sm leading-xs text-white">{{ data.market.exchange }}</p>
      </div>
      <div class="flex pb-15 md:pb-20">
        <p class="text-sm leading-xs text-grey-cl-300 mr-10">Pair:</p>
        <p class="text-sm leading-xs text-white">{{ data.market.symbol }}</p>
      </div>
      <div class="flex pb-15 md:pb-20">
        <p class="text-sm leading-xs text-grey-cl-300 mr-10">Updated:</p>
        <p class="text-sm leading-xs text-white">{{ data.updated_at | date("YYYY-MM-DD HH:MM:SS") }}</p>
      </div>

      <!-- Main details -->
      <div class="flex pb-15 md:pb-20">
        <p class="text-sm leading-xs text-grey-cl-300 mr-10">Entries:</p>
        <p class="text-sm leading-xs text-white">N/A</p>
      </div>
      <div class="flex pb-15 md:pb-20">
        <p class="text-sm leading-xs text-grey-cl-300 mr-10">Target:</p>
        <p class="text-sm leading-xs text-white">N/A</p>
      </div>
      <div class="flex pb-15 md:pb-20">
        <p class="text-sm leading-xs text-grey-cl-300 mr-10">Stop:</p>
        <p class="text-sm leading-xs text-white">N/A</p>
      </div>

      <div class="flex items-center justify-between pb-15 md:pb-20">
        <div class="flex w-1/2">
          <p class="text-sm leading-xs text-grey-cl-300 mr-10">Current profit:</p>
          <p class="text-sm leading-xs text-white">{{ profit }}</p>
        </div>
        <div class="flex w-1/2 items-center justify-end text-blue-cl-100" @click="$emit('close-modal')">
          <i class="icon-extra-close text-xxl2 md:text-xl mr-8" />
          <span class="text-md leading-xs">Close now</span>
        </div>
      </div>

      <!-- <div class="text-md leading-xs md:text-sm md:leading-md text-grey-cl-920 mb-20 md:mb-10 xl:pb-20">
        <p>You will {{ loseOrWin }} just <span :class="orderClasses">3$</span> if you close the trade now</p>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Strategy, StrategyDetailsDto } from "@/store/orders/types/types";

const order = namespace("orderModule");

@Component({ name: "Order" })
export default class Order extends Vue {
  /* VUEX */
  @order.Action fetchStrategyDetails: (id: string) => Promise<StrategyDetailsDto>;

  /* PROPS */
  @Prop({ required: true }) data: Strategy;

  /* DATA */
  detailView: boolean = false;
  isShowOrder: boolean = false;
  loading: boolean = false;

  /* COMPUTED */
  get executedPrice(): number | string {
    if (this.data.phase >= 4) {
      return "";
    } else {
      return "N/A";
    }
  }

  get amount(): number {
    if (this.data.entries.length === 1) {
      return this.data.entries[0].quantity as number;
    } else {
      return this.data.entries.reduce((acc, cur) => acc + +cur.quantity, 0) as number;
    }
  }

  get profit() {
    if (this.data.phase >= 4) {
      return "";
    } else {
      return "N/A";
    }
  }

  get isActiveClass() {
    // return !this.isShowOrder || "is-active bg-dark-cl-300 xl:pt-6 xl:pb-20";
    return "";
  }

  get orderClasses() {
    // return this.operation.form.totalValue > this.operation.form.amount ? "green text-green-cl-100" : "red text-red-cl-100";
    return "";
  }

  get loseOrWin() {
    // return this.operation.form.totalValue > this.operation.form.amount ? "win" : "lose";
    return "";
  }

  get baseAsset() {
    // return this.operation.form.currency;
    return "";
  }

  get orderType() {
    // return this.operation.form.selectedAdaptationsType;
    return "";
  }

  get price() {
    // return this.operation.form.price;
    return "";
  }

  get totalAmount() {
    // const { form } = this.operation;
    // const lengthAfterDot = form.totalValue.toString().split(".")[1].length;
    // return lengthAfterDot >= 6 ? Number(form.totalValue).toFixed(6) : form.totalValue;
    return "";
  }

  /* METHODS */
  fetcOrderDetail() {
    // prevent details fetching on the collapse
    if (!this.detailView) {
      this.loading = true;
      this.fetchStrategyDetails(this.data.id).finally(() => {
        this.loading = false;
      });
    }
  }

  showOrder() {
    this.fetcOrderDetail();
    this.detailView = !this.detailView;
  }
}
</script>

<style lang="scss" scoped>
.icon-arrow-expand {
  font-size: 6px;
  transition: 0.2s linear;
  &.green {
    background-blend-mode: overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(89, 167, 51, 0.5);
    @apply transform rotate-180;
  }

  &.red {
    background-blend-mode: normal, overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(255, 49, 34, 0.5);
  }
}

.is-active {
  @apply text-white;
  &::after {
    content: "";
    bottom: -1px;
    background: linear-gradient(0deg, #6ed4ca 0%, #27adc5 100%), #24819b;
    @apply absolute left-0 h-full w-2 shadow-30;
  }
}

.close-btn {
  &::after {
    content: "";
    @apply absolute -bottom-1 left-0 w-full h-px bg-grey-cl-100;
  }
}
</style>
