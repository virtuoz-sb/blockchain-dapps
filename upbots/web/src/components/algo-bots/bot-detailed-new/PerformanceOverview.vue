<template>
  <div class="my-performance flex flex-col rounded-3 px-20 py-20 xl:py-0">
    <div class="flex flex-col xl:flex-row items-center xl:items-start flex-grow justify-around">
      <div
        class="flex flex-col flex-shrink-0 flex-grow items-center justify-between h-auto xl:h-full w-full xl:w-auto pt-20 xl:pt-30 xl:mt-0 pb-20 mb-20 xl:mb-0"
        :style="`background: url(${backgroundStep3}) no-repeat center center / contain`"
      >
        <span class="text-bachelor-button text-xl leading-xs font-bold mb-20">Total Gain</span>
        <span class="text-white text-xxl1 leading-xs font-bold" :class="[isPerfeesEnable ? 'mb-20' : 'mb-0']"
          >{{ totalRealisedGain | toTwoDecimalDigitFixed }} USDT</span
        >
      </div>

      <!-- DIVIDER -->
      <AppDivider is-vertical class="hidden xl:block h-3/5 bg-iceberg my-auto" />

      <div
        class="flex flex-col flex-shrink-0 flex-grow items-center justify-between h-auto xl:h-full w-full xl:w-auto pt-10 xl:pt-30 mb-20 xl:mb-0"
        :class="[isPerfeesEnable ? 'pb-10' : 'pb-20']"
        :style="`background: url(${backgroundStep2}) no-repeat center center / contain`"
      >
        <div class="flex flex-col items-center">
          <span class="text-bachelor-button text-xl leading-xs font-bold mb-5">UBXT Allocation Balance</span>
          <span v-if="!isPerfeesEnable" class="text-iceberg">(Coming soon)</span>
        </div>

        <div class="flex flex-col">
          <div class="flex w-full justify-center items-center mt-15 mb-0">
            <img :src="require('@/assets/icons/ubxt-logo.png')" alt="wallet" class="w-27 h-27 mr-20" />

            <p class="text-white text-xl leading-xs font-bold" :class="{ 'text-red-cl-100': !isTradableAmount }">
              {{ getEnablePerfFees && botAllocation ? (botAllocation.amount - botAllocation.debtAmount).toFixed(4) : "N/A" }}
            </p>

            <div class="flex items-cetner ml-20">
              <AppButton
                type="circle"
                icon="icon-minus-stroke"
                class="performances-overview__btn-minus flex-shrink-0 w-30 h-30 mr-10"
                :disabled="!isMinButtonEnable"
                @click="showTransferModal('minus')"
              />
              <AppButton
                type="circle"
                icon="icon-plus-stroke"
                class="performances-overview__btn-plus flex-shrink-0 w-30 h-30"
                :disabled="!isPlusButtonEnable"
                @click="showTransferModal('plus')"
              />
            </div>
            <!-- <AppButton type="light-green" class="h-16" style="padding-top: 10px; padding-bottom: 10px;" >
              <span class="p-2 text-lg">-</span>
            </AppButton> -->
          </div>
          <div v-if="isPerfeesEnable" class="flex mt-10 mb-0 mr-auto pl-5 tooltip-box">
            <AppCheckbox v-model="autoRefill" @input="onAutoRefill()"><span class="text-md">Automatic Refill</span></AppCheckbox>
            <div class="tooltip">
              <span class="triangle"></span>
              I agree that the UBXT of my main balance will be automatically used in case of insufficient funds on my active bots
            </div>
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <AppDivider is-vertical class="hidden xl:block h-3/5 bg-iceberg my-auto" />

      <div
        class="flex flex-col flex-shrink-0 flex-grow items-center justify-between h-auto xl:h-full w-full xl:w-auto pt-20 xl:pt-30 pb-20"
        :style="`background: url(${backgroundStep1}) no-repeat center center / contain`"
      >
        <span class="text-bachelor-button text-xl leading-xs font-bold mb-20">Virtual Credit</span>
        <span class="text-green-cl-100 text-xxl1 leading-xs font-bold" :class="[isPerfeesEnable ? 'mb-20' : 'mb-0']">
          {{ getEnablePerfFees && botAllocation ? botAllocation.creditAmount.toFixed(4) : "N/A" }}
        </span>
      </div>
    </div>

    <!-- TRANSFER UBXT MODAL -->
    <AppModal v-model="isTransUbxtModalOpen" persistent max-width="500px">
      <div class="active-bot__hold-modal relative flex flex-col w-full pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Transfer UBXT</h2>

          <div class="grid grid-cols-5 gap-4 px-20 w-full mb-30">
            <div class="col-span-2 flex flex-col justify-center items-center text-iceberg">
              <div>From:</div>
              <div>{{ transferMode == "plus" ? "Main Balance" : algobot.name }}</div>
            </div>

            <div class="col-span-1 flex items-center justify-center">
              <i class="icon-swap-new text-astral text-xxl" />
            </div>

            <div class="col-span-2 flex flex-col justify-center items-center text-iceberg">
              <div>To:</div>
              <div>{{ transferMode == "minus" ? "Main Balance" : algobot.name }}</div>
            </div>
          </div>

          <div class="mb-30 w-full px-20 text-iceberg">
            Available UBXT Amount:
            <span class="text-sm text-iceberg ml-4">
              <span class="text-blue-cl-400">{{ transableMaxAmount.toFixed(4) }} UBXT</span>
            </span>
            <AppInput v-model="ubxtAmountToTrans" :max="transableMaxAmount" class="mt-10 text-md" type="number" />
          </div>

          <div class="flex flex-col md:flex-row items-center w-full md:w-auto">
            <AppButton :disabled="!isTransable" type="light-green" @click="transferUbxt">Transfer</AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { namespace, Getter } from "vuex-class";
