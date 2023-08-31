<template>
  <Card class="custom-blur-card flex flex-col bg-dark-200 rounded-3" header-classes="flex items-center justify-center">
    <template slot="header-left">
      <div v-if="pairData" class="w-32 h-18 mr-10 relative">
        <CryptoCoinChecker :data="pairData.base" class="absolute top-0 left-0">
          <template>
            <cryptoicon :symbol="pairData.base" size="18" generic />
          </template>
        </CryptoCoinChecker>

        <CryptoCoinChecker :data="pairData.quote" class="absolute top-0 right-0">
          <template>
            <cryptoicon :symbol="pairData.quote" size="18" generic />
          </template>
        </CryptoCoinChecker>
      </div>

      <p class="leading-md text-iceberg">{{ title }}</p>
    </template>

    <div slot="content" class="active-bot-card__content flex flex-col md:h-full relative" :class="isDataAvailable && 'disabled'">
      <div class="flex items-center w-full md:h-full py-20 xl:py-28 px-20">
        <div class="w-full px-14">
          <div class="flex w-full justify-between mb-10">
            <span class="text-iceberg">UBXT available</span>
            <span class="text-bright-turquoise"> {{ data ? (data.amount == 0 ? 0 : data.amount.toFixed(4)) : "N/A" }} </span>
          </div>

          <div class="flex w-full justify-between mb-10">
            <span class="text-iceberg">UBXT Credit</span>
            <span class="text-white">{{ data ? (data.creditAmount == 0 ? 0 : data.creditAmount.toFixed(4)) : "N/A" }}</span>
          </div>

          <div class="flex w-full justify-between mb-10">
            <span class="text-iceberg">Total Paid</span>
            <span class="text-white">{{ data ? (data.paidAmount == 0 ? 0 : data.paidAmount.toFixed(4)) : "N/A" }}</span>
          </div>
        </div>
      </div>

      <router-link :to="{ name: 'algo-bot-detailed', params: { id: data.botId } }" class="flex w-full justify-center flex-shrink-0 mb-20">
        <AppButton type="light-green" size="xs" :disabled="!enablePerfFees" class="w-1/3">View</AppButton>
      </router-link>
    </div>
  </Card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { UserWallet, UserTransaction, BotWallet } from "@/store/perfees/types";

@Component({ name: "ActiveBotCard" })
export default class ActiveBotCard extends Vue {
  /* PROPS */
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) data: BotWallet | null;
  @Prop({ required: true }) pairData: any;
  @Prop({ required: true }) enablePerfFees: boolean;

  /* DATA */
  isDataAvailable: boolean = false; // TODO (just for trigger no data state)
}
</script>

<style lang="scss" scoped>
.active-bot-card {
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
