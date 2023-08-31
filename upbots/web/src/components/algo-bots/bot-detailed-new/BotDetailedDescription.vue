<template>
  <div class="flex flex-col flex-grow flex-shrink-0" :style="`background: url(${backgroundDescription}) no-repeat center center / contain`">
    <div class="flex flex-col flex-shrink-0 mb-20">
      <div class="flex items-start justify-between mb-30">
        <div class="flex items-center">
          <div class="flex items-center justify-center w-60 h-60 rounded-full overflow-hidden">
            <img :src="botLogoImage" alt="Exchange Logo" class="h-full w-full object-cover" />
          </div>

          <div class="flex flex-col ml-18">
            <span class="text-hidden-sea-glass text-md font-bold">{{ algoBot && algoBot.name }}</span>
            <span class="text-white text-md font-bold">{{ algoBot && algoBot.creator }}</span>
          </div>
        </div>

        <div class="flex">
          <p class="hidden lg:block font-bold text-xl leading-xs" :class="status === 'active' ? 'text-green-cl-100' : 'text-red-cl-100'">
            {{ statusName }}
          </p>
          <span class="block lg:hidden w-16 h-16 rounded-full" :class="status === 'active' ? 'bg-green-cl-100' : 'bg-red-cl-100'" />
        </div>
      </div>

      <div class="w-full mb-28">
        <span class="text-white text-md font-medium">{{ algoBot && algoBot.description }}</span>
      </div>

      <div v-if="algoBot" class="grid grid-cols-2 col-gap-20 row-gap-20 mb-28">
        <span
          v-for="(item, index) in discriptionTagData"
          :key="index"
          class="bot-detailed-active__description-card-tag flex items-center justify-center text-base text-white leading-xs font-bold py-8 px-6 rounded-full"
        >
          {{ item }}
        </span>
      </div>

      <ul class="flex flex-col mb-24">
        <li v-if="botSubscriptionById && botSubscriptionById.cycleSequence" class="grid grid-cols-2 col-gap-20 items-center mb-16">
          <span class="text-base leading-xs text-white">Trade / month</span>
          <span class="text-tradewind text-xl leading-xs font-medium">{{ algoBot && algoBot.lastMonthTrades }}</span>
          <!-- <span class="text-tradewind text-xl leading-xs font-medium">{{ botSubscriptionById.cycleSequence }}</span> -->
        </li>

        <li v-if="daysRunning" class="grid grid-cols-2 col-gap-20 items-center mb-16">
          <span class="text-base leading-xs text-white">Running Days</span>
          <span v-if="activeSubscription" class="text-tradewind text-xl leading-xs font-medium">
            {{ daysRunning }}
          </span>
        </li>

        <li class="grid grid-cols-2 col-gap-20 items-center mb-16">
          <span class="text-base leading-xs text-white">Position Size</span>
          <span v-if="activeSubscription" class="flex items-center text-tradewind text-xl leading-xs font-medium">
            <span>{{ (activeSubscription.accountPercent * 100).toFixed(0) + "%" }}</span>
            <i
              v-if="!isBotRunning"
              class="block icon-edit text-blue-cl-100 text-sm ml-8 cursor-pointer"
              @click="showAccountPercentEditModal()"
            />
          </span>
        </li>

        <li class="grid grid-cols-2 col-gap-20 items-center mb-16">
          <div class="text-base leading-xs text-white">Account:</div>
          <div class="flex items-center">
            <img v-if="activeAccount && activeAccount.img" class="w-15 max-w-15 mr-6" :src="activeAccount.img" />
            <p class="text-tradewind text-xl leading-xs font-medium">{{ activeAccount.name }}</p>
          </div>
        </li>

        <li v-if="getEnablePerfFees" class="grid grid-cols-2 col-gap-20 items-center mb-16">
          <div class="text-base leading-xs text-white">Perf Fees:</div>
          <div class="flex items-center">
            <p class="text-tradewind text-xl leading-xs font-medium">{{ getBotPerfFees }}%</p>
          </div>
        </li>

        <!-- TODO -->
        <!-- <li class="grid grid-cols-2 col-gap-20 items-center">
          <div class="text-base leading-xs text-white">Total Profit:</div>
          <AppPercentageSpan class="text-xl leading-xs font-medium" :data="totalProfit" />
        </li> -->
      </ul>

      <BotDetailedStatistics v-if="formatedBotSnapshotData" :statistics-data="formatedBotSnapshotData" :displayUncomp="false" />
    </div>

    <div class="grid grid-cols-2 col-gap-20 flex-shrink-0 w-full mt-auto">
      <template v-if="isValidKey && status === 'inactive'">
        <AppButton type="light-green" class="w-full" @click="followBot">
          Activate
        </AppButton>
      </template>

      <template v-if="isValidKey && status === 'active'">
        <AppButton type="light-green" class="w-full" @click="changeSwitcher">
          Pause
        </AppButton>
        <AppButton type="light-green" class="w-full" @click="handleBotDeletion">Delete</AppButton>
      </template>

      <template v-if="isValidKey && status === 'paused'">
        <AppButton type="light-green" class="w-full" @click="changeSwitcher" :disabled="!isTradable">
          Reactivate
        </AppButton>
        <AppButton type="light-green" class="w-full" @click="handleBotDeletion">Delete</AppButton>
      </template>
    </div>
    <div v-if="status === 'paused' && !isTradable" class="text-red-cl-100 text-center text-xl leading-xs font-bold mt-20">
      Allocate UBXT to reactivate the bot
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

    <!-- DELETE CONFIRM MODAL -->
    <AppConfirmModal ref="confirmDeleteOpenPosition" title="Are you sure?" :subtitle="botDeletingMessage" confirm-button="Ok" />

    <!-- HOLD BOT MODAL -->
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
            <!-- <AppButton type="light-green" class="active-bot__hold-modal-btn w-full md:w-auto" @click="isHoldModalOpen = false">
              Pause and Close Now
            </AppButton> -->
          </div>
        </div>
      </div>
    </AppModal>

    <!-- ACTIVATE BOT MODAL -->
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
    <!-- ACCOUNT PERCENT EDIT MODAL -->
    <AppModal v-model="isEditModalOpen" max-width="400px">
      <div class="edit-modal__wrap relative flex flex-col pt-40 pb-40 px-20 md:px-45">
        <h2 class="font-raleway text-white text-xxl text-center">{{ algoBot && algoBot.name }}</h2>
        <span class="pt-10 text-center text-hidden-sea-glass text-md font-bold">Edit Position Size</span>
        <div class="pt-40">
          <AppRangeSlider
            v-if="activeSubscription && !isBotRunning"
            :options="{ min: 0, max: 100 }"
            v-model.number="percentageValue"
            labels="%"
            tooltip="active"
            :formatter="`${percentageValue}%`"
            @dragging="onUpdatedAccountPercent"
            @change="onUpdatedAccountPercent"
          />
        </div>
        <div class="flex items-center mt-20">
          <span class="text-base text-white mr-20">Next theorical order:</span>
          <span class="text-base text-white px-10 py-6"> {{ baseAvailable.toFixed(2) }} $ </span>
        </div>
        <div class="flex flex-col md:flex-row items-center w-full justify-between px-20 pt-30">
          <AppButton size="xs" type="light-green" @click="isEditModalOpen = false">
            Cancel
          </AppButton>
          <AppButton size="xs" type="light-green" @click="updateAccountPercent">
            Confirm
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import {
  AlgoBot,
  BotPerformanceCycleDto,
  AlgoBotSubscription,
  SubscriptionBotPause,
  BotPerformanceSnapshotDto,
  FollowBotRequest,
} from "@/store/algo-bots/types/algo-bots.payload";
import { UserWallet, UserTransaction, BotWallet, TransferType } from "@/store/perfees/types";
import { AlgobotsData } from "@/store/algo-bots/types/algo-bots.const";
import { KeyExtended } from "@/store/user/types";
import { AxiosError } from "axios";
import { namespace, Getter } from "vuex-class";
import moment from "moment";

