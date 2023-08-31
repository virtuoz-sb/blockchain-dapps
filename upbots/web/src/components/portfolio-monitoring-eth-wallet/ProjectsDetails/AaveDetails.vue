<template>
  <div :class="!isDataAvailabe ? 'disabled' : null">
    <!-- SUPPLIED -->
    <div v-if="isDataAvailabe" class="flex flex-col mb-10 md:mb-0">
      <!-- TITLE FOR MOBILE VIEW -->
      <div v-if="$breakpoint.smAndDown" class="flex w-full pt-20 px-20 mb-15">
        <span class="text-md leading-xs text-hidden-sea-glass">Supplied</span>
      </div>

      <!-- SUB TITLES -->
      <div class="card__titles-wrap grid grid-cols-4 md:grid-cols-5 col-gap-10 relative bg-gable-green px-20 py-6 md:py-12">
        <span
          v-for="(item, index) in suppliedData"
          :key="index"
          :class="{ 'font-bold': index === 0 }"
          class="truncate text-hidden-sea-glass text-sm md:text-xl leading-xs"
        >
          {{ item }}
        </span>
      </div>

      <!-- ITEMS LIST -->
      <div class="flex flex-col">
        <div
          v-for="(item, index) in items.aave.supplied"
          :key="index"
          class="grid grid-cols-4 md:grid-cols-5 col-gap-10 items-center pt-8 px-20 mb-6 md:mb-10 last:mb-0 md:last:mb-10"
        >
          <div v-if="!$breakpoint.smAndDown" />

          <div class="flex items-center">
            <CryptoCoinChecker :data="item.tickerSymbol">
              <template slot-scope="{ isExist, coinName, srcCoin }">
                <img
                  v-if="isExist"
                  :src="require(`@/assets/icons/${srcCoin}.png`)"
                  :alt="srcCoin"
                  class="w-20 md:w-24 h-20 md:h-24 overflow-hidden mr-5"
                />
                <cryptoicon v-else :symbol="coinName" :size="$breakpoint.width > 767 ? '24' : '20'" generic class="mr-5" />
              </template>
            </CryptoCoinChecker>

            <div class="truncate text-iceberg leading-xs text-xs md:text-md ml-4">{{ item.tickerSymbol }}</div>
          </div>

          <div class="truncate text-iceberg leading-xs text-xs md:text-md">{{ item.balance | fixed(6, 0) }}</div>

          <div class="truncate text-iceberg leading-xs text-xs md:text-md">${{ item.usdValue | fixed(2, 0) }}</div>
        </div>
      </div>
    </div>

    <!-- BORROWED -->
    <template v-if="isDataAvailabe">
      <div v-if="items.aave.borrowed && items.aave.borrowed.length" class="flex flex-col">
        <!-- TITLE FOR MOBILE VIEW -->
        <div v-if="$breakpoint.smAndDown" class="flex w-full pt-20 px-20 mb-15">
          <span class="text-md leading-xs text-hidden-sea-glass">Borrowed</span>
        </div>

        <!-- SUB TITLES -->
        <div class="card__titles-wrap grid grid-cols-4 md:grid-cols-5 col-gap-10 relative bg-gable-green px-20 py-6 md:py-12">
          <span
            v-for="(item, index) in borrowedData"
            :key="index"
            :class="{ 'font-bold': index === 0 }"
            class="truncate text-hidden-sea-glass text-sm md:text-xl leading-xs"
          >
            {{ item }}
          </span>
        </div>

        <!-- ITEMS LIST -->
        <div class="flex flex-col">
          <div
            v-for="(item, index) in items.aave.borrowed"
            :key="index"
            class="grid grid-cols-4 md:grid-cols-5 col-gap-10 items-center pt-8 px-20 mb-6 md:mb-10 last:mb-0 md:last:mb-10"
          >
            <div v-if="!$breakpoint.smAndDown" />

            <div class="flex items-center">
              <CryptoCoinChecker :data="item.tickerSymbol">
                <template slot-scope="{ isExist, coinName, srcCoin }">
                  <img
                    v-if="isExist"
                    :src="require(`@/assets/icons/${srcCoin}.png`)"
                    :alt="srcCoin"
                    class="w-20 md:w-24 h-20 md:h-24 mr-5"
                  />
                  <cryptoicon v-else :symbol="coinName" :size="$breakpoint.width > 767 ? '24' : '20'" generic class="mr-5" />
                </template>
              </CryptoCoinChecker>

              <div class="truncate text-iceberg leading-xs text-xs md:text-md ml-4">{{ item.tickerSymbol }}</div>
            </div>

            <div class="truncate text-iceberg leading-xs text-xs md:text-md">{{ item.balance | fixed(6, 0) }}</div>

            <div class="truncate text-iceberg leading-xs text-xs md:text-md">${{ item.usdValue | fixed(2, 0) }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { ProjectsData } from "@/store/dex-monitoring/types";

@Component({ name: "AaveDetails" })
export default class AaveDetails extends Vue {
  /* PROPS */
  @Prop({ required: true }) items: ProjectsData;

  /* COMPUTED */
  get isDataAvailabe() {
    return Boolean(this.items && this.items.aave && this.items.aave.borrowed.length);
  }

  get suppliedData() {
    if (!this.$breakpoint.smAndDown) {
      return ["Supplied", "Token", "Balance", "Value"];
    } else {
      return ["Token", "Balance", "Value"];
    }
  }

  get borrowedData() {
    if (!this.$breakpoint.smAndDown) {
      return ["Borrowed", "Token", "Balance", "Value"];
    } else {
      return ["Token", "Balance", "Value"];
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
