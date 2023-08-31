<template>
  <div v-if="!$breakpoint.smAndDown" class="table__inner">
    <div class="w-full overflow-x-auto custom-scrollbar">
      <div :class="$breakpoint.width > 1440 ? 'w-full' : 'table__container'">
        <div class="table relative flex-1 w-full max-w-full overflow-hidden">
          <div class="w-full">
            <table cellspacing="0" cellpadding="0" border="0" class="table__header bg-gable-green w-full">
              <colgroup>
                <BotHistoryCol v-for="(item, index) in tableColData" :key="index" :data="item" :index="index" />
              </colgroup>
              <thead class="has-gutter">
                <tr>
                  <BotHistoryLabel v-for="(item, index) in tableLabels" :key="index" :data="item" :index="index" />
                </tr>
              </thead>
            </table>
          </div>

          <!-- TABLE ITEM : when bot not subscribed otherwise empty  (if not use the subscribed flag here below algoBotSubscription) -->
          <div class="table__body-wrapper w-full custom-scrollbar">
            <table ref="table" cellspacing="0" cellpadding="0" border="0" class="table__body w-full">
              <colgroup>
                <BotHistoryCol v-for="(item, index) in tableColData" :key="index" :data="item" :index="index" />
              </colgroup>
              <tbody>
                <BotHistoryItem v-for="(item, index) in tableData" :key="index" :data="item" />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTON -->
      <!-- <div
            class="flex items-center justify-end w-full text-blue-cl-100 text-shadow-5 leading-xs ml-auto px-40 cursor-pointer mt-auto z-40"
            @click="loadMore"
          >
            Load More
      </div> -->
    </div>
  </div>

  <!-- MOBILE VIEW -->
  <div v-else class="flex flex-col px-20">
    <BotHistoryItemMobile v-for="(item, index) in tableData" :key="index" :data="item" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

import BotHistoryItem from "@/components/algo-bots/bot-detailed-new/bot-history-table/BotHistoryItem.vue";
import BotHistoryItemMobile from "@/components/algo-bots/bot-detailed-new/bot-history-table/BotHistoryItemMobile.vue";
import BotHistoryLabel from "@/components/algo-bots/bot-detailed-new/bot-history-table/BotHistoryLabel.vue";
import BotHistoryCol from "@/components/algo-bots/bot-detailed-new/bot-history-table/BotHistoryCol.vue";

@Component({ name: "BotHistory", components: { BotHistoryItem, BotHistoryItemMobile, BotHistoryLabel, BotHistoryCol } })
export default class BotHistory extends Vue {
  /* PROPS */
  @Prop({ required: true }) botCycleData: BotPerformanceCycleDto[];

  /* REFS */
  $refs: {
    table: HTMLElement;
  };

  /* DATA */
  tableLabels: string[] = ["Pair", "Status", "Side", "Entry Price", "Close Price", "Profit/Loss", "Started", "Completed"];
  tableColData: string[] = ["109", "92", "88", "95", "95", "87", "134", "135"];

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
    height: 186px;
  }

  .table {
    &__body-wrapper {
      @apply overflow-y-auto;
    }
  }

  @media (max-width: 767px) {
    &__inner {
      @apply relative;
      &:before {
        content: "";
        @apply absolute left-0 top-0 z-30;
        width: 55px;
        height: 100%;
        background: linear-gradient(270deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
      }
      &:after {
        content: "";
        @apply absolute h-full right-0 top-0 z-30;
        width: 55px;
        background: linear-gradient(90deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
      }
    }
  }
}
</style>
