<template>
  <GeneralLayout title="Signal Providers">
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col relative h-full w-full overflow-y-auto custom-scrollbar">
      <div class="flex flex-col w-full h-full bg-dark-200 rounded-t-15 md:rounded-3 overflow-y-auto custom-scrollbar">
        <!-- APP TABS -->
        <AppTabs :tabs="tabs">
          <template v-slot="{ currentTab }">
            <!-- ADD NEW CHANNEL -->
            <AddNewChannel v-if="currentTab.componentName === 'AddNewChannel'" />

            <!-- ACTIVE CHANNELS -->
            <ActiveChannels v-if="currentTab.componentName === 'ActiveChannels'" />
          </template>
        </AppTabs>
      </div>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <div v-else class="h-full w-full relative">
      <!-- COMING SOON -->
      <ComingSoonWithoutDesign v-if="isComingSoon" />
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";

import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";
import AddNewChannel from "@/components/signal-providers/add-channel-tab/AddNewChannel.vue";
import ActiveChannels from "@/components/signal-providers/active-channel-tab/ActiveChannels.vue";
import SignalProvidersComingSoon from "@/components/signal-providers//SignalProvidersComingSoon.vue";

@Component({
  name: "SignalProviders",
  components: { GeneralLayout, AddNewChannel, ActiveChannels, SignalProvidersComingSoon },
  mixins: [ComingSoon],
})
export default class SignalProviders extends Vue {
  /* DATA */
  tabs: Tab[] = [
    { value: "Add new channel", componentName: "AddNewChannel" },
    { value: "Active channels", componentName: "ActiveChannels" },
  ];
}
</script>

<style lang="scss" scoped>
::v-deep .content {
  &__wrap {
    @media (max-width: 767px) {
      height: calc(100% - 72px);
      @apply pb-0;
    }
  }
}
</style>
