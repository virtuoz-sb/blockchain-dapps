<template>
  <div class="grid grid-cols-4 col-gap-15 items-center mb-10 last:mb-0">
    <div class="flex items-center">
      <CryptoCoinChecker :data="data.coin" class="mr-5">
        <template slot-scope="{ isExist, coinName, srcCoin }">
          <img v-if="isExist" :src="require(`@/assets/icons/${srcCoin}.png`)" :alt="srcCoin" class="w-18 h-18" />
          <cryptoicon v-else :symbol="coinName" size="18" generic />
        </template>
      </CryptoCoinChecker>

      <div class="text-iceberg text-base leading-xs">
        {{ data.coin }}
        <span v-if="data.blockchain === 'bsc'" class="text-hidden-sea-glass text-sm font-bold">on BSC</span>
      </div>
    </div>

    <div class="block text-iceberg text-base leading-xs truncate">
      {{ formatPrice(data.amount) }}
    </div>

    <div class="block text-iceberg text-base leading-xs truncate">{{ formatPrice(data.btcValue, 6) }}</div>

    <div class="block text-iceberg text-base leading-xs truncate">
      {{ formatPrice(currency === "usd" ? data.usdValue : data.eurValue) }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { DistributionTable } from "@/components/portfolio/types/portfolio.types";
import { formatPrice } from "@/services/helpers.service";

@Component({ name: "PortfolioDistributionTableRow" })
export default class PortfolioDistributionTableRow extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: DistributionTable[];
  @Prop({ required: true }) currency: string;

  /* DATA */
  formatPrice = formatPrice;
}
</script>
