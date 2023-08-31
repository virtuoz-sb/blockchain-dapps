<template>
  <GeneralLayout :title="!$breakpoint.smAndDown && 'UBXT Bridge'" content-custom-classes="flex-col overflow-y-auto custom-scrollbar">
    <!-- METAMASK CONNECTION -->
    <div slot="header-right-side-start" class="metamask-connect-btn relative w-full flex-shrink-0 ml-10 md:mx-20">
      <AppButton v-if="this.metamaskAccountLink" type="light-green" size="xxs" class="flex-shrink-0 w-full" @click="walletModalOpen = true">
        {{ this.metamaskAccountLink | truncStringPortion }}
      </AppButton>

      <template v-else>
        <AppButton v-if="!$breakpoint.smAndDown" type="light-green" size="xxs" class="flex-shrink-0 w-full" @click="checkMetamaskEnabled()">
          Connect to Metamask
        </AppButton>

        <AppButton v-else type="light-green" size="xxs" class="flex-shrink-0 w-full" @click="checkMetamaskEnabled()">
          <img src="@/assets/icons/metamask.svg" alt="metamask" class="h-18 mr-8" />
          <span>Connect</span>
        </AppButton>
      </template>

      <!-- METAMASK WRONG NETWORK MESSAGE -->
      <p v-if="!isCorrectNetwork" class="absolute top-40 left-0 text-red-cl-100 text-xs md:text-sm leading-xs">
        <span class="icon-warning1 mr-4" />
        <span>Wrong Network</span>
      </p>
    </div>

    <div class="flex flex-col flex-grow w-full overflow-y-auto custom-scrollbar">
      <div class="flex flex-col flex-shrink-0 w-full mt-20 md:mt-0 px-20 md:px-0">
        <p
          v-if="$breakpoint.smAndDown"
          class="font-raleway text-md md:text-xl leading:sm md:leading-xs text-iceberg whitespace-no-wrap mb-20"
        >
          UBXT Bridge
        </p>

        <!-- UBXT BRIDGE DESCRIPTION -->
        <SwapDescription />
      </div>

      <div class="bridge-card__container flex flex-col w-full mx-auto pt-10 mt-20 px-20 pb-20 md:pb-0 overflow-y-auto custom-scrollbar">
        <!-- BRIDGE CARD -->
        <Card :header="false" class="custom-blur-card flex flex-col flex-shrink-0 w-full bg-dark-200 p-20 md:p-40 rounded-10">
          <template slot="content">
            <div class="flex flex-col">
              <div class="flex items-center justify-center mb-4">
                <p class="text-xl md:text-xxl text-iceberg">From</p>

                <SwapInfo :data="swapInfo" :srcChainName="srcChainName" :dstChainName="dstChainName" />

                <p class="text-xl md:text-xxl text-iceberg ml-auto">
                  {{ srcUbxtBalance | toTwoDecimalDigitFixed }} UBXT ({{ bridgeWay ? "ERC20" : "BEP20" }})
                </p>
              </div>

              <SwapInput
                v-model="ubxtAmountToTx"
                :chainName="srcChainName"
                :minAmount="minUbxtAmountToTx"
                :maxAmount="maxUbxtAmountToTx"
                :address="metamaskAccountLink"
                placeholder="0"
              />
            </div>

            <div class="flex justify-center items-center my-20">
              <span
                class="icon-swap-new block text-white text-xl md:text-xxl transform rotate-90 cursor-pointer"
                @click="setBridgeWay(!bridgeWay)"
              />
            </div>

            <div class="flex flex-col mb-30">
              <div class="flex items-center justify-center mb-4">
                <span class="text-xl md:text-xxl text-iceberg">To</span>
                <span class="text-xl md:text-xxl text-iceberg ml-auto">
                  {{ dstUbxtBalance | toTwoDecimalDigitFixed }} UBXT ({{ bridgeWay ? "BEP20" : "ERC20" }})
                </span>
              </div>

              <SwapInput
                readonly
                :chainName="dstChainName"
                placeholder="0"
                :value="acceptedUbxtAmount"
                :minAmount="0"
                :maxAmount="maxUbxtAmountToTx"
                :address="metamaskAccountLink"
              />
            </div>

            <div class="flex flex-col items-center justify-center w-full mt-auto">
              <AppButton
                v-if="this.metamaskAccountLink"
                :disabled="!canTransfer"
                size="md"
                type="light-green"
                class="w-full"
                @click="transferUBXT()"
              >
                Transfer
              </AppButton>

              <AppButton v-else size="md" type="light-green" class="w-full" @click="checkMetamaskEnabled()">
                Connect Wallet
              </AppButton>
            </div>

            <div
              v-if="showTransactionHistory"
              class="relative flex items-center text-white border border-solid border-grey-cl-200 rounded-5 p-20 mt-20"
            >
              <p class="flex absolute right-10 top-10 cursor-pointer" @click="closeTransactionHistory()">
                <i class="icon-cross text-sm text-grey-cl-100" />
              </p>

              <div class="mr-20">
                <AppLoader v-if="transTransactionHash == ''" />
                <i v-else-if="transTransactionResult" class="icon-success text-blue-cl-200" />
                <i v-else class="icon-cross text-red-cl-200" />
              </div>

              <div class="flex-grow">
                <span v-if="transTransactionHash == ''">Transfer transaction is pending...</span>
                <span v-else>Transfer transaction{{ transTransactionResult ? " successful" : " failed" }}</span>
              </div>

              <div v-if="transTransactionHash && transTransactionResult" class="ml-20">
                <span class="pl-4 cursor-pointer" @click="copyTransactionHash()">
                  <i class="icon-copy text-white" />
                </span>

                <a :href="getTransactionLink()" target="_blank" class="hover:text-white hover:underline ml-8 cursor-pointer">
                  <i class="icon-swap text-white" />
                </a>
              </div>
            </div>
          </template>
        </Card>

        <div class="flex flex-shrink-0 text-iceberg ml-auto mt-8">Powered by Multichain</div>

        <div class="flex flex-shrink-0 mt-12 p-12 text-md flex italic bg-dark-200 rounded-10">
          <i class="text-warning icon-warning mr-6 pt-5" />
          <span class="text-white">Depending on the network situation, it may take up to 2 hours to validate the transaction.</span>
        </div>
      </div>

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

          <AppButton type="light-green" size="sm" class="wallet-modal__btn flex-shrink-0 w-full mx-auto" @click="metamaskLogout()">
            Logout
          </AppButton>
        </div>
      </AppModal>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
