<template>
  <div>
    <div class="flex flex-col mb-20 overflow-hidden custom-scrollbar">
      <div class="invisible h-0 w-0">
        <MainStaking ref="mainStaking" />
      </div>

      <div v-if="dataReady" class="flex flex-col flex-shrink-0 MD:pt-10 cursor-pointer">
        <div class="flex items-center justify-between my-8 w-full md:px-16">
          <div class="text-iceberg w-full md:mt-2">
            {{ metamaskAccountLink ? totalStaked : `Connect to Metamask` }}
          </div>
        </div>

        <AppDivider class="bg-grey-cl-300 w-full mb-8 opacity-40" />

        <div class="item__wrap w-full flex flex-col">
          <div class="item flex items-center justify-between mb-8 w-full md:px-16">
            <div class="item__icon h-18 w-36 mr-10">
              <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-18 h-18" />
            </div>

            <div class="item__name leading-xs text-iceberg w-8/12">UBXT</div>

            <div class="item__apy w-4/12">
              <div class="flex items-center flex-shrink-0">
                <div class="text-sm text-bright-turquoise leading-xs mr-4">APR</div>

                <template>
                  <AppPercentageSpan v-if="metamaskAccountLink && metaMaskNetworkType === 'main'" class="text-xs" :data="farmAPY" />
                  <AppPercentageSpan
                    v-else-if="metamaskAccountLink && metaMaskNetworkType === 'private'"
                    class="text-xs"
                    :data="bscFarmAPY"
                  />
                  <div v-else class="text-xs leading-xs text-green-cl-200">N/A</div>
                </template>
              </div>
            </div>

            <router-link to="/staking" class="item__link icon-arrow-right-new text-x1 text-iceberg ml-7" />
          </div>

          <AppDivider class="bg-grey-cl-300 w-full mb-8 opacity-40" />

          <div class="item flex items-center justify-between w-full mb-8 md:px-16">
            <div class="item__icon h-18 w-36 relative mr-10">
              <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="absolute top-0 left-0 w-18 h-18" />
              <img src="@/assets/icons/eth-logo.svg" alt="eth" class="absolute top-0 right-0 w-18 h-18" />
            </div>

            <div class="item__name leading-xs text-iceberg w-8/12">UBXT - ETH LP</div>

            <div class="item__apy w-4/12">
              <div class="flex items-center flex-shrink-0">
                <div class="text-sm text-bright-turquoise leading-xs mr-4">APR</div>

                <template>
                  <AppPercentageSpan v-if="metamaskAccountLink && metaMaskNetworkType === 'main'" class="text-xs" :data="lpFarmAPY" />
                  <div v-else class="text-xs leading-xs text-green-cl-200">N/A</div>
                </template>
              </div>
            </div>

            <router-link to="/staking" class="item__link icon-arrow-right-new text-x1 text-iceberg ml-7" />
          </div>

          <AppDivider class="bg-grey-cl-300 w-full mb-8 opacity-40" />

          <div class="item flex items-center justify-between w-full mb-8 md:px-16">
            <div class="item__icon h-18 w-36 relative mr-10">
              <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="absolute top-0 left-0 w-18 h-18" />
              <img src="@/assets/icons/busd.svg" alt="eth" class="absolute top-0 right-0 w-18 h-18" />
            </div>

            <div class="item__name leading-xs text-iceberg w-8/12">UBXT - BUSD LP</div>

            <div class="item__apy w-4/12">
              <div class="flex items-center flex-shrink-0">
                <div class="text-sm text-bright-turquoise leading-xs mr-4">APR</div>

                <template>
                  <AppPercentageSpan v-if="metamaskAccountLink && metaMaskNetworkType === 'private'" class="text-xs" :data="bscLpFarmAPY" />
                  <div v-else class="text-xs leading-xs text-green-cl-200">N/A</div>
                </template>
              </div>
            </div>

            <router-link to="/staking" class="item__link icon-arrow-right-new text-x1 text-iceberg ml-7" />
          </div>

          <AppDivider class="bg-grey-cl-300 w-full mb-8 opacity-40" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import MainStaking from "@/pages/Staking.vue";

const staking = namespace("stakingModule");

@Component({ name: "Staking", components: { MainStaking } })
export default class Staking extends Vue {
  /* VUEX */
  @staking.State farmAPY: number;
  @staking.State lpFarmAPY: number;
  @staking.State bscFarmAPY: number;
  @staking.State bscLpFarmAPY: number;
  @staking.Mutation setSwitcherCurrency: any;
  @staking.State switcherCurrency: string;
  /* Data */
  metamaskAccountLink: string = "";
  dataReady: boolean = false;
  networkType: string = "";
  /* HOOKS */
  async mounted() {
    await this.init();
  }
  /* WATCHERS */
  @Watch("networkType")
  async handleNetworkChanged() {
    this.dataReady = false;
    this.setSwitcherCurrency(this.networkType === "main" ? "eth" : "bsc");
    await this.init();
  }
  /* COMPUTED */
  get metaMaskNetworkType() {
    const mainStaking: any = this.$refs.mainStaking;
    this.networkType = mainStaking.networkType;
    return this.networkType;
  }
  get totalStaked() {
    const mainStaking: any = this.$refs.mainStaking;
    if (this.metamaskAccountLink && this.networkType) {
      if (this.networkType === "main") {
        return `Total staked: ${mainStaking.balance
          .toFixed(0)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}$`;
      } else {
        return `Total staked: ${mainStaking.bscBalance
          .toFixed(0)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}$`;
      }
    } else {
      return `Connect to Metamask`;
    }
  }
  /* METHODS */
  async init() {
    const mainStaking: any = this.$refs.mainStaking;
    await mainStaking.checkMetamaskEnabled();
    await mainStaking.connectMetamask();
    await mainStaking.checkAccounts();
    this.metamaskAccountLink = mainStaking.metamaskAccountLink;
    this.dataReady = true;
  }
}
</script>

<style lang="scss" scoped>
.item {
  &__name {
    @media (max-width: 1280px) {
      @apply text-sm;
      width: 45%;
    }
    @media (max-width: 1024px) {
      width: 55%;
    }
  }

  &__icon {
    @media (max-width: 1280px) {
      @apply w-42;
    }

    @media (max-width: 900px) {
      @apply w-38;
    }
  }

  &__apy {
    @media (max-width: 1280px) {
      width: 55%;
    }
    @media (max-width: 1024px) {
      width: 45%;
    }
  }
}
</style>
