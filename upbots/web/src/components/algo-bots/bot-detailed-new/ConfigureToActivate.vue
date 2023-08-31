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
        <div class="col-span-2">
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
      </div>

      <!-- POSITION SIZE -->
      <div
        :class="breakpointXL ? 'grid-cols-1 row-gap-18 px-10 mb-80' : 'grid-cols-3 md:grid-cols-3 row-gap-20 md:col-gap-20 px-20 mb-18'"
        class="grid"
      >
        <p class="col-span-1 text-iceberg text-sm leading-xs mr-10">Position Size:</p>
        <div class="col-span-2 flex flex-col mb-25">
          <p class="text-grey-cl-920 text-xs leading-xs mb-16">% of your USDT balance that the bot will trade</p>

          <div class="mb-16">
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

          <p class="text-white text-sm leading-md">
            {{
              baseAvailableLimit ? `${algoBot && algoBot.allocatedMaxAmount} ${orderCostCurrency}` : `${baseAvailable} ${orderCostCurrency}`
            }}
          </p>
        </div>
      </div>

      <!-- UBXT Allocations -->
      <div
        :class="breakpointXL ? 'grid-cols-1 row-gap-18 px-10 mb-40' : 'grid-cols-3 md:grid-cols-3 row-gap-20 md:col-gap-20 px-20 mb-18'"
        class="grid"
      >
        <!-- TODO -->
        <template v-if="getEnablePerfFees">
          <div class="col-span-1 flex flex-col">
            <span class="text-iceberg text-sm leading-xs mb-6">UBXT Allocation:</span>
            <span class="text-grey-cl-920 text-xs leading-xs">
              Available: <span class="text-blue-cl-400">{{ getUserWallet.availableAmount }}</span>
            </span>
          </div>

          <div class="col-span-2 flex-grow flex flex-col">
            <div class="relative">
              <AppInput v-model="ubxtToAllocate" type="number" min="0" :max="getUserWallet.availableAmount" size="sm" />

              <div
                class="absolute right-4 underline text-xs text-white cursor-pointer"
                style="right: 10px; top: 9px;"
                @click="ubxtToAllocate = getUserWallet.availableAmount"
              >
                MAX
              </div>
            </div>

            <AppButton size="xs" type="light-green" class="mt-8 ml-auto" :disabled="!allowSubmit" @click="handleUbxtToBot">
              Allocate
            </AppButton>
          </div>
        </template>

        <template v-else>
          <div class="col-span-1 flex flex-col">
            <span class="text-grey-cl-920 text-sm leading-xs mb-6">UBXT Allocation:</span>
            <span class="text-grey-cl-920 text-xs leading-xs">
              Available: <span>{{ getUserWallet.availableAmount }}</span>
            </span>
          </div>

          <div class="col-span-2 flex-grow flex flex-col">
            <div class="flex items-center justify-between w-full bg-san-juan rounded-5 px-10 py-10 mb-10">
              <span class="text-sm leading-xs text-white">N/A</span>
              <span class="text-shakespeare underline text-sm leading-xs cursor-pointer">Max</span>
            </div>

            <AppButton size="xs" type="light-green" class="mt-8 ml-auto" disabled>Allocate</AppButton>
          </div>
        </template>
      </div>
    </div>

    <!-- MESSAGE -->
    <div v-if="costLimitError" class="flex items-center justify-center mb-10" :class="breakpointXL ? 'px-10' : 'px-20'">
      <span class="leading-xs text-red-cl-100">{{ costLimitError }}</span>
    </div>

    <!-- ACTIVATE BUTTON -->
    <div
      v-if="isValidKey && status === 'inactive'"
      :class="breakpointXL ? 'px-10' : 'px-20'"
      class="flex items-center w-auto md:w-full mt-auto"
    >
      <template v-if="!isKeysAvailable">
        <router-link tag="div" :to="{ name: 'keys' }" class="configure__activate-btn md:w-full">
          <AppButton type="light-green" class="w-full">Add an API key</AppButton>
        </router-link>
      </template>

      <template v-else>
        <AppButton type="light-green" class="configure__activate-btn md:w-full" :disabled="!allowSubmit" @click="followBot">
          Activate Now
        </AppButton>

        <p v-if="showFreeStakers" class="text-base text-white italic ml-20">Free for Stakers</p>
      </template>
    </div>

    <!-- ACTIVATE MODAL -->
    <AppConfirmModal ref="activateModal" title="Do you confirm that you want to activate this bot?" confirm-button="Confirm" is-checkbox>
      <div slot="checkbox-label" class="text-sm leading-xs text-iceberg">
        I agree to the UpBots
        <a href="/terms-conditions" target="_blank" class="text-blue-cl-100 cursor-pointer">terms and conditions</a>
      </div>
    </AppConfirmModal>

    <!-- OPTIMUS BTC UBXT ALLOCATION MODAL -->
    <AppModal v-model="isTransUbxtModalOpen" persistent max-width="500px">
      <div class="active-bot__hold-modal relative flex flex-col w-full pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Optimus BTC UBXT Allocation</h2>

          <div class="text-base text-iceberg mb-20 px-30 text-center">
            Select the UBXT amount you want to transfer from your UBXT Balance to the bot
          </div>

          <div class="mb-30 w-full px-20 text-iceber">
            UBXT Amount:
            <span class="text-sm text-iceberg ml-4">
              Total available:
              <span class="text-blue-cl-400">{{ getUserWallet.availableAmount.toFixed(4) }} UBXT</span>
            </span>
            <AppInput v-model="ubxtToAllocate" class="mt-10 text-md" type="number" />
          </div>

          <div class="flex flex-col md:flex-row items-center w-full md:w-auto">
            <AppButton type="light-green" @click="depositUbxtToBot">Transfer</AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { UserWallet, UserTransaction, BotWallet } from "@/store/perfees/types";
