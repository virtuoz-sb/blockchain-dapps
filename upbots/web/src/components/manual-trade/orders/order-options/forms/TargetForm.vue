<template>
  <ValidationObserver ref="form" tag="div">
    <div class="px-20 md:px-10 xl:px-20 mb-20">
      <div class="flex justify-between items-center text-grey-cl-200 text-md md:text-sm md:leading-md mb-8">
        <span>
          Trigger
          <span v-if="selectedOrderType.value === 'percentagePrice'">%</span>
          Price
        </span>
      </div>
      <AppInputNumber
        v-model.number="targetForm.triggerPrice"
        :step="priceStepOptions || defineStep(pair.baseCurrency)"
        :rules="intFloatRequiredRule"
        :disabled="inputDisabled"
        ref="triggerPrice"
        name="Trigger Price"
        size="sm"
        @input="(v) => validateFields(v, 'triggerPrice')"
      />
    </div>

    <div v-if="selectedOrderType.value === 'limit'" class="px-20 md:px-10 xl:px-20 mb-20">
      <div class="flex justify-between items-center mb-8">
        <span class="text-grey-cl-200 text-md md:text-sm md:leading-md">Order Price</span>
      </div>
      <AppInputNumber
        v-model.number="targetForm.orderPrice"
        :step="priceStepOptions || defineStep(pair.baseCurrency)"
        :rules="intFloatRequiredRule"
        :disabled="inputDisabled"
        ref="orderPrice"
        name="Order Price"
        size="sm"
        @input="(v) => validateFields(v, 'orderPrice')"
      />
    </div>

    <div class="px-20 mb-30">
      <!-- FIELD CURSOR -->
      <AppRangeSlider
        :options="{ min: 0, max: 100 }"
        v-model.number="targetForm.rangeValue"
        labels="%"
        tooltip="active"
        :formatter="`${targetForm.rangeValue}%`"
        class="mb-30"
        @dragging="calculateTokenAmout"
      />
    </div>

    <!-- FIELD TOTAL -->
    <div class="flex items-center mb-30 px-20 md:px-10 xl:px-20 text-grey-cl-100 text-sm leading-md">Quantity: {{ quantity }}</div>

    <!-- SAVE OPERATION -->
    <div class="hidden md:flex justify-between px-20 md:px-10 xl:px-20">
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
import { intFloatRequired } from "@/core/validation-rules";
import { ExchangePairSettings } from "@/store/trade/types";
import { defineStep, dynamicStepDefinition } from "@/core/services/trade.service";
import debounce from "@/core/debounce";

@Component({ name: "TargetForm" })
export default class TargetForm extends Vue {
  /* PROPS */
  @Prop({ required: true }) operations: any;
  @Prop({ required: true }) selectedOrderType: any;
  @Prop({ required: true }) baseAvailable: number;
  @Prop({ required: true }) operationType: any;
  @Prop({ required: true }) exchange: string;
  @Prop({ required: true }) priceCorrelationPair: number;
  @Prop({ default: null }) pair: ExchangePairSettings;
  @Prop({ required: true }) entriesTotalQuantity: number | string;
  @Prop({ required: true }) isLoader: boolean;
  @Prop({ required: true, type: Function }) saveTarget: any;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
    orderPrice: any;
  };

  /* DATA */
  targetForm: any = {
    triggerPrice: 0,
    targetPrice: 0,
    orderPrice: 1,
    amount: 0,
    deviationPrice: "",
    rangeValue: 20,
  };

  intFloatRequiredRule: any = intFloatRequired; // needed for initializing rule
  priceStepOptions: any = null;
  inputDisabled: boolean = false;
  isSaveDisabled: boolean = false;
  editIndex: number = null;
  defineStep = defineStep;

  /* COMPUTED */
  get maxAvailableAmount(): number {
    if (this.pair.inverse && this.pair.perpetualContract) {
      // this.baseAvailable  is always in XBT
      return this.baseAvailable * this.targetForm.triggerPrice;
    }
    //computes maximum quantity as maxBalance/price
    if (this.operationType === "buy") {
      return this.baseAvailable / this.targetForm.triggerPrice;
    } else {
      return this.baseAvailable;
    }
  }

  get quantity() {
    if (typeof this.entriesTotalQuantity === "string") {
      return 0;
    } else {
      return (this.entriesTotalQuantity / 100) * this.targetForm.rangeValue;
    }
  }

  /* WATCHERS */
  @Watch("selectedOrderType")
  orderTypeHandler() {
    if (this.$refs.form) this.$refs.form.reset();
  }

  /* HOOKS */
  created() {
    this.calcPrice();
  }

  /* METHODS */
  @debounce(400)
  validateFields(value: number, refKey: string) {
    this.inputDisabled = true;
    this.$emit("update:isLoader", true);

    const { symbol } = this.pair;

    return this.$http
      .get(`/api/trade/format-validity/price/${this.exchange}`, { params: { symbol, price: value } })
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
          this.applyCorrection(data, refKey);
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

  applyCorrection(data: any, refKey: any) {
    this.priceStepOptions = dynamicStepDefinition(data.precisionRules.price);

    // animate input
    if (!data.checkList.pricePrecision) {
      this.targetForm[refKey] = data.suggestedInput.price;
      (this.$refs as any)[refKey].animateAnimate();
    }
  }

  saveFormData() {
    const formData = { ...this.targetForm, selectedOrderType: this.selectedOrderType };

    this.saveTarget(formData);
    this.editIndex = null;
  }

  setEditData(payload: any, index: number) {
    this.targetForm = { ...payload };

    this.editIndex = index;
  }

  calculateTokenAmout() {
    if (typeof this.entriesTotalQuantity === "string") {
      this.targetForm.amount = 0;
    } else {
      this.targetForm.amount = (this.entriesTotalQuantity / 100) * this.targetForm.rangeValue;
    }
  }

  calcPrice() {
    if (this.operations.entry.length) {
      const lastEntryPrice = this.operations.entry[this.operations.entry.length - 1].price;

      // last price + 1%
      const finalPrice = lastEntryPrice / 100 + lastEntryPrice;

      this.targetForm.triggerPrice = finalPrice;
    } else {
      this.targetForm.triggerPrice = this.priceCorrelationPair;
    }
  }
}
</script>
