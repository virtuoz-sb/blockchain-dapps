<template>
  <div v-loading="loading">
    <div class="flex flex-col mb-20 overflow-y-auto custom-scrollbar">
      <!-- ALGO BOT NAME -->
      <div class="flex items-center" :class="breakpointXL ? 'px-10 mb-25' : 'px-20 mb-15'">
        <p class="text-iceberg text-sm leading-xs mr-10">Algo:</p>
        <p class="text-white text-sm leading-xs">{{ botName }}</p>
      </div>

      <!-- PAIR -->
      <div class="flex items-center" :class="breakpointXL ? 'px-10 mb-25' : 'px-20 mb-15'">
        <p class="text-iceberg text-sm leading-xs mr-10">Pair:</p>
        <p class="text-white text-sm leading-xs">{{ botPair }}</p>
      </div>

      <!-- MAX AMOUNT -->
      <div class="flex items-center" :class="breakpointXL ? 'px-10 mb-25' : 'px-20 mb-15'">
        <p class="text-iceberg text-sm leading-xs mr-10">Max Amount:</p>
        <p class="text-white text-sm leading-xs">{{ algoBot && algoBot.allocatedMaxAmount }} {{ orderCostCurrency }}</p>
      </div>

      <!-- SELECT ACCOUNT DROPDOWN -->
      <div v-if="status === 'inactive'" :class="breakpointXL ? 'flex-col px-10 mb-25' : 'px-20 mb-15'" class="flex items-start w-full">
        <p class="text-iceberg text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">Select Account:</p>
        <AppDropdownBasic
          :value="exchange"
          :options="getCompatibleAccounts()"
          key-value="id"
          key-label="name"
          disabled-key-name="exchange"
          size="sm"
          dark
          truncate
          @change="handleAccountSelection"
        />
      </div>

      <!-- ACCOUNT -->
      <div v-if="status !== 'inactive'" :class="breakpointXL ? 'flex-row px-10 mb-25' : 'px-20 mb-15'" class="flex items-start w-full">
        <p class="text-iceberg text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">Account:</p>
        <p class="text-white text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">{{ activeAccount.name }}</p>
        <img v-if="activeAccount && activeAccount.img" class="w-14 max-w-14" :src="activeAccount.img" />
      </div>

      <!-- STATUS -->
      <div :class="breakpointXL ? 'flex-row px-10 mb-25' : 'px-20 mb-15'" class="flex items-start w-full">
        <p class="text-iceberg text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">Status:</p>
        <p v-if="status === 'active'" class="text-green-cl-100 text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">ACTIVE</p>
        <p v-else-if="status === 'paused'" class="text-red-cl-100 text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">PAUSED</p>
        <p v-else class="text-red-cl-100 text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">INACTIVE</p>
      </div>

      <!-- POSITION SIZE RANGE (STATUS INACTIVE) -->
      <div v-if="status === 'inactive'" class="flex flex-col" :class="breakpointXL ? 'px-10 mb-10' : 'px-20 mb-20'">
        <div class="flex flex-col mb-25">
          <span class="text-iceberg text-sm leading-xs mb-6">Position Size:</span>
          <span class="text-grey-cl-920 text-xs leading-xs">% of USDT available on account</span>
        </div>

        <AppRangeSlider
          :options="{ min: 0, max: 100 }"
          v-model.number="percentageValue"
          labels="%"
          tooltip="active"
          :formatter="`${percentageValue}%`"
          @dragging="setAllocatedCapitalPercentage"
          @change="setAllocatedCapitalPercentage"
        />
      </div>

      <!-- POSITION SIZE (STATUS !INACTIVE) -->
      <div v-if="status !== 'inactive'" :class="breakpointXL ? 'flex-row px-10 mb-25' : 'px-20 mb-15'" class="flex items-start w-full">
        <p class="text-iceberg text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">Position Size:</p>
        <p class="text-white text-sm leading-xs mr-10" :class="breakpointXL && 'mb-8'">
          {{ activeSubscription.accountPercent * 100 + "%" }}
        </p>
      </div>

      <!-- THEORICAL INITIAL ORDER -->
      <div
        v-if="status === 'inactive'"
        class="flex"
        :class="breakpointXL ? 'flex-col mb-25 px-10' : 'items-center justify-between mb-20 px-20'"
      >
        <p class="flex" :class="breakpointXL ? 'flex-col mb-15' : 'items-center'">
          <span class="text-iceberg text-sm leading-md" :class="breakpointXL && 'mb-8'">Theorical initial order:</span>
          <span class="text-white text-sm leading-md" :class="!breakpointXL && 'ml-8'">
            {{
              baseAvailableLimit ? `${algoBot && algoBot.allocatedMaxAmount} ${orderCostCurrency}` : `${baseAvailable} ${orderCostCurrency}`
            }}
          </span>
        </p>

        <p v-if="baseAvailableLimit" class="text-sm leading-xs text-red-cl-100" :class="!breakpointXL && 'text-right'">
          Limited to {{ algoBot.allocatedMaxAmount }} {{ orderCostCurrency }}
        </p>
      </div>

      <!-- PAIR SELECTION -->
      <!-- <PairSelection v-model="selectedPair" class="flex flex-col mb-10" disabled /> -->

      <!-- DAYS RUNNING -->
      <div v-if="daysRunning" class="flex items-center" :class="breakpointXL ? 'px-10 mb-25' : 'px-20 mb-15'">
        <p class="text-iceberg text-sm leading-xs mr-10">Days running:</p>
        <p class="text-white text-sm leading-xs">{{ daysRunning }}</p>
      </div>

      <!-- CURRENT POSITION -->
      <div
        v-if="(botSubscriptionById && botSubscriptionById.stratType) || (botSubscriptionById && botSubscriptionById.botRunning)"
        class="flex items-center"
        :class="breakpointXL ? 'px-10 mb-25' : 'px-20 mb-15'"
      >
        <p class="text-iceberg text-sm leading-xs mr-10">Current position:</p>
        <p class="text-white text-sm leading-xs">
          {{ botSubscriptionById && botSubscriptionById.stratType }},
          {{ botSubscriptionById && botSubscriptionById.botRunning ? "Open" : "Close" }}
        </p>
      </div>

      <!-- NUMBER OF TRADE -->
      <div
        v-if="botSubscriptionById && botSubscriptionById.cycleSequence"
        class="flex items-center"
        :class="breakpointXL ? 'px-10 mb-25' : 'px-20 mb-15'"
      >
        <p class="text-iceberg text-sm leading-xs mr-10">Number of trades:</p>
        <p class="text-white text-sm leading-xs">
          {{ botSubscriptionById && botSubscriptionById.cycleSequence }}
        </p>
      </div>

      <!-- TOTAL PROFIT -->
      <div v-if="totalProfit" class="flex items-center" :class="breakpointXL ? 'px-10 mb-25' : 'px-20 mb-15'">
        <p class="text-iceberg text-sm leading-xs mr-10">Total profit:</p>
        <AppPercentageSpan class="text-sm leading-xs" :data="totalProfit" />
      </div>
    </div>

    <!--
    <div :class="breakpointXL ? 'mb-25' : 'mb-20 md:mb-34'" class="flex flex-col w-full">
      <p :class="breakpointXL ? 'px-10' : 'px-20'" class="w-full text-iceberg text-sm leading-xs mb-8">Leverage</p>
      <AppItemsGroup v-model="configureData.leverage" :items="leverageData" />
    </div>
    <div :class="breakpointXL ? 'flex-col px-10 mb-25' : 'items-center px-20 mb-20 md:mb-28'" class="flex">
      <p :class="breakpointXL ? 'mb-8' : 'mr-16'" class="text-iceberg text-sm leading-xs">Strategy:</p>
      <div class="flex items-center">
        <AppRadio v-model="configureData.radioSelected" label="By Default" class="mr-20" />
        <AppRadio v-model="configureData.radioSelected" label="Custom" input-value="custom" />
      </div>
    </div>

    <div
      :class="breakpointXL ? 'grid-cols-1 row-gap-18 px-10 mb-40' : 'grid-cols-1 md:grid-cols-2 row-gap-20 md:col-gap-20 px-20 mb-18'"
      class="grid"
    >
      <div class="flex flex-col">
        <p class="text-iceberg text-sm leading-xs mb-8">Stop Loss</p>
        <AppInput v-model="configureData.stopLoss" type="text" size="sm" />
      </div>
      <div class="flex flex-col">
        <p class="text-iceberg text-sm leading-xs mb-8">Take Profit</p>
        <AppInput v-model="configureData.takeProfit" type="text" size="sm" />
      </div>
    </div>
    -->

    <!-- ERROR MESSAGE -->
    <div v-if="costLimitError" class="flex items-center justify-center mb-10" :class="breakpointXL ? 'px-10' : 'px-20'">
      <span class="leading-xs text-red-cl-100">{{ costLimitError }}</span>
    </div>

    <!-- ACTIONS BUTTON -->
    <div :class="breakpointXL ? 'flex-col px-10' : 'px-20'" class="flex justify-between w-auto md:w-full mt-auto">
      <template v-if="isValidKey && status === 'inactive'">
        <AppButton type="light-green" class="configure__activate-btn md:w-full" :disabled="!allowSubmit" @click="followBot">
          Activate
        </AppButton>
      </template>

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

    <!-- DELETE CONFIRM MODAL -->
    <AppConfirmModal
      ref="confirmDeleteOpenPosition"
      title="Are you sure?"
      subtitle="Hey it seems that you have an open position on this bot, if you delete it now we will leave it open so you can manage it manually"
      confirm-button="Ok"
    />

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
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import {
  AlgoBot,
  AlgoBotSubscription,
  BotPerformanceCycleDto,
  BotPerformanceSnapshotDto,
  FollowBotRequest,
  SubscriptionBotPause,
} from "@/store/algo-bots/types/algo-bots.payload";
import { AxiosError } from "axios";
import { ExchangePairSettings } from "@/store/trade/types";
import { KeyExtended } from "@/store/user/types";
import { namespace } from "vuex-class";
import debounce from "@/core/debounce";
import moment from "moment";

