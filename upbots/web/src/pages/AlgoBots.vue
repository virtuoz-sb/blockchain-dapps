<template>
  <GeneralLayout title="Algo Bots" content-custom-classes="flex-col overflow-y-auto custom-scrollbar">
    <!-- CHANGE TAB BUTTON DESKTOP, TABLET -->
    <AppButtonsGroup
      v-if="!$breakpoint.mdAndDown"
      slot="header-nav-left-end"
      v-model="algoBotsTabValue"
      :items="algoBotsTabData"
      class="algo-bots__change-tab-btn w-full ml-25"
      custom-classes="py-3 px-15"
    />

    <!-- CHANGE TAB BUTTON MOBILE -->
    <div v-if="$breakpoint.mdAndDown" class="flex flex-shrink-0 w-full mb-20 px-20">
      <AppButtonsGroup v-model="algoBotsTabValue" :items="algoBotsTabData" class="w-full" custom-classes="py-3 px-15" />
    </div>

    <div v-if="!isComingSoon" class="flex flex-col flex-grow w-full relative overflow-y-auto custom-scrollbar">
      <div class="flex flex-col w-full flex-grow overflow-y-auto custom-scrollbar">
        <!-- BOTS TAB -->
        <template v-if="algoBotsTabValue === 1">
          <Bots class="flex-grow" />
        </template>

        <!-- ACTIVE BOTS TAB -->
        <template v-if="algoBotsTabValue === 2">
          <ActiveBots />
        </template>
      </div>
    </div>

    <!-- COMING SOON -->
    <div v-if="isComingSoon" class="w-full flex flex-col">
      <ComingSoonWithoutDesign />
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";
import Bots from "@/components/algo-bots/Bots.vue";
import ActiveBots from "@/components/algo-bots/ActiveBots.vue";

type AlgoBotsTab = { value: number; label: string };

@Component({ name: "AlgoBots", components: { GeneralLayout, Bots, ActiveBots }, mixins: [ComingSoon] })
export default class AlgoBots extends Vue {
  /* DATA */
  tabs: Tab[] = [
    { value: "Algo Bots", componentName: "Bots" },
    { value: "My Active Bots", componentName: "ActiveBots" },
  ];

  algoBotsTabValue: number = 1;
  algoBotsTabData: AlgoBotsTab[] = [
    { value: 1, label: "Algo Bots" },
    { value: 2, label: "My Active Bots" },
  ];

  /* TYPES */
  $zendesk: {
    show: Function;
    load: Function;
    hide: Function;
  };

  /* HOOKS */
  mounted() {
    this.$zendesk.show();
    this.$zendesk.load('a8559a18-9268-4b64-86e4-7b139c02b99e"');
  }

  beforeDestroy() {
    this.$zendesk.hide();
  }
}
</script>

<style lang="scss" scoped>
.algo-bots {
  &__change-tab-btn {
    max-width: 260px;
  }
}
</style>
