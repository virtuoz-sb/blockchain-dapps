<template>
  <div class="flex flex-col w-full mb-22">
    <div class="flex items-center justify-between px-20 mb-10">
      <!-- FAVOURITE -->
      <div class="relative text-grey-cl-400 cursor-pointer" @click="toggleFavouritePair">
        <div aria-hidden="true" class="icon-star text-xs" />
        <div :class="isFavourite ? 'w-full' : 'w-0'" class="front-stars is-single absolute top-0 flex gradient-1 overflow-hidden text-xs">
          <span aria-hidden="true" class="icon-star" />
        </div>
      </div>

      <!-- BTC -->
      <div class="flex mr-5 cursor-pointer" @click="handlePairFilters({ value: 'BTC', label: 'BTC' }, 'btc')">
        <span class="text-xs leading-xs text-iceberg uppercase">BTC</span>
      </div>

      <!-- ALTS -->
      <AppDropdownBasic
        :value="alts"
        :options="filters.alts"
        list
        item-size="xs"
        class="mr-5"
        truncate
        @change="(value) => handlePairFilters(value, 'alts')"
      />

      <!-- STABLE COINS -->
      <AppDropdownBasic
        :value="stableCoins"
        :options="filters.stableCoins"
        list
        item-size="xs"
        truncate
        @change="(value) => handlePairFilters(value, 'stableCoins')"
      />
    </div>

    <!-- SEARCH -->
    <AppInput v-model="search" type="search" placeholder="Search" size="sm" class="w-full px-20" @input="handleInputFilter" />
  </div>
</template>

<script lang="ts">
const stableCoins = { value: "STABLECOINS", label: "STABLE COINS", headerLabel: true };
const alts = { value: "ALTS", label: "ALTS", headerLabel: true };

import { Component, Vue, Prop } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";
import { PairsFilter } from "./types";

@Component({ name: "PairFiltersBar" })
export default class PairFiltersBar extends Vue {
  /* PROPS */
  @Prop({ required: true }) filters: PairsFilter;
  @Prop({ required: true }) isFavourite: boolean;

  /* DATA */

  alts: any = alts;
  stableCoins: any = stableCoins;
  search: string = "";

  /* METHODS */
  toggleFavouritePair() {
    this.stableCoins = stableCoins;
    this.alts = alts;

    this.$emit("favouritePair", !this.isFavourite);
  }

  handlePairFilters(item: GroupItems, type: string) {
    if (type === "alts") {
      this.stableCoins = stableCoins;
      this.alts = item;
    }

    if (type === "stableCoins") {
      this.alts = alts;
      this.stableCoins = item;
    }

    if (type === "btc") {
      this.stableCoins = stableCoins;
      this.alts = alts;
    }
    this.$emit("favouritePair", false);
    this.$emit("change", item);
  }

  handleInputFilter(value: string) {
    const filterValue = value.trim().toLowerCase();
    this.stableCoins = stableCoins;
    this.alts = alts;

    this.$emit("input", filterValue);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/_star.scss";
</style>
