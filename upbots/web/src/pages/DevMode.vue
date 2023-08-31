<template>
  <GeneralLayout title="Dev Mode" content-custom-classes="flex-col overflow-y-auto custom-scrollbar">
    <!-- CHANGE TAB BUTTON DESKTOP, TABLET -->
    <AppButtonsGroup
      v-if="!$breakpoint.mdAndDown"
      slot="header-nav-left-end"
      v-model="tabValue"
      :items="tabData"
      class="ubxt-wallet__change-tab-btn w-full ml-25"
      custom-classes="py-3 px-15"
      @change="changeTab"
    />

    <!-- CHANGE TAB BUTTON MOBILE -->
    <div v-if="$breakpoint.mdAndDown" class="flex flex-shrink-0 w-full mb-20 px-20">
      <AppButtonsGroup v-model="tabValue" :items="tabData" class="w-full" custom-classes="py-3 px-15" @change="changeTab" />
    </div>
    <!-- MY BOTS -->
    <div class="container mx-auto">
      <!-- DESKTOP VIEW -->
      <div v-if="!$breakpoint.smAndDown" class="flex flex-col flex-shrink-0 mb-20 lg:mb-40">
        <Card class="ubxt-balance__card flex flex-col w-full bg-dark-200 rounded-3 px-20 py-20" :header="false">
          <div slot="content" class="flex flex-col md:flex-row items-start justify-around items-center h-full">
            <div class="flex justify-center w-1/3 border-r border-hei-se-black">
              <div class="flex flex-col items-center justify-center pb-10 px-20 md:pt-15">
                <p class="text-iceberg text-xl leading-xs font-medium mb-20">Total UBXT Gained</p>
                <p class="flex text-white text-xl leading-xs">
                  <span class="font-bold block truncate">{{ totalUbxtGained | toDefaultFixed }}</span>
                  &nbsp;
                  <span class="font-light text-iceberg">UBXT</span>
                </p>
              </div>
            </div>

            <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

            <div class="flex justify-center w-1/3 border-r border-hei-se-black">
              <div class="flex flex-col items-center justify-center pb-10 px-20 md:pt-15">
                <p class="text-iceberg text-xl leading-xs font-medium mb-20">Total Followers</p>
                <p class="flex text-white text-xl leading-xs">
                  <span class="font-bold block truncate">{{ totalFollowwers }}</span>
                </p>
              </div>
            </div>

            <AppDivider is-vertical class="h-3/5 bg-hei-se-black my-auto" />

            <div class="flex justify-center w-1/3">
              <div class="flex flex-col items-center justify-center pb-10 px-20 md:pt-15">
                <p class="flex text-iceberg text-md leading-xs mb-20">Total Bots</p>
                <p class="flex text-white text-xl leading-xs">
                  <span class="font-bold block truncate">{{ getBotsStats.length || 0 }}</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- MOBILE VIEW -->
      <div v-else class="flex flex-col flex-shrink-0 px-20 md:px-0">
        <Card class="flex flex-col bg-dark-200 rounded-3 p-14 mb-20" :header="false">
          <div slot="content" class="flex justify-center">
            <div class="flex flex-col items-center justify-center pb-10 px-20 md:pt-15">
              <p class="flex flex text-iceberg text-xl leading-xs font-medium mb-20">Total UBXT Gained</p>
              <p class="flex text-white text-xl leading-xs">
                <span class="font-bold block truncate">{{ totalUbxtGained }}</span>
                &nbsp;
                <span class="font-light text-iceberg">UBXT</span>
              </p>
            </div>
          </div>
        </Card>

        <Card class="flex flex-col bg-dark-200 rounded-3 p-14 mb-20" :header="false">
          <div slot="content" class="flex justify-center">
            <div class="flex flex-col items-center justify-center pb-10 px-20 md:pt-15">
              <p class="flex flex text-iceberg text-xl leading-xs font-medium mb-20">Total Followers</p>
              <p class="flex text-white text-xl leading-xs">
                <span class="font-bold block truncate">{{ totalFollowwers }}</span>
              </p>
            </div>
          </div>
        </Card>

        <Card class="flex flex-col bg-dark-200 rounded-3 p-14" :header="false">
          <div slot="content" class="flex justify-center">
            <div class="flex flex-col items-center justify-center pb-10 px-20 md:pt-15">
              <p class="flex flex text-iceberg text-xl leading-xs font-medium mb-20">Total Profit Generated</p>
              <p class="flex text-white text-xl leading-xs">
                <span class="font-bold block truncate">0 %</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <AppDivider class="mt-35 mb-30 flex-shrink-0 opacity-50" />

      <!-- MY RENTED BOTS -->
      <div class="flex flex-col px-20 md:px-0">
        <p class="leading-xl text-iceberg mb-20">My Rented Bots</p>

        <Card class="ubxt-transaction__card flex flex-col w-full bg-dark-200 rounded-3" :header="false">
          <div slot="content" class="flex items-start justify-around h-full">
            <MyRentedBotTable class="my-bot__table" :tableData="getBotsStats" />
          </div>
        </Card>
      </div>

      <AppDivider class="mt-35 mb-30 flex-shrink-0 opacity-50" />

      <!-- UBXT TRANSACTION -->
      <div class="flex flex-col">
        <div class="flex justify-between mb-20">
          <p class="leading-xl text-iceberg">UBXT Transaction</p>
          <label class="flex items-center">
            <app-checkbox v-model="isGrouping">
              Grouping
            </app-checkbox>
          </label>
        </div>

        <Card class="ubxt-transaction__card flex flex-col w-full bg-dark-200 rounded-3" :header="false">
          <div slot="content" class="flex items-start justify-around h-full">
            <UBXTTransaction :transactionsData="getUserBotsTransactions" :isGrouping="isGrouping" />
          </div>
        </Card>
      </div>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { namespace } from "vuex-class";

