<template>
  <div class="find-trade h-auto md:h-full md:pt-20 pb-40 md:pb-20 xl:pb-35 pl-20 pr-20 xl:pr-35">
    <div class="flex w-full pr-20 md:pr-0">
      <div class="flex flex-col md:flex-row justify-between xl:justify-start md:items-center w-full">
        <div class="wrap w-full mb-20 md:mb-0">
          <p class="text-iceberg text-sm leading-xs mb-8">Buy</p>
          <v-select v-model="findTradeForm.selectedBuyCurrency" :options="coinsList" class="vs__upbot-style w-full" :clearable="false">
            <template slot="option" slot-scope="option">
              <div class="flex items-center" style="padding-bottom: 0.5rem;">
                <cryptoicon :symbol="option.id" size="16" generic class="mr-5" />
                {{ option.label }}
              </div>
            </template>
          </v-select>
        </div>
        <div v-if="!$breakpoint.smAndDown" class="flex cursor-pointer" @click="swapBuyWith">
          <i class="icon-swap text-xxl text-white mt-25 mx-42 xl:mx-60" />
        </div>
        <div class="wrap w-full">
          <p class="text-iceberg text-sm leading-xs mb-8">With</p>
          <v-select v-model="findTradeForm.selectedWithCurrency" :options="coinsList" class="vs__upbot-style w-full" :clearable="false">
            <template slot="option" slot-scope="option">
              <div class="flex items-center" style="padding-bottom: 0.5rem;">
                <cryptoicon :symbol="option.id" size="16" generic class="mr-5" />
                {{ option.label }}
              </div>
            </template>
          </v-select>
        </div>
      </div>
      <div v-if="$breakpoint.smAndDown" class="flex items-center justify-center cursor-pointer ml-40" @click="swapBuyWith">
        <i class="icon-swap text-xxl text-white" />
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-between xl:justify-start items-center mt-40 md:mt-25">
      <div class="wrap w-full md:mr-10 xl:mr-0 mb-20 md:mb-0">
        <div class="flex justify-between mb-8">
          <span class="text-iceberg text-sm leading-xs">Amount to buy ({{ findTradeForm.selectedBuyCurrency.label }})</span>
          <!-- <span class="text-blue-cl-500 text-sm leading-xs cursor-pointer">Max Amount</span> -->
        </div>
        <AppInput v-model="findTradeForm.amount" size="sm" />
      </div>

      <div class="wrap wrap__range-slider w-full ml-10 xl:ml-0">
        <p class="text-iceberg text-sm leading-xs mb-8">Slippage</p>
        <AppRangeSlider
          :options="{ min: 0, max: 5, interval: 0.01 }"
          v-model="findTradeForm.rangeValue"
          labels="%"
          tooltip="active"
          :formatter="`${findTradeForm.rangeValue}%`"
          class="range-slider h-32"
        />
      </div>
      <AppButton
        v-if="$breakpoint.width > 1279"
        type="light-green"
        class="find-trade__btn w-full self-end ml-20 xl:ml-40"
        @click="handleSubmit"
      >
        {{ isPending ? "Searching..." : "Search" }}
      </AppButton>
    </div>
    <div v-if="$breakpoint.width < 1280" class="flex items-center justify-center w-full mt-35 md:mt-24">
      <AppButton type="light-green" class="find-trade__btn w-full" @click="handleSubmit">
        {{ isPending ? "Searching..." : "Search" }}
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { coinsList } from "../../store/swap/const";
import { DexagRequest, ExchangeData } from "../../store/swap/types";

const swap = namespace("swapModule");

@Component({ name: "FindTrade" })
export default class FindTrade extends Vue {
  /* VUEX */
  @swap.Getter getProviderSdk: any;
  @swap.Getter isPending: boolean;
  @swap.Action fetchTableData: (payload: DexagRequest) => Promise<void>;

  /* DATA */
  coinsList = coinsList;
  findTradeForm: any = {
    selectedOperationType: "buy",
    selectedBuyCurrency: { id: "DAI", label: "DAI" },
    selectedWithCurrency: { id: "ETH", label: "ETH" },
    amount: "1",
    rangeValue: 0.3,
  };

  /* WATCHERS */
  @Watch("getProviderSdk", { immediate: true })
  initialSubmit(providerSdk: any) {
    if (providerSdk) this.handleSubmit();
  }

  /* METHODS */
  swapBuyWith() {
    const tmp = this.findTradeForm.selectedBuyCurrency;
    this.findTradeForm.selectedBuyCurrency = this.findTradeForm.selectedWithCurrency;
    this.findTradeForm.selectedWithCurrency = tmp;
  }

  async handleSubmit() {
    const amount = parseFloat(this.findTradeForm.amount);
    this.fetchTableData({
      to: this.findTradeForm.selectedBuyCurrency.id,
      from: this.findTradeForm.selectedWithCurrency.id,
      toAmount: amount,
      limitAmount: this.findTradeForm.rangeValue,
      dex: "all",
    });
    this.$emit("update:isSearch", true);
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  @media (min-width: 768px) {
    max-width: 250px;
  }

  &__range-slider {
    @media (min-width: 1280px) {
      margin-left: 145px;
    }
  }
}

.find-trade {
  &__btn {
    @media (min-width: 768px) {
      max-width: 240px;
    }
  }
}

::v-deep .vs__upbot-style {
  .vs__dropdown-menu {
    @apply border border-solid border-tradewind;
    top: calc(100% - -5px);
    background: #356268;
    border-radius: 25px;
    height: 170px;

    -ms-overflow-style: none !important; /* IE and Edge */
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important;
  }

  .vs__dropdown-menu::-webkit-scrollbar {
    display: none !important;
  }

  .vs__dropdown-toggle {
    @apply border border-solid border-tradewind;
    background: #356268;
    border-radius: 25px;
  }

  .vs__search::placeholder {
    @apply text-white;
  }

  .vs__open-indicator {
    fill: white;
  }

  .vs__selected,
  .vs__dropdown-option,
  .vs__no-options,
  input {
    @apply text-white;
  }

  .vs__dropdown-option--highlight {
    background: #78dcd40d;
  }
}
</style>
