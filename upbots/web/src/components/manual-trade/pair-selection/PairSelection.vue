<template>
  <div class="pair-selection__inner flex-shrink-0 bg-gable-green" :class="{ 'pb-25': isOpen, 'pointer-events-none': disabled }">
    <div :class="{ 'pb-20': !isOpen }" class="flex items-center w-full cursor-pointer pt-20 px-20" @click="isOpen = !isOpen">
      <p class="text-iceberg text-sm leading-xs mr-8">Pair:</p>

      <div class="flex items-center cursor-pointer">
        <span class="text-sm leading-xs text-white uppercase">{{ selectedPair.name }}</span>
        <span class="icon-arrow-expand text-grey-cl-920 ml-6" :class="{ 'transform rotate-180': isOpen }" />
      </div>
    </div>

    <transition name="fade">
      <div v-if="isOpen" class="flex flex-col mt-10 overflow-y-auto custom-scrollbar">
        <!-- FILTERS BAR -->
        <PairFiltersBar
          :filters="tradingFilters"
          :alts="alts"
          :stable-coins="stableCoins"
          :isFavourite="isFavourite"
          @favouritePair="favouritePair"
          @change="handlePairFilters"
          @input="handleInputFilter"
        />

        <!-- PAIRS TABLE -->
        <div class="flex flex-col overflow-y-auto custom-scrollbar">
          <div class="flex items-center mb-5 px-20">
            <div class="table__col-1 flex pr-10">
              <span class="text-iceberg text-xs leading-xs">Pair</span>
            </div>

            <div class="table__col-2 flex pr-8">
              <span class="text-iceberg text-xs leading-xs">Last Price</span>
            </div>

            <div class="table__col-3 flex">
              <span class="text-iceberg text-xs leading-xs">Change</span>
            </div>
          </div>

          <!-- PAIR ITEMS -->
          <div v-if="toDisplay.length" class="pair-selection__list-items-wrap flex flex-col py-10 overflow-y-auto custom-scrollbar">
            <PairItem
              v-for="(item, index) in toDisplay"
              :exchange="exchange"
              :key="index"
              :data="item"
              :change="changes[item.symbolForData]"
              :lastPrice="lastPrices[item.symbolForData]"
              @select="pairChange(item)"
            />
          </div>

          <div v-else class="mt-30">
            <div class="text-grey-cl-300 text-sm leading-xs text-center">No Data</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { GroupItems } from "@/models/interfaces";
import { tradingFilters } from "./trading-filters";

const user = namespace("userModule");
const userSettings = namespace("userSettingsModule");
const trade = namespace("tradeModule");

import PairFiltersBar from "@/components/manual-trade/pair-selection/PairFiltersBar.vue";
import PairItem from "@/components/manual-trade/pair-selection/PairItem.vue";

@Component({ name: "PairSelection", components: { PairFiltersBar, PairItem } })
export default class PairSelection extends Vue {
  /* VUEX */
  @userSettings.Mutation setFavouritePairs: (favourites: string[]) => void;
  @user.State alts: Array<string>;
  @user.State stableCoins: Array<string>;
  @trade.State selectedCurrencyPair: any;
  @trade.Getter getExchange: string;
  @trade.Getter getAvailablePairs: any;

  /* PROPS */
  @Prop({ required: true }) value!: any;
  @Prop({ required: true }) exchange!: string;
  @Prop({ type: Boolean, default: false }) disabled: boolean;

  /* DATA */
  isOpen: boolean = false;
  currentFilter: any = null;
  inputFilter: any = "";
  isFavourite: boolean = true;

  tradingFilters = tradingFilters;
  fetchDelay: number = 3000;
  lastPrices: any = {};
  changes: any = {};
  fetchAllowed: boolean = true;

  /* COMPUTED */

  // get selected pair
  get selectedPair() {
    return this.selectedCurrencyPair;
  }

  // filtered by favourite pairs
  get favouriteFiltered() {
    if (this.isFavourite) {
      return this.getAvailablePairs.filter((i: any) => i.isFavourite);
    } else {
      return this.getAvailablePairs;
    }
  }

  // filtered by dropdowns
  get dropdownFiltered() {
    if (this.currentFilter && this.currentFilter.headerLabel) {
      return this.favouriteFiltered;
    } else if (this.currentFilter && this.currentFilter.value) {
      return this.getAvailablePairs.filter((i: any) => i.quoteCurrency === this.currentFilter.value);
    } else {
      return this.favouriteFiltered;
    }
  }

  // pair data for display
  get toDisplay() {
    const filterValue = this.inputFilter.trim().toLowerCase();

    if (!filterValue.length) {
      return this.dropdownFiltered;
    } else {
      return this.dropdownFiltered.filter((i: any) => {
        return i.name.toLowerCase().indexOf(filterValue) > -1;
      });
    }
  }

  /* HOOKS */
  beforeDestroy() {
    this.fetchAllowed = false;
  }

  mounted() {
    this.setDefaultFavourites();
    this.fetchSummariesUpdate();
  }

  /* METHODS */
  setDefaultFavourites() {
    const areFavouritePairsSet = localStorage.getItem("areFavouritePairsSet");
    if (!areFavouritePairsSet) {
      const favourites = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "BNBUSDT", "LTCUSDT", "LINKUSDT", "DOTUSDT"];
      this.setFavouritePairs(favourites);
      localStorage.setItem("areFavouritePairsSet", "true");
    }
  }

  fetchSummariesUpdate() {
    if (!this.fetchAllowed) return;

    this.$http
      .get<any>(`/api/price/summary`, {
        params: {
          exchange: this.getExchange,
        },
      })
      .then(({ data }) => {
        this.lastPrices = {};
        this.changes = {};
        data.forEach((elem: any) => {
          this.lastPrices[elem.symbolForData] = elem.price && elem.price.last;
          this.changes[elem.symbolForData] = elem.price && elem.price.change && elem.price.change.percentage;
        });

        setTimeout(() => {
          this.fetchSummariesUpdate();
        }, this.fetchDelay);
      })
      .catch((_) => {
        this.lastPrices = {};
        this.changes = {};
      });
  }

  handlePairFilters(obj: GroupItems) {
    this.currentFilter = obj;
    this.isFavourite = false;
    this.inputFilter = "";
  }

  handleInputFilter(value: string) {
    this.currentFilter = null;
    this.isFavourite = false;
    this.inputFilter = value;
  }

  favouritePair(value: boolean) {
    this.currentFilter = "";
    this.isFavourite = value;
    this.inputFilter = "";
  }

  pairChange(item: any) {
    this.$emit("input", item);
    this.$emit("change");
    this.isOpen = false;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.pair-selection {
  &__list-items-wrap {
    max-height: 237px;
  }
}
.icon-arrow-expand {
  font-size: 6px;
  transition: all 0.3s linear;
}

.table {
  &__col-1 {
    width: 50%;
  }
  &__col-2 {
    width: 27%;
  }
  &__col-3 {
    width: 23%;
  }
}
</style>
