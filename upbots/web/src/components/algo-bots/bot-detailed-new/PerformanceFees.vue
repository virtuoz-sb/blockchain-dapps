<template>
  <div class="flex flex-col" :class="!$breakpoint.smAndDown && 'my-performance p-20'">
    <template v-if="!$breakpoint.smAndDown">
      <!-- TITLE -->
      <h2 class="text-iceberg text-md leading-xs mb-10">Performance Fees</h2>

      <div class="flex items-start justify-around h-full">
        <div class="flex flex-col justify-around items-center flex-grow h-full">
          <p class="text-iceberg">UBXT Allocation Balance</p>

          <div class="flex w-full justify-center items-center">
            <p class="text-white text-xl leading-xs font-bold">
              {{ botAllocation ? botAllocation.amount.toFixed(4) : "N/A" }}
            </p>

            <AppButton
              type="light-green"
              class="w-60 h-20 mx-10"
              style="padding-top: 10px; padding-bottom: 10px;"
              @click="isTransUbxtModalOpen = true"
            >
              <span class="p-2 text-sm">Transfer</span>
            </AppButton>
            <!-- <AppButton type="light-green" class="h-16" style="padding-top: 10px; padding-bottom: 10px;" @click="isTransUbxtModalOpen = true">
            <span class="p-2 text-lg">-</span>
          </AppButton> -->
          </div>
        </div>

        <!-- DIVIDER -->
        <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

        <div class="flex-grow flex flex-col justify-around items-center h-full">
          <div class="text-iceberg">Total fees paid</div>
          <div class="flex items-center text-white text-xl leading-xs font-bold">
            {{ botAllocation ? botAllocation.totalPaid : "N/A" }} <span class="ml-4 pt-2 text-sm">USDT</span>
          </div>
        </div>

        <!-- DIVIDER -->
        <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

        <div class="flex flex-col justify-around flex-grow items-center h-full">
          <span class="text-iceberg">Available Credit</span>
          <span class="text-green-cl-100 text-xl leading-xs font-bold">
            {{ botAllocation ? botAllocation.creditAmount : "N/A" }}
          </span>
        </div>
      </div>
    </template>

    <template v-else>
      <h2 class="text-iceberg text-md leading-xs mb-20">My Performance</h2>

      <div class="grid grid-cols-3 col-gap-10">
        <div class="flex flex-col items-center border-r border-solid border-hei-se-black pr-10">
          <p class="text-iceberg leading-xs text-center mb-10">UBXT Allocation Balance</p>

          <div class="flex w-full justify-center items-center mt-auto">
            <p class="text-white text-xl leading-xs font-bold">
              {{ botAllocation ? (botAllocation == 0 ? 0 : botAllocation.amount.toFixed(4)) : "N/A" }}
            </p>

            <AppButton
              type="light-green"
              class="w-60 h-20 mx-10"
              style="padding-top: 10px; padding-bottom: 10px;"
              @click="isTransUbxtModalOpen = true"
            >
              <span class="p-2 text-sm">Transfer</span>
            </AppButton>
          </div>
        </div>

        <div class="flex flex-col items-center border-r border-solid border-hei-se-black pr-10">
          <div class="text-iceberg leading-xs text-center mb-10">Total fees paid</div>
          <div class="flex items-center text-white text-xl leading-xs font-bold mt-auto">
            {{ botAllocation ? botAllocation.totalPaid : "N/A" }} <span class="ml-4 pt-2 text-sm">USDT</span>
          </div>
        </div>

        <div class="flex flex-col items-center pr-10">
          <span class="text-iceberg leading-xs text-center mb-10">Available Credit</span>
          <span class="text-green-cl-100 text-xl leading-xs font-bold mt-auto">
            {{ botAllocation ? botAllocation.creditAmount : "N/A" }}
          </span>
        </div>
      </div>
    </template>

    <!-- TRANSFER UBXT MODAL -->
    <AppModal v-model="isTransUbxtModalOpen" persistent max-width="500px">
      <div class="active-bot__hold-modal relative flex flex-col w-full pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Transfer UBXT</h2>

          <div class="grid grid-cols-5 gap-4 px-20 w-full mb-30">
            <div class="col-span-2 flex flex-col justify-center items-center text-iceberg">
              <div>From:</div>
              <div>UBXT</div>
            </div>

            <div class="col-span-1 flex items-center justify-center">
              <i class="icon-swap-new text-astral text-xxl" />
            </div>

            <div class="col-span-2 flex flex-col justify-center items-center text-iceberg">
              <div>To:</div>
              <div>{{ algobot.name }}</div>
            </div>
          </div>

          <div class="mb-30 w-full px-20 text-iceberg">
            UBXT Amount:
            <span class="text-sm text-iceberg ml-4">
              Total available :
              <span class="text-blue-cl-400">{{ getUserWallet.availableAmount.toFixed(4) }} UBXT</span>
            </span>
            <AppInput v-model="ubxtAmount" :max="getUserWallet.availableAmount" class="mt-10 text-md" type="number" />
          </div>

          <div class="flex flex-col md:flex-row items-center w-full md:w-auto">
            <AppButton type="light-green" @click="handleUbxtToBot">Transfer</AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { UserWallet, UserTransaction, BotWallet } from "@/store/perfees/types";
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";

const perfees = namespace("perfeesModule");

@Component({ name: "PerformanceFees" })
export default class PerformanceFees extends Vue {
  /* VUEX */
  @perfees.Getter getUserWallet!: UserWallet;
  @perfees.Action fetchUserWallet!: any;
  @perfees.Action transferBotWallet!: any;

  /* PROPS */
  @Prop({ required: true }) algobot: AlgoBot;
  @Prop({ required: true }) botAllocation!: BotWallet;

  /* DATA */
  isTransUbxtModalOpen: boolean = false;
  ubxtAmount: number = 0;

  /* HOOKS */
  async created() {
    this.fetchUserWallet();
  }

  async mounted() {
    if (this.botAllocation) {
      this.ubxtAmount = this.botAllocation.amount;
    }
  }

  /* METHODS */
  handleUbxtToBot() {
    this.isTransUbxtModalOpen = false;

    const paload = {
      botId: this.algobot.id,
      amount: this.ubxtAmount,
    };

    this.transferBotWallet(paload)
      .then(() => {})
      .catch(() => {});
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.my-performance {
  height: 130px;
}
</style>
