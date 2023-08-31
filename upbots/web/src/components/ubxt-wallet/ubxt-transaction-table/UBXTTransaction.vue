<template>
  <div v-if="!$breakpoint.smAndDown" class="table__inner">
    <div class="w-full overflow-x-auto custom-scrollbar">
      <div class="w-full">
        <div class="table relative flex-1 w-full max-w-full overflow-hidden">
          <div class="w-full">
            <table cellspacing="0" cellpadding="0" border="0" class="table__header w-full md:px-20">
              <colgroup>
                <UBXTTransactionCol v-for="(item, index) in tableColData" :key="index" :data="item" :index="index" />
              </colgroup>
              <thead class="has-gutter">
                <tr>
                  <UBXTTransactionLabel v-for="(item, index) in tableLabels" :key="index" :data="item" :index="index" />
                </tr>
              </thead>
            </table>
          </div>

          <!-- TABLE ITEM : when bot not subscribed otherwise empty  (if not use the subscribed flag here below algoBotSubscription) -->
          <div class="table__body-wrapper w-full custom-scrollbar md:px-20">
            <table ref="table" cellspacing="0" cellpadding="0" border="0" class="table__body w-full">
              <colgroup>
                <UBXTTransactionCol v-for="(item, index) in tableColData" :key="index" :data="item" :index="index" />
              </colgroup>
              <UBXTTransactionItem v-for="(item, index) in tableData" :key="index" :data="item" />
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col w-full">
    <UBXTTransactionItemMobile v-for="(item, index) in tableData" :key="index" :data="item" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { UserTransaction } from "@/store/perfees/types";

import UBXTTransactionItem from "@/components/ubxt-wallet/ubxt-transaction-table/UBXTTransactionItem.vue";
import UBXTTransactionItemMobile from "@/components/ubxt-wallet/ubxt-transaction-table/UBXTTransactionItemMobile.vue";
import UBXTTransactionLabel from "@/components/ubxt-wallet/ubxt-transaction-table/UBXTTransactionLabel.vue";
import UBXTTransactionCol from "@/components/ubxt-wallet/ubxt-transaction-table/UBXTTransactionCol.vue";

@Component({
  name: "UBXTTransaction",
  components: { UBXTTransactionItem, UBXTTransactionItemMobile, UBXTTransactionLabel, UBXTTransactionCol },
})
export default class UBXTTransaction extends Vue {
  /* PROPS */
  @Prop({ required: true }) transactionsData: UserTransaction[];
  @Prop({ required: true }) isGrouping: boolean;

  /* COMPUTED */
  get tableData() {
    if (this.transactionsData) {
      if (this.isGrouping) {
        const data_lv1 = [];
        let duplicated = false;
        for (const item of this.transactionsData) {
          if (item.extra && item.extra.performanceCycleId && item.type === "PERFORMANCE_FEE" && item.subType !== "GROUP") {
            duplicated = false;
            for (let i = 0; i < data_lv1.length; i++) {
              if (!data_lv1[i].extra) {
                continue;
              }
              if (
                item.botId === data_lv1[i].botId &&
                item.extra.performanceCycleId.toString() === data_lv1[i].extra.performanceCycleId.toString()
              ) {
                data_lv1[i].amount += item.amount;
                data_lv1[i].details.push(item);
                duplicated = true;
                break;
              }
            }
            if (!duplicated) {
              data_lv1.push({ ...item, type: "Performance Fee", hash: "", details: [item] });
            }
          } else {
            data_lv1.push(item);
          }
        }
        return data_lv1;
      } else {
        return this.transactionsData;
      }
    } else {
      return [];
    }
  }

  get tableColData() {
    if (this.$breakpoint) {
      if (this.$breakpoint.width > 1024) {
        return ["3%", "14%", "9%", "9%", "15%", "11%", "15%", "24%"];
      } else if (this.$breakpoint.width <= 1024 && this.$breakpoint.width > 900) {
        return ["3%", "16%", "9%", "9%", "13%", "11%", "15%", "24%"];
      } else {
        return ["4%", "15%", "9%", "13%", "15%", "12%", "21%", "14%"];
      }
    } else {
      return ["3%", "12%", "9%", "9%", "13%", "11%", "15%", "28%"];
    }
  }

  get tableLabels() {
    if (this.$breakpoint && this.$breakpoint.width < 900) {
      return ["", "Type", "Bot", "Status", "Amount", "Confirm%", "Date", "Hash"];
    } else {
      return ["", "Type", "Bot", "Status", "Amount", "Confirm%", "Date", "Transaction Hash"];
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  &__body,
  &__header {
    table-layout: fixed;
    border-collapse: separate;
  }
}

.table {
  &__body-wrapper {
    @apply overflow-hidden relative;
    height: 197px;
  }

  .table {
    &__body-wrapper {
      @apply overflow-y-auto;
    }
  }
}
</style>
