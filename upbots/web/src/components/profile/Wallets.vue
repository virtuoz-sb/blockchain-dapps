<template>
  <div class="flex flex-col flex-grow w-full pt-12 pb-10">
    <div :class="!!accountLink ? 'px-20' : 'justify-center items-center px-40'" class="flex flex-grow mb-20">
      <div v-if="!accountLink" class="flex items-center justify-center">
        <span class="text-iceberg text-md leading-md text-center">Connect/Install Metamask wallet</span>
      </div>

      <div v-else class="flex flex-col w-full h-full">
        <div class="flex flex-col w-full mb-12">
          <p class="text-grey-cl-200 text-xs leading-md mb-6">Address:</p>
          <AppInput v-model="accountLink" type="text" size="sm" readonly @click="copyLink" />
        </div>

        <div class="flex items-center mb-12">
          <div class="flex-shrink-0 text-iceberg leading-xs mr-5">ETH Balance:</div>
          <div class="block text-white truncate w-full">{{ balance | toDefaultFixed }}</div>
        </div>

        <div class="flex items-center">
          <div class="flex-shrink-0 text-iceberg leading-xs mr-5">UBXT Balance:</div>
          <div class="block text-white truncate w-full">{{ ubxtBalance | toDefaultFixed }}</div>
        </div>
      </div>
      <VueMetamask userMessage="msg" @onComplete="onComplete" />
    </div>

    <div v-if="msg" class="flex items-center justify-center">
      <div class="flex-shrink-0 text-white leading-xs mr-5">{{ msg }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import VueMetamask from "vue-metamask";
import Web3 from "web3";

@Component({ name: "Wallets", components: { VueMetamask } })
export default class Wallets extends Vue {
  /* DATA */
  msg: string = "";
  accountLink: string = "";
  balance: any = "";
  ubxtBalance: any = "";
  ubxtName: any = "";
  ubxtSymbol: any = "";
  web3 = new Web3(new Web3.providers.HttpProvider(`${process.env.VUE_APP_WEB3_PROVIDER_INFURA}`));
  erc20Abi = require("./erc20Abi.json");
  contractAddress = `${process.env.VUE_APP_WEB3_UBXTOKEN_PROXY_CONTRACT_ADDRESS}`;
  timerToken: any;
  data: any;
  networkType: string = "";
  cbTimer: number = Number(`${process.env.VUE_APP_WEB3_CALLBACK_TIMER}`);

  /* METHODS */

  // this is a working snippet of code though we can implement this better.
  onComplete(data: any) {
    this.data = data;
    data.web3.eth.getAccounts((error: any, accounts: any) => {
      if (!error) {
        data.web3.eth.getBalance(accounts[0], (error: any, balance: any) => {
          if (!error) {
            this.accountLink = accounts[0];
            this.networkType = data.type;
            this.balance = balance / 1000000000000000000;
            this.getERC20Balance();
            this.start();
          } else {
            this.clearMetamask();
            this.stop();
          }
        });
        //refacto -> data.web3.currentProvider.publicConfigStore.on("update", this.onComplete(this.data));
      } else {
        this.clearMetamask();
        this.stop();
      }
    });
  }

  clearMetamask() {
    this.accountLink = "";
    this.balance = "";
    this.clearUBXT();
  }

  clearUBXT() {
    this.ubxtBalance = "";
    this.ubxtName = "";
    this.ubxtSymbol = "";
  }

  copyLink(input: HTMLInputElement) {
    input.select();
    document.execCommand("copy");
  }

  start() {
    this.timerToken = setInterval(this.runningLoop, this.cbTimer);
  }

  stop() {
    clearInterval(this.timerToken);
  }

  runningLoop() {
    if (this.data.web3.eth.accounts[0] !== this.accountLink || this.data.type !== this.networkType) {
      this.onComplete(this.data);
    }
  }

  async getBalance(): Promise<void> {
    const wei = await this.web3.eth.getBalance(this.accountLink);
    this.balance = this.web3.utils.fromWei(wei, "ether");
  }

  async getERC20Balance(): Promise<void> {
    if (this.networkType.toLowerCase() === "mainnet") {
      const contract = new this.web3.eth.Contract(this.erc20Abi, this.contractAddress);
      const decimals = await contract.methods.decimals().call();
      const balance = await contract.methods.balanceOf(this.accountLink).call();
      const adjustedBalance = balance / Math.pow(10, decimals);
      this.ubxtBalance = adjustedBalance.toString();
      this.ubxtName = await contract.methods.name().call();
      this.ubxtSymbol = await contract.methods.symbol().call();
      this.msg = "";
    } else {
      this.clearUBXT();
      this.msg = "Please select MAINNET for UBXT";
    }
  }
}
</script>
