<template>
  <GeneralLayout
    :title="!$breakpoint.smAndDown && 'UBXT-ETH LP STAKING'"
    content-custom-classes="flex-col overflow-y-auto custom-scrollbar"
  >
    <!-- LINK TO EARN PAGE -->
    <router-link
      v-if="!$breakpoint.smAndDown"
      slot="header-nav-left-start"
      to="/staking"
      tag="div"
      class="flex items-center flex-shrink-0 cursor-pointer mr-20"
    >
      <span class="icon-arrow-back text-xxl text-astral" />
    </router-link>

    <div slot="header-right-side-start" class="flex items-center flex-shrink-0 md:mx-20">
      <div class="metamask-connect-btn relative w-full mr-10 md:mr-20">
        <!-- METAMASK CONNECTED STATE -->
        <AppButton
          v-if="this.metamaskAccountLink"
          type="light-green"
          size="xxs"
          class="flex-shrink-0 w-full"
          @click="walletModalOpen = true"
        >
          {{ this.metamaskAccountLink | truncStringPortion }}
        </AppButton>

        <!-- METAMASK CONNECT STATE -->
        <template v-else>
          <template v-if="isWalletConnectMode">
            <AppButton
              v-if="!$breakpoint.smAndDown"
              type="light-green"
              size="xxs"
              class="flex-shrink-0 w-full"
              @click="checkWalletEnabled()"
            >
              Connect to Wallet
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
        <p
          v-if="this.networkType && this.networkType !== 'main'"
          class="absolute top-40 left-0 text-red-cl-100 text-xs md:text-sm leading-xs"
        >
          <span class="icon-warning1 mr-4" />
          <span>{{ this.networkErrorMessage }}</span>
        </p>
      </div>

      <!-- MORE INFO -->
      <a
        v-if="!$breakpoint.smAndDown"
        href="https://upbots.gitbook.io/upbots/getting-started/what-is-upbots"
        target="_blank"
        class="flex-shrink-0"
      >
        <AppButton type="light-green" size="xxs">More Info</AppButton>
      </a>
    </div>

    <div class="flex flex-col flex-grow w-full mt-30 md:mt-0 md:pt-40 pb-40 md:pb-0 px-20 md:px-0 overflow-auto custom-scrollbar">
      <!-- LINK TO EARN PAGE -->
      <div v-if="$breakpoint.smAndDown" class="flex items-center justify-between flex-shrink-0 mb-30">
        <router-link slot="header-nav-left-start" to="/staking" tag="div" class="flex items-center flex-shrink-0 cursor-pointer">
          <span class="icon-arrow-back text-xxl text-astral mr-20" />

          <span class="font-raleway text-md md:text-xl leading:sm md:leading-xs text-iceberg whitespace-no-wrap">UBXT-ETH LP STAKING</span>
        </router-link>

        <a href="https://upbots.gitbook.io/upbots/getting-started/what-is-upbots" target="_blank" class="flex-shrink-0 ml-20">
          <AppButton type="light-green" size="xxs">More Info</AppButton>
        </a>
      </div>

      <!-- CARD VALUES -->
      <Card :header="false" class="flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 mb-40 md:mb-66">
        <template slot="content">
          <div class="grid md:grid-cols-3 row-gap-10 md:row-gap-0 md:col-gap-20 md:p-20">
            <div
              class="flex flex-col items-center border-b md:border-b-0 md:border-r border-solid border-iceberg py-10 md:py-0 px-20 md:px-0"
            >
              <span class="text-iceberg text-md md:text-xl text-center mb-14">Total staked in the pool</span>
              <span class="text-white text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                {{ this.totalLPStaked | convertNumberValue }}
              </span>
            </div>

            <div
              class="flex flex-col items-center border-b md:border-b-0 md:border-r border-solid border-iceberg pb-10 md:pb-0 px-20 md:px-0"
            >
              <span class="text-iceberg text-md md:text-xl text-center mb-14">APR</span>
              <span class="text-shakespeare text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                {{ this.lpFarmAPY.toFixed(2) }}%
              </span>
            </div>

            <div class="flex flex-col items-center pb-10 md:pb-0 px-20 md:px-0">
              <span class="text-iceberg text-md md:text-xl text-center mb-14">Your % in the Pool</span>
              <span class="text-white text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                {{ this.poolAllocationLP.toFixed(2) }}%
              </span>
            </div>
          </div>
        </template>
      </Card>

      <div
        class="ubxt-staking-card__container grid col-gap-20 w-full mb-40 mx-auto"
        :class="$breakpoint.mdAndDown ? 'row-gap-40' : 'grid-cols-2 col-gap-40'"
      >
        <!-- UBXT EARNED -->
        <Card
          :header="false"
          class="ubxt-staking-card custom-blur-card flex flex-col flex-shrink-0 w-full bg-dark-200 p-20 mx-auto rounded-10"
        >
          <template slot="content">
            <div class="h-64 mx-auto mb-30">
              <img src="@/assets/images/dashboard-images/ubxt_earned.svg" alt="ubxt_earned" />
            </div>

            <div class="flex flex-col flex-grow">
              <div class="flex items-center justify-center w-full mb-16">
                <span class="text-white text-center text-md">UBXT EARNED</span>
              </div>

              <div class="flex items-center justify-center w-full mb-50">
                <span class="ubxt-staking-card__value text-white text-xxl text-center break-all">
                  {{ this.ubxtEarned | convertNumberValue }}
                </span>
              </div>

              <div class="flex">
                <AppButton type="light-green" size="sm" class="flex-shrink-0 max-w-200 w-full mx-auto" @click="claimPendingReward()">
                  Claim
                </AppButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- UBXT-ETH LP STACKED -->
        <Card
          :header="false"
          class="ubxt-staking-card custom-blur-card flex flex-col flex-shrink-0 w-full bg-dark-200 p-20 mx-auto rounded-10"
        >
          <template slot="content">
            <div class="h-64 mx-auto mb-30">
              <img src="@/assets/images/dashboard-images/ubxt_stacked2.svg" alt="ubxt_stacked" />
            </div>

            <div class="flex flex-col flex-grow">
              <div class="flex items-center justify-center w-full mb-16">
                <span class="text-white text-center text-md">UBXT-ETH LP STAKED</span>
              </div>

              <div class="flex items-center justify-center w-full mb-50">
                <div class="flex mr-20">
                  <span class="ubxt-staking-card__value text-white text-xxl text-center break-all">
                    {{ this.amount | convertNumberValue }}
                  </span>
                </div>

                <div class="flex">
                  <AppButton type="light-green" size="xxs" class="flex-shrink-0" @click="ubxtModalOpen = true">Buy</AppButton>
                </div>
              </div>

              <div v-if="isApproved" class="flex items-center justify-center mt-auto mb-20">
                <AppButton
                  type="light-green"
                  size="sm"
                  class="ubxt-eth-lp-staking-card__btn-plus w-full mr-20"
                  @click="isDepositModalOpen = true"
                >
                  Add UBXT-ETH LP
                </AppButton>

                <AppButton
                  type="light-green"
                  size="sm"
                  class="ubxt-eth-lp-staking-card__btn-claim w-full"
                  @click="isWithdrawModalOpen = true"
                >
                  Claim & Withdraw
                </AppButton>
              </div>

              <div v-else class="flex items-center justify-center mt-auto mb-20">
                <AppButton
                  type="light-green"
                  size="sm"
                  class="ubxt-eth-lp-staking-card__btn-plus max-w-200 w-full"
                  @click="approveLPStake()"
                >
                  Approve
                </AppButton>
              </div>

              <div class="flex items-center justify-center w-full">
                <span class="text-white text-sm text-center italic break-all">
                  Fees : Deposit 0%, Withdrawal 0,3%
                </span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- UNISWAP LINK -->
      <div class="flex items-center justify-center flex-shrink-0 w-full mb-40">
        <a
          href="https://app.uniswap.org/#/add/0x8564653879a18c560e7c0ea0e084c516c62f5653/ETH"
          target="_blank"
          class="uniswap-btn__wrap w-full"
        >
          <AppButton type="light-green" size="xs" class="w-full mx-auto">
            <img src="@/assets/images/trade-images/uniswap.png" alt="uniswap" class="mr-10 w-20" />
            <span>Add Liquidity on Uniswap</span>
          </AppButton>
        </a>
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

          <AppButton type="light-green" size="sm" class="flex-shrink-0 max-w-200 w-full mx-auto" @click="metamaskLogout()">
            Logout
          </AppButton>
        </div>
      </AppModal>

      <!-- DEPOSIT MODAL -->
      <AppModal v-model="isDepositModalOpen" persistent max-width="450px">
        <div class="custom-blur-card rounded-5 relative flex flex-col pt-50 pb-40 px-20 md:px-45">
          <div class="flex items-center justify-center border-b border-solid border-iceberg mb-10 pb-5">
            <h2 class="font-raleway font-semibold text-xxl text-white text-center mr-5">Deposit UBXT-ETH LP</h2>

            <img src="@/assets/images/staking/staking-upbots-icon.svg" alt="staking-upbots" class="w-60" />
          </div>

          <p class="w-full text-white text-center mb-30">& Earn UBXT</p>

          <div class="flex flex-col flex-shrink-0 mb-40">
            <div class="flex items-center mb-5">
              <AppInput v-model="depositValue" type="number" size="sm" class="deposit-modal__input w-full">
                <div
                  class="flex items-center justify-center absolute right-0 px-10 h-full cursor-pointer"
                  @click="depositValue = lpBalance"
                >
                  <span class="text-shakespeare underline text-sm">Max</span>
                </div>
              </AppInput>
            </div>

            <div class="flex justify-end">
              <div class="flex items-center justify-center">
                <span class="text-md text-iceberg mr-3">Total available:</span>
                <span class="text-md text-shakespeare">{{ this.lpBalance }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center w-full">
            <AppButton
              v-if="isApproved"
              type="light-green"
              size="sm"
              class="deposit-modal__btn flex-shrink-0 w-full"
              @click="depositLPStake()"
            >
              Confirm
            </AppButton>

            <AppButton v-else type="light-green" size="sm" class="deposit-modal__btn flex-shrink-0 w-full" @click="approveLPStake()">
              Approve
            </AppButton>
          </div>
          <a href="https://app.uniswap.org/#/add/0x8564653879a18c560e7c0ea0e084c516c62f5653/ETH" target="_blank">
            <div class="mt-28 flex items-center">
              <div class="underline text-white">Add Liquidity on Uniswap</div>
              <img src="@/assets/icons/export-icon.svg" alt="uniswap" class="ml-8 w-14 h-14" />
            </div>
          </a>
        </div>
      </AppModal>

      <!-- WITHDRAW MODAL -->
      <AppModal v-model="isWithdrawModalOpen" persistent max-width="450px">
        <div class="custom-blur-card rounded-5 relative flex flex-col pt-50 pb-40 px-20 md:px-45">
          <div class="flex items-center justify-center border-b border-solid border-iceberg mb-30 pb-5">
            <h2 class="font-raleway font-semibold text-xxl text-white text-center mr-5">Withdraw UBXT-ETH LP</h2>

            <img src="@/assets/images/staking/staking-upbots-icon.svg" alt="staking-upbots" class="w-60" />
          </div>

          <div class="flex flex-col flex-shrink-0 mb-40">
            <div class="flex items-center mb-5">
              <AppInput v-model="withdrawValue" type="number" size="sm" class="withdraw-modal__input w-full">
                <div class="flex items-center justify-center absolute right-0 px-10 h-full cursor-pointer" @click="withdrawValue = amount">
                  <span class="text-shakespeare underline text-sm">Max</span>
                </div>
              </AppInput>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex">
                <span class="text-grey-cl-920 italic">~ {{ conversionRateUBXT ? conversionRateUBXT.toFixed(2) : 0 }} USD</span>
              </div>
              <div class="flex items-center justify-center">
                <span class="text-md text-iceberg mr-3">Total available:</span>
                <span class="text-md text-shakespeare">{{ this.amount }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center w-full">
            <AppButton type="light-green" size="sm" class="withdraw-modal__btn flex-shrink-0 w-full" @click="withdrawLPStake()">
              Confirm
            </AppButton>
          </div>
          <a href="https://app.uniswap.org/#/add/0x8564653879a18c560e7c0ea0e084c516c62f5653/ETH" target="_blank">
            <div class="mt-28 flex items-center">
              <div class="underline text-white">Add Liquidity on Uniswap</div>
              <img src="@/assets/icons/export-icon.svg" alt="uniswap" class="ml-8 w-14 h-14" />
            </div>
          </a>
        </div>
      </AppModal>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { default as Web3 } from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { BigNumber } from "bignumber.js";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

const staking = namespace("stakingModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import UBXTModal from "@/components/homepage/UBXTModal.vue";

@Component({ name: "UBXTETHLPStaking", components: { GeneralLayout, UBXTModal } })
export default class UBXTStaking extends Vue {
  /* VUEX */
  @staking.State lpFarmAPY: number;
  @staking.State metamaskAccountLink: string;
  @staking.State walletConnected: any;
  @staking.Action updateLPFarmAPY: any;
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
  lpStake: any = {};

  conversionRateUBXT: number = 0;
  poolAllocationLP: number = 0;
  finalPriceUbxt: number = 0;
  tokenPerBlock: number = 0;
  totalAllocPoint: number = 0;
  poolAllocPoint: number = 0;
  totalLPStaked: number = 0;
  withdrawValue: number = 0;
  depositValue: number = 0;
  ubxtEarned: number = 0;
  lpBalance: number = 0;
  decimals: number = 18;
  amount: number = 0;
  // feeAPY: number = 0;

  networkErrorMessage: string = "Please Select Ethereum Mainnet";
  networkType: string = "";

  USDTETHPairAddress: string = `${process.env.VUE_APP_ETH_USDT_PAIR_ADDRESS}`;
  UBXTPairAddress: string = `${process.env.VUE_APP_UBXT_PAIR_ADDRESS}`;
  stakingAbi = require("@/assets/contract/abistaking.json");
  stakingAddress = `${process.env.VUE_APP_STAKING_ADDRESS}`;
  pairAbi = require("@/assets/contract/abisushipair.json");
  lpAbi = require("@/assets/contract/abiunipair.json");
  lpAddress = `${process.env.VUE_APP_LP_ADDRESS}`;
  // contractAddress: string = `${process.env.VUE_APP_UBXT_ADDRESS}`;

  isWithdrawModalOpen: boolean = false;
  isDepositModalOpen: boolean = false;
  isWalletConnectMode: boolean = true;
  isMetamaskEnabled: boolean = false;
  walletModalOpen: boolean = false;
  ubxtModalOpen: boolean = false;
  isApproved: boolean = false;
  loading: boolean = false;

  /* WATCHERS */
  @Watch("depositValue", { immediate: true })
  handleDepositValueChanged(val: string) {
    if (val) {
      this.conversionRateUBXT = Number(val) * this.finalPriceUbxt;
    } else {
      this.conversionRateUBXT = 0;
    }
  }

  /* HOOKS */
  mounted() {
    if (this.isWalletConnectMode) {
      this.checkWalletEnabled();
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

    const provider = await this.web3Modal.connect();
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
      provider.on("networkChanged", async (networkId: any) => {
        if (provider.isConnected()) {
          await this.checkAccounts();
          this.detectNetworkType();
        }
      });
      if (provider.isConnected()) {
        this.isMetamaskEnabled = true;
        await this.connectMetamask();
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
    if (this.isMetamaskEnabled) this.checkAccounts();
  }

  async checkAccounts() {
    if (this.web3 === null) return;
    try {
      const accounts = await this.web3.eth.getAccounts();
      this.updateMetamaskAccountLink(accounts[0]);
      if (this.metamaskAccountLink) {
        this.getPendingRewardUBXT();
        this.getLPBalance();
        this.poolPercentage();
        this.getFarmAPY();
        this.getApproved();
      }
    } catch {
      this.$emit("set-error");
    }
  }

  async walletValidated() {
    if (!this.web3 || !this.web3.eth || (await this.web3.eth.net.getId()) != 1) return false;
    return true;
  }

  async getLPBalance(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contractlp = new this.web3.eth.Contract(this.lpAbi, this.lpAddress);
    this.lpBalance = await contractlp.methods.balanceOf(this.metamaskAccountLink).call();
    this.lpBalance = this.lpBalance / Math.pow(10, this.decimals);
  }

  async getPendingRewardUBXT(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    this.ubxtEarned = await contract.methods.pendingToken(1, this.metamaskAccountLink).call();
    this.ubxtEarned = this.ubxtEarned / Math.pow(10, this.decimals);
  }

  async claimPendingReward(): Promise<void> {
    if (!(await this.walletValidated())) return;
    if (this.ubxtEarned > 0) {
      const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
      this.loading = true;
      contract.methods
        .deposit(1, 0)
        .send({
          from: this.metamaskAccountLink,
        })
        .on("transactionHash", (hash: any) => {
          this.loading = false;
        })
        .on("receipt", (receipt: any) => {
          this.$notify({ text: "Success!", type: "success" });
          this.getPendingRewardUBXT();
          this.lpStakedAmount();
          this.getLPBalance();
          this.getTotalLPStaked();
          this.poolPercentage();
          this.getFarmAPY();
        })
        .on("error", (err: any, receipt: any) => {
          this.$notify({ text: "Fail!", type: "error" });
          this.loading = false;
        });
    } else {
      this.$notify({ text: "Fail!", type: "error" });
      this.loading = false;
    }
  }

  async lpStakedAmount(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    this.lpStake = await contract.methods.userInfo(1, this.metamaskAccountLink).call();
    this.amount = this.lpStake.amount / Math.pow(10, this.decimals);
  }

  async getTotalLPStaked(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    const lpContract = new this.web3.eth.Contract(this.lpAbi, this.lpAddress);
    this.totalLPStaked = await lpContract.methods.balanceOf(this.stakingAddress).call();
    this.totalLPStaked = this.totalLPStaked / Math.pow(10, this.decimals);
  }

  async poolPercentage(): Promise<void> {
    if (!(await this.walletValidated())) return;
    await this.lpStakedAmount();
    await this.getTotalLPStaked();
    if (this.amount == 0 || this.totalLPStaked == 0) {
      this.poolAllocationLP = 0;
    } else {
      this.poolAllocationLP = (this.amount / this.totalLPStaked) * 100;
    }
  }

  async withdrawLPStake(): Promise<void> {
    if (!(await this.walletValidated())) return;
    this.withdrawModalClose();
    var withdrawV = new BigNumber(this.withdrawValue);
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    if (withdrawV.gt(0) && withdrawV.lte(this.amount)) {
      this.loading = true;
      withdrawV = withdrawV.multipliedBy(Math.pow(10, 18));
      const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
      let lpStaked = new BigNumber((await contract.methods.userInfo(1, this.metamaskAccountLink).call()).amount);
      if (withdrawV.gt(lpStaked)) {
        withdrawV = lpStaked;
      }
      contract.methods
        .withdraw(1, `0x${withdrawV.toString(16)}`)
        .send({
          from: this.metamaskAccountLink,
        })
        .on("transactionHash", (hash: any) => {
          this.loading = false;
          this.withdrawValue = 0;
        })
        .on("receipt", (receipt: any) => {
          this.$notify({ text: "Withdraw LP Success!", type: "success" });
          this.getPendingRewardUBXT();
          this.lpStakedAmount();
          this.getLPBalance();
          this.getTotalLPStaked();
          this.poolPercentage();
          this.getFarmAPY();
        })
        .on("error", (err: any, receipt: any) => {
          this.loading = false;
          this.$notify({ text: "Withdraw LP Failed!", type: "error" });
        });
    } else {
      this.loading = false;
      this.$notify({ text: "Incorrect Input!", type: "error" });
    }
  }

  async approveLPStake(): Promise<void> {
    if (!(await this.walletValidated())) return;
    this.depositModalClose();
    const contractUbxt = new this.web3.eth.Contract(this.lpAbi, this.lpAddress);
    this.loading = true;
    contractUbxt.methods
      .approve(this.stakingAddress, `0x${new BigNumber(2).pow(256).minus(1).toString(16)}`)
      .send({ from: this.metamaskAccountLink })
      .on("transactionHash", (hash: any) => {
        this.loading = false;
      })
      .on("receipt", (receipt: any) => {
        this.isApproved = true;
        this.$notify({ text: "Approve LP success!", type: "success" });
      })
      .on("error", (err: any, receipt: any) => {
        this.loading = false;
        this.$notify({ text: "Approve LP Failed!", type: "error" });
      });
  }

  async depositLPStake(): Promise<void> {
    if (!(await this.walletValidated())) return;
    this.depositModalClose();
    var depositu = new BigNumber(this.depositValue);
    if (depositu.gt(0) && depositu.lte(this.lpBalance)) {
      depositu = depositu.multipliedBy(Math.pow(10, 18));
      const contractlp = new this.web3.eth.Contract(this.lpAbi, this.lpAddress);
      let lpBal = new BigNumber(await contractlp.methods.balanceOf(this.metamaskAccountLink).call());
      if (depositu.gt(lpBal)) {
        depositu = lpBal;
      }
      this.loading = true;
      const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
      contract.methods
        .deposit(1, `0x${depositu.toString(16)}`)
        .send({
          from: this.metamaskAccountLink,
        })
        .on("transactionHash", (hash: any) => {
          this.loading = false;
          this.depositValue = 0;
        })
        .on("receipt", (receipt: any) => {
          this.$notify({ text: "Deposit LP success!", type: "success" });
          this.getPendingRewardUBXT();
          this.getLPBalance();
          this.lpStakedAmount();
          this.getTotalLPStaked();
          this.poolPercentage();
          this.getFarmAPY();
        })
        .on("error", (err: any, receipt: any) => {
          this.loading = false;
          this.$notify({ text: "Deposit LP Failed!", type: "error" });
        });
    } else {
      this.$notify({ text: "Incorrect Input!", type: "error" });
    }
  }

  async getTokenPerBlock(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contract = new this.web3.eth.Contract(this.stakingAbi, this.stakingAddress);
    this.totalAllocPoint = await contract.methods.totalAllocPoint().call();
    const poolInfo = await contract.methods.poolInfo(1).call();
    if (poolInfo) {
      this.poolAllocPoint = poolInfo[1];
    }
    this.tokenPerBlock = await contract.methods.tokenPerBlock().call();
    this.tokenPerBlock = this.tokenPerBlock / Math.pow(10, 18);
  }

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

  async getFarmAPY(): Promise<void> {
    if (!(await this.walletValidated())) return;
    await this.getTotalLPStaked();
    await this.getTokenPerBlock();
    await this.getPriceUBXT();
    const blockPerYear = 6560 * 365;
    const tokenPerBlock = (this.tokenPerBlock * this.poolAllocPoint) / this.totalAllocPoint;
    const ubxtPrice = this.finalPriceUbxt;
    const lpPrice = 29;
    var apy = this.totalLPStaked === 0 ? 0 : ((tokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (this.totalLPStaked * lpPrice)) * 100;
    this.updateLPFarmAPY({ apy });
  }

  async getApproved(): Promise<void> {
    if (!(await this.walletValidated())) return;
    const contractUbxt = new this.web3.eth.Contract(this.lpAbi, this.lpAddress);
    const allowBalance = await contractUbxt.methods.allowance(this.metamaskAccountLink, this.stakingAddress).call();
    this.isApproved = !new BigNumber(allowBalance).isZero();
  }

  depositModalClose() {
    this.isDepositModalOpen = false;
  }

  withdrawModalClose() {
    this.isWithdrawModalOpen = false;
  }

  copyLink(ref: string) {
    const copyText = (this.$refs as any)[ref].$children[0].$el.children[0] as HTMLInputElement;
    copyText.select();
    document.execCommand("copy");
  }

  metamaskLogout() {
    this.web3 = null;
    this.updateWalletConnected(false);
    this.updateMetamaskAccountLink(null);
    this.networkType = "";
    this.walletModalOpen = false;
    if (this.isWalletConnectMode) {
      this.web3Modal.clearCachedProvider();
    }
  }
}
</script>

<style lang="scss" scoped>
.ubxt-staking-card {
  &__container {
    max-width: 900px;
  }

  &__value {
    @media (min-width: 768px) {
      font-size: 28px;
    }
  }

  @media (max-width: 1024px) {
    max-width: 430px;
  }
}

::v-deep .ubxt-staking-card {
  &__btn-plus,
  &__btn-minus {
    .icon-minus-stroke,
    .icon-plus-stroke {
      @apply text-xxl3;
    }
  }
}

.ubxt-eth-lp-staking-card {
  &__btn-plus,
  &__btn-claim {
    max-width: 150px;
  }
}

::v-deep .deposit-modal,
.withdraw-modal {
  &__btn {
    @apply max-w-200;
  }

  &__input {
    .input {
      @apply pr-45;
    }
  }
}

.uniswap-btn {
  &__wrap {
    max-width: 300px;
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
