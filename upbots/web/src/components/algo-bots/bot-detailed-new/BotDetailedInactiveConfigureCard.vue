<template>
  <div
    class="flex flex-col flex-grow flex-shrink-0 xl:flex-shrink w-full relative bg-ore-blish-black rounded-10 px-20 lg:px-30 pt-40 pb-20"
  >
    <div
      class="configure-cards__grid grid grid-cols-1 col-gap-60 flex-grow flex-shrink-0"
      :class="(!$breakpoint.smAndDown && 'grid-cols-3') || ($breakpoint.smAndDown && 'space-y-60')"
    >
      <!-- STEP 1 -->
      <div
        class="perf-fee-card__item perf-fee-card__item--first flex flex-col flex-grow relative"
        :style="`background: url(${backgroundStep1}) no-repeat center center / contain`"
      >
        <h3 class="text-bachelor-button text-xl1 leading-xs font-bold mb-20">STEP 1</h3>
        <h4 class="text-white text-xl1 leading-xs mb-10">Select Account:</h4>
        <p class="text-base text-white leading-xs italic mb-26">Select the API key that the bot will use to trade</p>
        <div class="bg-san-juan rounded-5 px-10 py-4">
          <AppDropdownBasic
            :value="exchange"
            :options="getCompatibleAccounts()"
            key-value="id"
            key-label="name"
            disabled-key-name="exchange"
            size="sm"
            dark
            truncate
            dropdown-content-tag="custom-scroll"
            class="select-account-dropdown"
            @change="handleAccountSelection"
          />
        </div>
      </div>

      <!-- STEP 2 -->
      <div
        class="perf-fee-card__item perf-fee-card__item--second flex flex-col flex-grow relative"
        :style="`background: url(${backgroundStep2}) no-repeat center center / contain`"
      >
        <h3 class="text-bachelor-button text-xl1 leading-xs font-bold mb-20">STEP 2</h3>
        <h4 class="text-white text-xl1 leading-xs mb-10">Position size:</h4>
        <p class="text-base leading-xs text-white italic mb-20">% of your USDT balance that the bot will trade</p>
        <AppRangeSlider
          :options="{ min: 0, max: 100 }"
          v-model.number="percentageValue"
          labels="%"
          tooltip="active"
          :formatter="`${percentageValue}%`"
          @dragging="setAllocatedCapitalPercentage"
          @change="setAllocatedCapitalPercentage"
        />

        <div class="flex items-center mt-20">
          <span class="text-base text-white mr-20">Initial cap:</span>
          <span class="text-base text-white px-10 py-6 bg-abyssal-anchorfish-blue">
            {{
              baseAvailableLimit
                ? `${Math.trunc(algoBot && algoBot.allocatedMaxAmount)} ${orderCostCurrency}`
                : `${Math.trunc(baseAvailable)} ${orderCostCurrency}`
            }}
          </span>
        </div>

        <div v-if="costLimitError" class="flex mt-10">
          <span class="leading-xs text-sm text-red-cl-100">{{ costLimitError }}</span>
        </div>
      </div>

      <!-- STEP 3 -->
      <div class="flex flex-col flex-grow relative" :style="`background: url(${backgroundStep3}) no-repeat center center / contain`">
        <h3 class="text-xl1 leading-xs font-bold mb-20" :class="isPerfeesEnable ? 'text-bachelor-button' : 'text-grey-cl-920'">
          STEP 3 <span v-if="!isPerfeesEnable">(Coming soon)</span>
        </h3>
        <h4 class="text-xl1 leading-xs mb-10" :class="isPerfeesEnable ? 'text-white' : 'text-grey-cl-920'">UBXT Allocation:</h4>
        <div class="flex justify-between">
          <p class="flex items-center text-base italic mb-30" :class="isPerfeesEnable ? 'text-white' : 'text-grey-cl-920'">
            <span class="mr-2">Minimum:</span>
            <span>{{ getMiniumUbxtToDeposit().toFixed(0) }}</span>
          </p>
          <p class="flex items-center text-base italic mb-30" :class="isPerfeesEnable ? 'text-white' : 'text-grey-cl-920'">
            <span class="mr-2">Available:</span>
            <span>{{ getAvailableUbxtToDeposit().toFixed(0) }}</span>
          </p>
        </div>

        <div class="flex flex-col items-end">
          <template v-if="isPerfeesEnable">
            <AppInput
              v-model="ubxtToAllocate"
              type="number"
              :min="getMiniumUbxtToDeposit()"
              :max="getAvailableUbxtToDeposit()"
              size="sm"
              class="deposit-modal__input w-full mb-10"
            >
              <div class="flex items-center justify-center absolute right-0 px-10 h-full cursor-pointer">
                <span class="text-shakespeare underline text-sm" @click="ubxtToAllocate = getAvailableUbxtToDeposit()">Max</span>
              </div>
            </AppInput>
            <div class="flex mt-10 mb-0 ml-auto tooltip-box">
              <AppCheckbox v-model="autoRefill"><span class="text-md">Automatic Refill</span></AppCheckbox>
              <div class="tooltip">
                <span class="triangle"></span>
                I agree that the UBXT of my main balance will be automatically used in case of insufficient funds on my active bots
              </div>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center justify-between w-full bg-san-juan rounded-5 px-10 py-10 mb-10">
              <span class="text-sm leading-xs text-white">N/A</span>
              <span class="text-shakespeare underline text-sm leading-xs cursor-pointer">Max</span>
            </div>

            <AppButton size="xs" type="light-green" disabled>Allocate</AppButton>
          </template>
        </div>
      </div>
    </div>

    <!-- ACTIVATE BTN -->
    <div v-if="isValidKey && status === 'inactive'" class="flex items-center justify-center flex-shrink-0 w-full mx-auto mt-15">
      <template v-if="!isKeysAvailable">
        <router-link tag="div" :to="{ name: 'keys' }" class="bot-detailed-inactive__activate-btn w-full">
          <AppButton type="light-green" size="sm" class="w-full">Add an API key</AppButton>
        </router-link>
      </template>

      <template v-else>
        <AppButton
          type="light-green"
          size="sm"
          class="bot-detailed-inactive__activate-btn w-full mr-20"
          :disabled="!allowSubmit"
          @click="followBot"
        >
          Activate Now
        </AppButton>

        <p v-if="showFreeStakers" class="text-sm text-white italic">Free for Stakers</p>
      </template>
    </div>

    <ComingSoonOverlay v-if="!canAccessToBot" class="top-0 left-0 rounded-10 z-100" />

    <!-- ACTIVATE MODAL -->
    <AppConfirmModal ref="activateModal" title="Do you confirm that you want to activate this bot?" confirm-button="Confirm" is-checkbox>
      <div slot="checkbox-label" class="text-sm leading-xs text-iceberg">
        I agree to the UpBots
        <a href="/terms-conditions" target="_blank" class="text-blue-cl-100 cursor-pointer">terms and conditions</a>
      </div>
    </AppConfirmModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { UserWallet, UserTransaction, BotWallet } from "@/store/perfees/types";