import { KeyExtended } from "@/store/user/types";
import { UserWallet, UserTransaction, BotWallet } from "@/store/perfees/types";
import { CryptoPriceData, CryptoItem } from "@/store/cryptoPrice/types";
import {
  AlgoBot,
  BotPerformanceCycleDto,
  AlgoBotSubscription,
  SubscriptionBotPause,
  BotPerformanceSnapshotDto,
  FollowBotRequest,
} from "@/store/algo-bots/types/algo-bots.payload";

const user = namespace("userModule");
const perfees = namespace("perfeesModule");
const algobots = namespace("algobotsModule");
const cryptoModule = namespace("cryptoPrice");

@Component({ name: "PerformanceOverview" })
export default class PerformanceOverview extends Vue {
  /* VUEX */
  @Getter getEnablePerfFees: boolean;
  @user.Getter getKeyNamesWithExchange!: KeyExtended[];
  @perfees.Getter getUserWallet!: UserWallet;
  @perfees.Getter getBotWallets!: any;
  @perfees.Getter getBotWalletById!: any;
  @perfees.Action transferBotWallet!: any;
  @perfees.Action autoRefillBotWallet!: any;
  @cryptoModule.Action fetchCryptoPriceCoinGecko: any;
  @cryptoModule.Getter getPriceData!: { [pair: string]: CryptoPriceData };
  @algobots.Getter getAlgoBots: any;
  @algobots.Getter getAlgoBotById: any;
  @algobots.Getter getBotSubscriptionCycles: BotPerformanceCycleDto[];
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  /* PROPS */
  @Prop({ required: true }) algobot: AlgoBot;
  @Prop({ required: true }) algoBotSubscription!: any;
  @Prop({ required: true }) botAllocation!: BotWallet;

  /* DATA */
  transferMode: string = "plus";
  isTransUbxtModalOpen: boolean = false;
  ubxtAmountToTrans: number = 0;
  autoRefill: boolean = false;

  algoBot: AlgoBot | null = null;
  activeAccount: any = {};
  activeSubscription: AlgoBotSubscription | null = null;
  baseAvailable: number = 0.0;

  backgroundStep1: any = "/img/algo-bots-detailed/configure/configure-step-1.png";
  backgroundStep2: any = "/img/algo-bots-detailed/configure/configure-step-2.png";
  backgroundStep3: any = "/img/algo-bots-detailed/configure/configure-step-3.png";

  /* HOOKS */
  async created() {}

  async mounted() {
    this.fetchCurrentUbxtPrice();
    // this.fetchBaseAvailable();
    // this.fetchBotWallet();
  }

