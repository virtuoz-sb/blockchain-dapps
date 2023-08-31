<template>
  <GeneralLayout
    class="overflow-hidden"
    title="Keys"
    content-custom-classes="md:flex-col overflow-y-auto md:overflow-y-visible custom-scrollbar"
  >
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full h-full relative">
      <!-- MY EXCHANGES KEYS -->
      <Card class="flex flex-col w-full h-2/5 bg-dark-200 rounded-3 overflow-hidden" header-classes="flex items-center">
        <template slot="header-left">
          <span class="leading-md text-iceberg">My Exchange Keys</span>
        </template>

        <MyExchangeKeys
          slot="content"
          :table-data="keys"
          class="flex flex-col relative h-full md:ml-8 md:mr-20 lg:mx-20 overflow-x-auto custom-scrollbar"
        />
      </Card>

      <!-- CONNECT NEW EXCHANGES -->
      <Card class="flex flex-col w-full h-3/5 bg-dark-200 rounded-3 mt-30" header-classes="flex items-center">
        <template slot="header-left">
          <span class="leading-md text-iceberg">Connect New Exchanges</span>
        </template>

        <ConnectNewExchanges slot="content" />
      </Card>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="!isComingSoon" class="w-full flex flex-col relative bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
        <AppTabs ref="tabs" :tabs="tabs" shrink>
          <template v-slot="{ currentTab }">
            <!-- CONNECT NEW EXCHANGES -->
            <template v-if="currentTab.componentName === 'ConnectNewExchanges'">
              <ConnectNewExchanges />
            </template>

            <!-- MY EXCHANGES KEYS -->
            <template v-if="currentTab.componentName === 'MyExchangesKeys'">
              <MyExchangeKeys
                :table-data="keys"
                class="flex flex-col flex-grow overflow-y-auto custom-scrollbar"
                @add-new-exchanges="addNewExchanges"
              />
            </template>
          </template>
        </AppTabs>
      </div>

      <!-- COMING SOON -->
      <div v-if="isComingSoon" class="w-full flex flex-col">
        <ComingSoonWithoutDesign />
      </div>
    </template>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ExchangeKey } from "@/store/exchangeKeys/types";
import { Tab } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";
import { namespace } from "vuex-class";

const user = namespace("userModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import MyExchangeKeys from "@/components/keys/exchange-keys/MyExchangeKeys.vue";
import ConnectNewExchanges from "@/components/keys/ConnectNewExchanges.vue";

@Component({ name: "ExchangeKeys", components: { GeneralLayout, MyExchangeKeys, ConnectNewExchanges }, mixins: [ComingSoon] })
export default class ExchangeKeys extends Vue {
  /* VUEX */
  @user.State keys!: ExchangeKey[];

  /* REFS */
  $refs!: {
    tabs: any;
  };

  /* DATA */
  tabs: Tab[] = [
    { value: "Connect New Exchanges", componentName: "ConnectNewExchanges" },
    { value: "My Exchange Keys", componentName: "MyExchangesKeys" },
  ];

  /* METHODS */
  addNewExchanges() {
    this.$refs.tabs.currentTab = { value: "Connect New Exchanges", componentName: "ConnectNewExchanges" };
  }
}
</script>
