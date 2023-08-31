<template>
  <div class="stop-loss">
    <div class="relative md:bg-dark-cl-300 border-transparent border-b" :class="[isOpen ? 'py-20' : 'py-12']">
      <!-- LOADER -->
      <AppLoader v-show="isOpen && isLoader" class="absolute right-10 top-10" color-inside="#151619" />

      <!-- DESKTOP -->
      <div v-if="!$breakpoint.smAndDown" class="px-20 md:px-10 xl:px-20" :class="{ 'mb-20': isOpen }">
        <div class="flex justify-between items-center">
          <!-- ENTRY LABEL -->
          <span class="text-base text-grey-cl-200 leading-xs">Stop Loss</span>
          <!-- ENTRY OPEN CREATE TAB -->
          <span
            v-if="!isOpen && !operations.stopLoss"
            class="text-blue-cl-100 leading-xs cursor-pointer"
            :class="{ 'opacity-30': isOpen }"
            @click="isOpen = !isOpen"
          >
            Add New
          </span>
        </div>

        <!-- STOP LOSS RECAP SLOT -->
        <slot name="recap" />
      </div>

      <!-- STOP/LOSS FORM -->
      <StopLossForm
        v-if="isOpen"
        ref="form"
        :operations="operations"
        :isOpen.sync="isOpen"
        :pair="pair"
        :price-correlation-pair="priceCorrelationPair"
        :exchange="exchange"
        :isLoader.sync="isLoader"
        :entries-total-quantity="entriesTotalQuantity"
        :save-stop-loss="saveStopLoss"
        @cancel="isOpen = false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";
import { ExchangePairSettings } from "@/store/trade/types";

import StopLossForm from "@/components/manual-trade/orders/order-options/forms/StopLossForm.vue";

@Component({ name: "StopLoss", components: { StopLossForm } })
export default class StopLoss extends Vue {
  /* PROPS */
  @Prop({ required: true }) operations: any;
  @Prop({ default: null }) pair: ExchangePairSettings;
  @Prop({ required: true }) priceCorrelationPair: number;
  @Prop({ required: true }) exchange: string;
  @Prop({ required: true }) entriesTotalQuantity: number | string;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  isOpen: boolean = false;
  isLoader: boolean = false;

  /* METHODS */
  saveStopLoss(formData: any) {
    this.$emit("save", { formData, type: "stopLoss" });
    this.isOpen = false;
  }

  async editStopLoss(formData: any) {
    this.isOpen = true;
    await this.$nextTick();

    this.$refs.form.setEditData(formData);
  }
}
</script>
