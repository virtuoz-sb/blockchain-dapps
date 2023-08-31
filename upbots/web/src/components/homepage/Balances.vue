<template>
  <div>
    <div v-if="msg" class="flex items-center justify-center">
      <div class="flex-shrink-0 text-grey-cl-920 text-xs leading-xs mb-10 mr-5">{{ msg }}</div>
    </div>
    <div class="flex flex-col mb-20">
      <div class="list-item flex flex-col flex-shrink-0 last:mb-0">
        <div class="flex items-center justify-between pb-10">
          <div class="flex mr-10">
            <span class="text-iceberg text-sm leading-md">DEX Wallets:</span>
          </div>
          <div v-if="!metamaskEnabled && !binanceChainEnabled" class="flex flex-col items-end flex-shrink-0">
            <AppButton
              type="light-green-reverse-bordered"
              size="xxs"
              class="start-trade-btn flex-shrink-0 w-full text-sm leading-sm"
              @click="isModalOpen = true"
            >
              Connect
            </AppButton>
          </div>
          <div v-if="metamaskEnabled || binanceChainEnabled" class="flex flex-col items-end flex-shrink-0">
            <div>
              <span class="text-faded-jade text-sm leading-md font-semibold mb-2 last:mb-0">
                {{ ubxtMetamaskBalance | fixed(0, 0) }}
              </span>
              &nbsp;
              <span class="text-faded-jade text-sm leading-md font-semibold">UBXT</span>
            </div>
            <div class="flex items-center justify-end">
              <i class="icon-approximately-equel text-xxs leading-xs text-tradewind mr-5" />
              <span class="text-iceberg text-sm leading-md font-semibold mb-2 last:mb-0">
                {{ ubxtMetamaskFiatBalance | toTwoDecimalDigitFixed }} {{ wallet && wallet.label }}
              </span>
            </div>
          </div>
        </div>

        <AppDivider class="bg-grey-cl-300 opacity-40 w-full" />

        <div class="list-item flex flex-col flex-shrink-0 mt-10 last:mb-0">
          <div class="flex items-center justify-between pt-10">
            <div class="flex mr-10">
              <span class="text-iceberg text-sm leading-md">Exchanges:</span>
            </div>
            <div class="block overflow-hidden">
              <div class="flex flex-wrap justify-end items-center mb-2">
                <span class="block truncate text-faded-jade text-sm leading-md font-semibold">
                  {{ ubxtExchangeBalance | fixed(0, 0) }}
                </span>
                &nbsp;
                <span class="text-faded-jade text-sm leading-md font-semibold">UBXT</span>
              </div>
              <div class="flex items-center justify-end">
                <i class="icon-approximately-equel text-xxs leading-xs text-tradewind mr-5" />
                <span class="text-iceberg text-sm leading-md font-semibold mb-2 last:mb-0">
                  {{ ubxtExchangeFiatBalance | toTwoDecimalDigitFixed }} {{ wallet && wallet.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppButton type="light-green" class="w-full mt-auto" :size="$breakpoint.mdAndDown ? 'sm' : 'xs'" @click="$emit('click')">
      Buy UBXT
    </AppButton>

    <AppModal v-model="isModalOpen" max-width="700px">
      <div class="edit-modal__wrap relative flex flex-col pt-60 pb-40 px-20 md:px-75">
        <div class="grid grid-cols-1 md:grid-cols-2 row-gap-70 md:col-gap-50">
          <div class="flex flex-col flex-grow items-center border-right">
            <img :src="require('@/assets/icons/wallet-icon.svg')" alt="wallet" class="wallet-icon mb-12" />
            <h2 class="font-raleway text-iceberg text-xxl text-center mb-12 font-bold">METAMASK</h2>
            <p class="text-md text-iceberg text-center leading-md mb-24">
              Connect your Metamask Wallet
            </p>
            <AppButton class="w-full mt-auto" @click="connectMetamask">Connect</AppButton>
          </div>

          <div class="flex flex-col flex-grow items-center">
            <img :src="require('@/assets/icons/binance-chain-wallet.png')" alt="wallet" class="wallet-icon mb-12" />
            <h2 class="font-raleway text-iceberg text-xxl text-center mb-12 font-bold">BINANCE CHAIN</h2>
            <p class="text-md text-iceberg text-center leading-md mb-24">
              Connect your Metamask Wallet
            </p>
            <AppButton class="w-full mt-auto" @click="connectBinanceChain">Connect</AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import { default as Web3 } from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

declare global {
  interface Window {
    web3: any;
    ethereum: any;
    BinanceChain: any;
  }
}
window.web3 = window.web3 || {};
window.ethereum = window.ethereum || {};
window.BinanceChain = window.BinanceChain || {};

@Component({ name: "Balances", components: {} })
export default class Balances extends Vue {
  /* PROPS */
  @Prop({ required: true }) wallet: any;

  /* DATA */
  msg: string = "";
  accountLink: string = "";
  balance: any = "";
  adjustedBalance: number = 0;
  ubxtMetamaskBalance: any = "";
  ubxtExchangeBalance: any = "";
  ubxtName: any = "";
  ubxtSymbol: any = "";
  ubxtMetamaskFiatBalance: any = "";
  ubxtExchangeFiatBalance: any = "";
  web3 = new Web3(new Web3.providers.HttpProvider(`${process.env.VUE_APP_WEB3_PROVIDER_INFURA}`));
  erc20Abi = require("./../profile/erc20Abi.json");
  contractAddress = `${process.env.VUE_APP_WEB3_UBXTOKEN_PROXY_CONTRACT_ADDRESS}`;
  data: any;
  networkType = "";
  metamaskEnabled = false;
  binanceChainEnabled = false;
  msgMetamask: { [key: string]: string } = {
    LOAD_MATAMASK_WALLET_ERROR: "Error loading MetaMask",
    EMPTY_METAMASK_ACCOUNT: "", // Replaced by "Connect" button
    NETWORK_ERROR: "The connection is abnormal",
    METAMASK_NOT_INSTALL: "Please install MetaMask",
    BINANCE_CHAIN_NOT_INSTALL: "Please install Binance Chain Wallet",
    METAMASK_TEST_NET: "Please select Main network",
    METAMASK_MAIN_NET: "Currently Main network",
    USER_DENIED_ACCOUNT_AUTHORIZATION: "", // Replaced by "Connect" button
  };
  isModalOpen = false;

  /* COMPUTED */
  get currency() {
    return this.wallet && this.wallet.label == "USD" ? "100" : "84.45";
  }

  /* HOOKS */
  mounted() {
    this.clearUBXT();
    this.checkMetamaskEnabled().then(() => {
      if (this.metamaskEnabled) this.connectMetamask();
    });
    this.getUbxtBalancesFromExchanges();
  }

  /* METHODS */
  checkWeb3() {
    if (typeof window.web3 === "undefined") {
      this.web3 = null;
      this.msg = this.msgMetamask.METAMASK_NOT_INSTALL;
    }
  }

  async checkAccounts() {
    if (this.web3 === null) return;
    await this.web3.eth.getAccounts((err, accounts) => {
      if (err != null) return (this.msg = this.msgMetamask.NETWORK_ERROR);
      if (accounts.length === 0) {
        this.accountLink = "";
        this.msg = this.msgMetamask.EMPTY_METAMASK_ACCOUNT;
        return;
      }
      this.accountLink = accounts[0]; // user Address
    });
  }

  async checkNetWorkAndERC20() {
    this.web3.eth.net
      .getNetworkType()
      .then((type) => {
        this.networkType = type;
        if (type.toLowerCase() !== "main") return (this.msg = this.msgMetamask.METAMASK_TEST_NET);
        this.getERC20Balance();
        return; // (this.msg = this.msgMetamask.METAMASK_MAIN_NET);
      })
      .catch((err) => {
        this.msg = this.msgMetamask.NETWORK_ERROR;
      });
  }

  async checkMetamaskEnabled() {
    const provider = await detectEthereumProvider();
    if (Object.prototype.hasOwnProperty.call(provider, "isMetaMask") && provider.isMetaMask) {
      this.metamaskEnabled = true;
    }
  }

  async connectBinanceChain() {
    this.msg = "";
    if (this.metamaskEnabled) return;
    if (typeof window.BinanceChain !== "undefined") {
      window.web3 = new Web3((window as any).BinanceChain);
      this.web3 = window.web3;
      try {
        await (window as any).BinanceChain.enable();
        this.binanceChainEnabled = true;
      } catch {
        this.msg = this.msgMetamask.USER_DENIED_ACCOUNT_AUTHORIZATION;
      }
    } else if (typeof window.web3 !== "undefined") {
      window.web3 = new Web3(window.web3.currentProvider);
      this.web3 = window.web3;
    } else {
      this.msg = this.msgMetamask.BINANCE_CHAIN_NOT_INSTALL;
    }

    if (this.binanceChainEnabled) this.checkAccounts();
    if (this.binanceChainEnabled) this.checkNetWorkAndERC20();
    this.isModalOpen = false;
  }

  async connectMetamask() {
    this.msg = "";
    if (typeof window.ethereum !== "undefined") {
      window.web3 = new Web3((window as any).ethereum);
      this.web3 = window.web3;
      try {
        await (window as any).ethereum.enable();
        this.metamaskEnabled = true;
      } catch (error) {
        this.msg = this.msgMetamask.USER_DENIED_ACCOUNT_AUTHORIZATION;
      }
    } else if (typeof window.web3 !== "undefined") {
      window.web3 = new Web3(window.web3.currentProvider);
      this.web3 = window.web3;
    } else {
      this.msg = this.msgMetamask.METAMASK_NOT_INSTALL;
    }

    if (this.metamaskEnabled) this.checkAccounts();
    if (this.metamaskEnabled) this.checkNetWorkAndERC20();
    this.isModalOpen = false;
  }

  async getUbxtBalancesFromExchanges() {
    if (this.wallet) {
      const balances = this.$http.get(`${process.env.VUE_APP_ROOT_API}/api/portfolio/ubxt-balance`).then(({ data }) => {
        this.ubxtExchangeBalance = data.ubxt;
        this.ubxtExchangeFiatBalance = data[this.wallet.label.toLowerCase()] ? data[this.wallet.label.toLowerCase()] : "0.00";
      });
    }
  }

  clearUBXT() {
    this.adjustedBalance = 0;
    this.ubxtMetamaskBalance = "";
    this.ubxtExchangeBalance = "";
    this.ubxtName = "";
    this.ubxtSymbol = "";
    this.ubxtMetamaskFiatBalance = "";
    this.ubxtExchangeFiatBalance = "";
  }

  async getBalance(): Promise<void> {
    const wei = await this.web3.eth.getBalance(this.accountLink);
    this.balance = this.web3.utils.fromWei(wei, "ether");
  }

  async getERC20Balance(): Promise<void> {
    if (this.networkType.toLowerCase() === "mainnet" || this.networkType.toLowerCase() === "main") {
      const contract = new this.web3.eth.Contract(this.erc20Abi, this.contractAddress);
      const decimals = await contract.methods.decimals().call();
      const balance = await contract.methods.balanceOf(this.accountLink).call();
      this.adjustedBalance = balance / Math.pow(10, decimals);
      this.ubxtMetamaskBalance = this.adjustedBalance.toString();
      this.ubxtName = await contract.methods.name().call();
      this.ubxtSymbol = await contract.methods.symbol().call();
      this.msg = "";
      this.getERC20FiatBalance();
    } else {
      this.clearUBXT();
      this.msg = "Please select Main network";
    }
  }

  getERC20FiatBalance() {
    if (this.wallet) {
      const contract_addresses = `${process.env.VUE_APP_WEB3_UBXTOKEN_PROXY_CONTRACT_ADDRESS}`;
      const vs_currencies = this.wallet.label.toLowerCase();
      this.$http
        .get(`${process.env.VUE_APP_WEB3_PROVIDER_COINGECKO_API_ETHEREUM}`, {
          params: {
            contract_addresses: contract_addresses,
            vs_currencies: vs_currencies,
          },
        })
        .then(({ data }) => {
          const prices = data;
          const price = prices[contract_addresses.toLowerCase()];
          const contractExchangeRate = price ? price[vs_currencies] : 0;
          this.ubxtMetamaskFiatBalance = (this.adjustedBalance * contractExchangeRate).toFixed(2).toString();
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.balances {
  @media (max-width: 900px) {
    &__wrap {
      @apply mb-15;
    }
    &__title {
      @apply mb-8;
    }
  }
  @media (max-width: 767px) {
    &__wrap {
      @apply mb-20;
    }
    &__title {
      @apply mb-0;
    }
  }
}
.wallet-icon {
  width: 54px;
}
.border-right {
  padding-right: 24px;
  margin-right: -24px;
  border-right: 2px solid darkgrey;
}
</style>
