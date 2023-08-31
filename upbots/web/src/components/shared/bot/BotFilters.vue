<template>
  <div class="flex items-center flex-wrap flex-shrink-0 px-20 lg:pt-50">
    <div class="flex items-center flex-1 flex-wrap w-full">
      <!-- SEARCH INPUT (TABLE, DESKTOP) -->
      <AppInput
        v-if="!$breakpoint.smAndDown"
        class="search-input w-full mr-30 mb-12 flex:1"
        v-model="search"
        type="text"
        placeholder="Search"
        custom-class="pl-36"
      >
        <i class="absolute left-10 top-1/2 transform -translate-y-1/2 icon-search text-grey-cl-100 text-xl1"></i>
      </AppInput>

      <!-- SEARCH INPUT (MOBILE) -->
      <AppInput v-else class="search-input w-full mb-15" v-model="search" type="text" placeholder="Search" custom-class="pl-38 py-10">
        <i class="absolute left-10 top-1/2 transform -translate-y-1/2 icon-search text-grey-cl-100 text-xl1" />
      </AppInput>

      <!-- MOBILE: TOGGLE FILTER AND SORTED FILTER -->
      <div v-if="$breakpoint.smAndDown" class="flex items-center w-full mb-15 flex:1">
        <div class="flex items-center w-full bg-san-juan rounded-5 py-9 px-12 mr-12" @click="isFilterOpen = !isFilterOpen">
          <i class="icon-filters text-iceberg text-base" />
          <span class="text-sm leading-md text-white ml-7">Filters {{ filtersCount.length ? `(${filtersCount.length})` : null }}</span>
        </div>

        <AppSelect v-model="sortedByValue" :options="sortedByData" class="ml-12 w-full" />
      </div>

      <!-- STRATEGY FILTER -->
      <div v-if="!$breakpoint.smAndDown || isFilterOpen" class="flex flex-1 mb-12 mr-20 pr-20 sm:border-r border-grey-cl-400">
        <p class="text-grey-cl-100 text-sm leading-xs mr-8">Strategy:</p>
        <app-dropdown-basic v-model="strategyValue" :options="strategyData" dark />
      </div>

      <!-- EXCHANGE FILTER -->
      <div v-if="!$breakpoint.smAndDown || isFilterOpen" class="flex items-center flex-3 mr-0 sm:mr-60">
        <div class="flex items-center flex-1 mb-12 mr-20 pr-20 sm:border-r border-grey-cl-400">
          <AppDropdownBasic
            :value="exchangesValue"
            :options="exchangesData"
            placeholder-classes="text-grey-cl-920"
            dark
            @change="addExchange"
          />

          <div v-if="selectedExchangeData.length" class="exchange__tags-wrap flex items-center ml-8">
            <div
              v-for="(item, index) in selectedExchangeData"
              :key="item.value"
              class="exchange__tag flex items-center bg-blue-cl-100 text-white rounded-5 px-8 mr-10 last:mr-0"
            >
              <span class="text-sm mr-3">{{ item.label }}</span>
              <i class="text-xxs icon-cross mt-2 cursor-pointer" @click="removeExchage(index)" />
            </div>
          </div>
        </div>

        <!-- PAIRS FILTER -->
        <div
          v-if="!$breakpoint.smAndDown || isFilterOpen"
          class="flex items-center flex-1 mb-12 mr-20 pr-20 sm:border-r border-grey-cl-400"
        >
          <p class="text-grey-cl-100 text-sm leading-xs mr-8">Pairs:</p>
          <app-dropdown-basic v-model="pairsValue" :options="pairsData" dark />
        </div>

        <!-- SORT FILTER -->
        <div v-if="!$breakpoint.smAndDown" class="flex items-start flex-1 mb-12 mr-30 md:mr-0">
          <p class="text-grey-cl-100 text-sm leading-xs mr-8">Sorted by:</p>
          <AppDropdownBasic v-model="sortedByValue" :options="sortedByData" dark />
        </div>
      </div>

      <!-- RESET FILTERS -->
      <div
        v-if="!$breakpoint.smAndDown || isFilterOpen"
        class="flex items-center cursor-pointer mb-12"
        :class="!$breakpoint.smAndDown ? 'ml-auto' : 'w-full'"
        @click="resetFilters"
      >
        <i class="icon-cross text-blue-cl-100 text-xxs mr-6 mt-px" />
        <span class="text-blue-cl-100 text-sm leading-xs">Reset All Filters</span>
      </div>
    </div>

    <AppButton v-if="showButton" type="light-green" size="xs" class="w-full sm:hidden" @click="$router.push('/create-new-bot')">
      Create New Bot
    </AppButton>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";
