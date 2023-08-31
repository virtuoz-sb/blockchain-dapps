<template>
  <Card class="flex flex-col bg-dark-200 rounded-3" header-classes="flex items-center'">
    <template slot="header-left">
      <div v-if="$slots['header-icon-left']" class="flex w-1/2">
        <slot name="header-icon-left" />
        <div class="leading-md text-iceberg">{{ title }}</div>
      </div>
      <div v-if="$slots['header-icon-right']" class="flex w-1/2 justify-end">
        <slot name="header-icon-right" />
      </div>
    </template>

    <div slot="content" class="currency-card__content flex flex-col md:h-full relative" :class="!balanceData && 'disabled'">
      <div class="flex items-center md:h-full py-20 xl:py-28 px-20">
        <div class="w-full flex items-center justify-center">
          <slot />

          <p class="text-xxl2 leading-xs mr-7" :class="currencyValueClass">{{ currencyCharacter }}</p>

          <p class="flex items-center">
            <span class="text-xxl2 leading-xs" :class="currencyValueClass">
              {{ balance && currencyKey && balance[currencyKey] | fixed(2, "N/A") }}
            </span>
          </p>
        </div>
      </div>

      <div class="py-18 px-20 bg-gable-green md:rounded-b-3 mt-auto">
        <span class="flex justify-center w-full text-md leading-xs text-iceberg">
          {{ balance && balance.btc | fixed(8, "N/A") }} {{ balance ? "BTC" : null }}
        </span>
      </div>
    </div>
  </Card>
</template>

<script lang="ts">
type DummyData = { btc: number; eur: number; usd: number; conversionDate: string };

const dummyData: DummyData = {
  btc: 8.040858350401413,
  eur: 78355.75236715666,
  usd: 92757.73375856061,
  conversionDate: "2020-10-13T00:00:00.000Z",
};

import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "CurrencyCard" })
export default class CurrencyCard extends Vue {
  /* PROPS */
  @Prop({ required: true }) balanceData: DummyData;
  @Prop({ required: true }) currencyKey!: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: false, default: "text-bright-turquoise" }) currencyValueClass: string;

  /* COMPUTED */
  get currencyCharacter() {
    if (this.balanceData && this.currencyKey) {
      return this.currencyKey === "usd" ? "$" : "€";
    } else {
      return "";
    }
  }

  get balance() {
    return this.balanceData ? this.balanceData : dummyData;
  }
}
</script>

<style lang="scss" scoped>
.currency-card {
  &__content {
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