const algobots = namespace("algobotsModule");
const user = namespace("userModule");
const trade = namespace("tradeModule");
const perfees = namespace("perfeesModule");

const dummyTagsData = AlgobotsData;

import BotDetailedStatistics from "@/components/algo-bots/bot-detailed-new/BotDetailedStatistics.vue";

@Component({ name: "BotDetailedDescription", components: { BotDetailedStatistics } })
export default class BotDetailedDescription extends Vue {
  /* VUEX */
  @Getter getEnablePerfFees: boolean;
  @user.Getter getKeyNamesWithExchange!: KeyExtended[];

  @trade.State exchange: any;

  @algobots.State error: any;
  @algobots.State botssubscriptions: any;
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Getter getSubscribedAlgoBotById: any;
  @algobots.Getter getBotSubscriptionCycles: BotPerformanceCycleDto[];
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action deleteSubscriptionActionAsync: (payload: { id: string }) => Promise<void>;
  @algobots.Action pauseResumeBotAction: (sub: Partial<SubscriptionBotPause>) => Promise<any>;
  @algobots.Action followBotAction: (payload: Partial<FollowBotRequest>) => Promise<any>;
  @algobots.Action updateSubscriptionAccountPercent!: any;
  @perfees.Action calcCurrentPerformanceFee!: any;
  @perfees.Action closePerformanceCycle!: any;

