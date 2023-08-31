<template>
  <GeneralLayout title="Portfolio" content-custom-classes="flex-col relative overflow-y-auto custom-scrollbar">
    <!-- CHANGE TAB BUTTON DESKTOP, TABLET -->
    <AppButtonsGroup
      v-if="!$breakpoint.mdAndDown"
      slot="header-nav-left-end"
      v-model="portfolioTabValue"
      :items="portfolioTabData"
      class="portfolio__change-tab-btn w-full ml-25"
      custom-classes="py-3 px-15"
      @change="changeTab"
    />

    <!-- CHANGE TAB BUTTON MOBILE -->
    <div v-if="$breakpoint.mdAndDown" class="flex flex-shrink-0 w-full mb-20" :class="$breakpoint.smAndDown && 'px-20'">
      <AppButtonsGroup
        v-model="portfolioTabValue"
        :items="portfolioTabData"
        class="w-full"
        custom-classes="py-3 px-15"
        @change="changeTab"
      />
    </div>

    <!-- PORTFOLIO MONITORING SUMMARY -->
    <template v-if="$route.name === portfolioTabData[0].route">
      <PortfolioMonitoringSummary />
    </template>

    <!-- PORTFOLIO MONITORING CEXs -->
    <template v-if="$route.name === portfolioTabData[1].route">
      <PortfolioMonitoringCEXs />
    </template>

    <!-- PORTFOLIO MONITORING ETH WALLET -->
    <template v-if="$route.name === portfolioTabData[2].route">
      <PortfolioMonitoringETHPortfolio />
    </template>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import GeneralLayout from "@/views/GeneralLayout.vue";
import PortfolioMonitoringSummary from "@/pages/portfolio/PortfolioMonitoringSummary.vue";
import PortfolioMonitoringCEXs from "@/pages/portfolio/PortfolioMonitoringCEXs.vue";
import PortfolioMonitoringETHPortfolio from "@/pages/portfolio/PortfolioMonitoringETHPortfolio.vue";

Component.registerHooks(["beforeRouteEnter"]);

type PortfolioTab = { value: number; label: string; route: string };

@Component({
  name: "Portfolio",
  components: { GeneralLayout, PortfolioMonitoringETHPortfolio, PortfolioMonitoringCEXs, PortfolioMonitoringSummary },
})
export default class Portfolio extends Vue {
  /* DATA */
  portfolioTabValue: number = 1;
  portfolioTabData: PortfolioTab[] = [
    { value: 1, label: "Summary", route: "portfolio-monitoring-summary" },
    { value: 2, label: "CEXs", route: "portfolio-monitoring-cexs" },
    { value: 3, label: "ETH/BSC", route: "portfolio-monitoring-eth-portfolio" },
  ];

  /* HOOKS */
  created() {
    this.setCurrentTab();
  }

  beforeRouteEnter(to: any, from: any, next: any) {
    if (to.name === "portfolio-monitoring") {
      next("/portfolio-monitoring/summary");
    } else {
      next();
    }
  }

  /* METHODS */
  changeTab(item: PortfolioTab) {
    if (this.$route.name !== `${item.route}`) {
      this.$router.push({ name: item.route as string });
    }
  }

  setCurrentTab() {
    const curr = this.portfolioTabData.find((el: PortfolioTab) => {
      return el.route === this.$route.name;
    });

    this.portfolioTabValue = curr.value;
  }
}
</script>

<style lang="scss" scoped>
.portfolio {
  &__change-tab-btn {
    max-width: 360px;
  }
}
</style>
