<template>
  <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
    <div v-if="!isEdit && !loading" class="flex flex-col flex-grow overflow-y-auto custom-scrollbar" :class="!wallets.length && 'disabled'">
      <div v-if="$breakpoint.smAndDown" class="flex items-center justify-between p-20">
        <div class="text-astral leading-md cursor-pointer mr-10" @click="$emit('select-all')">Unselect All</div>
      </div>

      <div class="flex flex-col flex-grow mt-10 mb-20 overflow-y-auto custom-scrollbar">
        <!-- WALLETS CARD -->
        <WalletsCard
          v-for="(item, index) in getAccounts"
          :key="index"
          :data="item"
          :currency-key="currencyKey"
          @select="handleWalletSelection"
        />
      </div>

      <div class="mt-auto px-20 w-full pb-20">
        <AppButton type="light-green" class="hidden md:flex w-full" @click="isEdit = true">Add account</AppButton>
      </div>
    </div>

    <div v-if="isEdit" class="h-full pt-20 overflow-y-auto custom-scrollbar">
      <!-- MY WALLETS EDIT -->
      <MyWalletsEdit @cancelEdit="cancelEdit" />
    </div>
  </div>
</template>

<script lang="ts">
const dummyData: any[] = [
  {
    id: "5f87155b080c5e6eaaf082a1",
    name: "binance 3",
    exchange: "binance",
    total: {
      btc: 6.174035246707613,
      eur: 60164.12126859168,
      usd: 71222.43579896969,
      conversionDate: "2020-10-13T00:00:00.000Z",
    },
  },
  {
    id: "5f871543080c5e2f61f082a0",
    name: "binance 2",
    exchange: "binance",
    total: {
      btc: 1.8656625402304952,
      eur: 18180.32175578411,
      usd: 21521.909931590944,
      conversionDate: "2020-10-13T00:00:00.000Z",
    },
  },
  {
    id: "5f85c473080c5e4118f07d4f",
    name: "binance",
    exchange: "binance",
    total: {
      btc: 0.001160563463305536,
      eur: 11.309342780873457,
      usd: 13.388028,
      conversionDate: "2020-10-13T00:00:00.000Z",
    },
  },
];

import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { AccountTotal } from "@/store/portfolio/types";
import { Accounts } from "../../store/user/types";

const user = namespace("userModule");

import WalletsCard from "@/components/portfolio/WalletsCard.vue";
import MyWalletsEdit from "@/components/portfolio/MyWalletsEdit.vue";

@Component({ name: "MyWallets", components: { WalletsCard, MyWalletsEdit } })
export default class MyWallets extends Vue {
  /* VUEX */
  @user.Getter getAccounts: Accounts[];
  @user.Action handleWalletSelection!: any;

  /* PROPS */
  @Prop({ required: true }) wallets: AccountTotal[];
  @Prop({ required: true }) currencyKey: string;

  /* DATA */
  isEdit: boolean = false;
  loading: boolean = false;

  /* COMPUTED */
  get myWalletsData() {
    return this.wallets.length ? this.wallets : dummyData;
  }

  /* METHODS */
  cancelEdit() {
    this.isEdit = false;
  }
}
</script>

<style lang="scss" scoped>
.my-wallets {
  &__btn-group {
    width: 140px;
  }
}
</style>
