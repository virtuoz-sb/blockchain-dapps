<template>
  <div class="flex flex-col flex-grow w-full my-20 overflow-y-auto custom-scrollbar">
    <!-- FILTERS -->
    <div class="flex flex-wrap items-center justify-between w-full mb-30 px-20">
      <div class="flex flex-wrap items-center">
        <!-- TRANSFER -->
        <div class="flex items-start border-r border-grey-cl-400 mr-20 pr-20 mb-10">
          <p class="text-grey-cl-100 text-sm leading-xs mr-6">Transfer:</p>
          <app-dropdown-basic v-model="transferValue" :options="transferData" dark />
        </div>

        <!-- STATUS -->
        <div class="flex items-start border-r border-grey-cl-400 mr-20 pr-20 mb-10">
          <p class="text-grey-cl-100 text-sm leading-xs mr-6">Status:</p>
          <app-dropdown-basic v-model="statusValue" :options="statusData" dark />
        </div>

        <!-- DATE -->
        <div class="flex items-start mb-10">
          <span class="text-grey-cl-100 text-sm leading-xs mr-6">Date:</span>
          <app-dropdown-basic v-model="dateValue" :options="dateData" dark />
        </div>
      </div>

      <div class="flex items-center ml-auto mb-10 cursor-pointer">
        <i class="icon-cross text-blue-cl-100 text-xxs mr-6 mt-px" />
        <span class="text-blue-cl-100 text-sm leading-xs">Reset All Filters</span>
      </div>
    </div>

    <!-- TABLE -->
    <div class="flex flex-col flex-grow w-full overflow-y-auto custom-scrollbar">
      <template v-if="transactionData.length">
        <!-- TABLE LABELS -->
        <UBXTTransactionLabel />

        <!-- TABLE ITEMS -->
        <UBXTTransactionItem :data="transactionData" />
      </template>

      <div v-else class="flex flex-1 items-center justify-center">
        <span class="text-iceberg">No Data Available</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";

type TransactinData = { icon: string; title: string; price: number; date: string };

const faceData: TransactinData[] = [
  { icon: "icon-algo-bots", title: "Bot trading fees", price: -400, date: "10/09/2020" },
  { icon: "icon-learning", title: "Training purchase", price: 600, date: "10/09/2020" },
  { icon: "icon-signals-providers", title: "Referral fees", price: 500, date: "10/09/2020" },
  { icon: "icon-algo-bots", title: "Bot trading fees", price: -400, date: "10/09/2020" },
  { icon: "icon-learning", title: "Training purchase", price: 600, date: "10/09/2020" },
  { icon: "icon-signals-providers", title: "Referral fees", price: 500, date: "10/09/2020" },
  { icon: "icon-algo-bots", title: "Bot trading fees", price: -400, date: "10/09/2020" },
  { icon: "icon-learning", title: "Training purchase", price: 600, date: "10/09/2020" },
  { icon: "icon-signals-providers", title: "Referral fees", price: 500, date: "10/09/2020" },
  { icon: "icon-algo-bots", title: "Bot trading fees", price: -400, date: "10/09/2020" },
  { icon: "icon-learning", title: "Training purchase", price: 600, date: "10/09/2020" },
  { icon: "icon-signals-providers", title: "Referral fees", price: 500, date: "10/09/2020" },
  { icon: "icon-algo-bots", title: "Bot trading fees", price: -400, date: "10/09/2020" },
  { icon: "icon-learning", title: "Training purchase", price: 600, date: "10/09/2020" },
  { icon: "icon-signals-providers", title: "Referral fees", price: 500, date: "10/09/2020" },
];

import UBXTTransactionLabel from "@/components/ubxt-wallet/UBXTTransactionLabel.vue";
import UBXTTransactionItem from "@/components/ubxt-wallet/UBXTTransactionItem.vue";

@Component({ name: "UBXTTransaction", components: { UBXTTransactionLabel, UBXTTransactionItem } })
export default class UBXTTransaction extends Vue {
  /* DATA */
  transactionData: TransactinData[] = [];

  transferValue: GroupItems = { label: "Deposit", value: 1 };
  transferData: GroupItems[] = [{ label: "Deposit", value: 1 }];

  statusValue: GroupItems = { label: "All", value: 1 };
  statusData: GroupItems[] = [{ label: "All", value: 1 }];

  dateValue: GroupItems = { label: "09/2020", value: 1 };
  dateData: GroupItems[] = [{ label: "09/2020", value: 1 }];
}
</script>
