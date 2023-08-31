<template>
  <div v-loading="loading" class="my-orders md:flex md:flex-col md:overflow-y-auto custom-scrollbar">
    <div class="hidden md:flex px-10 xl:px-20 pt-20 pb-5 xl:py-20">
      <div class="flex items-center mr-20">
        <span class="h-12 mr-8 w-12 bg-green-cl-100 shadow-70 rounded-full" />
        <span class="text-grey-cl-920 text-sm leading-md">Gain</span>
      </div>
      <div class="flex items-center">
        <span class="h-12 mr-8 w-12 bg-red-cl-100 shadow-60 rounded-full" />
        <span class="text-grey-cl-920 text-sm leading-md">Loss</span>
      </div>
    </div>
    <div class="flex flex-col overflow-y-auto custom-scrollbar pb-50 md:pb-0">
      <div class="px-20 md:px-10 xl:px-20 pt-10 xl:pt-20 mb-0 xl:mb-20 pb-10 border-b border-grey-cl-300">
        <p class="mb-15 xl:mb-20 text-grey-cl-920 text-base md:text-sm leading-md">Long Strategies</p>
        <div class="flex items-center justify-between">
          <i class="flex icon-up-bar w-20 text-grey-cl-300 text-xs leading-xs" />
          <span
            v-for="(label, index) in labels"
            :key="index"
            class="text-hidden-sea-glass text-sm md:text-xs leading-xs"
            :class="[{ 'w-61 md:w-43': index === 0 }, { 'w-53 md:w-38': index === 1 }, { 'w-85 md:w-61': index === 2 }]"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <!-- BUY ORDERS SECTION -->
      <div v-for="order in longStrategies" :key="order.id">
        <!-- ORDER -->
        <Order :key="order.id" operation-type="buy" :data="order" class="mb-0 xl:mb-10 xl:py-5" />
      </div>
      <!-- @click.native="selectOrder({ operation: item, orderId: order.id, operationType: 'buy' })" -->

      <div class="px-20 md:px-10 xl:px-20 pt-10 xl:pt-20 mb-0 xl:mb-20 pb-10 border-b border-grey-cl-300">
        <p class="mb-15 xl:mb-20 text-grey-cl-920 text-base md:text-sm leading-md">Short Strategies</p>
        <div class="flex items-center justify-between">
          <i class="flex icon-up-bar w-20 text-grey-cl-300 text-xs leading-xs" />
          <span
            v-for="(label, index) in labels"
            :key="index"
            class="text-grey-cl-300 text-sm md:text-xs leading-xs"
            :class="[{ 'w-61 md:w-43': index === 0 }, { 'w-53 md:w-38': index === 1 }, { 'w-85 md:w-61': index === 2 }]"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <!-- SELL ORDERS SECTION -->
      <div v-for="order in shortStrategies" :key="order.id">
        <!-- ORDER -->
        <Order :key="order.id" operation-type="buy" :data="order" class="mb-0 xl:mb-10 xl:py-5" />
      </div>
    </div>

    <!-- ORDER MODAL -->
    <AppModal v-model="isVisibleModal" custom-class="order-modal">
      <!-- ORDER -->
      <!-- <order
        v-if="selectedOrder && selectedOrder.orderId"
        modal
        :operation="selectedOrder.operation"
        :order-id="selectedOrder.orderId"
        :operation-type="selectedOrder.operationType"
        @close-modal="closeModal"
      /> -->
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Strategy } from "@/store/orders/types/types";

const order = namespace("orderModule");

import Order from "@/components/manual-trade/orders/order-options/Order.vue";

@Component({ name: "MyOrders", components: { Order } })
export default class MyOrders extends Vue {
  /* VUEX */
  @order.State strategies: Strategy[];
  @order.Getter longStrategies: Strategy[];
  @order.Getter shortStrategies: Strategy[];
  @order.Action fetchStrategies: () => Promise<Strategy[]>;

  labels: string[] = ["Current", "Amount", "Price"];
  selectedOrder: any = null;
  isVisibleModal: boolean = false;
  loading: boolean = false;

  /* HOOKS */
  created() {
    // prevent startegies list fetching if data already exist
    if (!this.strategies.length) {
      this.loading = true;
      this.fetchStrategies().finally(() => {
        this.loading = false;
      });
    }
  }

  /* METHODS */
  selectOrder(payload: any) {
    if (this.$breakpoint.mdAndDown) {
      this.selectedOrder = payload;
      this.isVisibleModal = true;
    }
  }

  closeModal() {
    this.isVisibleModal = false;
  }
}
</script>

<style lang="scss" scoped>
.my-orders {
  .order {
    @media (max-width: 1279px) {
      background: rgba(21, 22, 25, 0.7);
      border-bottom: 1px solid;
      border-color: rgba(71, 76, 87, 0.5);
    }
  }
}
::v-deep .order-modal {
  @apply w-full px-20;
  max-width: 375px;
  @media (max-width: 767px) {
    .order {
      @apply px-0 py-20 shadow-20 rounded-15 border-none;
      background-color: rgba(21, 22, 25, 0.8);
    }
  }
}
</style>
