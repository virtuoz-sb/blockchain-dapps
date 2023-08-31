<template>
  <div v-if="!isEdit" class="relative flex flex-col h-full overflow-y-auto custom-scrollbar">
    <!-- BALANCE -->
    <slot />

    <div class="flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
      <div class="flex px-20 mt-20 mb-5 md:mb-0" @click="changeSelectWallets">
        <span class="text-astral leading-md cursor-pointer">{{ selectUnselectWallet ? "Select All" : "Unselect All" }}</span>
      </div>
      <div class="flex flex-col mb-20 overflow-y-auto custom-scrollbar">
        <!-- WALLETS CARD -->
        <WalletsCard
          v-for="(item, index) in wallets.slice()"
          :key="index"
          :data="item"
          :currency-key="currencyKey"
          @select="handleWalletSelection"
          class="flex-shrink-0"
        />
      </div>
    </div>

    <div class="w-full px-20 pb-20 mt-auto">
      <AppButton type="light-green" class="w-full" @click="isEdit = true">Add account</AppButton>
    </div>
  </div>

  <div v-else class="flex flex-col h-full pt-20 overflow-y-auto custom-scrollbar">
    <!-- MY WALLETS EDIT -->
    <MyWalletsEdit @cancelEdit="cancelEdit" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { BtcAmount, AccountTotal } from "@/store/portfolio/types";
import { namespace } from "vuex-class";

const user = namespace("userModule");

import PortfolioBalance from "@/components/portfolio/PortfolioBalance.vue";
import WalletsCard from "@/components/portfolio/WalletsCard.vue";
import MyWalletsEdit from "@/components/portfolio/MyWalletsEdit.vue";
import CurrencyCard from "@/components/portfolio/CurrencyCard.vue";

@Component({ name: "MyWalletsMobile", components: { PortfolioBalance, WalletsCard, MyWalletsEdit, CurrencyCard } })
export default class MyWalletsMobile extends Vue {
  /* VUEX */
  @user.Mutation portfolioSelected!: any;
  @user.Action handleWalletSelection!: any;
  @user.Action fetchFilteredPortfolio!: any;

  /* PROPS */
  @Prop({ required: true }) wallets: AccountTotal[];
  @Prop({ required: true }) balance: BtcAmount;
  @Prop({ required: true }) currencyKey: string;

  /* DATA */
  isEdit: boolean = false;
  selectUnselectWallet: boolean = false;

  /* HOOKS */
  created() {
    this.selectAllWallets(false);
  }

  /* METHODS */
  selectAllWallets(unselect: boolean = true) {
    const allWallets = unselect ? [] : this.wallets.map((w: any) => w.name);
    this.portfolioSelected(allWallets);
    this.fetchFilteredPortfolio();
  }

  changeSelectWallets() {
    this.selectUnselectWallet = !this.selectUnselectWallet;
    this.selectAllWallets(this.selectUnselectWallet);
  }

  cancelEdit() {
    this.isEdit = false;
  }
}
</script>