  /* PROPS */
  @Prop({ required: false, type: Boolean }) breakpointXL: boolean;
  @Prop({ required: true }) botName: string;
  @Prop({ required: true }) botAllocation!: BotWallet;

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
  isEditModalOpen: boolean = false;
  botSnapshotData: BotPerformanceSnapshotDto = null;

  selectedAccountDist: any = null;
  baseAvailable: number = 0.0;
  baseInitialAvailable: number = 0.0;
  percentageValue: number = 100;
  currentPerfee: number = 0;

  backgroundDescription: any = "/img/algo-bots-detailed/description/bot-detailed-description-bg.png";

  /* COMPUTED */
  get daysRunning() {
    const subscription = this.getSubscribedAlgoBotById(this.$route.params.id);
    if (subscription && subscription.createdAt) {
      let subscriptionCreatedDate = subscription.createdAt;
      let formatedData = moment(new Date()).diff(moment(subscriptionCreatedDate), "day");

      return formatedData < 1 ? "-" : `${formatedData} days`;
    } else {
      return null;
    }
  }

  get totalProfit() {
    let toReturn = 0;

    this.getBotSubscriptionCycles.forEach((el: any) => {
      toReturn += el.profitPercentage;
    });

    return toReturn;
  }

  get botPair(): string {
    if (!this.algoBot) {
      return null;
    }
    return this.algoBot.base + this.algoBot.quote;
  }

  get discriptionTagData() {
    if (this.$route.params.id) {
      const baseQuoteCurrency = (this.algoBot.base + this.algoBot.quote).toUpperCase();
      const startType = this.algoBot.stratType.toUpperCase();
      return [baseQuoteCurrency, startType, ...this.filteredDummyTagsData];
    } else {
      return null;
    }
  }

  get filteredDummyTagsData() {
    const exEl = dummyTagsData.find((tag: any) => {
      return tag.botRef === this.algoBot.botRef;
    });

    return exEl.exchangesType.map((el: any) => {
      return el;
    });
  }

  get formatedBotSnapshotData() {
    if (this.botSnapshotData) {
      return {
        month1: this.botSnapshotData.month1,
        month3: this.botSnapshotData.month3,
        month6: this.botSnapshotData.month6,
        month1UC: this.botSnapshotData.month1UC,
        month3UC: this.botSnapshotData.month3,
        month6UC: this.botSnapshotData.month6UC,
      };
    } else {
      return null;
    }
  }

  get botSubscriptionById() {
    if (this.algoBot) {
      return this.botssubscriptions.find((el: any) => {
        return el.botId === this.$route.params.id;
      });
    } else {
      return null;
    }
  }

  get statusName() {
    if (this.status === "active") {
      return "ACTIVE";
    } else if (this.status === "paused") {
      return "PAUSED";
    } else {
      return "INACTIVE";
    }
  }

  get botLogoImage() {
    if (this.algoBot) {
      if (this.algoBot.creator === "I-Robot") {
        return require("@/assets/images/IRobot-logo.jpg");
      } else if (this.algoBot.botRef === "FRAMAV2ETH") {
        return require("@/assets/images/gravity-logo.jpeg");
      } else if (this.algoBot.botRef === "ETHINFINITY") {
        return require("@/assets/images/xpr-logo.png");
      } else if (this.algoBot.creator === "Pure Gold Crypto Signals") {
        return require("@/assets/images/PG-logo-white.png");
      } else if (this.algoBot.creator === "Wave Trader") {
        return require("@/assets/images/wt-logo.png");
      }
    }
    return require("@/assets/images/4c_logo.png");
  }

  get isBotRunning() {
    return this.activeSubscription.botRunning;
  }

  get isTradable() {
    if (!this.getEnablePerfFees || (this.botAllocation && this.botAllocation.amount > this.botAllocation.debtAmount)) {
      return true;
    }
    return false;
  }

