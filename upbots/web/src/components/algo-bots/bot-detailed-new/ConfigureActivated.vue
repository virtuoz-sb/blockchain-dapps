<template>
  <div v-loading="loading">
    <div class="flex flex-col mb-20 overflow-y-auto custom-scrollbar">
      <!-- TITLE -->
      <h2 class="text-iceberg leading-xs mb-24 px-20">Configuration</h2>

      <!-- PAIR -->
      <div
        :class="breakpointXL ? 'grid-cols-1 row-gap-18 px-10 mb-40' : 'grid-cols-3 md:grid-cols-3 row-gap-20 md:col-gap-20 px-20 mb-18'"
        class="grid"
      >
        <p class="col-span-1 text-iceberg text-sm leading-xs mr-10">Pair</p>
        <p class="col-span-2 text-white text-sm leading-xs">{{ botPair }}</p>
      </div>

      <!-- SELECT ACCOUNT DROPDOWN -->
      <div
        :class="breakpointXL ? 'grid-cols-1 row-gap-18 px-10 mb-40' : 'grid-cols-3 md:grid-cols-3 row-gap-20 md:col-gap-20 px-20 mb-18'"
        class="grid"
      >
        <p class="col-span-1 text-iceberg text-sm leading-xs mr-10">Account</p>
        <div class="col-span-2 flex items-center">
          <p class="text-white text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">{{ activeAccount.name }}</p>
          <img v-if="activeAccount && activeAccount.img" class="w-14 max-w-14 h-auto ml-2" :src="activeAccount.img" />
        </div>
      </div>

      <!-- POSITION SIZE -->
      <div
        :class="breakpointXL ? 'grid-cols-1 row-gap-18 px-10 mb-40' : 'grid-cols-3 md:grid-cols-3 row-gap-20 md:col-gap-20 px-20 mb-18'"
        class="grid"
      >
        <p class="col-span-1 text-iceberg text-sm leading-xs mr-10">Position Size:</p>
        <div class="col-span-2 flex flex-col">
          <p v-if="activeSubscription" class="text-white text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">
            {{ activeSubscription.accountPercent * 100 + "%" }}
          </p>
        </div>
      </div>

      <!-- STATUS -->
      <div
        :class="breakpointXL ? 'grid-cols-1 row-gap-18 px-10 mb-40' : 'grid-cols-3 md:grid-cols-3 row-gap-20 md:col-gap-20 px-20 mb-18'"
        class="grid"
      >
        <p class="col-span-1 text-iceberg text-sm leading-xs mr-10">Status:</p>
        <div class="col-span-2 flex flex-col">
          <p v-if="status === 'active'" class="text-green-cl-100 text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">ACTIVE</p>
          <p v-else-if="status === 'paused'" class="text-red-cl-100 text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">PAUSED</p>
        </div>
      </div>
    </div>

    <!-- ACTIVATE BUTTON -->
    <div :class="breakpointXL ? 'flex-col px-10' : 'px-20'" class="flex justify-between w-auto md:w-full mt-auto">
      <template v-if="isValidKey && status === 'active'">
        <AppButton type="light-green" class="configure__pause-btn" :class="breakpointXL && 'mb-10'" @click="changeSwitcher">
          Pause
        </AppButton>
        <AppButton type="light-green" class="configure__delete-btn" @click="handleBotDeletion">Delete</AppButton>
      </template>

      <template v-if="isValidKey && status === 'paused'">
        <AppButton type="light-green" class="configure__reactivate-btn" :class="breakpointXL && 'mb-10'" @click="changeSwitcher">
          Reactivate
        </AppButton>
        <AppButton type="light-green" class="configure__delete-btn" @click="handleBotDeletion">Delete</AppButton>
      </template>
    </div>

    <!-- ACTIVATE MODAL -->
    <AppConfirmModal ref="activateModal" title="Do you confirm that you want to activate this bot?" confirm-button="Confirm" is-checkbox>
      <div slot="checkbox-label" class="text-sm leading-xs text-iceberg">
        I agree to the UpBots
        <a href="/terms-conditions" target="_blank" class="text-blue-cl-100 cursor-pointer">terms and conditions</a>
      </div>
    </AppConfirmModal>

    <!-- DELETE MODAL -->
    <AppConfirmModal
      ref="deleteModal"
      title="Delete Your Bot?"
      subtitle="Are you sure you want to delete this bot?"
      confirm-button="Delete"
    />

    <!-- DELETE MODAL -->
    <AppConfirmModal
      ref="confirmDeleteOpenPosition"
      title="Are you sure?"
      subtitle="Hey it seems that you have an open position on this bot, if you delete it now we will leave it open so you can manage it manually"
      confirm-button="Ok"
    />

    <!-- HOLD MODAL -->
    <AppModal v-model="isHoldModalOpen" persistent max-width="690px">
      <div class="active-bot__hold-modal relative flex flex-col w-full pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Put The Bot On Hold?</h2>

          <div class="active-bot__hold-modal-desc w-full text-grey-cl-100 leading-xs text-center text-base mx-auto mb-40">
            Are you sure you want to pause the bot ? If you have an open position, we will leave it open so you can manage it manually
          </div>

          <div class="flex flex-col md:flex-row items-center w-full md:w-auto">
            <AppButton
              type="light-green"
              class="active-bot__hold-modal-btn w-full md:w-auto mb-30 md:mb-0 md:mr-40"
              @click="switchBotSubscription"
            >
              Pause
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="isActiveModalOpen" persistent max-width="690px">
      <div class="active-bot__hold-modal relative flex flex-col w-full pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Are you sure you want to activate this bot?</h2>

          <div class="flex flex-col md:flex-row items-center w-full md:w-auto">
            <AppButton
              type="light-green"
              class="active-bot__hold-modal-btn w-full md:w-auto mb-30 md:mb-0 md:mr-40"
              @click="isActiveModalOpen = false"
            >
              Cancel
            </AppButton>

            <AppButton type="light-green" class="active-bot__hold-modal-btn w-full md:w-auto" @click="switchBotSubscription">
              Activate
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { AlgoBot, AlgoBotSubscription, SubscriptionBotPause } from "../../../store/algo-bots/types/algo-bots.payload";
import { UserWallet, UserTransaction, BotWallet, TransferType } from "@/store/perfees/types";
import { KeyExtended } from "@/store/user/types";
import { namespace } from "vuex-class";