import { AlgoBot, AlgoBotSubscription, FollowBotRequest } from "@/store/algo-bots/types/algo-bots.payload";
import { ExchangePairSettings } from "@/store/trade/types";
import { KeyExtended } from "@/store/user/types";
import { ExchangeKey } from "@/store/exchangeKeys/types";
import { namespace, Getter } from "vuex-class";
import debounce from "@/core/debounce";

const user = namespace("userModule");
const staking = namespace("stakingModule");
const algobots = namespace("algobotsModule");
const trade = namespace("tradeModule");
const perfees = namespace("perfeesModule");
const cryptoModule = namespace("cryptoPrice");

import { CryptoPriceData, CryptoItem } from "@/store/cryptoPrice/types";
import ComingSoonOverlay from "@/components/algo-bots/bot-detailed-new/ComingSoon.vue";

@Component({ name: "BotDetailedInactiveConfigureCard", components: { ComingSoonOverlay } })
export default class BotDetailedInactiveConfigureCard extends Vue {
  /* VUEX */
  @user.State keys!: ExchangeKey[];
  @Getter isBetaServer: boolean;
  @Getter getEnablePerfFees: boolean;

  @user.Getter getKeyNamesWithExchange!: KeyExtended[];
  @user.Getter hasCouponsWithCorrectPromo: boolean;

  @staking.Getter getStakingAmountSuccess: any;
  @staking.Action fetchStakingAmount: any;

  @algobots.State error: any;
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action followBotAction: (payload: Partial<FollowBotRequest>) => Promise<any>;

  @trade.State exchange: any;
  @trade.Getter getAvailablePairs: ExchangePairSettings[];
  @trade.Mutation setExchange: any;

  @perfees.Getter getBotWallets: BotWallet[];
  @perfees.Getter getBotWalletById!: any;
  @perfees.Getter getUserWallet!: UserWallet;
  @perfees.Action fetchUserWallet!: any;
  @perfees.Action transferBotWallet!: any;
  @perfees.Action autoRefillBotWallet!: any;