const algobots = namespace("algobotsModule");
const perfees = namespace("perfeesModule");

import { Component, Vue } from "vue-property-decorator";

import GeneralLayout from "@/views/GeneralLayout.vue";
import { AlgoBotsStats } from "@/store/algo-bots/types/algo-bots-stats.payload";
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";
import { UserTransaction } from "@/store/perfees/types";
import UBXTTransaction from "@/components/ubxt-wallet/ubxt-transaction-table/UBXTTransaction.vue";
import MyRentedBotTable from "@/components/ubxt-wallet/MyRentedBotTable.vue";

type UBXTWalletTab = { value: number; label: string; route: string };

@Component({ name: "DevMode", components: { GeneralLayout, UBXTTransaction, MyRentedBotTable } })
export default class DevMode extends Vue {
  /* VUEX */
  @algobots.Action fetchBotsStats: () => Promise<AlgoBotsStats[]>;
  @algobots.Getter getBotsStats: AlgoBotsStats[];
  @perfees.Action fetchUserTransactions!: any;
  @perfees.Getter getUserTransactions!: UserTransaction[];
  @algobots.Getter getAlgoBots: AlgoBot[];
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;

  /* DATA */
  tabValue: number = 2;
  tabData: UBXTWalletTab[] = [
    { value: 1, label: "UBXT Wallet", route: "ubxt-wallet" },
    { value: 2, label: "My Bots Stats", route: "dev-mode" },
  ];
  isGrouping: boolean = false;

  /* COMPUTED */
  get totalUbxtGained() {
    return this.getBotsStats.map((s) => s.totalRealisedUbxtGain).reduce((a, b) => a + b, 0);
  }
  get totalFollowwers() {
    return this.getBotsStats.map((s) => s.totalUsers).reduce((a, b) => a + b, 0);
  }
  get getUserBotsTransactions() {
    return this.getUserTransactions.filter((s) => s.botId && s.type === "PERFORMANCE_FEE" && s.subType === "DEVELOPER");
  }

  /* METHODS */
  changeTab(item: UBXTWalletTab) {
    if (this.$route.name !== `${item.route}`) {
      this.$router.push({ name: item.route as string });
    }
  }

  /* HOOKS */
  async mounted() {
    await this.fetchBotsStats();
    await this.fetchUserTransactions();
    await this.fetchAlgoBotsAction();
  }
}
</script>

<style lang="scss" scoped>
.ubxt-wallet {
  &__change-tab-btn {
    max-width: 260px;
  }
}

.my-bots {
  &__create-bot-btn-wrap {
    min-width: 120px;
  }
  &__card-wrap {
    grid-auto-rows: minmax(min-content, max-content);
  }

  &__table {
    height: 400px;
  }
  @media (max-width: 1300px) {
    &__card-wrap {
      @apply grid-cols-2;
    }
  }
  @media (max-width: 900px) {
    &__card-wrap {
      @apply grid-cols-1;
    }
  }
}

.add-exchanges-btn {
  bottom: 80px;
}
</style>
