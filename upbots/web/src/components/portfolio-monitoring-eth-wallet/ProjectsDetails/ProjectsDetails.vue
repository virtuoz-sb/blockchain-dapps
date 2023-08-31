<template>
  <div>
    <!-- Aave CARD -->
    <Card class="flex flex-col flex-shrink-0 mb-38 md:mb-20 lg:mb-30" header-classes="flex items-center" :class="cardStyle">
      <template slot="header-left">
        <div class="flex items-center">
          <img :src="projectsHeader.aave.logo" :alt="projectsHeader.aave.title" class="w-23 md:w-25 h-23 md:h-25 mr-12 md:mr-8" />
          <span class="leading-md text-iceberg md:text-xl">{{ projectsHeader.aave.title }}</span>
        </div>
      </template>

      <template slot="content">
        <AaveDetails :items="getProjectsData" class="flex flex-col flex-grow relative" />
      </template>
    </Card>

    <!-- Compound CARD -->
    <Card class="flex flex-col flex-shrink-0 mb-38 md:mb-20 lg:mb-30" header-classes="flex items-center" :class="cardStyle">
      <template slot="header-left">
        <div class="flex items-center">
          <img :src="projectsHeader.compound.logo" :alt="projectsHeader.compound.title" class="w-23 md:w-25 h-23 md:h-25 mr-12 md:mr-8" />
          <span class="leading-md text-iceberg md:text-xl">{{ projectsHeader.compound.title }}</span>
        </div>
      </template>

      <template slot="content">
        <CompoundDetails :items="getProjectsData" class="flex flex-col flex-grow relative" />
      </template>
    </Card>

    <!-- Pancakeswap CARD -->
    <Card class="flex flex-col flex-shrink-0 mb-38 md:mb-20 lg:mb-30" header-classes="flex items-center" :class="cardStyle">
      <template slot="header-left">
        <div class="flex items-center">
          <img
            :src="projectsHeader.pancakeswap.logo"
            :alt="projectsHeader.pancakeswap.title"
            class="w-23 md:w-25 h-23 md:h-25 mr-12 md:mr-8"
          />
          <span class="leading-md text-iceberg md:text-xl">{{ projectsHeader.pancakeswap.title }}</span>
        </div>
      </template>

      <template slot="content">
        <PancakeswapDetails :items="getProjectsData" class="flex flex-col flex-grow relative" />
      </template>
    </Card>

    <!-- Uniswap V2 CARD -->
    <Card class="flex flex-col flex-shrink-0 mb-38 md:mb-20 lg:mb-30" header-classes="flex items-center" :class="cardStyle">
      <template slot="header-left">
        <div class="flex items-center">
          <img :src="projectsHeader.uniswap.logo" :alt="projectsHeader.uniswap.title" class="w-23 md:w-25 h-23 md:h-25 mr-12 md:mr-8" />
          <span class="leading-md text-iceberg md:text-xl">{{ projectsHeader.uniswap.title }}</span>
        </div>
      </template>

      <template slot="content">
        <UniswapDetails :items="getProjectsData" class="flex flex-col flex-grow relative" />
      </template>
    </Card>

    <!-- Sushiswap CARD -->
    <Card class="flex flex-col flex-shrink-0 mb-38 md:mb-20 lg:mb-30" header-classes="flex items-center" :class="cardStyle">
      <template slot="header-left">
        <div class="flex items-center">
          <img :src="projectsHeader.sushiswap.logo" :alt="projectsHeader.sushiswap.title" class="w-23 md:w-25 h-23 md:h-25 mr-12 md:mr-8" />
          <span class="leading-md text-white md:text-xl">{{ projectsHeader.sushiswap.title }}</span>
        </div>
      </template>

      <template slot="content">
        <SushiswapDetails :items="getProjectsData" class="flex flex-col flex-grow relative" />
      </template>
    </Card>

    <!-- Balance CARD -->
    <Card class="flex flex-col flex-shrink-0 mb-38 md:mb-20 lg:mb-30" header-classes="flex items-center" :class="cardStyle">
      <template slot="header-left">
        <div class="flex items-center">
          <img :src="projectsHeader.balancer.logo" :alt="projectsHeader.balancer.title" class="w-23 md:w-25 h-23 md:h-25 mr-12 md:mr-8" />
          <span class="leading-md text-iceberg md:text-xl">{{ projectsHeader.balancer.title }}</span>
        </div>
      </template>

      <div class="flex flex-col flex-grow" slot="content">
        <BalancerDetails :items="getProjectsData" class="flex flex-col flex-grow relative" />
      </div>
    </Card>

    <!-- Curve CARD -->
    <Card class="flex flex-col flex-shrink-0 mb-38 md:mb-0" header-classes="flex items-center" :class="cardStyle">
      <template slot="header-left">
        <div class="flex items-center">
          <img :src="projectsHeader.curve.logo" :alt="projectsHeader.curve.title" class="w-23 md:w-25 h-23 md:h-25 mr-12 md:mr-8" />
          <span class="leading-md text-iceberg md:text-xl">{{ projectsHeader.curve.title }}</span>
        </div>
      </template>

      <div class="flex flex-col flex-grow" slot="content">
        <CurveDetails :items="getProjectsData" class="flex flex-col flex-grow relative" />
      </div>
    </Card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ProjectsData } from "@/store/dex-monitoring/types";
import { namespace } from "vuex-class";

const dexMonitoring = namespace("dexMonitoringModule");

import UniswapDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/UniswapDetails.vue";
import PancakeswapDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/PancakeswapDetails.vue";
import SushiswapDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/SushiswapDetails.vue";
import BalancerDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/BalancerDetails.vue";
import CurveDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/CurveDetails.vue";
import AaveDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/AaveDetails.vue";
import CompoundDetails from "@/components/portfolio-monitoring-eth-wallet/ProjectsDetails/CompoundDetails.vue";

@Component({
  name: "ProjectsDetails",
  components: { UniswapDetails, PancakeswapDetails, SushiswapDetails, BalancerDetails, AaveDetails, CompoundDetails, CurveDetails },
})
export default class ProjectsDetails extends Vue {
  /* VUEX */
  @dexMonitoring.Getter getProjectsData: ProjectsData;

  /* DATA */
  projectsHeader: any = {
    aave: { logo: require("@/assets/images/trade-images/aave.svg"), title: "Aave" },
    compound: { logo: require("@/assets/images/trade-images/coumpound.svg"), title: "Compound" },
    sushiswap: { logo: require("@/assets/images/trade-images/sushiswap.png"), title: "Sushiswap" },
    uniswap: { logo: require("@/assets/images/trade-images/uniswap.png"), title: "Uniswap V2" },
    pancakeswap: { logo: require("@/assets/images/trade-images/pancakeswap.svg"), title: "Pancakeswap" },
    curve: { logo: require("@/assets/images/trade-images/curve.svg"), title: "Curve" },
    balancer: { logo: require("@/assets/images/trade-images/balancer.svg"), title: "Balancer" },
  };

  /* COMPUTED */
  get cardStyle() {
    return !this.$breakpoint.smAndDown && "bg-dark-200 rounded-3";
  }
}
</script>

<style lang="scss" scoped>
.disabled {
  min-height: 75px;
  &:after {
    content: "No Data Available";
    @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg;
  }
}
.coming-soon {
  min-height: 75px;
  &:after {
    content: "Coming soon...";
    @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg;
  }
}
</style>