  @cryptoModule.Action fetchCryptoPriceCoinGecko: any;
  @cryptoModule.Getter getPriceData!: { [pair: string]: CryptoPriceData };

  /* REFS */
  $refs!: {
    activateModal: Vue & {
      show: () => Promise<void>;
    };
  };

  /* DATA */
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
  ubxtToAllocate: number = 0.0;
  ubxtToDeposit: number = 0.0;
  autoRefill: boolean = false;

  backgroundStep1: any = "/img/algo-bots-detailed/configure/configure-step-1.png";
  backgroundStep2: any = "/img/algo-bots-detailed/configure/configure-step-2.png";
  backgroundStep3: any = "/img/algo-bots-detailed/configure/configure-step-3.png";

  /* WATCHERS */
  @Watch("baseAvailableLimit", { immediate: true })
  @Watch("baseAvailable", { immediate: true })
  baseValue() {
    const currentBaseLimit = this.baseAvailableLimit
      ? Math.trunc(this.algoBot && this.algoBot.allocatedMaxAmount)
      : Math.trunc(this.baseAvailable);
    this.$emit("onBaseValueChange", currentBaseLimit);
  }

  /* COMPUTED */
  get baseAvailableLimit() {
    return this.baseAvailable >= (this.algoBot && this.algoBot.allocatedMaxAmount);
  }

  get isKeysAvailable() {
    return !!this.keys.length;
  }

  get isCommunityBot() {
    if (this.algoBot && (this.algoBot.botRef === "AVAXUSDT1" || this.algoBot.botRef === "TOMOLO1")) {
      return true;
    }
    return false;
  }

  get isPerfeesEnable() {
    return this.getEnablePerfFees && !this.isCommunityBot;
  }

