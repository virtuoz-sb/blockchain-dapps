<template>
  <div class="portfolio-balance__wrap flex flex-col md:h-full" :class="!data && 'disabled'">
    <div class="flex items-center py-20 xl:py-24 px-20">
      <div class="w-full flex items-center justify-center">
        <p class="text-xxl1 leading-xs text-white mr-7">{{ currencyCharacter }}</p>
        <p class="flex items-center">
          <span class="text-xxl1 leading-xs text-blue-cl-500 text-shadow-3">
            {{ balanceData && currencyKey && balanceData[currencyKey] | fixed(2, "N/A") }}
          </span>
        </p>
      </div>
    </div>
    <div class="bg-dark-cl-300 md:rounded-b-3 py-16 px-20 mt-auto">
      <span class="flex justify-center w-full text-md leading-xs text-white">
        {{ balanceData && balanceData.btc | fixed(8, "N/A") }} {{ balanceData ? "BTC" : null }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
const dummyData: any = {
  btc: 8.040858350401413,
  eur: 78355.75236715666,
  usd: 92757.73375856061,
  conversionDate: "2020-10-13T00:00:00.000Z",
};

import { Component, Vue, Prop } from "vue-property-decorator";
import { FavoriteCurrency } from "@/components/portfolio/types/portfolio.types";

@Component({ name: "PortfolioBalance" })
export default class PortfolioBalance extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: FavoriteCurrency;
  @Prop({ required: true }) currencyKey!: string;

  /* COMPUTED */
  get currencyCharacter() {
    if (this.balanceData && this.currencyKey) {
      return this.currencyKey === "usd" ? "$" : "€";
    } else {
      return "";
    }
  }

  get balanceData() {
    return this.data ? this.data : dummyData;
  }
}
</script>

<style lang="scss" scoped>
.portfolio-balance {
  &__wrap {
    &.disabled {
      &:after {
        content: "No Data Available";
        background: rgba(27, 49, 58, 0.8);
        @apply flex items-center justify-center absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed text-iceberg;
      }
    }
  }
}
</style>
