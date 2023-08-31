<template>
  <GeneralLayout title="UBXT Balance" content-custom-classes="flex-col overflow-y-auto custom-scrollbar">
    <!-- CHANGE TAB BUTTON DESKTOP, TABLET -->
    <AppButtonsGroup
      v-if="isDeveloperUser & !$breakpoint.mdAndDown"
      slot="header-nav-left-end"
      v-model="tabValue"
      :items="tabData"
      class="ubxt-wallet__change-tab-btn w-full ml-25"
      custom-classes="py-3 px-15"
      @change="changeTab"
    />

    <!-- CHANGE TAB BUTTON MOBILE -->
    <div v-if="isDeveloperUser & $breakpoint.mdAndDown" class="flex flex-shrink-0 w-full mb-20 px-20">
      <AppButtonsGroup v-model="tabValue" :items="tabData" class="w-full" custom-classes="py-3 px-15" @change="changeTab" />
    </div>

    <!-- DESKTOP VIEW -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full relative overflow-y-auto custom-scrollbar">
      <!-- UBXT BALANCE -->
      <div class="flex flex-col flex-shrink-0 mb-20 lg:mb-40">
        <Card class="ubxt-balance__card flex flex-col w-full bg-dark-200 rounded-3" :header="false">
          <div slot="content" class="flex items-start justify-around h-full">
            <div class="flex justify-center w-1/3">
              <UBXTBalance
                :balance="getUserWallet.amount ? getUserWallet.amount : 0"
                :enable-perf-fees="getEnablePerfFees"
                @clickDeposit="isOpenTopupModal = true"
                @clickWithdraw="isOpenWithdrawModal = true"
              />
            </div>

            <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

            <div class="flex justify-center w-1/3">
              <UBXTAllocated :balance="getUserWallet.allocatedAmount ? getUserWallet.allocatedAmount : 0" />
            </div>

            <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

            <div class="flex justify-center w-1/3">
              <UBXTAvailable :balance="getUserWallet.availableAmount ? getUserWallet.availableAmount : 0" />
            </div>
          </div>
        </Card>
      </div>

      <!-- BOT ALLOCATION -->
      <div class="flex flex-col flex-shrink-0 mb-20 lg:mb-40">
        <p class="leading-xl text-iceberg mb-20">Bot Allocation</p>

        <div class="grid grid-rows-1 md:grid-rows-none md:grid-cols-2 lg:grid-cols-4 gap-30 p-6">
          <ActiveBotCard
            v-for="(item, index) in activeBotAllocation"
            :key="index"
            :title="item.botName"
            :data="item"
            :pairData="getPairData(item.botRef)"
            :enable-perf-fees="getEnablePerfFees"
            class=""
          />
        </div>
      </div>

      <!-- UBXT TRANSACTION -->
      <div class="flex flex-col">
        <div class="flex justify-between mb-20">
          <p class="leading-xl text-iceberg">UBXT Transaction</p>
          <label class="flex items-center">
            <app-checkbox v-model="isGrouping">
              Grouping
            </app-checkbox>
          </label>
        </div>

        <Card class="ubxt-transaction__card flex flex-col w-full bg-dark-200 rounded-3" :header="false">
          <div slot="content" class="flex items-start justify-around h-full">
            <UBXTTransaction :transactionsData="getUserTransactions" :isGrouping="isGrouping" />
          </div>
        </Card>
      </div>
    </div>

    <!-- MOBILE VIEW -->
    <div v-else class="flex flex-col flex-grow px-20 pb-20 overflow-y-auto custom-scrollbar">
      <div class="flex flex-col mb-40 flex-shrink-0">
        <div class="flex items-center mb-20">
          <span class="font-bold text-iceberg mr-14">UBXT Balance</span>
        </div>

        <Card class="flex flex-col bg-dark-200 rounded-3 p-14 mb-20" :header="false">
          <div slot="content" class="flex flex-col relative">
            <div class="flex flex-grow justify-center">
              <UBXTBalance
                :balance="getUserWallet.amount ? getUserWallet.amount : 0"
                :enable-perf-fees="getEnablePerfFees"
                @clickDeposit="isOpenTopupModal = true"
                @clickWithdraw="isOpenWithdrawModal = true"
              />
            </div>
          </div>
        </Card>

        <Card class="flex flex-col bg-dark-200 rounded-3 p-14 mb-20" :header="false">
          <div slot="content" class="flex flex-col relative">
            <div class="flex flex-grow justify-center">
              <UBXTAllocated :balance="getUserWallet.allocatedAmount ? getUserWallet.allocatedAmount : 0" />
            </div>
          </div>
        </Card>

        <Card class="flex flex-col bg-dark-200 rounded-3 p-14" :header="false">
          <div slot="content" class="flex flex-col relative">
            <div class="flex flex-grow justify-center">
              <UBXTAvailable :balance="getUserWallet.availableAmount ? getUserWallet.availableAmount : 0" />
            </div>
          </div>
        </Card>
      </div>

      <div class="flex flex-col flex-shrink-0 mb-40">
        <p class="leading-md text-white mb-20">Bot Allocation</p>

        <div class="grid grid-rows-1 gap-30">
          <ActiveBotCard
            v-for="item in activeBotAllocation"
            :key="item.bot"
            :title="item.botName"
            :data="item"
            :pairData="getPairData(item.botRef)"
            :enable-perf-fees="getEnablePerfFees"
          />
        </div>
      </div>

      <div class="flex flex-col flex-shrink-0 overflow-y-hidden custom-scrollbar">
        <div class="flex justify-between mb-20">
          <p class="leading-md text-white">UBXT Transaction</p>
          <label class="flex items-center">
            <app-checkbox v-model="isGrouping">
              Grouping
            </app-checkbox>
          </label>
        </div>

        <div class="ubxt-transaction-wrap flex flex-col relative overflow-y-auto custom-scrollbar">
          <UBXTTransaction :transactionsData="getUserTransactions" :isGrouping="isGrouping" />
        </div>
      </div>
    </div>

    <!-- DEPOSIT MODAL -->
    <AppModal v-model="isOpenTopupModal" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="w-full text-xxl text-iceberg text-center mb-10 md:mb-20">Add UBXT to UpBots</h2>

          <p class="w-full text-white leading-xs text-center mb-20">
            To credit your UpBots account you can transfer your UBXTs on the following addresses
          </p>

          <div class="flex flex-col items-center w-full px-10">
            <div class="flex flex-col justify-center w-full mb-20">
              <label>
                <p class="text-iceberg text-sm mb-5">ERC20</p>
                <AppInput
                  :value="getUserWallet.depositAddressETH"
                  type="text"
                  custom-class="pr-50"
                  size="sm"
                  class="w-full"
                  readonly
                  ref="ethAddress"
                >
                  <div
                    class="absolute right-0 top-0 flex items-center justify-center h-full w-30 cursor-pointer"
                    @click="copyLink('ethAddress')"
                  >
                    <i class="icon-copy text-white text-xl1" />
                  </div>
                </AppInput>
              </label>
            </div>

            <div class="flex flex-col justify-center w-full mb-30 hidden">
              <label>
                <p class="text-iceberg text-sm mb-5">BEP20</p>
                <AppInput
                  :value="getUserWallet.depositAddressBSC"
                  type="text"
                  custom-class="pr-50"
                  size="sm"
                  class="w-full"
                  readonly
                  ref="bscAddress"
                >
                  <div
                    class="absolute right-0 top-0 flex items-center justify-center h-full w-30 cursor-pointer"
                    @click="copyLink('bscAddress')"
                  >
                    <i class="icon-copy text-white" />
                  </div>
                </AppInput>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
    <!-- WITHDRAW MODAL -->
    <AppModal v-model="isOpenWithdrawModal" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="w-full text-xxl text-iceberg text-center mb-10 md:mb-20">Withdraw UBXT from UpBots</h2>

          <p class="w-full text-white leading-xs text-center mb-20">
            To withdraw your UBXT please fill in the following information, your request will be processed within 48 hours
          </p>

          <div class="flex flex-col items-center w-full px-10">
            <div class="flex justify-between items-center w-full py-16">
              <div class="text-grey-cl-920">Network:</div>
              <label class="flex items-center">
                <app-checkbox v-model="isETH" @click="selectNetwork()">
                  ETH (9,5$ fees)
                </app-checkbox>
              </label>
              <label class="flex items-center">
                <app-checkbox v-model="isBSC" @click="selectNetwork()">
                  BSC (0,5$ fees)
                </app-checkbox>
              </label>
            </div>
            <div class="flex flex-col justify-center w-full">
              <label class="pb-10">
                <p class="text-grey-cl-920 text-sm py-10">Address to withdraw</p>
                <div class="flex">
                  <AppInput v-model="withdrawAddress" type="text" custom-class="pr-50" size="sm" class="w-full"> </AppInput>
                </div>
              </label>
              <label>
                <p class="text-grey-cl-920 text-sm py-10">
                  Amount - fees included ({{ getUserWallet.availableAmount ? getUserWallet.availableAmount.toFixed(2) : 0 }} UBXT available)
                </p>
                <div class="col-span-2 flex-grow flex flex-col">
                  <div class="relative">
                    <AppInput v-model="withdrawAmount" type="number" :min="minAmount" :max="getUserWallet.availableAmount" size="sm" />

                    <div
                      class="absolute right-4 underline text-xs text-white cursor-pointer"
                      style="right: 10px; top: 9px;"
                      @click="withdrawAmount = getUserWallet.availableAmount"
                    >
                      MAX
                    </div>
                  </div>

                  <p v-if="dataReady" class="text-grey-cl-920 text-sm italic mt-8 mb-5">
                    Min $20&nbsp;
                    <span class="text-grey">({{ minAmount }} UBXT)</span>
                  </p>

                  <AppButton size="xs" type="light-green" class="mt-8 ml-auto" :disabled="!isWithdrawable" @click="onWithdraw">
                    Withdraw
                  </AppButton>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace, Getter } from "vuex-class";
