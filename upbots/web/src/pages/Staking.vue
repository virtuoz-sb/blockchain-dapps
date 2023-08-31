<template>
  <GeneralLayout title="EARN" content-custom-classes="flex-col overflow-y-auto custom-scrollbar">
    <!-- HEADER SLOT METAMASK CONNECTION -->
    <div slot="header-right-side-start" class="metamask-connect-btn relative w-full flex-shrink-0 ml-10 md:mx-20">
      <!-- METAMASK CONNECTED STATE -->
      <AppButton v-if="this.metamaskAccountLink" type="light-green" size="xxs" class="flex-shrink-0 w-full" @click="walletModalOpen = true">
        {{ this.metamaskAccountLink | truncStringPortion }}
      </AppButton>

      <!-- METAMASK CONNECT STATE -->
      <template v-else>
        <template v-if="isWalletConnectMode">
          <AppButton v-if="!$breakpoint.smAndDown" type="light-green" size="xxs" class="flex-shrink-0 w-full" @click="checkWalletEnabled()">
            Connect Wallet
          </AppButton>
          <AppButton v-else type="light-green" size="xxs" class="flex-shrink-0 w-full" @click="checkWalletEnabled()">
            <span>Connect</span>
          </AppButton>
        </template>
        <template v-else>
          <AppButton
            v-if="!$breakpoint.smAndDown"
            type="light-green"
            size="xxs"
            class="flex-shrink-0 w-full"
            @click="checkMetamaskEnabled()"
          >
            Connect to Metamask
          </AppButton>
          <AppButton v-else type="light-green" size="xxs" class="flex-shrink-0 w-full" @click="checkMetamaskEnabled()">
            <img src="@/assets/icons/metamask.svg" alt="metamask" class="h-18 mr-8" />
            <span>Connect</span>
          </AppButton>
        </template>
      </template>

      <!-- METAMASK WRONG NETWORK MESSAGE -->
      <p v-if="isMetamaskNetworkMsg" class="absolute top-40 left-0 text-red-cl-100 text-xs md:text-sm leading-xs">
        <span class="icon-warning1 mr-4" />
        <span>{{ this.networkErrorMessage }}</span>
      </p>
    </div>

    <div class="flex flex-col flex-grow w-full mt-30 md:mt-0 md:pt-30 pb-40 md:pb-0 px-20 md:px-0 overflow-auto custom-scrollbar">
      <div class="staking-buttons-group__wrap w-full mx-auto mb-30">
        <AppButtonsGroup v-model="switcherCurrencyModel" :items="switcherCurrencyData" type="filled" class="w-full" />
      </div>

      <!-- CARD VALUES -->
      <Card :header="false" class="flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 mb-40 md:mb-66">
        <template slot="content">
          <div class="grid md:grid-cols-3 row-gap-10 md:row-gap-0 md:col-gap-20 md:p-20">
            <div
              class="flex flex-col items-center border-b md:border-b-0 md:border-r border-solid border-iceberg py-10 md:py-0 px-20 md:px-0"
            >
              <span class="text-iceberg text-md md:text-xl text-center mb-14">Total Value Locked</span>
              <span class="text-white text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                $ {{ (switcherCurrency === "eth" ? this.balance : this.bscBalance) | convertNumberValue }}
              </span>
            </div>

            <div
              class="flex flex-col items-center border-b md:border-b-0 md:border-r border-solid border-iceberg pb-10 md:pb-0 px-20 md:px-0"
            >
              <span class="text-iceberg text-md md:text-xl text-center mb-14">UBXT Price</span>
              <span class="text-white text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                $ {{ switcherCurrency === "eth" ? this.finalPriceUbxt.toFixed(4) : this.bscFinalPriceUbxt.toFixed(4) }}
              </span>
            </div>

            <div class="flex flex-col items-center pb-10 md:pb-0 px-20 md:px-0">
              <span class="text-iceberg text-md md:text-xl text-center mb-14">My UBXT Balance</span>
              <span class="text-shakespeare text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                {{ (switcherCurrency === "eth" ? this.ubxtBalance : this.bscUbxtBalance) | convertNumberValue }}
              </span>
            </div>
          </div>
        </template>
      </Card>

      <!-- DESKTOP CONTENT -->
      <div
        v-if="!$breakpoint.mdAndDown"
        class="staking-earn-card__container grid w-full mb-40 mx-auto col-gap-40"
        :class="switcherCurrencyModel !== 'eth' ? 'grid-cols-2' : 'grid-cols-2'"
      >
        <!-- UBXT STAKING CARD -->
        <Card
          :header="false"
          class="staking-earn-card custom-blur-card flex flex-col flex-shrink-0 w-full bg-dark-200 p-20 mx-auto rounded-10"
        >
          <template slot="content">
            <div class="flex items-center justify-center w-full mb-18">
              <div class="mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-27 h-27" />
              </div>

              <div class="flex">
                <span class="text-xxl text-white">UBXT STAKING</span>
              </div>
            </div>

            <div class="flex items-center justify-center w-full mb-32">
              <span class="text-white text-md text-center">Stake UBXT - Earn UBXT</span>
            </div>

            <div class="grid grid-cols-2 col-gap-10 w-full mb-40">
              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">APR (unstable)</span>
                  <span class="staking-earn-card__value text-green-cl-100 text-xxl font-semibold break-all">
                    {{ switcherCurrency === "eth" ? this.farmAPY.toFixed(2) : this.bscFarmAPY.toFixed(2) }}%
                  </span>
                </div>
              </div>

              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">Staked in the pool</span>
                  <span class="staking-earn-card__value text-white text-xxl font-semibold break-all">
                    {{ (switcherCurrency === "eth" ? this.ubxtStaked : this.bscUbxtStaked) | convertNumberValue }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center w-full mt-auto">
              <router-link
                tag="div"
                :to="switcherCurrency === 'eth' ? '/ubxt-staking' : '/ubxt-bsc-staking'"
                class="staking-earn-card__select-btn-wrap flex flex-col max-w-200 w-full mx-auto"
              >
                <AppButton size="sm" type="light-green" class="w-full">Select</AppButton>
              </router-link>
            </div>
          </template>
        </Card>

        <!-- UBXT ETH LP CARD -->
        <Card :header="false" class="staking-earn-card custom-blur-card flex flex-col w-full bg-dark-200 p-20 mx-auto rounded-10">
          <template slot="content">
            <!-- <img src="@/assets/images/dashboard-images/ubxt_usd.svg" alt="ubxt" /> -->
            <div class="flex items-center justify-center w-full mb-20">
              <div class="flex items-center mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-27 h-27" />
                <template>
                  <img
                    :src="switcherCurrency === 'eth' ? require('@/assets/icons/eth-logo.svg') : require('@/assets/icons/busd.svg')"
                    :alt="switcherCurrency === 'eth' ? 'eth' : 'busd'"
                    class="w-27 h-27 -ml-10"
                  />
                </template>
              </div>

              <div class="flex">
                <span class="text-xxl text-white">UBXT - {{ switcherCurrency === "eth" ? "ETH" : "BUSD" }} LP</span>
              </div>
            </div>

            <div class="flex items-center justify-center w-full mb-40">
              <span class="text-white text-md text-center">
                Stake UBXT - {{ switcherCurrency === "eth" ? "ETH-UNI-LPV2" : "BUSD LP" }} & earn UBXT
              </span>
            </div>

            <div class="grid grid-cols-2 col-gap-10 w-full mb-40">
              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">APR (unstable)</span>
                  <span class="staking-earn-card__value text-green-cl-100 text-xxl font-semibold break-all">
                    {{ switcherCurrency === "eth" ? this.lpFarmAPY.toFixed(2) : this.bscLpFarmAPY.toFixed(2) }}%
                  </span>
                </div>
              </div>

              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">Staked in the pool</span>
                  <span class="staking-earn-card__value text-white text-xxl font-semibold break-all">
                    {{ (switcherCurrency === "eth" ? this.lpStakedTotal : this.bscLpStakedTotal) | convertNumberValue }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center w-full mt-auto">
              <router-link
                tag="div"
                :to="switcherCurrency === 'eth' ? '/ubxt-eth-lp-staking' : '/ubxt-busd-lp-staking'"
                class="staking-earn-card__select-btn-wrap flex flex-col max-w-200 w-full mx-auto"
              >
                <AppButton size="sm" type="light-green" class="w-full">Select</AppButton>
              </router-link>
            </div>
          </template>
        </Card>

        <!-- UBXT Vault -->
        <!-- <Card
          v-if="switcherCurrency !== 'eth'"
          :header="false"
          class="staking-earn-card custom-blur-card flex flex-col w-full bg-dark-200 p-20 mx-auto rounded-10"
        >
          <template slot="content">
            <VaultDetails :vaultUSDTStaked="vaultUSDTStaked" />
          </template>
        </Card> -->

        <!-- UBXT STAKING TIP -->
        <div class="staking-earn-card flex items-center bg-blue-dianne border-l-2 border-solid border-iceberg mt-30 px-10 py-10 mx-auto">
          <span class="icon-tips text-iceberg text-xxl1 mr-20" />
          <span class="text-iceberg text-sm leading-xl italic">
            Tip: stake over 2,500 UBXT to get free access to the community bots.
          </span>
        </div>
      </div>

      <!-- MOBILE CONTENT -->
      <div
        v-else
        class="staking-earn-card__container grid w-full mb-40 mx-auto row-gap-40"
        :class="$breakpoint.mdAndDown ? 'row-gap-40' : 'grid-cols-2 col-gap-40'"
      >
        <!-- UBXT STAKING CARD -->
        <Card
          :header="false"
          class="staking-earn-card custom-blur-card flex flex-col flex-shrink-0 w-full bg-dark-200 p-20 mx-auto rounded-10"
        >
          <template slot="content">
            <div class="flex items-center justify-center w-full mb-18">
              <div class="mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-27 h-27" />
              </div>

              <div class="flex">
                <span class="text-xxl text-white">UBXT STAKING</span>
              </div>
            </div>

            <div class="flex items-center justify-center w-full mb-32">
              <span class="text-white text-md text-center">Stake UBXT - Earn UBXT</span>
            </div>

            <div class="grid grid-cols-2 col-gap-10 w-full mb-40">
              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">APR (unstable)</span>
                  <span class="staking-earn-card__value text-green-cl-100 text-xxl font-semibold break-all">
                    {{ switcherCurrency === "eth" ? this.farmAPY.toFixed(2) : this.bscFarmAPY.toFixed(2) }}%
                  </span>
                </div>
              </div>

              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">Staked in the pool</span>
                  <span class="staking-earn-card__value text-white text-xxl font-semibold break-all">
                    {{ (switcherCurrency === "eth" ? this.ubxtStaked : this.bscUbxtStaked) | convertNumberValue }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center w-full mt-auto">
              <router-link
                tag="div"
                :to="switcherCurrency === 'eth' ? '/ubxt-staking' : '/ubxt-bsc-staking'"
                class="staking-earn-card__select-btn-wrap flex flex-col max-w-200 w-full mx-auto"
              >
                <AppButton size="sm" type="light-green" class="w-full">Select</AppButton>
              </router-link>
            </div>
          </template>
        </Card>

        <!-- UBXT STAKING TIP -->
        <div class="staking-earn-card flex items-center bg-blue-dianne border-l-2 border-solid border-iceberg px-10 py-10 mx-auto">
          <span class="icon-tips text-iceberg text-xxl1 mr-20" />
          <span class="text-iceberg text-sm leading-xl italic">
            Tip: stake over 2,500 UBXT to get free access to the algo bots, until the official launch
          </span>
        </div>

        <!-- UBXT ETH LP CARD -->
        <Card :header="false" class="staking-earn-card custom-blur-card flex flex-col w-full bg-dark-200 p-20 mx-auto rounded-10">
          <template slot="content">
            <!-- <img src="@/assets/images/dashboard-images/ubxt_usd.svg" alt="ubxt" /> -->
            <div class="flex items-center justify-center w-full mb-20">
              <div class="flex items-center mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-27 h-27" />
                <template>
                  <img
                    :src="switcherCurrency === 'eth' ? require('@/assets/icons/eth-logo.svg') : require('@/assets/icons/busd.svg')"
                    :alt="switcherCurrency === 'eth' ? 'eth' : 'busd'"
                    class="w-27 h-27 -ml-10"
                  />
                </template>
              </div>

              <div class="flex">
                <span class="text-xxl text-white">UBXT - {{ switcherCurrency === "eth" ? "ETH" : "BUSD" }} LP</span>
              </div>
            </div>

            <div class="flex items-center justify-center w-full mb-40">
              <span class="text-white text-md text-center">
                Stake UBXT - {{ switcherCurrency === "eth" ? "ETH-UNI-LPV2" : "BUSD LP" }} & earn UBXT
              </span>
            </div>

            <div class="grid grid-cols-2 col-gap-10 w-full mb-40">
              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">APR (unstable)</span>
                  <span class="staking-earn-card__value text-green-cl-100 text-xxl font-semibold break-all">
                    {{ switcherCurrency === "eth" ? this.lpFarmAPY.toFixed(2) : this.bscLpFarmAPY.toFixed(2) }}%
                  </span>
                </div>
              </div>

              <div class="flex justify-center">
                <div class="flex flex-col items-center w-full">
                  <span class="text-white text-md mb-8">Staked in the pool</span>
                  <span class="staking-earn-card__value text-white text-xxl font-semibold break-all">
                    {{ (switcherCurrency === "eth" ? this.lpStakedTotal : this.bscLpStakedTotal) | convertNumberValue }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center w-full mt-auto">
              <router-link
                tag="div"
                :to="switcherCurrency === 'eth' ? '/ubxt-eth-lp-staking' : '/ubxt-busd-lp-staking'"
                class="staking-earn-card__select-btn-wrap flex flex-col max-w-200 w-full mx-auto"
              >
                <AppButton size="sm" type="light-green" class="w-full">Select</AppButton>
              </router-link>
            </div>
          </template>
        </Card>

        <!-- UBXT Vault -->
        <!-- <Card
          v-if="switcherCurrency !== 'eth'"
          :header="false"
          class="staking-earn-card custom-blur-card flex flex-col w-full bg-dark-200 p-20 mx-auto rounded-10"
        >
          <template slot="content">
            <VaultDetails :vaultUSDTStaked="vaultUSDTStaked" />
          </template>
        </Card> -->
      </div>

      <!-- COMMUNITY LINKS -->
      <div class="flex items-center justify-center flex-shrink-0 w-full mt-auto">
        <div v-for="(item, index) in links" :key="index" class="flex text-md text-white mr-20 md:mr-40 last:mr-0">
          <a v-if="item.link" :href="item.link" target="_blank" class="flex text-md text-white mr-40 last:mr-0">
            {{ item.label }}
          </a>

          <span v-else class="cursor-pointer" @click="ubxtModalOpen = true">{{ item.label }}</span>
        </div>
      </div>

      <!-- UBXT MODAL -->
      <AppModal v-model="ubxtModalOpen" persistent max-width="550px">
        <UBXTModal />
      </AppModal>

      <!-- WALLET MODAL -->
      <AppModal v-model="walletModalOpen" persistent max-width="500px">
        <div class="relative flex flex-col pt-70 pb-40 px-20 md:px-45">
          <h2 class="font-raleway text-xxl text-white font-bold text-center mb-40">Your wallet:</h2>

          <div class="flex flex-col flex-shrink-0 mb-40">
            <div class="flex">
              <AppInput :value="metamaskAccountLink" type="text" size="sm" class="w-full" readonly ref="walletLink" />
              <div class="flex items-center justify-center w-36 bg-san-juan rounded-5 ml-8 cursor-pointer" @click="copyLink('walletLink')">
                <i class="icon-copy text-white" />
              </div>
            </div>
          </div>

          <AppButton
            type="light-green"
            size="sm"
            class="wallet-modal__btn flex-shrink-0 max-w-200 w-full mx-auto"
            @click="metamaskLogout()"
          >
            Logout
          </AppButton>
        </div>
      </AppModal>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import detectEthereumProvider from "@metamask/detect-provider";
import { default as Web3 } from "web3";
import { namespace } from "vuex-class";
import { GroupItems } from "@/models/interfaces";
// import { BigNumber } from "bignumber.js";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

const staking = namespace("stakingModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import UBXTModal from "@/components/homepage/UBXTModal.vue";
import VaultDetails from "@/components/vault/VaultDetails.vue";

declare global {
  interface Window {
    web3: any;
    // @ts-ignore
    ethereum: any;
  }
}

window.web3 = window.web3 || {};
window.ethereum = window.ethereum || {};

@Component({ name: "Staking", components: { GeneralLayout, UBXTModal, VaultDetails } })
export default class Staking extends Vue {
  /* VUEX */
  @staking.State farmAPY: number;
  @staking.State lpFarmAPY: number;
  @staking.State bscFarmAPY: number;
  @staking.State bscLpFarmAPY: number;
  @staking.State metamaskAccountLink: string;
  @staking.State walletConnected: any;
  @staking.State switcherCurrency: string;
  @staking.Mutation setSwitcherCurrency: any;
  @staking.Action updateFarmAPY: any;
  @staking.Action updateLPFarmAPY: any;
  @staking.Action updateBSCFarmAPY: any;
  @staking.Action updateBSCLPFarmAPY: any;
  @staking.Action updateMetamaskAccountLink: any;
  @staking.Action updateWalletConnected: any;

  /* DATA */
  web3: Web3;
  web3Modal!: any;

  links: { link: string; label: string }[] = [
    { link: "", label: "Buy UBXT" },
    { link: "https://discord.com/invite/wCrdMYEVjd", label: "Discord" },
    { link: "https://t.me/Upbots_announcement", label: "Telegram" },
    { link: "https://upbots.gitbook.io/upbots/getting-started/what-is-upbots", label: "Gitbook" },
  ];
  switcherCurrencyData: GroupItems[] = [
    { value: "eth", label: "ETH" },
    { value: "bsc", label: "BSC" },
  ];
  priceUbxt: any = {};

  finalUbxtPrice: number = 0;
  finalPriceUbxt: number = 0;
  lpStakedTotal: number = 0;
  tokenPerBlock: number = 0;
  totalAllocPoint: number = 0;
  ubxtBalance: number = 0;
  ubxtStaked: number = 0;
  decimals: number = 18;
  totalUbxt: number = 0;
  balance: number = 0;
  totalLp: number = 0;
  bscFinalUbxtPrice: number = 0;
  bscFinalPriceUbxt: number = 0;
  bscLpStakedTotal: number = 0;
  bscTokenPerBlock: number = 0;
  bscTotalAllocPoint: number = 0;
  bscUbxtBalance: number = 0;
  bscUbxtStaked: number = 0;
  vaultUSDTStaked = 0;
  bscTotalUbxt: number = 0;
  bscBalance: number = 0;
  bscTotalLp: number = 0;
  // balance = new BigNumber(0);
  // ubxtBalance = new BigNumber(0);
  // ubxtStaked = new BigNumber(0);
  // ubxtStaked = new BigNumber(0);
  // lpStakedTotal = new BigNumber(0);

  networkType: string = "";

  USDTETHPairAddress: string = `${process.env.VUE_APP_ETH_USDT_PAIR_ADDRESS}`;
  UBXTPairAddress: string = `${process.env.VUE_APP_UBXT_PAIR_ADDRESS}`;
  stakingAddress: string = `${process.env.VUE_APP_STAKING_ADDRESS}`;
  contractAddress: string = `${process.env.VUE_APP_UBXT_ADDRESS}`;
  stakingAbi = require("@/assets/contract/abistaking.json");
  pairAbi = require("@/assets/contract/abisushipair.json");
  erc20Abi = require("@/assets/contract/abiubxt.json");

  bscUSDTETHPairAddress: string = `${process.env.VUE_APP_ETH_USDT_PAIR_ADDRESS}`;
  bscUBXTPairAddress: string = `${process.env.VUE_APP_BSC_UBXT_PAIR_ADDRESS}`;
  bscStakingAddress: string = `${process.env.VUE_APP_BSC_STAKING_ADDRESS}`;
  bscContractAddress: string = `${process.env.VUE_APP_BSC_UBXT_ADDRESS}`;
  vaultAddress = "0xeD1e97E62730E83F1d56459C9025eB88F7F1E576";
  bscStakingAbi = require("@/assets/contract/abibscstaking.json");
  bscPairAbi = require("@/assets/contract/abicakepair.json");
  bscErc20Abi = require("@/assets/contract/abibscubxt.json");
  vaultAbi = require("@/assets/contract/abivault.json");

  isWalletConnectMode: boolean = true;
  isMetamaskEnabled: boolean = false;
  walletModalOpen: boolean = false;
  ubxtModalOpen: boolean = false;

  /* COMPUTED */
  get isMetamaskNetworkMsg() {
    return (
      (this.switcherCurrency === "bsc" && this.networkType && this.networkType !== "private") ||
      (this.switcherCurrency === "eth" && this.networkType && this.networkType !== "main")
    );
  }

  get networkErrorMessage() {
    if (this.switcherCurrency === "bsc" && this.networkType && this.networkType !== "private") {
      return "Please Select Binance Smart Chain Mainnet";
    } else if (this.switcherCurrency === "eth" && this.networkType && this.networkType !== "main") {
      return "Please Select Ethereum Mainnet";
    } else {
      return "";
    }
  }

  get switcherCurrencyModel() {
    return this.switcherCurrency;
  }
  set switcherCurrencyModel(value: string) {
    this.setSwitcherCurrency(value);
    this.checkAccounts();
  }

  /* HOOKS */
  mounted() {
    if (this.isWalletConnectMode) {
      if (this.walletConnected) {
        this.checkWalletEnabled();
      }
    } else {
      if (this.walletConnected) {
        this.checkMetamaskEnabled().then(() => {
          if (this.isMetamaskEnabled) this.connectMetamask();
        });
      }
    }
  }

  /* METHODS */
  async checkWalletEnabled() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: `${process.env.VUE_APP_WEB3_PROVIDER_INFURA_ID}`, // required
        },
      },
    };
    this.web3Modal = new Web3Modal({
      // disableInjectedProvider: true,
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions, // required
    });

    let provider: any = null;
    if (this.web3Modal.cachedProvider == "walletconnect" || this.web3Modal.cachedProvider == "injected") {
      provider = await this.web3Modal.connectTo(this.web3Modal.cachedProvider);
    } else {
      provider = await this.web3Modal.connect();
    }
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: any) => {
      this.checkAccounts();
    });
    // Subscribe to chainId change
    provider.on("chainChanged", (networkId: any) => {
      if (provider.isConnected()) {
        this.checkAccounts();
        this.detectNetworkType();
      }
    });
    // Subscribe to provider connection
    provider.on("connect", (info: { chainId: number }) => {});
    // Subscribe to provider disconnection
    provider.on("disconnect", (error: { code: number; message: string }) => {
      this.metamaskLogout();
    });
    this.isMetamaskEnabled = true;
    this.web3 = new Web3(provider);
    this.updateWalletConnected(true);
    this.checkAccounts();
    this.detectNetworkType();
  }

  async checkMetamaskEnabled() {
    if (typeof window.ethereum !== "undefined") {
      const provider = await detectEthereumProvider();
      provider.on("accountsChanged", (accounts: any) => {
        this.checkAccounts();
      });
      provider.on("networkChanged", (networkId: any) => {
        if (provider.isConnected()) {
          this.checkAccounts();
          this.detectNetworkType();
        }
      });
      if (provider.isConnected()) {
        this.isMetamaskEnabled = true;
        this.connectMetamask();
        this.detectNetworkType();
      }
    } else {
      this.$emit("set-error");
    }
  }

  detectNetworkType() {
    this.web3.eth.net.getNetworkType().then((type) => {
      this.networkType = type;
    });
  }

  async connectMetamask() {
    this.isMetamaskEnabled = false;
    this.web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      this.isMetamaskEnabled = true;
      this.updateWalletConnected(true);
    } catch {
      this.isMetamaskEnabled = false;
    }
    if (this.isMetamaskEnabled) {
      this.checkAccounts();
    }
  }

  async checkAccounts() {
    if (this.web3 === null) return;
    try {
      const accounts = await this.web3.eth.getAccounts();
      this.updateMetamaskAccountLink(accounts[0]);
      if (this.metamaskAccountLink) {
        if (this.switcherCurrency === "eth") {
          await this.getERC20Balance();
          await this.getTotalValueLocked();
          await this.getFarmAPY();
        } else if (this.switcherCurrency === "bsc") {
          await this.getBSCERC20Balance();
          await this.getBSCTotalValueLocked();
          await this.getBSCFarmAPY();
        } else {
          this.finalUbxtPrice = 0;
          this.finalPriceUbxt = 0;
          this.lpStakedTotal = 0;
          this.tokenPerBlock = 0;
          this.totalAllocPoint = 0;
          this.ubxtBalance = 0;
          this.ubxtStaked = 0;
          this.decimals = 18;
          this.totalUbxt = 0;
          this.balance = 0;
          this.totalLp = 0;
          this.bscFinalUbxtPrice = 0;
          this.bscFinalPriceUbxt = 0;
          this.bscLpStakedTotal = 0;
          this.bscTokenPerBlock = 0;
          this.bscTotalAllocPoint = 0;
          this.bscUbxtBalance = 0;
          this.bscUbxtStaked = 0;
          this.vaultUSDTStaked = 0;
          this.bscTotalUbxt = 0;
          this.bscBalance = 0;
          this.bscTotalLp = 0;
        }
      }
    } catch {
      this.$emit("set-error");
    }
  }

  async walletValidated() {
    if (!this.web3 || !this.web3.eth) return false;
    if (this.switcherCurrency === "eth") {
      if ((await this.web3.eth.net.getId()) != 1) return false;
    } else if (this.switcherCurrency === "bsc") {
      if ((await this.web3.eth.net.getId()) != 56) return false;
    } else {
      return false;
    }
    return true;
  }

  // async getPriceUBXT(): Promise<void> {
  //   const contract = new this.web3.eth.Contract(ubxtPayerAbi, UBXTPairAddress);
  //   this.priceUbxt = await contract.methods.getReserves().call();
  // this.finalPriceUbxt = this.priceUbxt._reserve0/ this.priceUbxt._reserve1;
  // }

  async getPriceUBXT(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const ubxtEthContract = new this.web3.eth.Contract(this.pairAbi, this.UBXTPairAddress);
    let data = await ubxtEthContract.methods.getReserves().call();
    const ubxtEthPrice = data._reserve0 / data._reserve1;
    const usdtEthContract = new this.web3.eth.Contract(this.pairAbi, this.USDTETHPairAddress);
    data = await usdtEthContract.methods.getReserves().call();
    const usdtEthPrice = data._reserve0 / data._reserve1 / Math.pow(10, 12);
    this.finalPriceUbxt = 1 / (ubxtEthPrice * usdtEthPrice);
  }

  async getBSCPriceUBXT(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const bscUbxtBusdContract = new this.web3.eth.Contract(this.bscPairAbi, this.bscUBXTPairAddress);
    let data = await bscUbxtBusdContract.methods.getReserves().call();
    const ubxtBusdPrice = data._reserve0 / data._reserve1;
    this.bscFinalPriceUbxt = 1 / ubxtBusdPrice;
  }

  async getTotalValueLocked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    await this.getPriceUBXT();
    await this.getTotalUbxtStaked();
    await this.getTotalUniLpStaked();
    this.balance = this.totalUbxt + this.totalLp;
  }

  async getBSCTotalValueLocked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    await this.getBSCPriceUBXT();
    await this.getBSCTotalUbxtStaked();
    await this.getBSCTotalPancakeLpStaked();
    await this.getVaultUSDTStaked();
    this.bscBalance = this.bscTotalUbxt + this.bscTotalLp + this.vaultUSDTStaked;
  }

  async getERC20Balance(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.erc20Abi, this.contractAddress);
    this.ubxtBalance = await contract.methods.balanceOf(this.metamaskAccountLink).call();
    this.ubxtBalance = this.ubxtBalance / Math.pow(10, this.decimals);
  }

  async getBSCERC20Balance(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.bscErc20Abi, this.bscContractAddress);
    this.bscUbxtBalance = await contract.methods.balanceOf(this.metamaskAccountLink).call();
    this.bscUbxtBalance = this.bscUbxtBalance / Math.pow(10, this.decimals);
  }

  async getTotalUbxtStaked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    this.ubxtStaked = await contract.methods.totalStakedUBXT().call();
    this.ubxtStaked = this.ubxtStaked / Math.pow(10, this.decimals);
    this.totalUbxt = this.finalPriceUbxt * this.ubxtStaked;
  }

  async getBSCTotalUbxtStaked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.bscStakingAbi, this.bscStakingAddress);
    this.bscUbxtStaked = await contract.methods.totalStakedUBXT().call();
    this.bscUbxtStaked = this.bscUbxtStaked / Math.pow(10, this.decimals);
    this.bscTotalUbxt = this.bscFinalPriceUbxt * this.bscUbxtStaked;
  }

  async getVaultUSDTStaked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.vaultAbi, this.vaultAddress);
    this.vaultUSDTStaked = (await contract.methods._stakedTokenPool().call()) / Math.pow(10, 18);
  }

  async getTotalUniLpStaked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const MockLpApi = require("@/assets/contract/abiunipair.json");
    const MockLpAddress = `${process.env.VUE_APP_LP_ADDRESS}`;
    const contract = new this.web3.eth.Contract(MockLpApi, MockLpAddress);
    this.lpStakedTotal = await contract.methods.balanceOf(this.stakingAddress).call();
    this.lpStakedTotal = this.lpStakedTotal / Math.pow(10, this.decimals);
    const lpPrice = 29;
    this.totalLp = lpPrice * this.lpStakedTotal;
  }

  async getBSCTotalPancakeLpStaked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const MockLpApi = require("@/assets/contract/abicakepair.json");
    const MockLpAddress = `${process.env.VUE_APP_BSC_LP_ADDRESS}`;
    const contract = new this.web3.eth.Contract(MockLpApi, MockLpAddress);
    this.bscLpStakedTotal = await contract.methods.balanceOf(this.bscStakingAddress).call();
    this.bscLpStakedTotal = this.bscLpStakedTotal / Math.pow(10, this.decimals);
    const lpPrice = 0.52;
    this.bscTotalLp = lpPrice * this.bscLpStakedTotal;
  }

  async getTokenPerBlock(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    this.totalAllocPoint = await contract.methods.totalAllocPoint().call();
    this.tokenPerBlock = await contract.methods.tokenPerBlock().call();
    this.tokenPerBlock = this.tokenPerBlock / Math.pow(10, 18);
  }

  async getBSCTokenPerBlock(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.bscStakingAbi, this.bscStakingAddress);
    this.bscTotalAllocPoint = await contract.methods.totalAllocPoint().call();
    this.bscTokenPerBlock = await contract.methods.tokenPerBlock().call();
    this.bscTokenPerBlock = this.bscTokenPerBlock / Math.pow(10, 18);
  }

  async getFarmAPY(): Promise<void> {
    if (!(await this.walletValidated())) return;
    await this.getTokenPerBlock();
    const blockPerYear = 6560 * 365;
    let poolInfo;
    let poolAllocPoint;
    let tokenPerBlock;
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    poolInfo = await contract.methods.poolInfo(0).call();
    if (poolInfo) {
      poolAllocPoint = poolInfo[1];
    }
    tokenPerBlock = (this.tokenPerBlock * poolAllocPoint) / this.totalAllocPoint;
    const ubxtPrice = this.finalPriceUbxt;
    const lpPrice = 29;
    const apy = !this.ubxtStaked ? 0 : ((tokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (this.ubxtStaked * ubxtPrice)) * 100;
    this.updateFarmAPY({ apy });
    poolInfo = await contract.methods.poolInfo(1).call();
    if (poolInfo) {
      poolAllocPoint = poolInfo[1];
    }
    tokenPerBlock = (this.tokenPerBlock * poolAllocPoint) / this.totalAllocPoint;
    const lpApy = !this.lpStakedTotal ? 0 : ((tokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (this.lpStakedTotal * lpPrice)) * 100;
    this.updateLPFarmAPY({ apy: lpApy });
  }

  async getBSCFarmAPY(): Promise<void> {
    if (!(await this.walletValidated())) return;
    await this.getBSCTokenPerBlock();
    const blockPerYear = 20 * 60 * 24 * 365;
    let poolInfo;
    let bscPoolAllocPoint;
    let bscTokenPerBlock;
    const contract = new this.web3.eth.Contract(this.bscStakingAbi, this.bscStakingAddress);
    poolInfo = await contract.methods.poolInfo(0).call();
    if (poolInfo) {
      bscPoolAllocPoint = poolInfo[1];
    }
    bscTokenPerBlock = (this.bscTokenPerBlock * bscPoolAllocPoint) / this.bscTotalAllocPoint;
    const ubxtPrice = this.bscFinalPriceUbxt;
    const apy = !this.bscUbxtStaked ? 0 : ((bscTokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (this.bscUbxtStaked * ubxtPrice)) * 100;
    this.updateBSCFarmAPY({ apy });
    poolInfo = await contract.methods.poolInfo(2).call();
    if (poolInfo) {
      bscPoolAllocPoint = poolInfo[1];
    }
    bscTokenPerBlock = (this.bscTokenPerBlock * bscPoolAllocPoint) / this.bscTotalAllocPoint;
    const lpPrice = 0.52;
    const lpApy = !this.bscLpStakedTotal
      ? 0
      : ((bscTokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (this.bscLpStakedTotal * lpPrice)) * 100;
    this.updateBSCLPFarmAPY({ apy: lpApy });
  }

  copyLink(ref: string) {
    const copyText = (this.$refs as any)[ref].$children[0].$el.children[0] as HTMLInputElement;
    copyText.select();
    document.execCommand("copy");
  }

  async metamaskLogout() {
    this.web3 = null;
    this.updateWalletConnected(false);
    this.updateMetamaskAccountLink("");
    this.networkType = "";
    this.walletModalOpen = false;
    if (this.isWalletConnectMode) {
      this.web3Modal.clearCachedProvider();
    }
  }
}
</script>

<style lang="scss" scoped>
.staking-buttons-group {
  &__wrap {
    max-width: 500px;
  }
}

::v-deep .staking-earn-card {
  max-width: 430px;
  &__container {
    max-width: 1200px;
  }

  &__value {
    @media (min-width: 768px) {
      font-size: 28px;
    }
  }
}

.metamask-connect-btn {
  min-width: 175px;
  max-width: 175px;
  @media (max-width: 767px) {
    min-width: 150px;
    max-width: 150px;
  }
}
</style>