import { AlgobotsData, PairsData } from "@/store/algo-bots/types/algo-bots.const";

@Component({ name: "BotFilters" })
export default class BotFilters extends Vue {
  /* PROPS */
  @Prop({ type: Boolean, default: true }) showButton: boolean;

  /* DATA */
  search: string = "";

  strategyValue: GroupItems = { label: "Long", value: "long" };
  strategyData: GroupItems[] = [{ label: "Long", value: "long" }];

  pairsValue: GroupItems = { label: "All", value: "all" };
  pairsData: GroupItems[] = PairsData;

  exchangesValue: GroupItems = { label: "Exchanges", value: -1 };
  exchangesData: any[] = [
    { label: "FTX", value: 1 },
    { label: "Binance", value: 2 },
    { label: "KuCoin", value: 3 },
  ];
  selectedExchangeData: any[] = [];

  // TODO: retrieve the bots exchange details from the api
  // now we made it static.
  botExchangesType: any[] = AlgobotsData;
  sortedByValue: GroupItems = { label: "Total perf %", value: "performance" };
  sortedByData: GroupItems[] = [
    { label: "Total perf %", value: "performance" },
    { label: "6m perf %", value: "performance_6m" },
    { label: "3m perf %", value: "performance_3m" },
    { label: "Creation date", value: "date" },
  ];

  filtersCount: string[] = ["Strategy", "Exchanges", "Pairs"];

  isFilterOpen: boolean = false;

  /* COMPUTED */
  get activeExchange() {
    return this.exchangesData.filter((i: any) => i.isActive);
  }

  get activeExchangeName() {
    const exchangeName = this.activeExchange.map((e: any) => e.label);
    return exchangeName;
  }

  /* WATCHERS */
  @Watch("search", { immediate: true })
  onTextChange() {
    this.$emit("onTextChange", this.search);
  }

  @Watch("sortedByValue", { immediate: true, deep: true })
  onSortedValueChange() {
    this.$emit("onSortedValueChange", this.sortedByValue.value);
  }

  @Watch("strategyValue", { immediate: true, deep: true })
  onStratagyChange() {
    this.$emit("onStratagyChange", this.strategyValue.value);
  }

  @Watch("selectedExchangeData", { immediate: true, deep: true })
  onExchangeChange() {
    const selectBots = this.botExchangesType.filter((e) => {
      return this.selectedExchangeData.length === 0 || this.selectedExchangeData.find((a) => e.exchangesType.includes(a.label));
    });
    this.$emit(
      "onExchangeChange",
      selectBots.map(({ botName }) => botName)
    );
  }

  @Watch("pairsValue", { immediate: true, deep: true })
  onPairsChange() {
    this.$emit("onPairsChange", this.pairsValue.value);
  }

  /* METHODS */
  addExchange(item: any) {
    if (this.selectedExchangeData.length) {
      const exist = this.selectedExchangeData.find((i: any) => i.value === item.value);
      if (!exist) {
        this.selectedExchangeData.push(item);
      }
    } else {
      this.selectedExchangeData.push(item);
    }
  }

  removeExchage(index: any) {
    this.selectedExchangeData.splice(index, 1);
  }

  resetFilters() {
    this.search = "";
    this.pairsValue = { label: "All", value: "all" };
    this.strategyValue = { label: "Long", value: "long" };
    this.sortedByValue = { label: "Creation date", value: "date" };
    this.selectedExchangeData = [];
  }
}
</script>

<style lang="scss" scoped>
.flex-3 {
  flex: 3;
}
::v-deep .search-input {
  .input {
    @apply py-8;
  }
  .icon-search {
    @apply text-md;
  }
  @media (min-width: 768px) {
    max-width: 240px;
  }
}
</style>
