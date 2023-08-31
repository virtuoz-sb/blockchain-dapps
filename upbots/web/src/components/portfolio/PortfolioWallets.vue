<template>
  <div
    v-if="!isEdit && !loading"
    class="portfolio-my-wallets__wrap flex flex-col overflow-y-auto custom-scrollbar"
    :class="!wallets.length && 'disabled'"
  >
    <div class="flex items-center justify-between mb-20">
      <span class="leading-xs text-white">My Wallets</span>
      <span class="text-blue-cl-100 leading-md cursor-pointer" @click="$emit('select-all')">Unselect All</span>
    </div>

    <div class="flex flex-col mb-10 overflow-y-auto custom-scrollbar">
      <!-- WALLETS CARD -->
      <PortfolioWalletsCard
        v-for="(item, index) in getAccounts"
        :key="index"
        :data="item"
        :currency-key="currencyKey"
        @select="handleWalletSelection"
      />
    </div>

    <AppButton type="light-green" class="portfolio-wallets__add-btn hidden md:flex w-full" @click="isEdit = true">Add account</AppButton>
  </div>

  <!-- MY WALLETS EDIT -->
  <PortfolioWalletsEdit v-else @cancelEdit="cancelEdit" />
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

import PortfolioWalletsCard from "@/components/portfolio/PortfolioWalletsCard.vue";
import PortfolioWalletsEdit from "@/components/portfolio/PortfolioWalletsEdit.vue";

@Component({ name: "PortfolioWallets", components: { PortfolioWalletsCard, PortfolioWalletsEdit } })
export default class PortfolioWallets extends Vue {
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

.portfolio-my-wallets {
  &__wrap {
    &.disabled {
      &:after {
        content: "No Data Available";
        background: rgba(27, 49, 58, 0.8);
        @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg;
      }
    }
  }
}

.portfolio-wallets {
  &__add-btn {
    height: 67px;
  }
}
</style>
