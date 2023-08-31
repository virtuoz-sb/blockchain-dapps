<template>
  <div class="entry">
    <div class="relative md:bg-dark-cl-300 border-grey-cl-300 border-b" :class="[isOpen ? 'py-20' : 'py-12']">
      <!-- LOADER -->
      <AppLoader v-show="isOpen && isLoader" class="absolute right-10 top-10" color-inside="#151619" />

      <!-- DESKTOP -->
      <div class="hidden md:block px-20 md:px-10 xl:px-20" :class="{ 'mb-20': isOpen }">
        <div class="flex justify-between items-center">
          <!-- ENTRY LABEL -->
          <span class="text-base text-grey-cl-200 leading-xs">Entry</span>
          <!-- ENTRY OPEN CREATE TAB -->
          <span
            v-if="!canAddNew && !isOpen"
            class="text-base text-blue-cl-100 leading-xs cursor-pointer"
            :class="{ 'opacity-30': isOpen }"
            @click="isOpen = true"
          >
            Add New
          </span>
        </div>

        <!-- ENTRY RECAP SLOT -->
        <slot name="recap" />
      </div>

      <!-- FIELD LIMIT OR MARKET -->
      <div v-if="isOpen" class="flex justify-between items-center px-20 md:px-10 xl:px-20 mb-20">
        <AppDropdownBasic v-model="adaptationsType" :options="adaptationsTypeList" dark />
        <i class="icon-cross md:hidden text-xl text-blue-cl-100" @click="isOpen = false" />
      </div>

      <!-- ENTRY FORM -->
      <EntryForm
        v-if="isOpen"
        ref="form"
        :key="adaptationsType.value"
        :pair="pair"
        :base-available="baseAvailable"
        :price-correlation-pair="priceCorrelationPair"
        :operations="operations"
        :isOpen.sync="isOpen"
        :isLoader.sync="isLoader"
        :adaptations-type="adaptationsType"
        :operation-type="operationType"
        :exchange="exchange"
        :save-entry="saveEntry"
        @cancel="isOpen = false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { GroupItems, Tab } from "@/models/interfaces";
import { ExchangePairSettings } from "@/store/trade/types";
import { namespace } from "vuex-class";

const trade = namespace("tradeModule");

import EntryForm from "@/components/manual-trade/orders/order-options/forms/EntryForm.vue";

@Component({ name: "Entry", components: { EntryForm } })
export default class Entry extends Vue {
  /* VUEX */
  @trade.Action fetchCurrentPriceAction: any;

  /* PROPS */
  @Prop({ default: null }) tab: Tab;
  @Prop({ default: null }) pair: ExchangePairSettings;
  @Prop({ required: true }) operations: any;
  @Prop({ required: true }) baseAvailable: number;
  @Prop({ required: true }) priceCorrelationPair: number;
  @Prop({ required: true }) operationType: any;
  @Prop({ required: true }) exchange: string;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  adaptationsType: GroupItems = { value: "limit", label: "Limit" };
  adaptationsTypeList: GroupItems[] = [
    { value: "limit", label: "Limit" },
    { value: "market", label: "Market" },
  ];
  isOpen: boolean = false;
  isLoader: boolean = false;

  /* COMPUTED */
  get canAddNew() {
    if (this.operations.entry.length) {
      const totalInPercentage = this.operations.entry.reduce((acc: number, cur: any) => Number(acc) + Number(cur.rangeValue), 0);
      return totalInPercentage === 100;
    } else {
      return false;
    }
  }

  /* HOOKS */
  created() {
    this.refreshCurrentPrice();
  }

  /* METHODS */
  refreshCurrentPrice() {
    if (this.exchange) {
      let pairSymbol = this.pair.symbolForData;
      this.fetchCurrentPriceAction({ exchange: this.exchange, symbol: pairSymbol });
    }
  }

  saveEntry(formData: any) {
    this.$emit("save", { formData, type: "entry" });
    this.isOpen = false;
  }

  async editEntry(formData: any, index: number) {
    this.isOpen = true;
    this.adaptationsType = formData.adaptationsType;
    await this.$nextTick();

    this.$refs.form.setEditData(formData, index);
  }
}
</script>

<style lang="scss" scoped>
.save-btn,
.icon-cross {
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
