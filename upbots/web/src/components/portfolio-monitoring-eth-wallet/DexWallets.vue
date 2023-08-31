<template>
  <div class="px-12 py-16">
    <!-- SELECT WALLET -->
    <AppSelect class="select mb-30 md:mb-20" :value="getSelectedWallet" :options="getWallets" @input="selectWallet" />

    <!-- ACTION BUTTONS -->
    <div class="dex-wallet__btn-wrap w-full grid grid-cols-2 col-gap-10">
      <AppButton type="light-green" size="xxs" @click="isModalOpen = true">
        <span class="icon-accordion-plus text-xl mr-8" />
        <span>New Wallet</span>
      </AppButton>

      <AppButton type="light-green" size="xxs" @click="submitDeleteWallet">
        <span class="icon-trash text-xl mr-8" />
        <span>Delete Wallet</span>
      </AppButton>
    </div>

    <AppModal v-model="isModalOpen" max-width="900px">
      <div class="edit-modal__wrap relative flex flex-col py-40 px-20 md:px-75">
        <!-- MODAL TITLE -->
        <h2 class="font-raleway text-iceberg text-xxl text-center mb-45">Add New Wallet</h2>

        <div class="grid grid-rows-1 row-gap-40 lg:row-gap-0 lg:grid-cols-3 lg:col-gap-20">
          <!-- METAMASK CARD -->
          <div class="flex flex-col flex-grow items-center justify-center lg:border-r lg:border-solid lg:border-san-juan lg:pr-20">
            <p class="text-md text-iceberg text-center leading-md mb-20">
              Add your Metamask wallets and keep track of your assets evolution on Upbots.
            </p>

            <img src="@/assets/icons/wallet-icon.svg" alt="metamask" class="w-53 mb-12" />

            <AppButton type="yellow" class="w-full mt-auto" @click="addMetamaskWallet">Connect Wallet</AppButton>
          </div>

          <!-- BINANCE CHAIN CARD -->
          <div class="flex flex-col flex-grow items-center justify-center lg:border-r lg:border-solid lg:border-san-juan lg:pr-20">
            <p class="text-md text-iceberg text-center leading-md mb-20">
              Add your Binance Chain wallets and keep track of your assets evolution on Upbots.
            </p>

            <img src="@/assets/icons/binance-chain-wallet.png" alt="binance chain wallet" class="w-53 mb-12" />

            <AppButton class="w-full mt-auto" type="light-green" @click="addBinanceChainWallet">Connect Wallet</AppButton>
          </div>

          <!-- DEX WALLET CARD -->
          <ValidationObserver ref="form" tag="div" class="flex flex-col flex-grow">
            <p class="text-md text-iceberg text-center leading-md mb-20">Add your DEX wallet using its address.</p>

            <form @submit.prevent="submitAddWallet" class="flex flex-col h-full">
              <div class="flex-1 h-full mb-20 md:mb-0 pb-0 md:pb-20">
                <div class="flex flex-col mb-20">
                  <h3 class="text-iceberg text-sm leading-xs mb-12">Wallet Label</h3>
                  <AppInput
                    v-model="newWalletForm.label"
                    placeholder="Label for your new wallet"
                    name="Label"
                    rules="required"
                    custom-class="py-8"
                    size="sm"
                  />
                </div>

                <div class="flex flex-col">
                  <h3 class="text-iceberg text-sm leading-xs mb-8">Wallet Address</h3>
                  <AppInput
                    v-model.trim="newWalletForm.address"
                    show-last
                    placeholder="Wallet address"
                    name="Address"
                    rules="required"
                    custom-class="py-8"
                    size="sm"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between mt-auto">
                <AppButton type="light-green" class="w-full">Add Wallet</AppButton>
              </div>
            </form>
          </ValidationObserver>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { DexWallet } from "@/store/dex-monitoring/types";
import { default as Web3 } from "web3";
import { resolveEns } from "@/store/dex-monitoring/helpers";

const dexMonitoring = namespace("dexMonitoringModule");

@Component({ name: "DexWallets" })
export default class DexWallets extends Vue {
  /* VUEX */
  @dexMonitoring.Getter getWallets: DexWallet[];
  @dexMonitoring.Getter getSelectedWallet: DexWallet;
  @dexMonitoring.Action fetchBalances: () => Promise<void>;
  @dexMonitoring.Action addWallet: (payload: { wallet: DexWallet }) => Promise<void>;
  @dexMonitoring.Action deleteWallet: ({ wallet }: { wallet: DexWallet }) => Promise<void>;
  @dexMonitoring.Action selectWallet: (payload: DexWallet) => void;

  /* DATA */
  isModalOpen = false;
  newWalletForm: DexWallet = {
    label: "",
    address: "",
  };

  /* METHODS */
  async submitDeleteWallet() {
    if (this.getSelectedWallet.address) {
      await this.deleteWallet({ wallet: this.getSelectedWallet });
      this.handleFetchBalances();
    }
  }

  async submitAddWallet() {
    const newWallet: DexWallet = {
      label: this.newWalletForm.label,
      address: await resolveEns(this.newWalletForm.address),
    };
    if (this.getWallets.find(({ address }) => address === newWallet.address)) {
      this.handleExistingAddress();
    } else {
      await this.addWallet({ wallet: newWallet });
      this.handleFetchBalances();
    }
  }

  async addAccounts(accounts: string[]) {
    accounts.forEach((account) => {
      const label = account.substring(0, 8) + "....." + account.substring(account.length - 6);
      if (this.getWallets.find(({ address }) => address === account)) {
        this.handleExistingAddress();
      } else {
        this.addWallet({
          wallet: {
            label,
            address: account,
          },
        });
      }
    });
    this.handleFetchBalances();
  }

  async addBinanceChainWallet() {
    // @ts-ignore
    const web3 = new Web3(window.BinanceChain);
    // @ts-ignore
    await window.BinanceChain.enable();
    const accounts = await web3.eth.getAccounts();
    this.addAccounts(accounts);
  }

  async addMetamaskWallet() {
    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    // @ts-ignore
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    this.addAccounts(accounts);
  }

  handleFetchBalances() {
    setTimeout(() => {
      this.fetchBalances();
      this.clearForm();
      this.isModalOpen = false;
    }, 500);
  }

  clearForm() {
    this.newWalletForm.label = "";
    this.newWalletForm.address = "";
  }

  handleExistingAddress() {
    this.$notify({ text: `${this.newWalletForm.label} already exists on your portfolio`, type: "info" });
  }
}
</script>

<style lang="scss" scoped>
::v-deep .select {
  .text-sm {
    @apply text-md;
  }
}

.dex-wallet {
  &__btn-wrap {
    @media (min-width: 768px) and (max-width: 1439px) {
      @apply grid-cols-1 row-gap-10;
    }
  }
}
</style>