const algobots = namespace("algobotsModule");
const user = namespace("userModule");
const trade = namespace("tradeModule");
const perfees = namespace("perfeesModule");

import PairSelection from "@/components/manual-trade/pair-selection/PairSelection.vue";

@Component({ name: "ConfigureActivated", components: { PairSelection } })
export default class ConfigureActivated extends Vue {
  /* VUEX */
  @algobots.State error: any;
  @algobots.State botssubscriptions: any;
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action deleteSubscriptionActionAsync: (payload: { id: string }) => Promise<void>;
  @algobots.Action pauseResumeBotAction: (sub: Partial<SubscriptionBotPause>) => Promise<any>;
  @user.Getter getKeyNamesWithExchange!: KeyExtended[];
  @trade.State exchange: any;
  @perfees.Action closePerformanceCycle!: any;

  /* PROPS */
  @Prop({ required: false, type: Boolean }) breakpointXL: boolean;
  @Prop({ required: true }) botName: string;

  /* REFS */
  $refs!: {
    activateModal: Vue & {
      show: () => Promise<void>;
    };
    deleteModal: Vue & {
      show: () => Promise<void>;
    };
    confirmDeleteOpenPosition: Vue & {
      show: () => Promise<void>;
    };
  };

  /* DATA */
  algoBot: AlgoBot | null = null;
  activeAccount: any = {};
  activeSubscription: AlgoBotSubscription | null = null;
  status: "active" | "inactive" | "paused" = "inactive";
  isValidKey: boolean = false;

  loading: boolean = false;
  isHoldModalOpen: boolean = false;
  isActiveModalOpen: boolean = false;

  /* COMPUTED */
  get botPair(): string {
    if (!this.algoBot) {
      return null;
    }
    return this.algoBot.base + this.algoBot.quote;
  }

  /* WATCHERS */
  @Watch("exchange", { immediate: true })
  handleExchange(val: any) {
    if (!val) return;

    if (val.valid) {
      this.isValidKey = true;
    } else {
      this.$notify({ text: `API key for ${val.name} account is not valid. Trading is blocked`, type: "error" });
      this.isValidKey = false;
    }
  }

  /* HOOKS */
  mounted() {
    this.init();
  }

  /* METHODS */
  async init() {
    await this.fetchAlgoBotsAction();
    if (this.$route.params.id) {
      this.algoBot = this.getAlgoBotById(this.$route.params.id);
      this.setStatus();
      this.getActiveAccount();
      if (!this.getKeyNamesWithExchange) {
        return;
      }
    }
  }

  setStatus() {
    const activeBots = this.getBotsSubcriptions.filter((sub) => sub.enabled).map((sub) => sub.botId);
    const pausedBots = this.getBotsSubcriptions.filter((sub) => !sub.enabled).map((sub) => sub.botId);
    const botId = this.algoBot.id;
    if (activeBots.includes(botId)) {
      this.status = "active";
    } else if (pausedBots.includes(botId)) {
      this.status = "paused";
    } else {
      this.status = "inactive";
    }
  }

  getActiveAccount() {
    if (this.status !== "inactive") {
      this.activeSubscription = this.getBotsSubcriptions.filter((sub) => sub.botId === this.algoBot.id)[0];
      const { name, img } = this.getKeyNamesWithExchange.filter((key: any) => key.id === this.activeSubscription.apiKeyRef)[0];
      this.activeAccount = { name, img };
    }
  }

  handleBotDeletion() {
    const sub = this.botssubscriptions.find((el: any) => {
      return el.botId === this.algoBot.id;
    });

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
        this.init();
      })
      .catch(({ response: { data } }) => {
        this.$notify({ text: data.message, type: "error" });
      });
  }

  switchBotSubscription() {
    const sub = this.botssubscriptions.find((el: any) => {
      return el.botId === this.algoBot.id;
    });
    this.pauseResumeBotAction({ subId: sub.id }).then(async () => {
      await this.fetchAlgoBotsSubscriptionsAction();
      this.algoBot = this.getAlgoBotById(this.$route.params.id);
      this.setStatus();
      this.isHoldModalOpen = false;
      this.isActiveModalOpen = false;
      // this.isHoldModalOpen = true;
    });
  }

  changeSwitcher() {
    const data = this.botssubscriptions.find((el: any) => {
      return el.botId === this.algoBot.id;
    });
    if (data.enabled) {
      this.isHoldModalOpen = true;
    } else {
      this.isActiveModalOpen = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.configure {
  &__activate-btn {
    min-width: 130px;
  }
  &__pause-btn,
  &__reactivate-btn,
  &__delete-btn {
    @media (min-width: 1281px) {
      width: 150px;
    }
    @media (max-width: 767px) {
      width: 150px;
    }
  }
}

.active-bot {
  &__hold-modal-desc {
    max-width: 330px;
  }
  &__hold-modal-btn {
    min-width: 200px;
  }
}

::v-deep iframe {
  background: red !important;
}
</style>
