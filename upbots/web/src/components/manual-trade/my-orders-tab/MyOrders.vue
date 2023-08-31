<template>
  <div class="flex flex-col flex-grow md:py-20 overflow-y-auto custom-scrollbar">
    <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
      <!-- BUY ORDERS -->
      <div class="flex flex-col flex-shrink-0 mb-40">
        <p class="text-iceberg text-sm leading-md mb-20 px-20">Buy Orders</p>
        <MyOrdersLabels :data="ordersLabels" class="pb-10 px-10" />
        <MyOrdersItem v-for="(item, index) in longStrategies" :key="index" :data="item" @cancelOrder="cancelOrder" class="flex-shrink-0" />
      </div>

      <!-- SELL ORDERS -->
      <div class="flex flex-col flex-shrink-0">
        <p class="text-iceberg text-sm leading-md mb-20 px-20">Sell Orders</p>
        <MyOrdersLabels :data="ordersLabels" class="pb-10 px-10" />
        <MyOrdersItem v-for="(item, index) in shortStrategies" :key="index" :data="item" @cancelOrder="cancelOrder" class="flex-shrink-0" />
      </div>
    </div>

    <!-- CONFIRM MODAL -->
    <AppConfirmModal
      ref="confirmCancelModal"
      title="Cancel your order"
      subtitle="Are you sure you want to cancel your order?"
      confirm-button="Cancel"
    >
    </AppConfirmModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Strategy } from "@/store/orders/types/types";

const order = namespace("orderModule");
const notifications = namespace("notificationsModule");

import MyOrdersLabels from "@/components/manual-trade/my-orders-tab/MyOrdersLabels.vue";
import MyOrdersItem from "@/components/manual-trade/my-orders-tab/MyOrdersItem.vue";

@Component({ name: "MyOrders", components: { MyOrdersLabels, MyOrdersItem } })
export default class MyOrders extends Vue {
  /* VUEX */
  @notifications.State notifications!: any;
  @order.Getter longStrategies: Strategy[];
  @order.Getter shortStrategies: Strategy[];
  @order.Action fetchOrders: any;
  @order.Action changeUnreadOrders: any;

  /* DATA */
  ordersLabels: string[] = ["Pair", "Price", "Qty", "Status", ""];

  /* REFS */
  $refs!: {
    confirmCancelModal: Vue & {
      show: () => Promise<void>;
    };
  };

  /* WATCHERS */
  @Watch("notifications")
  handleNewNotification() {
    this.fetchOrders();
  }

  /* HOOKS */
  created() {
    this.fetchOrders();
  }

  /* METHODS */
  cancelOrder(payload: any) {
    this.$refs.confirmCancelModal
      .show()
      .then(() => {
        const url = `/api/trade/directorder/cancel/${payload.id}`;
        this.$http
          .put(url)
          .then(() => {
            this.changeUnreadOrders(true);
          })
          .catch((e: any) => {
            this.$notify({ text: "Sorry, operation failed", type: "error" });
          })
          .finally(() => {});
      })
      .catch(() => {});
  }
}
</script>