const user = namespace("userModule");
const algobots = namespace("algobotsModule");
const trade = namespace("tradeModule");

import PairSelection from "@/components/manual-trade/pair-selection/PairSelection.vue";

@Component({ name: "Configure", components: { PairSelection } })
export default class Configure extends Vue {
  /* VUEX */
  @user.Getter getKeyNamesWithExchange!: KeyExtended[];

  @algobots.State botssubscriptions: any;
  @algobots.State error: any;
  @algobots.Getter getAlgoBotById: any;
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Getter getBotSubscriptionCycles: BotPerformanceCycleDto[];
  @algobots.Getter getSubscribedAlgoBotById: any;
  @algobots.Mutation setSelectedBotSubId: any;
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action followBotAction: (payload: Partial<FollowBotRequest>) => Promise<any>;
  @algobots.Action deleteSubscriptionActionAsync: (payload: { id: string }) => Promise<void>;
  @algobots.Action pauseResumeBotAction: (sub: Partial<SubscriptionBotPause>) => Promise<any>;
  @algobots.Action fetchBotSubscriptionSnapshotCyclesAction!: any;
  // @algobots.Getter getFollowedBotById: any;
  // @algobots.Getter getAlgoBots: AlgoBot[];

  @trade.State exchange: any;
  @trade.Getter getAvailablePairs: ExchangePairSettings[];
  @trade.Mutation setExchange: any;
  // @trade.Mutation selectPair: any;
  // @trade.State selectedCurrencyPair: ExchangePairSettings;

