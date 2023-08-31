<template>
  <div v-if="!$breakpoint.smAndDown" class="table__inner">
    <div class="w-full overflow-x-auto custom-scrollbar">
      <div :class="$breakpoint.width > 1440 ? 'w-full' : 'table__container'">
        <div class="table relative flex-1 w-full max-w-full overflow-hidden">
          <div class="w-full">
            <table cellspacing="0" cellpadding="0" border="0" class="table__header bg-gable-green w-full">
              <colgroup>
                <UserHistoryCol v-for="(item, index) in tableColSize" :key="index" :data="item" :index="index" />
              </colgroup>
              <thead class="has-gutter">
                <tr>
                  <UserHistoryLabel v-for="(item, index) in tableLabels" :key="index" :data="item" :index="index" />
                </tr>
              </thead>
            </table>
          </div>

          <!-- TABLE ITEM : when bot not subscribed otherwise empty  (if not use the subscribed flag here below algoBotSubscription) -->
          <div class="table__body-wrapper w-full custom-scrollbar">
            <table ref="table" cellspacing="0" cellpadding="0" border="0" class="table__body w-full">
              <colgroup>
                <UserHistoryCol v-for="(item, index) in tableColSize" :key="index" :data="item" :index="index" />
              </colgroup>
              <tbody>
                <UserHistoryItem v-for="(item, index) in tableData" :key="index" :data="item" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MOBILE VIEW -->
  <div v-else class="flex flex-col px-20">
    <UserHistoryItemMobile v-for="(item, index) in tableData" :key="index" :data="item" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

import UserHistoryItem from "@/components/algo-bots/bot-detailed-new/user-history-table/UserHistoryItem.vue";
import UserHistoryItemMobile from "@/components/algo-bots/bot-detailed-new/user-history-table/UserHistoryItemMobile.vue";
import UserHistoryLabel from "@/components/algo-bots/bot-detailed-new/user-history-table/UserHistoryLabel.vue";
import UserHistoryCol from "@/components/algo-bots/bot-detailed-new/user-history-table/UserHistoryCol.vue";

@Component({ name: "UserHistory", components: { UserHistoryItem, UserHistoryItemMobile, UserHistoryLabel, UserHistoryCol } })
export default class UserHistory extends Vue {
  /* PROPS */
  @Prop({ required: true }) botCycleData: BotPerformanceCycleDto[];

  /* DATA */
  tableLabels: string[] = [
    "Pair",
    "Status",
    "Side",
    "Entry Price",
    "Close Price",
    "Realised Gain",
    "Profite/Loss",
    // "Profite/Loss(UC)",
    // "Paid/Credited",
    "Started",
    "Completed",
  ];
  tableColSize: string[] = ["109", "92", "78", "85", "81", "80", "80", "134", "136"];

  /* COMPUTED */
  get tableData() {
    if (this.botCycleData) {
      const toReturn = [...this.botCycleData];

      toReturn.sort((a, b) => +new Date(b.openAt) - +new Date(a.openAt));

      return toReturn;
    } else {
      return [];
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
  &__container {
    width: 860px;
  }

  &__body-wrapper {
    @apply overflow-hidden relative;
    height: 197px;
  }

  .table {
    &__body-wrapper {
      @apply overflow-y-auto;
    }
  }

  @media (max-width: 767px) {
    &__inner {
      @apply relative;
      &:before,
      &:after {
        content: "";
        @apply absolute left-0 top-0 h-full z-30;
        width: 55px;
      }
      &:before {
        background: linear-gradient(270deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
      }
      &:after {
        background: linear-gradient(90deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
      }
    }
  }
}
</style>
