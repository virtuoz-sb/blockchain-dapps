<template>
  <GeneralLayout title="Optimus BTC/USDT" class="overflow-x-hidden" content-custom-classes="md:flex-col overflow-y-auto custom-scrollbar">
    <!-- HEADER ICON BACK -->
    <router-link slot="header-nav-left-start" to="/my-performance" tag="div" class="flex items-center flex-shrink-0 cursor-pointer mr-20">
      <span class="icon-arrow-back text-xxl text-blue-cl-100" />
    </router-link>

    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full relative">
      <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
        <!-- PERFORMANCE RECAP -->
        <Card class="performance-card flex flex-col w-full bg-dark-200 rounded-3 mb-40" header-classes="flex items-center">
          <template slot="header-left">
            <span class="leading-md text-white">Performance recap</span>
          </template>

          <PerformanceRecap slot="content" />
        </Card>

        <div class="flex items-start mb-40">
          <!-- BOT PARAMETERS -->
          <Card class="bot-parameters-card flex flex-col w-full bg-dark-200 rounded-3 mr-40" header-classes="flex items-center">
            <template slot="header-left">
              <span class="leading-md text-white">Bot Parameters</span>
            </template>

            <BotParameters slot="content" />
          </Card>

          <!-- BOT CHART -->
          <Card
            class="bot-chart-card flex flex-col flex-grow bg-dark-200 rounded-3 overflow-x-hidden"
            header-classes="flex items-center"
            :header="false"
          >
            <BotChart slot="content" />
          </Card>
        </div>

        <!-- MY TRADES -->
        <Card class="my-trades-card flex flex-col w-full bg-dark-200 rounded-3" header-classes="flex items-center">
          <template slot="header-left">
            <span class="leading-md text-white">My Trades</span>
          </template>

          <MyTrades slot="content" />
        </Card>

        <!-- COMING SOON -->
        <ComingSoonDesktop v-if="isComingSoon" />
      </div>
    </div>

    <!-- MOBILE CONTENT -->
    <div v-else class="w-full flex flex-col relative">
      <!-- COMING SOON -->
      <ComingSoonWithoutDesign v-if="isComingSoon" />
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";
import PerformanceRecap from "@/components/bot-performance/PerformanceRecap.vue";
import BotParameters from "@/components/bot-performance/BotParameters.vue";
import BotChart from "@/components/bot-performance/BotChart.vue";
import MyTrades from "@/components/bot-performance/MyTrades.vue";

@Component({
  name: "BotPerformance",
  components: { GeneralLayout, PerformanceRecap, BotParameters, BotChart, MyTrades },
  mixins: [ComingSoon],
})
export default class BotPerformance extends Vue {}
</script>

<style lang="scss" scoped>
.performance-card {
  height: 133px;
}

.bot-parameters-card {
  max-width: 260px;
  height: 370px;
}

.bot-chart-card {
  height: 370px;
}

.my-trades-card {
  height: 234px;
}
</style>
