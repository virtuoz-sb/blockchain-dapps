<template>
  <div class="target">
    <div class="relative md:bg-dark-cl-300 border-grey-cl-300 border-b" :class="[isOpen ? 'py-20' : 'py-12']">
      <!-- LOADER -->
      <AppLoader v-show="isOpen && isLoader" class="absolute right-10 top-10" color-inside="#151619" />

      <!-- DESKTOP -->
      <div class="hidden md:block text-grey-cl-200 px-20 md:px-10 xl:px-20" :class="{ 'mb-20': isOpen }">
        <div class="flex justify-between items-center">
          <span class="text-base text-grey-cl-200 leading-xs">Targets</span>
          <span v-if="!isOpen" class="text-blue-cl-100 leading-xs cursor-pointer" :class="{ 'opacity-30': isOpen }" @click="isOpen = true">
            Add New
          </span>
        </div>

        <!-- TARGET RECAP SLOT -->
        <slot name="recap" />
      </div>

      <!-- FIELD TRIGGER TYPE -->
      <div v-if="isOpen" class="flex items-center px-20 md:px-10 xl:px-20 mb-15">
        <span class="text-grey-cl-920 text-md md:text-sm md:leading-md mr-8">Trigger Type:</span>
        <AppDropdownBasic v-model="selectedOrderType" :options="orderTypes" dark class="text-md md:text-sm md:leading-md" />
      </div>

      <!-- TARGET FORM -->
      <TargetForm
        v-if="isOpen"
        ref="form"
        :key="selectedOrderType.value"
        :pair="pair"
        :base-available="baseAvailable"
        :price-correlation-pair="priceCorrelationPair"
        :operations="operations"
        :isOpen.sync="isOpen"
        :isLoader.sync="isLoader"
        :operation-type="operationType"
        :exchange="exchange"
        :selected-order-type="selectedOrderType"
        :entries-total-quantity="entriesTotalQuantity"
        :save-target="saveTarget"
        @cancel="isOpen = false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";
import { ExchangePairSettings } from "@/store/trade/types";

import TargetForm from "@/components/manual-trade/orders/order-options/forms/TargetForm.vue";

@Component({ name: "Target", components: { TargetForm } })
export default class Target extends Vue {
  /* PROPS */
  @Prop({ required: true }) operations: any;
  @Prop({ required: true }) baseAvailable: number;
  @Prop({ default: null }) pair: ExchangePairSettings;
  @Prop({ required: true }) priceCorrelationPair: number;
  @Prop({ required: true }) operationType: any;
  @Prop({ required: true }) exchange: string;
  @Prop({ required: true }) entriesTotalQuantity: number | string;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  selectedOrderType: GroupItems = { value: "limit", label: "Limit" };
  orderTypes: GroupItems[] = [
    { value: "limit", label: "Limit" },
    { value: "market", label: "Market" },
  ];
  isOpen: boolean = false;
  isLoader: boolean = false;

  /* METHODS */
  saveTarget(formData: any) {
    this.$emit("save", { formData, type: "target" });
    this.isOpen = false;
  }

  async editTarget(formData: any, index: number) {
    this.isOpen = true;
    this.selectedOrderType = formData.selectedOrderType;
    await this.$nextTick();

    this.$refs.form.setEditData(formData, index);
  }
}
</script>
