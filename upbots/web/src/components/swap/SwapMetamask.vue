<template>
  <!-- ACTIVE METAMASK -->
  <div v-if="isMetamaskEnabled" slot="content" class="flex flex-col items-center flex-grow px-20 md:px-0">
    <div class="flex flex-col flex-1 w-full mb-20">
      <div class="flex items-center justify-center w-full mb-10">
        <img src="@/assets/icons/wallet-icon.svg" alt="wallet" class="icon-wallet" />
      </div>

      <div class="flex flex-col w-full h-full">
        <div class="flex flex-col w-full mb-12">
          <p class="text-iceberg text-sm leading-md mb-8">Address:</p>
          <AppInput v-model="formattedMetamaskAccountLink" type="text" size="sm" readonly @click="copyLink" />
        </div>

        <div class="flex items-center mb-12">
          <div class="flex-shrink-0 text-iceberg leading-xs mr-5">ETH Balance:</div>
          <div class="block text-bright-turquoise truncate w-full">{{ balance | toDefaultFixed }}</div>
        </div>

        <div class="flex items-center">
          <div class="flex-shrink-0 text-iceberg leading-xs mr-5">UBXT Balance:</div>
          <div class="block text-bright-turquoise truncate w-full">{{ ubxtBalance | toDefaultFixed }}</div>
        </div>
      </div>
    </div>

    <AppButton
      type="light-green-bordered"
      icon="icon-refresh mr-5"
      class="w-full mt-auto"
      :size="$breakpoint.smAndDown ? 'md' : 'xs'"
      @click="connectMetamask"
    >
      <span>Refresh</span>
    </AppButton>
  </div>

  <!-- INACTIVE METAMASK -->
  <div v-else slot="content" class="flex flex-col flex-grow items-center flex-shrink-0 px-20 md:px-0">
    <p class="text-md text-iceberg text-center leading-md mb-12">
      Welcome to our decentralized exchange aggregator! Enter the trade you want to make on decentralized exchanges and our tools will scan
      multiple DEXs to give you the best price and combination for your transaction!
    </p>
    <img src="@/assets/icons/wallet-icon.svg" alt="wallet" class="icon-wallet mb-5" />
    <AppButton type="yellow" class="w-full mt-auto" @click="connectMetamask">Connect Wallet</AppButton>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import detectEthereumProvider from "@metamask/detect-provider";

import { default as Web3 } from "web3";

@Component({ name: "SwapMetamask" })
export default class SwapMetamask extends Vue {
  /* DATA */
  web3: Web3;
  isMetamaskEnabled: boolean = false;
  balance: string = "";
  ubxtBalance: string = "";
  metamaskAccountLink: string = "";
  formattedMetamaskAccountLink = "";
  erc20Abi = require("@/components/profile/erc20Abi.json");
  contractAddress = `${process.env.VUE_APP_WEB3_UBXTOKEN_PROXY_CONTRACT_ADDRESS}`;

  /* WATCHERS */
  @Watch("getError", { immediate: true })
  handleError(message: string) {
    if (message) this.$notify({ text: message, type: "error" });
  }

  /* HOOKS */
  async mounted() {
    await this.checkMetamaskEnabled();
    if (this.isMetamaskEnabled) this.connectMetamask();
  }

  /* METHODS */
  async checkMetamaskEnabled() {
    if (typeof window.ethereum !== "undefined") {
      const provider = await detectEthereumProvider();
      if (provider.isConnected()) {
        if (provider._metamask.isEnabled()) this.isMetamaskEnabled = true;
      }
    } else {
      this.$emit("set-error");
    }
  }

  async connectMetamask() {
    this.isMetamaskEnabled = false;
    this.balance = "";
    this.ubxtBalance = "";

    // @ts-ignore
    this.web3 = new Web3(window.ethereum);
    try {
      // @ts-ignore
      await window.ethereum.enable();
      this.isMetamaskEnabled = true;
    } catch {
      // User denied account authorisation, so isMetamaskEnabled is false
      this.isMetamaskEnabled = false;
    }

    if (this.isMetamaskEnabled) this.checkAccounts();
  }

  async checkAccounts() {
    if (this.web3 === null) return;

    try {
      const accounts = await this.web3.eth.getAccounts();
      this.metamaskAccountLink = accounts[0];

      if (this.metamaskAccountLink) {
        this.formattedMetamaskAccountLink = this.formatAddress(this.metamaskAccountLink);
        const wei = await this.web3.eth.getBalance(this.metamaskAccountLink);
        this.balance = this.web3.utils.fromWei(wei, "ether");
        this.getERC20Balance();
      }
    } catch {
      this.$emit("set-error");
    }
  }

  formatAddress(address: string) {
    return address.substring(0, 8) + "....." + address.substring(address.length - 6);
  }

  async getERC20Balance(): Promise<void> {
    const contract = new this.web3.eth.Contract(this.erc20Abi, this.contractAddress);
    const decimals = await contract.methods.decimals().call();
    const balance = await contract.methods.balanceOf(this.metamaskAccountLink).call();
    const adjustedBalance = balance / Math.pow(10, decimals);
    this.ubxtBalance = adjustedBalance.toString();
  }

  copyLink(input: HTMLInputElement) {
    input.value = this.metamaskAccountLink;
    input.select();
    document.execCommand("copy");
    input.value = this.formattedMetamaskAccountLink;
  }
}
</script>

<style lang="scss" scoped>
.icon-wallet {
  width: 54px;
}
</style>