  get canAccessToBot() {
    if (this.isCommunityBot) {
      return this.hasCouponsWithCorrectPromo || this.getStakingAmountSuccess;
    } else {
      return true;
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

  /* COMPUTED */
  get showFreeStakers() {
    if (!this.algoBot) return false;
    return ["Community bot TOMO LO1", "Community Bot AVAX"].indexOf(this.algoBot.name) > -1;
  }

  /* HOOKS */
  mounted() {
    this.init();
    this.fetchStakingAmount();
    this.fetchCurrentUbxtPrice();
    this.fetchBotWallet();
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

    this.fetchUserWallet();
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
      // RETURN ONLY BINANCE KEYS FOR "AVAX" BOT
      if (this.algoBot.base === "AVAX") {
        let exchangesToReturn: any = [];
        this.getKeyNamesWithExchange.forEach((el: any) => {
          if (el.exchange === "binance" || el.exchange === "binance-us" || el.exchange === "kucoin") {
            exchangesToReturn.push(el);
          }
        });
        return exchangesToReturn;
      } else {
        //bot does not determine the exchange (the exchange key does)
        let accounts = this.getKeyNamesWithExchange.filter((x) => x.tradingAllowed);
        if (this.algoBot.base === "FTT") {
          accounts = accounts.filter((x) => x.exchange != "kucoin");
        }
        if (this.algoBot.base === "BAT" || this.algoBot.base === "ETC") {
          accounts = accounts.filter((x) => x.exchange != "ftx");
        }
        return accounts;
      }
    }
  }

  setStatus() {
    const activeBots = this.getBotsSubcriptions.filter((sub) => sub.enabled).map((sub) => sub.botId);
    const pausedBots = this.getBotsSubcriptions.filter((sub) => !sub.enabled).map((sub) => sub.botId);
    const botId = this.$route.params.id;
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
      this.activeSubscription = this.getBotsSubcriptions.filter((sub) => sub.botId === this.$route.params.id)[0];
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
          if (this.baseAvailable === undefined) {
            this.baseAvailable = 0;
          }
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
        botId: this.$route.params.id,
        apiKeyRef: this.exchange.id,
        // quantity: this.baseAvailable, // quantity is no longer used since algobot specs changes v2.2 (oct 2020)
        accountPercentage: this.percentageValue / 100,
      };

      if (this.allocateUbxtToDeposit() || !this.isPerfeesEnable) {
        this.$refs.activateModal.show().then(() => {
          this.followBotAction(payload)
            .then(() => {
              this.depositUbxt().then(() => {
                this.$router.push({ name: "algo-bots", params: { tabtoselect: "ActiveBots" } }); //ActiveBots linked the compomentName (we should have a sub router)
                this.$notify({ text: "Bot successfully activated.", type: "success" });
                this.percentageValue = 100;
              });
            })
            .catch((err) => {
              this.$notify({ text: "Bot activation failed", type: "error" });
            });
        });
      } else {
        this.$notify({ text: "Not enough ubxt.", type: "warning" });
      }
    }
  }

  allocateUbxtToDeposit() {
    if (this.ubxtToAllocate >= this.getMiniumUbxtToDeposit() && this.ubxtToAllocate <= this.getAvailableUbxtToDeposit()) {
      this.ubxtToDeposit = Math.min(this.ubxtToAllocate, this.getUserWallet.availableAmount);
      return true;
    } else {
      this.ubxtToDeposit = 0;
      return false;
    }
  }

  async depositUbxt() {
    const paload = {
      botId: this.$route.params.id,
      amount: Number(this.ubxtToDeposit),
    };
    return new Promise((resolve, reject) => {
      this.transferBotWallet(paload)
        .then(() => {
          this.onAutoRefill();
          this.$notify({ text: "UBXT successfully allocated to bot.", type: "success" });
          resolve(true);
        })
        .catch(() => {
          this.$notify({ text: "UBXT allocation failed", type: "error" });
          resolve(false);
        });
    });
  }

  onAutoRefill() {
    const paload = {
      botId: this.$route.params.id,
      autoRefill: this.autoRefill,
    };

    this.autoRefillBotWallet(paload);
  }

  getAvailableUbxtToDeposit() {
    if (!this.getUserWallet) {
      return 0;
    }
    const botId = this.$route.params.id;
    const botWallet = this.getBotWallets.find((botWallet: BotWallet) => botWallet.botId === botId);
    let botCreditAmount = 0;
    if (botWallet) {
      botCreditAmount = botWallet.creditAmount;
    }
    return this.getUserWallet.availableAmount + botCreditAmount;
  }

  getMiniumUbxtToDeposit() {
    const ubxtPrice = this.getCurrentUbxtPrice();
    if (ubxtPrice === 0) {
      return 0;
    } else {
      const minUbxt = (this.baseAvailable / ubxtPrice) * 0.01;
      return minUbxt;
    }
  }

  getCurrentUbxtPrice() {
    const pairData = this.getPriceData["upbots/usd"];
    if (pairData) {
      const latestPrice = pairData.prices[pairData.prices.length - 1][1];
      return latestPrice;
    }
    return 0;
  }
  fetchCurrentUbxtPrice() {
    this.fetchCryptoPriceCoinGecko({
      cryptoSymbol: "upbots",
      fiatSymbol: "usd",
    });
  }

  fetchCurrentPrice() {
    return this.$http
      .get(`/api/cryptoPrice/${this.exchange.exchange}/${this.selectedPair.baseCurrency}/${this.selectedPair.quoteCurrency}`)
      .then(({ data }) => {
        this.marketPrice = (data.Latest && data.Latest.close) || null;
      });
  }

  async fetchBotWallet() {
    const botWallet = this.getBotWalletById(this.$route.params.id);
    if (botWallet) {
      this.autoRefill = botWallet.autoRefill;
    }
  }

  @debounce(400)
  async validateTradeCost() {
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
      .finally(() => {});
  }
}
</script>

<style lang="scss" scoped>
.bot-detailed-inactive {
  &__activate-btn {
    max-width: 220px;
  }
}

.active-bot {
  &__hold-modal-desc {
    max-width: 330px;
  }
  &__hold-modal-btn {
    min-width: 100px;
  }
}

::v-deep .select-account-dropdown {
  &.dropdown {
    .dropdown {
      &__preview-title {
        @apply text-xxl;
      }

      &__preview-img {
        @apply max-w-22 w-22 h-22;
      }

      &__preview-expand {
        @apply text-xs ml-10;
      }
    }
  }
}

.perf-fee-card {
  &__item {
    &:after {
      content: "";
      @apply absolute top-0 h-full bg-iceberg;
      width: 0.5px;
      right: -30px;
    }
  }
}

.configure-cards {
  &__grid {
    grid-auto-rows: minmax(min-content, max-content);
  }
}

.tooltip-box {
  position: relative;
  &:hover {
    .tooltip {
      display: block;
    }
  }
  .tooltip {
    display: none;
    position: absolute;
    width: 400px;
    background: rgba(50, 75, 86, 0.95);
    color: #ffffff;
    text-align: center;
    padding: 10px 10px 10px 10px;
    border-radius: 5px;
    bottom: calc(100% + 11px);
    transform: translate-x(-50%);
    left: -80%;
    .triangle {
      border-width: 0px 6px 6px;
      border-color: transparent transparent rgba(50, 75, 86, 0.95);
      position: absolute;
      left: calc(50% - 12px);
      transform: rotate(180deg) translateX(-50%);
      bottom: -6px;
    }
  }
}
</style>
