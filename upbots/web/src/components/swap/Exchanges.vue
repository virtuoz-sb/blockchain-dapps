<template>
  <div class="px-20 md:mt-15 md:mb-14 overflow-y-auto custom-scrollbar">
    <div class="exchanges__item-wrap flex flex-col overflow-y-auto custom-scrollbar">
      <AppCheckbox
        class="flex-shrink-0 mb-15 last:mb-0"
        v-for="item in data"
        :key="item.id"
        :value="isChecked(item.id)"
        @input="() => toggleExchange(item)"
      >
        <div class="flex items-center">
          <img v-if="exchangeImages[item.id]" :src="exchangeImages[item.id]" :alt="item.name" class="max-w-24 pr-7" />
          <p class="text-iceberg text-base md:text-xl">{{ item.label }}</p>
        </div>
      </AppCheckbox>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ExchangeData } from "@/store/swap/types";
import { namespace } from "vuex-class";
import { Exchange } from "./types/types";

const swap = namespace("swapModule");

@Component({ name: "Exchanges" })
export default class Exchanges extends Vue {
  /* VUEX */
  @swap.Getter getExchangesData: ExchangeData[];
  @swap.Action toggleExchange: (payload: Exchange) => any;

  /* PROPS */
  @Prop({ required: true }) data: any;
  @Prop({ required: true }) exchangeImages: any;

  /* METHODS */
  isChecked(id: string) {
    return this.getExchangesData.find((exchange) => exchange.id === id).checked;
  }
}
</script>

<style lang="scss" scoped>
.exchanges {
  &__item-wrap {
    @media (max-width: 767px) {
      height: 300px;
    }
  }
}
</style>
