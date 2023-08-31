<template>
  <div class="flex flex-col overflow-y-auto custom-scrollbar">
    <div class="staking__container flex flex-col overflow-y-auto custom-scrollbar">
      <custom-scroll :ops="scrollData">
        <div v-if="dataReady" class="flex flex-col flex-grow md:py-10">
          <div class="flex items-center justify-between w-full md:px-16 mb-10">
            <div class="text-iceberg w-full">{{ totalStaked() }}</div>
          </div>

          <AppDivider class="bg-grey-cl-300 w-full mb-8 opacity-40" />

          <div class="item__wrap w-full flex flex-col">
            <div class="item flex items-center justify-between mb-8 w-full md:px-16">
              <div class="h-18 w-38 lg:w-42 xl:w-36 mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-18 h-18" />
              </div>

              <div class="item__name text-sm xl:text-base leading-xs text-iceberg w-8/12">UBXT (ETH)</div>

              <div class="item__apy w-4/12">
                <div class="flex items-center flex-shrink-0">
                  <div class="text-sm text-bright-turquoise leading-xs mr-4">APR</div>
                  <AppPercentageSpan class="text-xs" :data="stakingData.eth.farmAPY" />
                </div>
              </div>

              <router-link :to="{ name: 'staking' }" class="icon-arrow-right-new text-md text-iceberg ml-7" />
            </div>

            <AppDivider class="bg-grey-cl-300 w-full mb-8 opacity-40" />

            <div class="item flex items-center justify-between w-full mb-8 md:px-16">
              <div class="relative h-18 w-38 lg:w-42 xl:w-36 mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="absolute top-0 left-0 w-18 h-18" />
                <img src="@/assets/icons/eth-logo.svg" alt="eth" class="absolute top-0 right-0 w-18 h-18" />
              </div>

              <div class="item__name text-sm xl:text-base leading-xs text-iceberg w-8/12">UBXT - ETH LP</div>

              <div class="item__apy w-4/12">
                <div class="flex items-center flex-shrink-0">
                  <div class="text-sm text-bright-turquoise leading-xs mr-4">APR</div>

                  <template>
                    <AppPercentageSpan class="text-xs" :data="stakingData.eth.lpFarmAPY" />
                  </template>
                </div>
              </div>

              <router-link :to="{ name: 'staking' }" class="icon-arrow-right-new text-md text-iceberg ml-7" />
            </div>

            <AppDivider class="bg-grey-cl-300 w-full mb-8 opacity-40" />

            <div class="item flex items-center justify-between mb-8 w-full md:px-16">
              <div class="h-18 w-38 lg:w-42 xl:w-36 mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-18 h-18" />
              </div>

              <div class="item__name text-sm xl:text-base leading-xs text-iceberg w-8/12">UBXT (BSC)</div>

              <div class="item__apy w-4/12">
                <div class="flex items-center flex-shrink-0">
                  <div class="text-sm text-bright-turquoise leading-xs mr-4">APR</div>

                  <template>
                    <AppPercentageSpan class="text-xs" :data="stakingData.bsc.farmAPY" />
                  </template>
                </div>
              </div>

              <router-link :to="{ name: 'staking' }" class="item__link icon-arrow-right-new text-md text-iceberg ml-7" />
            </div>

            <!-- For now it is hidden. Because it has been deactivated. -->
            <AppDivider v-if="false" class="bg-grey-cl-300 w-full mb-8 opacity-40" />

            <div v-if="false" class="item flex items-center justify-between w-full mb-8 md:px-16">
              <div class="w-38 lg:w-42 xl:w-36 relative mr-10">
                <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="absolute top-0 left-0 w-18 h-18" />
                <img src="@/assets/icons/busd.svg" alt="eth" class="absolute top-0 right-0 w-18 h-18" />
              </div>

              <div class="item__name text-sm xl:text-base leading-xs text-iceberg w-8/12">UBXT - BUSD LP</div>

              <div class="item__apy w-4/12">
                <div class="flex items-center flex-shrink-0">
                  <div class="text-sm text-bright-turquoise leading-xs mr-4">APR</div>
                  <AppPercentageSpan class="text-xs" :data="stakingData.bsc.lpFarmAPY" />
                </div>
              </div>
              <router-link :to="{ name: 'staking' }" class="icon-arrow-right-new text-md text-iceberg ml-7" />
            </div>
          </div>
        </div>
      </custom-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// import { namespace } from "vuex-class";
import * as stakingService from "@/store/staking/service";

// const staking = namespace("stakingModule");

@Component({ name: "Staking" })
export default class Staking extends Vue {
  /* VUEX */
  // @staking.State farmAPY: number;
  // @staking.State lpFarmAPY: number;
  // @staking.State bscFarmAPY: number;
  // @staking.State bscLpFarmAPY: number;
  // @staking.Mutation setSwitcherCurrency: any;
  // @staking.State switcherCurrency: string;

  /* DATA */
  dataReady: boolean = false;

  /* COMPUTED */
  get stakingData() {
    return stakingService.getStakingData();
  }

  get scrollData() {
    return {
      rail: {
        gutterOfSide: this.$breakpoint.smAndDown ? "0px" : "5px",
        gutterOfEnds: "2px",
      },

      bar: {
        background: "#378C9C",
        keepShow: true,
        size: "6px",
        hight: "100px",
      },

      scrollPanel: {
        easing: "easeInQuad",
        speed: 100,
      },

      vuescroll: {
        wheelScrollDuration: 1000,
        wheelDirectionReverse: false,
      },
    };
  }

  /* HOOKS */
  async mounted() {
    await this.init();
  }

  /* METHODS */
  async init() {
    await stakingService.calcStakingData();
    this.dataReady = true;
  }

  totalStaked(chainType: string = "") {
    let balance = 0;

    if (chainType == "eth") {
      balance = this.stakingData.eth.balance;
    } else if (chainType == "bsc") {
      balance = this.stakingData.bsc.balance;
    } else {
      balance = this.stakingData.eth.balance + this.stakingData.bsc.balance;
    }

    return `Total staked: ${balance
      .toFixed(0)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}$`;
  }
}
</script>

<style lang="scss" scoped>
.staking {
  &__container {
    height: 190px;
  }
}

.item {
  &__name {
    @media (max-width: 1280px) {
      width: 45%;
    }
    @media (max-width: 1024px) {
      width: 55%;
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