  get botDeletingMessage() {
    if (this.getEnablePerfFees) {
      return `Hey it seems that you have an open position on this bot, if you delete it now we will leave it open and ${this.currentPerfee.toFixed(
        4
      )} UBXT will be deducted from your balance to pay for the performance fees so you can manage it manually`;
    }
    return "Hey it seems that you have an open position on this bot, if you delete it now we will leave it open so you can manage it manually";
  }
  get getBotPerfFees() {
    if (!this.algoBot) {
      return 0;
    }
    if (this.algoBot.botRef === "AVAXUSDT1" || this.algoBot.botRef === "TOMOLO1") {
      return 0;
    }
    return this.algoBot.perfFees.percent;
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

  @Watch("getBotsSubcriptions", { immediate: true })
  handleOnChangeBotsSubcriptions(val: any) {
    this.getActiveAccount();
    this.setStatus();
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

      this.fetchAlgoBotsSubscriptionsAction()
        .then(() => {
          const algoBotSubscription = this.getSubscribedAlgoBotById(this.$route.params.id);

          if (algoBotSubscription) {
            this.fetchBotSnapshotData(algoBotSubscription.id);
          } else {
            this.$notify({ text: "You haven't subscribed to the bot yet", type: "warning" });
          }
        })
        .catch(({ response }: AxiosError) => {
          if (response.data.message) {
            this.$notify({ text: response.data.message, type: "error" });
          }
        });

      if (!this.getKeyNamesWithExchange) {
        return;
      }
    }
  }

  setStatus() {
    if (!this.algoBot) {
      return;
    }
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
      const { id, name, img } = this.getKeyNamesWithExchange.filter((key: any) => key.id === this.activeSubscription.apiKeyRef)[0] || {};
      this.activeAccount = { id, name, img };
      this.percentageValue = this.activeSubscription.accountPercent * 100;
    }
  }

  handleBotDeletion() {
    const sub = this.botssubscriptions.find((el: any) => {
      return el.botId === this.algoBot.id;
    });

    const isOpenPosition = sub.botRunning;

    this.$refs.deleteModal.show().then(() => {
      if (isOpenPosition) {
        this.calcCurrentPerformanceFee({ botId: sub.botId, botSubId: sub.id }).then(({ result }: any) => {
          this.currentPerfee = result;
        });

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

  followBot() {
    if (this.algoBot && this.exchange && this.baseAvailable) {
      const payload: Partial<FollowBotRequest> = {
        botId: this.algoBot.id,
        apiKeyRef: this.exchange.id,
        // quantity: this.baseAvailable, // quantity is no longer used since algobot specs changes v2.2 (oct 2020)
        accountPercentage: this.percentageValue / 100,
      };

      this.$refs.activateModal.show().then(() => {
        this.followBotAction(payload)
          .then(() => {
            this.loading = true;
            this.$router.push({ name: "algo-bots", params: { tabtoselect: "ActiveBots" } }); //ActiveBots linked the compomentName (we should have a sub router)
            this.$notify({ text: "Bot successfully activated.", type: "success" });
            this.percentageValue = 100;
          })
          .catch((err) => {
            this.$notify({ text: "Bot activation failed", type: "error" });
          });
      });
    }
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
    this.pauseResumeBotAction({ botId: sub.botId, subId: sub.id }).then(async () => {
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

  fetchBotSnapshotData(subId: string) {
    return this.$http
      .get<BotPerformanceSnapshotDto>(`/api/performance/subscription/${subId}/snapshot/six-months`)
      .then(({ data }) => {
        this.botSnapshotData = data;
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  showAccountPercentEditModal() {
    this.isEditModalOpen = true;
    // get base limit balance
    this.$http.get(`/api/portfolio/trade-balance/${this.activeAccount.id}`).then(({ data }) => {
      this.selectedAccountDist = data;
      this.calcBaseAvailable();
    });
    this.getActiveAccount();
  }

  calcBaseAvailable() {
    // Depend on operation type BUY/SELL find the appropriate currency
    if (this.selectedAccountDist && this.selectedAccountDist.freeBalances) {
      this.baseAvailable = this.selectedAccountDist.freeBalances["USDT"];
    } else {
      this.baseAvailable = 0.0;
    }
    this.baseInitialAvailable = this.baseAvailable;
    this.onUpdatedAccountPercent(null);
  }

  onUpdatedAccountPercent(item: any) {
    this.baseAvailable = (this.baseInitialAvailable * this.percentageValue) / 100.0;
  }

  updateAccountPercent() {
    const payload = {
      subscriptionId: this.activeSubscription.id,
      percentage: this.percentageValue / 100.0,
    };
    this.updateSubscriptionAccountPercent(payload);
    this.isEditModalOpen = false;
  }
}
</script>

<style lang="scss" scoped>
.bot-detailed-active {
  &__description-card-tag {
    width: 110px;
    background: rgba(66, 128, 128, 0.55);
  }

  &__description-perf-card {
    background: rgba(14, 19, 26, 0.28);
  }
}
</style>