  get totalRealisedGain() {
    let total = 0;
    this.getBotSubscriptionCycles.forEach((cycle) => {
      if (cycle.realisedGain) {
        total = total + cycle.realisedGain.usd;
      }
    });
    return total;
  }
  get isPerfeesEnable() {
    let isCommunityBot = false;
    if (this.algobot && (this.algobot.botRef === "AVAXUSDT1" || this.algobot.botRef === "TOMOLO1")) {
      isCommunityBot = true;
    }
    return this.getEnablePerfFees && !isCommunityBot;
  }
  get isTradableAmount() {
    if (!this.botAllocation) {
      return false;
    }
    const realAmount = this.botAllocation.amount - this.botAllocation.debtAmount;
    if (realAmount > this.getMiniumUbxtToDeposit()) {
      return true;
    }
    return false;
  }
  get isMinButtonEnable() {
    const isBotRunning = this.algoBotSubscription && this.algoBotSubscription.botRunning;
    return this.isPerfeesEnable && this.isTradableAmount && !isBotRunning;
  }
  get isPlusButtonEnable() {
    return this.isPerfeesEnable;
  }
  get transableMaxAmount() {
    if (this.transferMode == "plus") {
      return this.getUserWallet.availableAmount;
    } else {
      return this.botAllocation.amount - this.getMiniumUbxtToDeposit();
    }
  }
  get isTransable() {
    return this.ubxtAmountToTrans > 0 && this.ubxtAmountToTrans <= this.transableMaxAmount;
  }

  /* WATCHERS */
  @Watch("getAlgoBots")
  onChangeAlgoBots(val: any) {
    this.fetchBaseAvailable();
  }

  @Watch("getBotWallets")
  onChangeBotWallets(val: any) {
    this.fetchBotWallet();
  }

  /* METHODS */
  showTransferModal(transferMode: string) {
    this.transferMode = transferMode;
    this.isTransUbxtModalOpen = true;
    this.ubxtAmountToTrans = 0;
  }

  transferUbxt() {
    this.isTransUbxtModalOpen = false;
    let amount = 0;
    let botAmount = this.botAllocation ? Number(this.botAllocation.amount) : 0;
    if (this.transferMode == "plus") {
      amount = botAmount + Number(this.ubxtAmountToTrans);
    } else {
      amount = botAmount - Number(this.ubxtAmountToTrans);
    }

    const paload = {
      botId: this.algobot.id,
      amount,
    };

    this.transferBotWallet(paload);
  }
  onAutoRefill() {
    const paload = {
      botId: this.algobot.id,
      autoRefill: this.autoRefill,
    };

    this.autoRefillBotWallet(paload);
  }
  async fetchBotWallet() {
    const botWallet = this.getBotWalletById(this.$route.params.id);
    if (botWallet) {
      this.autoRefill = botWallet.autoRefill;
    }
  }
  fetchBaseAvailable() {
    this.algoBot = this.getAlgoBotById(this.$route.params.id);
    this.activeSubscription = this.getBotsSubcriptions.filter((sub) => sub.botId === this.algoBot.id)[0];
    const { id, name, img } = this.getKeyNamesWithExchange.filter((key: any) => key.id === this.activeSubscription.apiKeyRef)[0] || {};
    this.activeAccount = { id, name, img };

    this.$http.get(`/api/portfolio/trade-balance/${this.activeAccount.id}`).then(({ data }) => {
      const selectedAccountDist = data;
      // Depend on operation type BUY/SELL find the appropriate currency
      if (selectedAccountDist && selectedAccountDist.freeBalances) {
        this.baseAvailable = selectedAccountDist.freeBalances["USDT"];
        if (this.baseAvailable === undefined) {
          this.baseAvailable = 0;
        }
      } else {
        this.baseAvailable = 0.0;
      }
      this.baseAvailable = this.baseAvailable * this.activeSubscription.accountPercent;
    });
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
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.my-performance {
  @media (min-width: 1281px) {
    height: 140px;
  }
}

::v-deep .performances-overview {
  &__btn-plus,
  &__btn-minus {
    .icon-minus-stroke,
    .icon-plus-stroke {
      @apply text-xxl3;
    }
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
