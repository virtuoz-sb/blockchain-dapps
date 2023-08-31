<template>
  <ValidationObserver ref="form" tag="div">
    <div class="px-20 md:px-10 xl:px-20 mb-20">
      <div class="flex justify-between items-center mb-8">
        <span class="text-grey-cl-200 text-md md:text-sm md:leading-md">Trigger Price</span>
      </div>
      <AppInputNumber
        ref="inputTriggerPrice"
        v-model.number="stopLossForm.triggerPrice"
        :step="priceStepOptions || defineStep(pair.quoteCurrency)"
        name="Trigger Price"
        size="sm"
        :disabled="inputDisabled"
        @input="triggerPriceChange"
      />
    </div>
    <div class="px-20 md:px-10 xl:px-20 mb-20">
      <div class="flex justify-between items-center text-grey-cl-200 text-md md:text-sm md:leading-md mb-8">
        <span>Stop Loss quantity:</span> {{ entriesTotalQuantity }}
      </div>
    </div>

    <!-- SAVE OPERATION -->
    <div v-if="!$breakpoint.smAndDown" class="flex justify-between px-20 md:px-10 xl:px-20">
      <div
        class="save-btn flex items-center cursor-pointer"
        :class="isSaveDisabled && 'pointer-events-none opacity-50'"
        @click="saveFormData"
      >
        <i class="icon-check text-blue-cl-100 text-md leading-xs mr-6" />
        <span class="text-blue-cl-100 text-md leading-xs">Save</span>
      </div>
      <div class="flex items-center cursor-pointer" @click="$emit('cancel')">
        <i class="icon-cross text-blue-cl-100 text-sm cursor-pointer mr-6" />
        <span class="text-blue-cl-100 text-md leading-xs">Close</span>
      </div>
    </div>
  </ValidationObserver>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import { ExchangePairSettings } from "@/store/trade/types";
import { defineStep, dynamicStepDefinition } from "@/core/services/trade.service";
import debounce from "@/core/debounce";

@Component({ name: "StopLossForm" })
export default class StopLossForm extends Vue {
  /* PROPS */
  @Prop({ required: true }) operations: any;
  @Prop({ required: true }) pair: ExchangePairSettings;
  @Prop({ required: true }) priceCorrelationPair: number;
  @Prop({ required: true }) exchange: string;
  @Prop({ required: true }) entriesTotalQuantity: number | string;
  @Prop({ required: true }) isLoader: boolean;
  @Prop({ required: true, type: Function }) saveStopLoss: any;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
    inputTriggerPrice: any;
  };

  /* DATA */
  stopLossForm: any = {
    triggerPrice: "",
  };

  priceStepOptions: any = null;
  inputDisabled: boolean = false;
  isSaveDisabled: boolean = false;
  defineStep = defineStep;

  /* WATCHERS */
  @Watch("pair", { immediate: true, deep: true })
  onDataChange() {
    this.stopLossForm.triggerPrice = this.priceCorrelationPair;
  }

  /* HOOKS */
  async mounted() {
    await this.validateFields();
    this.triggerPriceChange();
  }

  /* METHODS */
  @debounce(400)
  validateFields() {
    this.inputDisabled = true;
    this.$emit("update:isLoader", true);

    const { symbol } = this.pair;

    return this.$http
      .get(`/api/trade/format-validity/price/${this.exchange}`, { params: { symbol, price: this.stopLossForm.triggerPrice } })
      .then(({ data }: any) => {
        const { validity } = data;
        // if valid stop calculations
        if (validity) {
          this.isSaveDisabled = false;
          return;
        }

        const { priceLimit, pricePrecision } = data.checkList;
        const { price, amount } = data.precisionRules;

        this.handleValidationError({ priceLimit }, data.comments);

        if (data.suggestedInput.price) {
          this.applyCorrection(data);
        }
      })
      .finally(() => {
        this.$emit("update:isLoader", false);
        this.inputDisabled = false;
      });
  }

  handleValidationError({ priceLimit }: any, msg: string) {
    if (!priceLimit) {
      this.$notify({ text: msg || "Price Limit!", type: "error" });
      this.isSaveDisabled = true;
    } else {
      this.isSaveDisabled = false;
    }
  }

  applyCorrection(data: any) {
    this.priceStepOptions = dynamicStepDefinition(data.precisionRules.price);

    // animate input
    if (!data.checkList.pricePrecision) {
      this.stopLossForm.triggerPrice = data.suggestedInput.price;
      this.$refs.inputTriggerPrice.animateAnimate();
    }
  }

  saveFormData() {
    const formData = { ...this.stopLossForm };

    this.saveStopLoss(formData);
  }

  setEditData(payload: any) {
    this.stopLossForm = { ...payload };
  }

  async triggerPriceChange() {
    await this.validateFields();
  }
}
</script>
