<template>
  <GeneralLayout :title="!$breakpoint.smAndDown && 'UBXT VAULT'" content-custom-classes="flex-col overflow-y-auto custom-scrollbar">
    <!-- LINK TO EARN PAGE -->
    <router-link
      v-if="!$breakpoint.smAndDown"
      slot="header-nav-left-start"
      tag="div"
      to="/staking"
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

        <p v-if="isWrongChain" class="absolute top-40 left-0 text-red-cl-100 text-xs md:text-sm leading-xs">
          <span class="icon-warning1 mr-4" />
          <span>Please Select Binance Smart Chain Mainnet</span>
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

          <span class="font-raleway text-md md:text-xl leading:sm md:leading-xs text-iceberg whitespace-no-wrap">UBXT VAULT</span>
        </router-link>

        <a href="https://upbots.gitbook.io/upbots/getting-started/what-is-upbots" target="_blank" class="flex-shrink-0 ml-20">
          <AppButton type="light-green" size="xxs">More Info</AppButton>
        </a>
      </div>

      <!-- CARD VALUES -->
      <Card :header="false" class="flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 mb-40 md:mb-66">
        <template slot="content">
          <div class="grid md:grid-cols-2 xl:grid-cols-4 row-gap-10 md:row-gap-20 xl:row-gap-0 md:col-gap-20 md:p-20">
            <div
              class="flex flex-col items-center border-b md:border-b-0 md:border-r border-solid border-iceberg py-10 md:py-0 px-20 md:pl-0 md:pr-10"
            >
              <span class="text-iceberg text-md md:text-xl text-center mb-14">Total staked in the pool</span>
              <span class="text-shakespeare text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                {{ this.poolTotal }}
              </span>
            </div>

            <div class="flex flex-col items-center border-b md:border-b-0 border-solid border-iceberg pb-10 md:pb-0 px-20 md:pl-0 md:pr-10">
              <span class="text-iceberg text-md md:text-xl text-center mb-14">APY</span>
              <span class="text-xxl1 md:text-xxl2 text-center text-white font-semibold">{{ this.globalAPY }}</span>
            </div>

            <div
              class="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-solid border-iceberg pb-10 md:pb-0 px-20 md:pl-0 md:pr-10"
            >
              <span class="text-iceberg text-md md:text-xl mb-14"
                >Internal APY
                <span class="text-white font-semibold text-md md:text-xl ml-24">{{ this.internalAPY }}</span>
              </span>

              <span class="text-iceberg text-md md:text-xl mb-14"
                >UBXT APY
                <span class="text-white font-semibold text-md md:text-xl ml-24">{{ this.ubxtAPY }}</span>
              </span>
            </div>

            <div class="flex flex-col items-center pb-10 md:pb-0 px-20 md:px-0">
              <span class="text-iceberg text-md md:text-xl text-center mb-14">Your % in the Pool</span>
              <span class="text-white text-xxl1 md:text-xxl2 text-center font-semibold break-all">
                {{ this.poolUserOwned.toFixed(2) }}%
              </span>
            </div>
          </div>
        </template>
      </Card>

      <div
        class="ubxt-eth-lp-staking-card__container grid row-gap-40 w-full mb-40 mx-auto"
        :class="{ 'grid-cols-2 row-gap-0 col-gap-40': !$breakpoint.mdAndDown }"
      >
        <!-- UBXT EARNED -->
        <Card
          :header="false"
          class="ubxt-eth-lp-staking-card custom-blur-card flex flex-col flex-shrink-0 w-full bg-dark-200 p-20 rounded-10 flex"
        >
          <template slot="content">
            <div class="h-64 mx-auto mb-30">
              <img src="@/assets/images/dashboard-images/ubxt_earned.svg" alt="ubxt_earned" />
            </div>

            <div class="flex justify-between flex-col flex-grow">
              <div class="flex items-center justify-center w-full mb-16">
                <span class="text-white text-center text-md">UBXT EARNED</span>
              </div>

              <div class="flex items-end justify-center w-full mb-10">
                <span class="ubxt-eth-lp-staking-card__value text-white text-xxl text-center break-all leading-xs">
                  {{ this.earnedUBXT }}
                </span>
              </div>

              <div class="flex flex-col mb-20">
                <AppButton type="light-green" size="sm" class="flex-shrink-0 max-w-200 w-full mx-auto" @click="claimUBXT">
                  Claim
                </AppButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- Vault Crypto -->
        <Card
          :header="false"
          class="ubxt-eth-lp-staking-card custom-blur-card flex flex-col flex-shrink-0 w-full bg-dark-200 p-20 mx-auto rounded-10"
        >
          <template slot="content">
            <div class="h-64 mx-auto mb-30">
              <div class="flex items-center">
                <CryptoCoinChecker v-for="coin in ['USDT']" :key="coin" :data="coin" class="mr-5">
                  <template slot-scope="{ isExist, coinName, srcCoin }">
                    <img
                      v-if="isExist"
                      :src="require(`@/assets/icons/${srcCoin}.png`)"
                      :alt="srcCoin"
                      class="-ml-10"
                      style="width: 46px; height: 46px;"
                    />
                    <cryptoicon v-else :symbol="coinName" size="46" generic class="-ml-10" />
                  </template>
                </CryptoCoinChecker>
              </div>
            </div>

            <div class="flex flex-col flex-grow">
              <div class="flex items-center justify-center w-full mb-50">
                <span class="text-white text-center text-md">USDT STAKED</span>
              </div>

              <div class="flex items-center justify-center w-full mb-30">
                <div class="flex mr-20">
                  <span class="ubxt-eth-lp-staking-card__value text-white text-xxl text-center break-all">
                    {{ stakedValue }}
                  </span>
                </div>
              </div>

              <div v-if="isApproved" class="flex items-center justify-center mb-20">
                <AppButton
                  type="light-green"
                  size="sm"
                  class="ubxt-eth-lp-staking-card__btn-claim w-full mr-12"
                  @click="buyModalOpen = true"
                >
                  Deposit
                </AppButton>
                <AppButton
                  type="light-green"
                  size="sm"
                  class="ubxt-eth-lp-staking-card__btn-claim w-full"
                  @click="withdrawalModalOpen = true"
                >
                  Withdraw
                </AppButton>
              </div>

              <div v-else class="flex items-center justify-center mb-20">
                <AppButton
                  type="light-green"
                  size="sm"
                  class="ubxt-eth-lp-staking-card__btn-plus max-w-200 w-full"
                  @click="approveUSDTContract"
                >
                  Approve
                </AppButton>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- COMMUNITY LINKS -->
      <div class="flex items-center justify-center flex-shrink-0 w-full mt-auto">
        <div v-for="(item, index) in links" :key="index" class="flex text-md text-white mr-20 md:mr-40 last:mr-0">
          <a :href="item.link" target="_blank" class="flex text-md text-white mr-40 last:mr-0">
            {{ item.label }}
          </a>
        </div>
      </div>

      <!-- BUY MODAL -->
      <AppModal v-model="buyModalOpen" persistent max-width="550px">
        <VaultBuyModal :depositUSDT="depositUSDT" :maxUSDT="maxUSDT" />
      </AppModal>

      <!-- WALLET MODAL -->
      <AppModal v-model="walletModalOpen" persistent max-width="500px">
        <div class="relative flex flex-col pt-70 pb-40 px-20 md:px-45">
          <h2 class="font-raleway text-xxl text-white font-bold text-center mb-40">Your wallet:</h2>

          <div class="flex flex-col flex-shrink-0 mb-40">
            <div class="flex">
              <AppInput ref="walletLink" :value="metamaskAccountLink" type="text" size="sm" class="w-full" readonly />
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

      <!-- WITHDRAW MODAL -->
      <AppModal v-model="withdrawalModalOpen" persistent max-width="450px">
        <div class="custom-blur-card rounded-5 relative flex flex-col pt-50 pb-40 px-20 md:px-45">
          <div class="flex items-center justify-center border-b border-solid border-iceberg mb-30 pb-5">
            <h2 class="font-raleway font-semibold text-xxl text-white text-center mr-5">Withdraw USDT</h2>
            <img src="@/assets/images/staking/staking-upbots-icon.svg" alt="staking-upbots" class="w-60" />
          </div>

          <div class="flex flex-col flex-shrink-0 mb-40">
            <div class="flex items-center mb-5">
              <AppInput v-model="withdrawValue" type="number" size="sm" class="withdraw-modal__input w-full">
                <div class="flex items-center justify-center absolute right-0 px-10 h-full">
                  <span class="text-shakespeare text-sm">USDT</span>
                </div>
              </AppInput>
            </div>
          </div>

          <div class="flex items-center justify-around w-full">
            <AppButton type="light-green" size="sm" class="withdraw-modal__btn flex-shrink-0 w-full" @click="withdrawUSDT">
              Withdraw
            </AppButton>

            <AppButton type="light-green" size="sm" class="withdraw-modal__btn flex-shrink-0 w-full" @click="withdrawAllUSDT">
              Withdraw all
            </AppButton>
          </div>
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
import VaultBuyModal from "@/components/vault/VaultBuyModal.vue";