import { GroupItems } from "../../../models/interfaces";
import { AlgoBot, AlgoBotSubscription, FollowBotRequest } from "@/store/algo-bots/types/algo-bots.payload";
import { ExchangePairSettings } from "@/store/trade/types";
import { KeyExtended } from "@/store/user/types";
import { ExchangeKey } from "@/store/exchangeKeys/types";
import { namespace, Getter } from "vuex-class";
import debounce from "@/core/debounce";

const algobots = namespace("algobotsModule");
const user = namespace("userModule");
const trade = namespace("tradeModule");
const perfees = namespace("perfeesModule");

import PairSelection from "@/components/manual-trade/pair-selection/PairSelection.vue";

@Component({ name: "ConfigureToActivate", components: { PairSelection } })
export default class ConfigureActivated extends Vue {
  /* VUEX */
  @Getter getEnablePerfFees: boolean;

  @user.State keys!: ExchangeKey[];
  @user.Getter getKeyNamesWithExchange!: KeyExtended[];

  @algobots.State botssubscriptions: any;
  @algobots.State error: any;
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action followBotAction: (payload: Partial<FollowBotRequest>) => Promise<any>;
  @trade.State exchange: any;
  @trade.Getter getAvailablePairs: ExchangePairSettings[];
  @trade.Mutation setExchange: any;

  @perfees.Getter getUserWallet!: UserWallet;
  @perfees.Action fetchUserWallet!: any;
  @perfees.Action transferBotWallet!: any;

  /* PROPS */
  @Prop({ required: false, type: Boolean }) breakpointXL: boolean;

  /* REFS */
  $refs!: {
    activateModal: Vue & {
      show: () => Promise<void>;
    };
  };

  /* DATA */
  configureData: any = null;
  choseAccountData: any[] = [];

  algoBot: AlgoBot | null = null;
  activeAccount: any = {};
  activeSubscription: AlgoBotSubscription;
  status: "active" | "inactive" | "paused" = "inactive";
  isValidKey: boolean = false;
  selectedOperationType: string = "buy";
  selectedAccountDist: any = null;
  baseAvailable: number = 0.0;
  baseAvailableToSend: number = 0.0;
  baseInitialAvailable: number = 0.0;
  percentageValue: number = 100;
  currentPercentage: number = 100;
  currentCurrency: string = "";
  marketPrice: number | null = null;
  allowSubmit: boolean = false;
  costLimitError: string = "";
  selectedPair: ExchangePairSettings;
  orderCostCurrency: string = null;

  ubxtToAllocate: number = 0.0;
  isTransUbxtModalOpen: boolean = false;

  percentageData: GroupItems[] = [
    { value: "25", label: "25%" },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
  ];

  leverageData: GroupItems[] = [
    { value: "x1", label: "x1" },
    { value: "x2", label: "x2" },
    { value: "x5", label: "x5" },
    { value: "x10", label: "x10" },
  ];

  rangeValue: number = 100;

  loading: boolean = false;

  /* COMPUTED */
  get baseAvailableLimit() {
    return this.baseAvailable >= (this.algoBot && this.algoBot.allocatedMaxAmount);
  }

  get botPair(): string {
    if (!this.algoBot) {
      return null;
    }
    return this.algoBot.base + this.algoBot.quote;
  }

  get isKeysAvailable() {
    return !!this.keys.length;
  }

  get showFreeStakers() {
    if (!this.algoBot) return false;
    return ["Community bot TOMO LO1", "Community Bot AVAX"].indexOf(this.algoBot.name) > -1;
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
      const exchangeKey = this.getCompatibleAccounts()[0]; //first key as default
      if (exchangeKey) {
        this.handleAccountSelection(exchangeKey);
      }
    }

    await this.fetchUserWallet();
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
      return this.getKeyNamesWithExchange.filter((x) => x.tradingAllowed);
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
    this.status = "inactive";
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
      this.costLimitError = "pair not available for trading";
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

  handleBaseAvailable(val: string) {
    this.baseAvailable = Number(val);
    this.percentageValue = Number(((Number(val) * 100) / this.baseInitialAvailable).toFixed(0));
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
            // this.isTransUbxtModalOpen = true;
            // this.handleUbxtToBot();

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

  handleUbxtToBot() {
    const paload = {
      botId: this.algoBot.id,
      amount: this.ubxtToAllocate,
    };
    this.transferBotWallet(paload)
      .then(() => {
        this.$notify({ text: "UBXT successfully allocated to bot.", type: "success" });
      })
      .catch(() => {
        this.$notify({ text: "UBXT allocation failed", type: "error" });
      });
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

    this.$http
      .get(
        `/api/trade/format-validity/${this.exchange.exchange}?symbol=${this.selectedPair.symbol}&quantity=${quantity}&price=${this.marketPrice}`
      )
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