import { AlgoBot, AlgoBotSubscription } from "@/store/algo-bots/types/algo-bots.payload";
import { UserWallet, UserTransaction, BotWallet, TransferType } from "@/store/perfees/types";
import { ErrorResponse } from "@/store/error-response";
import * as stakingService from "@/store/staking/service";
import { default as Web3 } from "web3";

const auth = namespace("authModule");
const algobots = namespace("algobotsModule");
const perfees = namespace("perfeesModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import UBXTBalance from "@/components/ubxt-wallet/UBXTBalance.vue";
import UBXTAllocated from "@/components/ubxt-wallet/UBXTAllocated.vue";
import UBXTAvailable from "@/components/ubxt-wallet/UBXTAvailable.vue";
import ActiveBotCard from "@/components/ubxt-wallet/ActiveBotCard.vue";
import UBXTTransaction from "@/components/ubxt-wallet/ubxt-transaction-table/UBXTTransaction.vue";

type UBXTWalletTab = { value: number; label: string; route: string };

@Component({
  name: "UBXTWallet",
  components: {
    GeneralLayout,
    UBXTBalance,
    UBXTAllocated,
    UBXTAvailable,
    ActiveBotCard,
    UBXTTransaction,
  },
})
export default class UBXTWallet extends Vue {
  /* VUEX */
  @Getter getEnablePerfFees: boolean;

  @auth.State user!: any;
  @auth.Getter isDeveloperUser!: boolean;
  @auth.Action getInfoUser!: any;

  @algobots.Getter getAlgoBots: AlgoBot[];
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;

  @perfees.State error: ErrorResponse;
  @perfees.Getter getUserWallet!: UserWallet;
  @perfees.Getter getUserTransactions!: UserTransaction[];
  @perfees.Getter getBotWallets!: BotWallet[];
  @perfees.Getter getBotWalletById!: BotWallet;
  @perfees.Action fetchUserWallet!: any;
  @perfees.Action fetchUserTransactions!: any;
  @perfees.Action fetchBotWallets!: any;
  @perfees.Action transferBotWallet!: any;
  @perfees.Action transferUserWallet!: any;

  /* DATA */
  isOpenTopupModal: boolean = false;
  isOpenWithdrawModal: boolean = false;
  withdrawAddress: string = "";
  withdrawAmount: number = 0;
  isETH: boolean = true;
  isBSC: boolean = false;
  isGrouping: boolean = false;
  dataReady: boolean = false;

  tabValue: number = 1;
  tabData: UBXTWalletTab[] = [
    { value: 1, label: "UBXT Wallet", route: "ubxt-wallet" },
    { value: 2, label: "My Bots Stats", route: "dev-mode" },
  ];

  /* WATCHERS */
  // @Watch("error", { immediate: true, deep: true })
  // onDataChange() {
  //   if (this.error) {
  //     this.$notify({ text: this.error.message, type: "error" });
  //   }
  // }

  /* HOOKS */
  async mounted() {
    await this.fetchAlgoBotsAction();
    await this.fetchAlgoBotsSubscriptionsAction();
    await this.fetchUserWallet();
    await this.fetchUserTransactions();
    await this.fetchBotWallets();
    await stakingService.calcStakingData();
    this.dataReady = true;
  }

  /* COMPUTED */
  get stakingData() {
    return stakingService.getStakingData();
  }

  get minAmount() {
    const priceUbxt = (this.isETH ? this.stakingData.eth.finalPriceUbxt : this.stakingData.bsc.finalPriceUbxt) || 0.029;
    return Math.ceil(this.dataReady ? 20.0 / priceUbxt : 20 / 0.029);
  }

  /* METHODS */
  getPairData(botRef: string) {
    if (this.getAlgoBots) {
      return this.getAlgoBots.find((bot: AlgoBot) => bot.botRef === botRef);
    }
    return null;
  }

  selectNetwork() {
    this.isETH = !this.isETH;
    this.isBSC = !this.isBSC;
  }

  get activeBotAllocation() {
    if (!this.getBotsSubcriptions) {
      return [];
    }
    const userActiveBots = this.getBotsSubcriptions
      .map((botSub: AlgoBotSubscription) => this.getAlgoBotById(botSub.botId))
      .filter((bot: AlgoBot | undefined) => bot != undefined);
    let activeBotAllocation = this.getBotWallets
      .filter((allocation: BotWallet) => userActiveBots.find((bot: AlgoBot) => bot.id === allocation.botId))
      .map((allocation: any) => {
        const algoBot = userActiveBots.find((bot: AlgoBot) => bot.id === allocation.botId);
        if (algoBot) {
          allocation.botRef = algoBot.botRef;
          allocation.botName = algoBot.name;
        }
        return allocation;
      });
    if (activeBotAllocation.length > 0) {
      activeBotAllocation = activeBotAllocation.filter((allocation) => allocation.botRef != "AVAXUSDT1" && allocation.botRef != "TOMOLO1");
      return activeBotAllocation;
    } else {
      //Display Dummy Data
      let dummy = this.getAlgoBots
        .map((bot: AlgoBot) => {
          const botWallet = this.getBotWallets.find((botWallet: BotWallet) => botWallet.botId === bot.id);
          let data: any = {
            userId: botWallet ? botWallet.userId : "",
            botId: bot.id,
            botSubId: "",
            botRef: bot.botRef,
            botName: bot.name,
            amount: botWallet ? botWallet.amount : 0,
            allocatedAmount: botWallet ? botWallet.allocatedAmount : 0,
            creditAmount: botWallet ? botWallet.creditAmount : 0,
            debtAmount: botWallet ? botWallet.debtAmount : 0,
            paidAmount: botWallet ? botWallet.paidAmount : 0,
            status: "ENABLED",
          };
          return data;
        })
        .filter((allocation) => allocation.botRef != "AVAXUSDT1" && allocation.botRef != "TOMOLO1");
      return dummy;
    }
  }

  copyLink(ref: string) {
    const copyText = (this.$refs as any)[ref].$children[0].$el.children[0] as HTMLInputElement;

    copyText.select();
    document.execCommand("copy");
  }

  get isWithdrawable() {
    const amountIsValid = this.withdrawAmount > 0 && this.withdrawAmount <= this.getUserWallet.availableAmount;
    const addressIsValid = Web3.utils.isAddress(this.withdrawAddress);
    return amountIsValid && addressIsValid;
  }

  onWithdraw() {
    if (!this.isWithdrawable) return false;

    const paload = {
      amount: this.withdrawAmount,
      address: this.withdrawAddress,
      transferType: TransferType.WITHDRAW,
      isETH: this.isETH,
    };

    this.transferUserWallet(paload)
      .then(() => {
        this.isOpenWithdrawModal = false;
      })
      .catch(({ response: { data } }: any) => {
        this.$notify({ text: data.message, type: "error" });
        this.isOpenWithdrawModal = false;
      });
  }

  changeTab(item: UBXTWalletTab) {
    if (this.$route.name !== `${item.route}`) {
      this.$router.push({ name: item.route as string });
    }
  }
}
</script>

<style lang="scss" scoped>
.ubxt-balance {
  &__card {
    min-height: 150px;
  }
}

.ubxt-wallet {
  &__change-tab-btn {
    max-width: 260px;
  }
}

@media (max-width: 767px) {
  .ubxt-wallet {
    &__title {
      &--coming-soon {
        bottom: -15px;
      }
    }
  }

  .ubxt-transaction-wrap {
    max-height: 600px;
  }
}
</style>