@Component({ name: "UBXTVault", components: { GeneralLayout, VaultBuyModal } })
export default class UBXTVault extends Vue {
  @staking.State metamaskAccountLink: string;
  @staking.Action updateMetamaskAccountLink: any;
  @staking.State walletConnected: any;
  @staking.Action updateWalletConnected: any;

  web3: Web3;
  web3Modal!: any;
  totalApr = 0;
  poolTotal = 0;
  poolUserOwned = 0;
  earnedUBXT = 0;
  withdrawValue = 0;
  stakedValue = 0;
  maxUSDT = 10;
  networkType = "";
  isApproved = false;
  buyModalOpen = false;
  withdrawalModalOpen = false;
  walletModalOpen = false;
  isWalletConnectMode = true;
  isMetamaskEnabled = false;
  erc20Abi = require("@/assets/contract/abi.json");
  vaultAbi = require("@/assets/contract/abivault.json");
  vaultAddress = "0xeD1e97E62730E83F1d56459C9025eB88F7F1E576";
  // vaultAddress = `${process.env.VUE_APP_VAULT_ADDRESS}`;
  _vaultContract: any = null;

  links: { link: string; label: string }[] = [
    { link: "https://discord.com/invite/wCrdMYEVjd", label: "Discord" },
    { link: "https://t.me/Upbots_announcement", label: "Telegram" },
    { link: "https://upbots.gitbook.io/upbots/getting-started/what-is-upbots", label: "Gitbook" },
  ];

