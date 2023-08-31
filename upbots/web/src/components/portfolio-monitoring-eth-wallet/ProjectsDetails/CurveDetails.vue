<template>
  <div :class="!isDataAvailabe ? 'coming-soon' : null">
    <!-- POOL -->
    <div v-if="isDataAvailabe" class="flex flex-col mb-10 md:mb-0">
      <!-- TITLE FOR MOBILE VIEW -->
      <div v-if="$breakpoint.smAndDown" class="flex w-full pt-20 px-20 mb-15">
        <span class="text-md leading-xs text-hidden-sea-glass">Pool</span>
      </div>

      <!-- SUB TITLES -->
      <div class="card__titles-wrap grid grid-cols-4 md:grid-cols-5 col-gap-10 relative bg-gable-green px-20 py-6 md:py-12">
        <span
          v-for="(item, index) in poolData"
          :key="index"
          :class="{ 'font-bold': index === 0 }"
          class="truncate text-hidden-sea-glass text-sm md:text-xl leading-xs"
        >
          {{ item }}
        </span>
      </div>

      <!-- LIST ITEMS -->
      <div v-if="items.curve && items.curve.length">
        <div
          v-for="(item, index) in items.curve"
          :key="index"
          class="grid grid-cols-4 md:grid-cols-5 col-gap-10 items-center pt-8 px-20 mb-6 md:mb-10 last:mb-0 md:last:mb-10"
        >
          <div v-if="!$breakpoint.smAndDown" />

          <div class="flex items-center">
            <div
              v-for="(token, index) in item.tokens"
              :key="index"
              class="flex-shrink-0 rounded-full overflow-hidden"
              :class="index > 0 && ($breakpoint.smAndDown ? '-ml-14' : '-ml-6')"
              :style="`z-index: ${index};`"
            >
              <CryptoCoinChecker :data="token.tickerSymbol">
                <template slot-scope="{ isExist, coinName, srcCoin }">
                  <img v-if="isExist" :src="require(`@/assets/icons/${srcCoin}.png`)" :alt="srcCoin" class="w-20 md:w-24 h-20 md:h-24" />
                  <cryptoicon v-else :symbol="coinName" :size="$breakpoint.width > 767 ? '24' : '20'" generic />
                </template>
              </CryptoCoinChecker>
            </div>

            <div class="truncate text-iceberg leading-xs text-xs md:text-md ml-10">
              {{ item.tokens[0].tickerSymbol }} + {{ item.tokens[1].tickerSymbol }}
            </div>
          </div>

          <div class="truncate text-iceberg leading-xs text-xs md:text-md">
            {{ item.tokens[0].balance | fixed(3, 0) }} {{ item.tokens[0].tickerSymbol }} + {{ item.tokens[1].balance | fixed(3, 0) }}
            {{ item.tokens[1].tickerSymbol }}
          </div>

          <div class="truncate text-iceberg leading-xs text-xs md:text-md">${{ item.totalUsdValue | fixed(2, 0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ProjectsData } from "@/store/dex-monitoring/types";

@Component({ name: "CurveDetails" })
export default class CurveDetails extends Vue {
  /* PROPS */
  @Prop({ required: true }) items: ProjectsData;

  /* COMPUTED */
  get isDataAvailabe() {
    return Boolean(this.items && this.items.curve && this.items.curve.length);
  }

  get poolData() {
    if (!this.$breakpoint.smAndDown) {
      return ["Pool", "Supplied", "Balance", "Value"];
    } else {
      return ["Supplied", "Balance", "Value"];
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  &__titles-wrap {
    @media (max-width: 767px) {
      &:before,
      &:after {
        @apply h-px w-full absolute left-0;
        content: "";
        background-image: linear-gradient(to right, rgba(52, 56, 64, 0) 0%, #343840 12.36%, #343840 88.4%, rgba(52, 56, 64, 0) 100%);
      }
      &:before {
        @apply top-0;
      }
      &:after {
        @apply bottom-0;
      }
    }
  }
}
</style>