// eslint-disable-next-line
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import detectEthereumProvider from "@metamask/detect-provider";
import { default as Web3 } from "web3";
import { default as BN } from "bn.js";

import GeneralLayout from "@/views/GeneralLayout.vue";
import SwapDescription from "@/components/ubxt-bridge/SwapDescription.vue";
import SwapInfo from "@/components/ubxt-bridge/SwapInfo.vue";
import SwapInput from "@/components/ubxt-bridge/SwapInput.vue";

const ubxtBridge = namespace("ubxtBridgeModule");
import { UbxtBridgeServerInfo, ChainID, EthNetLink, BscNetLink } from "@/store/ubxt-bridge/types";

window.web3 = window.web3 || {};
window.ethereum = window.ethereum || {};

@Component({ name: "UbxtBridge", components: { GeneralLayout, SwapDescription, SwapInfo, SwapInput } })
export default class UbxtBridge extends Vue {
  /* VUEX */
  @ubxtBridge.State metamaskAccountLink: string;
  @ubxtBridge.State serverInfo: UbxtBridgeServerInfo;
  @ubxtBridge.State ethUbxtContractAddress: string;
  @ubxtBridge.State bscUbxtContractAddress: string;
  @ubxtBridge.State eth2bscDepositAddress: string;
  @ubxtBridge.State bridgeWay: boolean; // true: eth->bsc, false: bsc->eth
  @ubxtBridge.State networkId: number; // 1: eth, 56: bsc
  @ubxtBridge.Mutation setBridgeWay: any;
  @ubxtBridge.Mutation setNetworkId: any;
  @ubxtBridge.Action updateMetamaskAccountLink: any;
  @ubxtBridge.Action updateWalletConnected: any;
  @ubxtBridge.Action fetchServerInfo: any;
  @ubxtBridge.Action registerAccount: any;

  web3: Web3;
  ethWeb3: Web3;
  bscWeb3: Web3;
  isMetamaskEnabled: boolean = false;

  decimals: number = 18;
  ethUbxtContractAbi = require("@/assets/contract/abiubxt.json");
  bscUbxtContractAbi = require("@/assets/contract/abiubxt-bsc.json");
  ubxtAmountToTx: number = null;
  ethUbxtBalance: number = 0;
  bscUbxtBalance: number = 0;

  loading: boolean = false;
  showTransactionHistory: boolean = false;
  transTransactionHash: string = "";
  transTransactionResult: boolean = true;
  walletModalOpen: boolean = false;

  /* COMPUTED */
  get isCorrectNetwork() {
    if (this.bridgeWay && this.networkId === ChainID.CHAIN_ETH) {
      return true;
    } else if (!this.bridgeWay && this.networkId === ChainID.CHAIN_BSC) {
      return true;
    }
    return false;
  }

  get swapInfo() {
    return this.bridgeWay ? this.serverInfo.SrcToken : this.serverInfo.DestToken;
  }

  get srcChainName() {
    return this.bridgeWay ? "eth" : "bsc";
  }

  get dstChainName() {
    return this.bridgeWay ? "bsc" : "eth";
  }