  /* PROPS */
  @Prop({ required: false, type: Boolean }) breakpointXL: boolean;
  @Prop({ required: true }) botName: string;
  @Prop({ required: false }) botCycleData: BotPerformanceCycleDto[];
  @Prop({ required: false }) botSnapshotData: BotPerformanceSnapshotDto;

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
  configureData: any = null;

  algoBot: AlgoBot | null = null;
  activeAccount: any = {};
  activeSubscription: AlgoBotSubscription;
  status: "active" | "inactive" | "paused" = "inactive";
  isValidKey: boolean = false;
  selectedOperationType: string = "buy";
  selectedAccountDist: any = null;
  baseAvailable: number = 0.0;
  baseInitialAvailable: number = 0.0;
  percentageValue: number = 100;
  currentPercentage: number = 100;
  marketPrice: number | null = null;
  allowSubmit: boolean = false;
  costLimitError: string = "";
  selectedPair: ExchangePairSettings;
  orderCostCurrency: string = null;

  loading: boolean = false;
  isHoldModalOpen: boolean = false;
  isActiveModalOpen: boolean = false;

  // leverageData: GroupItems[] = [
  //   { value: "x1", label: "x1" },
  //   { value: "x2", label: "x2" },
  //   { value: "x5", label: "x5" },
  //   { value: "x10", label: "x10" },
  // ];

