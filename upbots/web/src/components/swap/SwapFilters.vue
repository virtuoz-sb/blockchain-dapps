<template>
  <div class="flex flex-col pt-20 px-20 mb-10">
    <div class="flex items-center w-full bg-san-juan rounded-5 py-9 px-12 mb-10" @click="isFilterOpen = !isFilterOpen">
      <i class="icon-filters text-iceberg text-base" />
      <span class="text-sm leading-md text-iceberg ml-7">Filters {{ filtersCount.length ? `(${filtersCount.length})` : null }}</span>
    </div>

    <div v-if="isFilterOpen" class="flex flex-col mb-12">
      <div class="flex items-center justify-between mb-10">
        <AppDropdownBasic
          :value="defaultLabels"
          :options="exchangesData"
          placeholder-classes="text-grey-cl-920"
          key-label="label"
          key-value="id"
          dark
          @change="toggleExchange"
        />

        <p class="text-base leading-xs text-astral" @click="$emit('toggleAllExchangesChecked')">
          {{ allExchangesChecked ? "Unselect All" : "Select all" }}
        </p>
      </div>

      <div v-if="activeExchange.length" class="flex flex-wrap">
        <div
          v-for="(item, index) in activeExchange"
          :key="index"
          class="exchange__tag flex items-center bg-astral text-white rounded-5 px-8 py-2 mr-10 last:mr-0 mb-5"
        >
          <img v-if="exchangeImages[item.id]" :src="exchangeImages[item.id]" :alt="item.name" class="flex w-22 h-22 mr-4" />
          <p class="flex text-sm mr-5">{{ item.label }}</p>
          <div class="flex mt-2">
            <i class="text-xxs icon-cross cursor-pointer" @click="toggleExchange(item)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import { Exchange } from "./types/types";

@Component({ name: "SwapFilters" })
export default class SwapFilters extends Vue {
  /* PROPS */
  @Prop({ required: true }) exchangesData: Exchange[];
  @Prop({ required: true }) exchangeImages: Record<string, string>;
  @Prop({ required: true, type: Boolean }) allExchangesChecked: boolean;

  /* DATA */
  isFilterOpen: boolean = false;
  filtersCount: string[] = ["Exchanges"];
  defaultLabels: Exchange = { id: "exchanges", label: "Exchanges", checked: false };

  /* COMPUTED */
  get activeExchange() {
    return this.exchangesData.filter((i: Exchange) => {
      return i.checked;
    });
  }

  /* METHODS */
  toggleExchange(item: Exchange) {
    this.$emit("toggleExchange", item);
  }
}
</script>
