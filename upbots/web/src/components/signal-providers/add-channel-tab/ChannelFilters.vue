<template>
  <div class="flex items-center flex-wrap flex-shrink-0 px-20 pt-20">
    <div class="flex items-center flex-wrap w-full">
      <!-- SEARCH -->
      <AppInput class="search-input w-full mr-30 mb-12" v-model="search" type="text" placeholder="Search" custom-class="pl-36" size="sm">
        <i class="absolute left-10 top-1/2 transform -translate-y-1/2 icon-search text-grey-cl-100 text-xl1" />
      </AppInput>

      <div class="flex items-center flex-wrap flex-grow mr-0 sm:mr-60">
        <!-- NAME -->
        <div class="flex items-start mb-12 mr-20 pr-20 sm:border-r border-grey-cl-400">
          <p class="text-grey-cl-100 text-sm leading-xs mr-8">Name:</p>
          <AppDropdownBasic v-model="strategyValue" :options="strategyData" dark />
        </div>

        <!-- EXCHANGES -->
        <div class="flex items-center mb-12 mr-20 pr-20 sm:border-r border-grey-cl-400">
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

        <!-- PRICE / MONTH -->
        <div class="flex items-start flex-grow mb-12 mr-30 md:mr-0">
          <p class="text-grey-cl-100 text-sm leading-xs mr-8">Price/month:</p>
          <AppRangeSlider :options="{ min: 1, max: 100 }" v-model="priceMonth" labels="$" tooltip="active" :formatter="`${priceMonth}$`" />
        </div>
      </div>

      <!-- RESET FILTERS -->
      <div class="flex items-center cursor-pointer mb-12" :class="{ 'ml-auto': !$breakpoint.smAndDown }">
        <i class="icon-cross text-blue-cl-100 text-xxs mr-6 mt-px" />
        <span class="text-blue-cl-100 text-sm leading-xs">Reset All Filters</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";

@Component({ name: "ChannelFilters" })
export default class ChannelFilters extends Vue {
  /* DATA */
  search: string = "";

  strategyValue: object = { label: "4C-trading", value: 1 };
  strategyData: GroupItems[] = [
    { label: "4C-trading", value: 1 },
    { label: "4C-trading", value: 2 },
  ];

  exchangesValue: object = { label: "Exchanges", value: 1 };
  exchangesData: GroupItems[] = [
    { label: "Binance", value: 1 },
    { label: "Bitmex", value: 2 },
  ];
  selectedExchangeData: any[] = [];

  priceMonth: number = 33;

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
}
</script>

<style lang="scss" scoped>
::v-deep .search-input {
  .icon-search {
    @apply text-md;
  }
  @media (min-width: 768px) {
    max-width: 240px;
  }
}

::v-deep .range-slider {
  &__wrap {
    max-width: 210px;
  }
}
</style>