  /* COMPUTED */
  get totalProfit() {
    let toReturn = 0;

    this.getBotSubscriptionCycles.map((el: any) => {
      return (toReturn += el.profitPercentage);
    });

    return toReturn;
  }

  get baseAvailableLimit() {
    return this.baseAvailable >= (this.algoBot && this.algoBot.allocatedMaxAmount);
  }

  get botPair(): string {
    if (!this.algoBot) {
      return null;
    }
    return this.algoBot.base + this.algoBot.quote;
  }

  get botSubscriptionById() {
    if (this.algoBot && this.algoBot.id) {
      return this.botssubscriptions.find((el: any) => {
        return el.botId === this.algoBot.id;
      });
    } else {
      return null;
    }
  }

  get daysRunning() {
    if (this.botSubscriptionById && this.botSubscriptionById.createdAt) {
      let subscriptionCreatedDate = this.botSubscriptionById && this.botSubscriptionById.createdAt;
      let formatedData = moment(new Date()).diff(moment(subscriptionCreatedDate), "day");

      return formatedData < 1 ? "-" : `${formatedData} days`;
    } else {
      return null;
    }
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

  @Watch("botName", { immediate: true })
  handleBotName(val: any) {
    if (val) {
      const exchangeKey = this.getCompatibleAccounts()[0]; //first key as default
      if (exchangeKey) {
        this.handleAccountSelection(exchangeKey);
      }
    }
  }

  /* HOOKS */
  mounted() {
    this.init();
  }

  /* METHODS */
  async init() {
    this.fetchBotData();

    await this.fetchAlgoBotsAction();

    if (this.$route.params.id) {
      this.algoBot = this.getAlgoBotById(this.$route.params.id);
      this.setStatus();
      this.getActiveAccount();
      if (!this.getKeyNamesWithExchange) {
        return;
      }
      const exchangeKey = this.getCompatibleAccounts()[0]; //first key as default
      if (exchangeKey) {
        this.handleAccountSelection(exchangeKey);
      }
    }
  }

  computeOrderCostCurrency() {
    if (!this.selectedPair) {
      this.orderCostCurrency = null;
      return;
    }
    if (this.selectedPair.inverse && this.selectedPair.perpetualContract) {
      this.orderCostCurrency = this.selectedPair.baseCurrency;
      return;
    }
    this.orderCostCurrency = this.selectedOperationType === "buy" ? this.selectedPair.quoteCurrency : this.selectedPair.baseCurrency;
    return;
  }

  getCompatibleAccounts(): KeyExtended[] {
    if (this.algoBot) {
      //bot does not determine the exchange (the exchange key does)
      return this.getKeyNamesWithExchange.filter((x) => {
        if (this.botName == "Community Bot AVAX") {
          // return only binance keys for "Community Bot AVAX" bot
          return x.exchange === "binance";
        } else {
          return x.tradingAllowed;
        }
      });
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

  handleAccountSelection(item: KeyExtended) {
    this.setExchange(item);
    //setExchange implicitly changes the getAvailablePairs returned value
    this.selectedPair = this.getAvailablePairs.find((p) => p.baseCurrency === this.algoBot.base && p.quoteCurrency === this.algoBot.quote);
    this.computeOrderCostCurrency();
    if (!this.selectedPair) {
      // this.costLimitError = "pair not available for trading"; // TODO
      this.allowSubmit = false;
      return; // avoid cost calculation when selected pair is null
    }
    this.getBaseAvailable();
    this.percentageValue = 100; //reset to 100% by default
  }

  getBaseAvailable() {
    this.$http.get(`/api/portfolio/trade-balance/${this.exchange.id}`).then(({ data }) => {
      this.selectedAccountDist = data;
      this.calcBaseAvailable();
      if (this.status === "inactive") {
        this.validateTradeCost();
      }
    });
  }

  calcBaseAvailable() {
    // Depend on operation type BUY/SELL find the appropriate currency
    let currency = this.selectedOperationType === "buy" ? this.selectedPair.quoteCurrency : this.selectedPair.baseCurrency;

    if (this.selectedPair.perpetualContract && this.selectedPair.inverse) {
      currency = "BTC"; // order cost is always XBT (display) for bitmex, but is actually = to BTC in the balance received from the API (because it is BTC)
    }
    // check if distribution with this currency exist
    if (this.selectedAccountDist && this.selectedAccountDist.freeBalances) {
      const notExist = Object.keys(this.selectedAccountDist.freeBalances).length === 0;
      if (notExist) {
        this.baseAvailable = 0.0;
      } else {
        if (currency in this.selectedAccountDist.freeBalances) {
          this.baseAvailable = this.selectedAccountDist.freeBalances[currency];
        } else {
          this.baseAvailable = 0.0;
        }
      }

      this.baseInitialAvailable = this.baseAvailable;
    }
  }

  setAllocatedCapitalPercentage(item: any) {
    const baseAvailable = ((this.baseInitialAvailable / 100) * Number(item)).toFixed(0);
    this.baseAvailable = Number(baseAvailable);
    // this.currentPercentage = item;
    if (this.status === "inactive") {
      this.validateTradeCost();
    }
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

  fetchCurrentPrice() {
    return this.$http
      .get(`/api/cryptoPrice/${this.exchange.exchange}/${this.selectedPair.baseCurrency}/${this.selectedPair.quoteCurrency}`)
      .then(({ data }) => {
        this.marketPrice = (data.Latest && data.Latest.close) || null;
      });
  }

  @debounce(400)
  async validateTradeCost() {
    this.loading = true;

    await this.fetchCurrentPrice();

    const quantity = this.baseAvailable / this.marketPrice;
    const currencyPair: any = this.selectedPair;
    let pairSymbol = currencyPair.symbol;

    this.$http
      .get(`/api/trade/format-validity/${this.exchange.exchange}?symbol=${pairSymbol}&quantity=${quantity}&price=${this.marketPrice}`)
      .then(({ data: { checkList, comments } }) => {
        if (checkList && checkList.costLimit === false) {
          this.allowSubmit = false;
          this.costLimitError = comments;
          return;
        }

        this.costLimitError = "";
        this.allowSubmit = true;
      })
      .finally(() => {
        this.loading = false;
      });
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
        });
      } else {
        this.deleteBot(sub.id);
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

  fetchBotData() {
    this.fetchAlgoBotsSubscriptionsAction()
      .then(async () => {
        const algoBotSubscription = this.getSubscribedAlgoBotById(this.$route.params.id);
        this.setSelectedBotSubId(algoBotSubscription.id);
        if (algoBotSubscription) {
          this.fetchBotSubscriptionSnapshotCyclesAction();
        }
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
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
</style>