  get globalAPY() {
    return this.totalApr ? (this.totalApr * 0.89).toFixed(2) + "%" : "N/A";
  }

  get internalAPY() {
    return this.totalApr ? (this.totalApr * 0.89).toFixed(2) + "%" : "N/A";
  }

  get ubxtAPY() {
    return this.totalApr ? (this.totalApr * 0.89).toFixed(2) + "%" : "N/A";
  }

  get isWrongChain() {
    return this.networkType && this.networkType !== "private";
  }

  mounted() {
    this.fetchApr();

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

  vaultContract() {
    if (!this._vaultContract) this._vaultContract = new this.web3.eth.Contract(this.vaultAbi, this.vaultAddress);
    return this._vaultContract;
  }

  async fetchNetworkType() {
    this.networkType = await this.web3.eth.net.getNetworkType();
  }

  async fetchApr() {
    try {
      const { data } = await this.$http.get("https://s.belt.fi/info/all.json");
      this.totalApr = data.info.BSC.vaultPools.find((e: any) => e.name === "4Belt").totalAPR;
    } catch {
      this.$notify({ text: "Couldn't fetch APR for vault", type: "warning" });
    }
  }

  async fetchPoolStats() {
    const contract = this.vaultContract();
    this.stakedValue = (await contract.methods.stakedTokens(this.metamaskAccountLink).call()) / Math.pow(10, 18);
    this.poolTotal = (await contract.methods._stakedTokenPool().call()) / Math.pow(10, 18);
    if (this.poolTotal && this.stakedValue) {
      this.poolUserOwned = (this.stakedValue / this.poolTotal) * 100;
    }
  }

  async fetchEarnedUBXT() {
    const contract = this.vaultContract();
    this.earnedUBXT = (await contract.methods.currentRewards(this.metamaskAccountLink).call()) / Math.pow(10, 18);
  }

  async fetchApprovedStatus() {
    const contractUSDT = new this.web3.eth.Contract(this.erc20Abi, "0x55d398326f99059ff775485246999027b3197955");
    const allowedBalance = await contractUSDT.methods.allowance(this.metamaskAccountLink, this.vaultAddress).call();
    this.isApproved = !new BigNumber(allowedBalance).isZero();
  }

  async fetchMaxUSDT() {
    const contractUSDT = new this.web3.eth.Contract(this.erc20Abi, "0x55d398326f99059ff775485246999027b3197955");
    this.maxUSDT = (await contractUSDT.methods.balanceOf(this.metamaskAccountLink).call()) / Math.pow(10, 18);
  }

  async approveUSDTContract(): Promise<void> {
    const contractUSDT = new this.web3.eth.Contract(this.erc20Abi, "0x55d398326f99059ff775485246999027b3197955");
    contractUSDT.methods
      .approve(this.vaultAddress, `0x${new BigNumber(2).pow(256).minus(1).toString(16)}`)
      .send({ from: this.metamaskAccountLink })
      .on("receipt", () => {
        this.isApproved = true;
        this.$notify({ text: "Approved Successfully!", type: "success" });
      })
      .on("error", () => {
        this.$notify({ text: "Approval process failed!", type: "error" });
      });
  }

  async depositUSDT(amount: number) {
    const contract = this.vaultContract();
    let depositValue = new BigNumber(amount);
    depositValue = depositValue.multipliedBy(Math.pow(10, 18));

    contract.methods
      .deposit(`0x${depositValue.toString(16)}`)
      .send({
        from: this.metamaskAccountLink,
      })
      .on("receipt", () => {
        this.$notify({ text: "Deposit successfull!", type: "success" });
        this.checkAccounts();
      })
      .on("error", () => {
        this.$notify({ text: "Deposit failed!", type: "error" });
      });
  }

  async withdrawUSDT() {
    let withdrawValue = new BigNumber(this.withdrawValue);
    if (withdrawValue.gt(0) && withdrawValue.lte(this.stakedValue)) {
      withdrawValue = withdrawValue.multipliedBy(Math.pow(10, 18));
      const contract = this.vaultContract();
      contract.methods
        .withdraw(`0x${withdrawValue.toString(16)}`)
        .send({
          from: this.metamaskAccountLink,
        })
        .on("transactionHash", (hash: any) => {
          this.withdrawValue = 0;
        })
        .on("receipt", () => {
          this.$notify({ text: "Withdrawal successfull!", type: "success" });
          this.checkAccounts();
        })
        .on("error", () => {
          this.$notify({ text: "Withdrawal failed!", type: "error" });
        });
    } else {
      this.$notify({ text: "Incorrect input!", type: "error" });
    }
  }

  async withdrawAllUSDT() {
    const contract = this.vaultContract();
    contract.methods
      .withdrawAll()
      .send({
        from: this.metamaskAccountLink,
      })
      .on("transactionHash", (hash: any) => {
        this.withdrawValue = 0;
      })
      .on("receipt", (receipt: any) => {
        this.$notify({ text: "Withdrawal successfull!", type: "success" });
        this.checkAccounts();
      })
      .on("error", (err: any, receipt: any) => {
        this.$notify({ text: "Withdrawal failed!", type: "error" });
      });
  }

  claimUBXT() {
    const contract = this.vaultContract();
    contract.methods
      .claimUBXT(this.metamaskAccountLink)
      .send({
        from: this.metamaskAccountLink,
      })
      .on("receipt", (receipt: any) => {
        this.$notify({ text: "Withdrawal successfull!", type: "success" });
        this.checkAccounts();
      })
      .on("error", (err: any, receipt: any) => {
        this.$notify({ text: "Withdrawal failed!", type: "error" });
      });
  }

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
        }
      });
      if (provider.isConnected()) {
        this.isMetamaskEnabled = true;
        this.connectMetamask();
      }
    } else {
      this.$emit("set-error");
    }
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
        this.fetchPoolStats();
        this.fetchEarnedUBXT();
        this.fetchApprovedStatus();
        this.fetchMaxUSDT();
        this.fetchNetworkType();
      }
    } catch {
      this.$emit("set-error");
    }
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
    this.walletModalOpen = false;
    if (this.isWalletConnectMode) {
      this.web3Modal.clearCachedProvider();
    }
  }
}
</script>

<style lang="scss" scoped>
.ubxt-eth-lp-staking-card {
  &__container {
    max-width: 900px;
  }
  &__value {
    @media (min-width: 768px) {
      font-size: 28px;
    }
  }

  &__value {
    @media (min-width: 768px) {
      font-size: 28px;
    }
  }

  &__btn-plus,
  &__btn-claim {
    max-width: 150px;
  }

  @media (max-width: 1024px) {
    max-width: 430px;
  }
}

::v-deep .deposit-modal,
.withdraw-modal {
  &__btn {
    @apply max-w-120;
  }

  &__input {
    .input {
      @apply pr-45;
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
