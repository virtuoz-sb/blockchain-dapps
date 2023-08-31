<template>
  <div
    class="flex flex-col flex-grow bg-dark-200 rounded-t-15 md:rounded-3 md:pb-20 md:pt-20 overflow-y-auto custom-scrollbar cursor-pointer"
  >
    <!-- TABLE CARDS -->
    <div v-if="loading === false" class="flex flex-col flex-grow py-20 md:py-0 px-20 md:px-0 overflow-y-auto custom-scrollbar">
      <!-- TABLE LABELS -->
      <div v-if="!$breakpoint.smAndDown" class="table__label-wrap flex items-stretch sticky top-0 w-full mb-10 z-20">
        <!-- LABEL ACTIVE -->
        <div
          class="table__label table__label-col-1 flex items-center h-full text-hidden-sea-glass text-xs md:ml-20 pl-20 md:pl-10 lg:pl-20 pr-10 lg:pr-20 py-15 md:py-20"
        >
          Active
        </div>

        <!-- LABEL BOT NAME -->
        <div class="table__label table__label-col flex items-center h-full pr-10 lg:pr-20 py-15 md:py-20">
          <span class="text-hidden-sea-glass text-xs mr-2">Bot Name</span>
          <i class="icon-arrow-filled text-iceberg text-xs"></i>
        </div>

        <!-- LABEL ACCOUNT PLUGGED -->
        <div class="table__label table__label-col flex items-center h-full text-hidden-sea-glass text-xs pr-10 lg:pr-20 py-15 md:py-20">
          Account plugged
        </div>

        <!-- LABEL ACTIVATION DATE -->
        <div class="table__label table__label-col flex items-center h-full text-hidden-sea-glass text-xs pr-10 lg:pr-20 py-15 md:py-20">
          Activation date
        </div>

        <!-- LABEL CURRENT POSITION -->
        <div class="table__label table__label-col flex items-center h-full text-hidden-sea-glass text-xs pr-10 lg:pr-20 py-15 md:py-20">
          Current position
        </div>

        <div
          class="table__label table__label-col flex items-center h-auto text-grey-cl-300 text-xs pr-20 md:pr-10 lg:pr-20 mr-20 py-15 md:py-20"
        >
          <!-- Last month profit (% USD)-->
        </div>
      </div>

      <!-- @switchBotRunning="switchBotRunning(index)" -->
      <!-- TABLE ITEM -->
      <ActiveBotsItem
        :data="item"
        v-for="(item, index) in getBotsSubcriptions"
        :key="index"
        @delete="handleBotDeletion(index)"
        @pause-subscription="switchBotSubscription(item)"
        @resume-subscription="switchBotSubscription(item)"
      />
    </div>

    <!-- DELETE MODAL -->
    <AppConfirmModal
      ref="deleteModal"
      title="Delete Your Bot?"
      subtitle="Are you sure you want to delete this bot?"
      confirm-button="Delete"
    />

    <!-- Confirm delete if position is open-->
    <AppConfirmModal
      ref="confirmDeleteOpenPosition"
      title="Are you sure?"
      subtitle="Hey it seems that you have an open position on this bot, if you delete it now we will leave it open so you can manage it manually"
      confirm-button="Ok"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AlgoBotSubscription, SubscriptionBotPause } from "../../store/algo-bots/types/algo-bots.payload";
import { UserWallet, UserTransaction, BotWallet, TransferType } from "@/store/perfees/types";
import { namespace } from "vuex-class";

const algobots = namespace("algobotsModule");
const perfees = namespace("perfeesModule");

import ActiveBotsItem from "@/components/algo-bots/ActiveBotsItem.vue";

@Component({ name: "ActiveBots", components: { ActiveBotsItem } })
export default class ActiveBots extends Vue {
  /* VUEX */
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Action pauseResumeBotAction: (sub: Partial<SubscriptionBotPause>) => Promise<any>;
  @algobots.Action deleteSubscriptionActionAsync: (payload: { id: string }) => Promise<void>;
  @perfees.Action closePerformanceCycle!: any;

  /* REFS */
  $refs!: {
    deleteModal: Vue & {
      show: () => Promise<void>;
    };
    confirmDeleteOpenPosition: Vue & {
      show: () => Promise<void>;
    };
  };

  /* DATA */
  loading: boolean = false;

  /* HOOKS */
  async mounted() {
    this.loading = true;
    await this.fetchAlgoBotsSubscriptionsAction();
    this.loading = false;
  }

  /* METHODS */
  handleBotDeletion(index: any) {
    const sub = this.getBotsSubcriptions[index];
    const isOpenPosition = sub.botRunning;

    this.$refs.deleteModal.show().then(() => {
      if (isOpenPosition) {
        this.$refs.confirmDeleteOpenPosition.show().then(() => {
          this.deleteBot(sub.id);
          this.closePerformanceCycle({ botId: sub.botId, botSubId: sub.id });
        });
      } else {
        this.deleteBot(sub.id);
        this.closePerformanceCycle({ botId: sub.botId, botSubId: sub.id });
      }
    });
  }

  deleteBot(id: string) {
    this.deleteSubscriptionActionAsync({ id })
      .then(() => {
        this.$notify({ text: "Bot has been deleted", type: "success" });
      })
      .catch(({ response: { data } }) => {
        this.$notify({ text: data.message, type: "error" });
      });
  }

  switchBotSubscription(sub: AlgoBotSubscription) {
    this.pauseResumeBotAction({ subId: sub.id });
  }
}
</script>

<style lang="scss" scoped>
.table {
  &__label {
    background: rgb(13, 31, 40);
  }
  &__label-col-1 {
    width: 12%;
    min-width: 144px;
  }
  &__label-col {
    width: 17.6%;
  }

  @media (max-width: 767px) {
    &__label-col {
      min-width: 90px;
    }
  }
}

.icon-arrow-filled {
  font-size: 3px;
}
</style>