  get srcUbxtBalance() {
    return this.bridgeWay ? this.ethUbxtBalance : this.bscUbxtBalance;
  }

  get dstUbxtBalance() {
    return this.bridgeWay ? this.bscUbxtBalance : this.ethUbxtBalance;
  }

  get minUbxtAmountToTx() {
    if (!this.serverInfo.SrcToken || !this.serverInfo.DestToken) {
      return 0;
    }
    return this.bridgeWay ? this.serverInfo.SrcToken.MinimumSwap : this.serverInfo.DestToken.MinimumSwap;
  }

  get maxUbxtAmountToTx() {
    if (!this.serverInfo.SrcToken || !this.serverInfo.DestToken) {
      return 0;
    }
    const serverMaxValue = this.bridgeWay ? this.serverInfo.SrcToken.MaximumSwap : this.serverInfo.DestToken.MaximumSwap;
    return Math.min(this.srcUbxtBalance, serverMaxValue);
  }

  get canTransfer() {
    if (!this.metamaskAccountLink || !this.isCorrectNetwork) {
      return false;
    }
    if (this.ubxtAmountToTx < this.minUbxtAmountToTx || this.ubxtAmountToTx > this.maxUbxtAmountToTx) {
      return false;
    }
    return true;
  }

  get acceptedUbxtAmount() {
    if (!this.canTransfer) {
      return 0;
    }
    if (!this.serverInfo.SrcToken || !this.serverInfo.DestToken) {
      return 0;
    }
    let txFee = this.ubxtAmountToTx * this.swapInfo.SwapFeeRate;
    txFee = Math.max(txFee, this.swapInfo.MinimumSwapFee);
    txFee = Math.min(txFee, this.swapInfo.MaximumSwapFee);
    let acceptedAmount = Math.floor(this.ubxtAmountToTx - txFee);
    return acceptedAmount;
  }

  /* HOOKS */
  mounted() {
    this.fetchServerInfo();
    this.checkMetamaskEnabled();
  }

  /* METHODS */
  async checkMetamaskEnabled() {
    if (typeof window.ethereum !== "undefined") {
      const provider = await detectEthereumProvider();
      if (provider) {
        provider.on("accountsChanged", async (accounts: any) => {
          await this.checkAccounts();
        });

        provider.on("networkChanged", async (networkId: any) => {
          this.setNetworkId(networkId);
          if (provider.isConnected()) {
            await this.checkAccounts();
            await this.detectNetworkType();
          }
        });

        if (provider.isConnected()) {
          await this.connectMetamask();
          await this.detectNetworkType();
        }
      }
    } else {
      this.$emit("set-error");
    }
  }

  async connectMetamask(): Promise<void> {
    this.isMetamaskEnabled = false;
    this.web3 = new Web3(window.ethereum);
    this.ethWeb3 = new Web3(EthNetLink);
    this.bscWeb3 = new Web3(BscNetLink);
    try {
      await window.ethereum.enable();
      this.isMetamaskEnabled = true;
      await this.checkAccounts();
      this.updateWalletConnected(true);
    } catch {
      this.isMetamaskEnabled = false;
    }
  }

  async detectNetworkType(): Promise<any> {
    this.web3.eth.net.getId().then((id) => {
      this.setNetworkId(id);
      Promise.resolve(id);
    });
    Promise.resolve(0);
  }

  async checkAccounts(): Promise<void> {
    if (this.web3 === null) return;
    try {
      const accounts = await this.web3.eth.getAccounts();
      await this.updateMetamaskAccountLink(accounts[0]);
      await this.getEthBalance();
      await this.getBscBalance();
    } catch (e) {
      this.$emit("set-error");
    }
  }

  async getEthBalance(): Promise<any> {
    const contract = new this.ethWeb3.eth.Contract(this.ethUbxtContractAbi, this.ethUbxtContractAddress);
    this.ethUbxtBalance = await contract.methods.balanceOf(this.metamaskAccountLink).call();
    this.ethUbxtBalance = this.ethUbxtBalance / Math.pow(10, this.decimals);
    Promise.resolve(this.ethUbxtBalance);
  }

  async getBscBalance(): Promise<void> {
    const contract = new this.bscWeb3.eth.Contract(this.bscUbxtContractAbi, this.bscUbxtContractAddress);
    this.bscUbxtBalance = await contract.methods.balanceOf(this.metamaskAccountLink).call();
    this.bscUbxtBalance = this.bscUbxtBalance / Math.pow(10, this.decimals);
    Promise.resolve(this.bscUbxtBalance);
  }

  async metamaskLogout() {
    this.web3 = null;
    this.updateWalletConnected(false);
    this.updateMetamaskAccountLink("");
    this.setBridgeWay(true);
    this.setNetworkId(1);
    this.ubxtAmountToTx = null;
    this.ethUbxtBalance = 0;
    this.bscUbxtBalance = 0;
    this.walletModalOpen = false;
  }

  closeTransactionHistory() {
    this.showTransactionHistory = false;
    this.transTransactionHash = "";
    this.transTransactionResult = false;
  }

  getTransactionLink() {
    const ethExplorer = `https://etherscan.io/address/${this.transTransactionHash}`;
    const bscExplorer = `https://bscscan.com/address/${this.transTransactionHash}`;
    return this.bridgeWay ? ethExplorer : bscExplorer;
  }

  isValidAddress(address: string) {
    const isValid = this.web3.utils.isAddress(address);
    return isValid;
  }

  parseNumber(amount: number, decimal: number) {
    let decimalb = 10 ** decimal;
    const decimals = new BN(decimalb.toString());
    return new BN(new BN(amount).mul(decimals));
  }

  async transferUBXT(): Promise<void> {
    if (this.bridgeWay) {
      await this.depositUBXT();
    } else {
      await this.withdrawUBXT();
    }
  }

  async getBalance() {
    var web3Balance = await this.web3.eth.getBalance(this.metamaskAccountLink);
    const decimals = parseInt(web3Balance) / 10 ** this.decimals;
    return decimals;
  }

  async depositUBXT(): Promise<void> {
    const depositValue = Math.floor(Number(this.ubxtAmountToTx));
    var depositBalance = this.parseNumber(depositValue, this.decimals);
    const contract = new this.web3.eth.Contract(this.ethUbxtContractAbi, this.ethUbxtContractAddress);

    const minGasFee = 0.002203;
    const ethBalance = await this.getBalance();
    if (ethBalance < minGasFee) {
      const eventText = "You don't have enought ETH to make the transaction";
      this.$notify({ text: eventText, duration: 15000, type: "error" });
      return;
    }

    try {
      if (!this.isValidAddress(this.metamaskAccountLink)) {
        await this.registerAccount(this.metamaskAccountLink);
      }
    } catch (e) {
      return;
    }

    this.loading = true;
    this.showTransactionHistory = true;
    this.transTransactionHash = "";
    this.transTransactionResult = true;
    contract.methods
      .transfer(this.eth2bscDepositAddress, depositBalance)
      .send({
        from: this.metamaskAccountLink,
      })
      .on("transactionHash", (hash: any) => {
        this.transTransactionHash = hash;
        this.transTransactionResult = true;
        this.loading = false;
      })
      .on("receipt", async (receipt: any) => {
        this.$notify({ text: "UBXT Swapping is Success!", type: "success" });
        await this.getEthBalance();
        await this.getBscBalance();
      })
      .on("error", async (err: any, receipt: any) => {
        this.transTransactionHash = "failed";
        this.transTransactionResult = false;
        this.loading = false;
        this.$notify({ text: "UBXT Swapping is Failed!", type: "error" });
      });
  }

  async withdrawUBXT(): Promise<void> {
    const withdrawValue = Math.floor(Number(this.ubxtAmountToTx));
    var withdrawBalance = this.parseNumber(withdrawValue, this.decimals);
    const contract = new this.web3.eth.Contract(this.bscUbxtContractAbi, this.bscUbxtContractAddress);

    try {
      if (!this.isValidAddress(this.metamaskAccountLink)) {
        await this.registerAccount(this.metamaskAccountLink);
      }
    } catch (e) {
      return;
    }

    this.loading = true;
    this.showTransactionHistory = true;
    this.transTransactionHash = "";
    this.transTransactionResult = true;

    contract.methods
      .Swapout(withdrawBalance, this.metamaskAccountLink)
      .send({
        from: this.metamaskAccountLink,
      })
      .on("transactionHash", (hash: any) => {
        this.transTransactionHash = hash;
        this.transTransactionResult = true;
        this.loading = false;
      })
      .on("receipt", async (receipt: any) => {
        this.$notify({ text: "UBXT Swapping is Success!", type: "success" });
        await this.getEthBalance();
        await this.getBscBalance();
      })
      .on("error", async (err: any, receipt: any) => {
        this.transTransactionHash = "failed";
        this.transTransactionResult = false;
        this.loading = false;
        this.$notify({ text: "UBXT Swapping is Failed!", type: "error" });
      });
  }

  copyLink(ref: string) {
    const copyText = (this.$refs as any)[ref].$children[0].$el.children[0] as HTMLInputElement;
    copyText.select();
    document.execCommand("copy");
  }

  copyTransactionHash() {
    var tempInput = document.createElement("input");
    tempInput.value = this.transTransactionHash;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }
}
</script>

<style lang="scss" scoped>
.bridge-card {
  &__container {
    max-width: 480px;
  }
}

.wallet-modal {
  &__btn {
    max-width: 200px;
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
