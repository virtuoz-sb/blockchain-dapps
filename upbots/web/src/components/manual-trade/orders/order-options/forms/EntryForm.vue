<template>
  <div>
    <!-- FIELD PRICE (SHOW IF TYPE LIMIT) -->
    <div v-if="adaptationsType.value === 'limit'" class="px-20 md:px-10 xl:px-20 mb-20">
      <p class="text-grey-cl-100 text-sm leading-xs mb-10">Limit Price Order ({{ pair.quoteCurrency }})</p>
      <AppInputNumber
        ref="inputLimitPrice"
        v-model.number="entryForm.price"
        :step="priceStepOptions || defineStep(pair.quoteCurrency)"
        size="sm"
        :disabled="inputDisabled"
        @input="calculateEntryAmout"
      />
    </div>

    <!-- FIELD TOKEN AMOUNT -->
    <div class="flex flex-col px-20 md:px-10 xl:px-20 mb-20">
      <p v-if="!pair.perpetualContract" class="text-grey-cl-100 text-sm leading-xs mb-10">Quantity of {{ pair.baseCurrency }}</p>
      <p v-else class="text-grey-cl-100 text-sm leading-xs mb-10">Contracts</p>
      <ValidationObserver ref="tokenAmout" tag="div">
        <AppInputNumber
          ref="inputContracts"
          :step="quantityStepOptions || defineStep(pair.baseCurrency)"
          :rules="`max_value:${maxAvailableAmount}`"
          :value="entryForm.amount"
          name="Amount"
          size="sm"
          :disabled="inputDisabled"
          @input="handleAmountChange"
        />
      </ValidationObserver>
    </div>

    <div class="px-20 mb-30">
      <!-- FIELD CURSOR -->
      <AppRangeSlider
        :options="{ min: 0, max: 100 }"
        v-model.number="entryForm.rangeValue"
        labels="%"
        tooltip="active"
        :formatter="`${entryForm.rangeValue}%`"
        class="mb-30"
        :disabled-max="sliderRestrictions"
        @dragging="onDragging"
        @change="calculateEntryAmout"
      />
    </div>

    <!-- FIELD TOTAL -->
    <div class="flex items-center mb-30 px-20 md:px-10 xl:px-20 text-grey-cl-100 text-sm leading-md">
      Est. {{ pair.inverse ? pair.baseCurrency : pair.quoteCurrency }} cost:
      <span class="text-white ml-8">{{ totalAmount | fixed }}</span>
    </div>

    <!-- SAVE OPERATION -->
    <div class="hidden md:flex justify-between items-center px-10 xl:px-20">
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
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { maxFloatCharacters } from "@/core/helper-functions";
import { defineStep, dynamicStepDefinition } from "@/core/services/trade.service";
import { ExchangePairSettings } from "@/store/trade/types";
import debounce from "@/core/debounce";

@Component({ name: "EntryForm" })
export default class EntryForm extends Vue {
  /* PROPS */
  @Prop({ required: true }) pair: ExchangePairSettings;
  @Prop({ required: true }) operations: any;
  @Prop({ required: true }) baseAvailable: number; // misnommer: it is the max available balance (in quote for buy and in base for sell)
  @Prop({ required: true }) priceCorrelationPair: number;
  @Prop({ required: true }) operationType: any;
  @Prop({ required: true }) adaptationsType: any;
  @Prop({ required: true }) exchange: string;
  @Prop({ required: true }) isLoader: boolean;
  @Prop({ required: true, type: Function }) saveEntry: any;

  /* PROPS */
  $refs!: {
    inputLimitPrice: any;
    inputContracts: any;
  };

  /* DATA */
  entryForm: any = {
    price: 1,
    amount: 0,
    rangeValue: 100,
  };

  priceStepOptions: any = null;
  quantityStepOptions: any = { size: 6 };
  editIndex: number = null;
  inputDisabled: boolean = false;
  isSaveDisabled: boolean = false;
  defineStep = defineStep;

  /* COMPUTED */
  get maxAvailableAmount(): number {
    if (this.pair.inverse && this.pair.perpetualContract) {
      // this.baseAvailable  is always in XBT
      return this.baseAvailable * this.entryForm.price;
    }
    //computes maximum quantity as maxBalance/price
    if (this.operationType === "buy") {
      return this.baseAvailable / this.entryForm.price;
    } else {
      return this.baseAvailable;
    }
  }

  // computes order cost estimation
  get totalAmount(): number {
    if (this.pair.inverse && this.pair.perpetualContract) {
      return this.entryForm.amount / this.entryForm.price;
    } else {
      return this.entryForm.amount * this.entryForm.price;
    }
  }

  // return Maximum allowed slider value based on available balance
  get sliderRestrictions() {
    if (this.operations.entry.length) {
      // all Entries except open one, open/current editing is not taking into account
      const entriesToCalc =
        this.editIndex !== null ? this.operations.entry.filter((i: any, index: number) => index !== this.editIndex) : this.operations.entry;

      // calculate Total from all Entries
      const totalUsed = entriesToCalc.reduce((acc: number, cur: any) => Number(cur.totalValue) + acc, 0);
      const maxPercentage = 100 - (100 * totalUsed) / this.baseAvailable;
      return maxPercentage.toFixed(0);
    } else {
      return 100;
    }
  }

  /* WATCHERS */
  @Watch("pair", { immediate: true, deep: true })
  onDataChange() {
    this.entryForm.price = this.priceCorrelationPair;
  }

  /* HOOKS */
  async mounted() {
    this.entryForm.rangeValue = this.sliderRestrictions;
    this.entryForm.amount = maxFloatCharacters((this.maxAvailableAmount * this.entryForm.rangeValue) / 100, this.quantityStepOptions.size);

    await this.validateFields();
    this.calculateEntryAmout();
  }

  /* METHODS */
  @debounce(400)
  validateFields() {
    this.inputDisabled = true;
    this.$emit("update:isLoader", true);

    const { symbol } = this.pair;
    const { amount } = this.entryForm;

    return this.$http
      .get(`/api/trade/format-validity/${this.exchange}`, { params: { symbol, quantity: amount, price: this.entryForm.price } })
      .then(({ data }: any) => {
        const { validity } = data;
        // if valid stop calculations
        if (validity) {
          this.isSaveDisabled = false;
          return;
        }

        const { costLimit, priceLimit, pricePrecision, quantityLimit, quantityPrecision } = data.checkList;
        const { price, amount } = data.precisionRules;

        // Handle errors
        this.handleValidationError({ costLimit, priceLimit, quantityLimit }, data.comments);

        if (data.suggestedInput.price && data.suggestedInput.quantity) {
          this.applyCorrection(data);
        }
      })
      .finally(() => {
        this.$emit("update:isLoader", false);
        this.inputDisabled = false;
      });
  }

  handleValidationError({ costLimit, priceLimit, quantityLimit }: any, msg: string) {
    if (!costLimit) {
      this.$notify({ text: msg || "Cost Limit!", type: "error" });
      this.isSaveDisabled = true;
    } else if (!priceLimit) {
      this.$notify({ text: msg || "Price Limit!", type: "error" });
      this.isSaveDisabled = true;
    } else if (!quantityLimit) {
      this.$notify({ text: msg || "Quantity Limit!", type: "error" });
      this.isSaveDisabled = true;
    } else {
      this.isSaveDisabled = false;
    }
  }

  applyCorrection(data: any) {
    this.priceStepOptions = dynamicStepDefinition(data.precisionRules.price);
    this.quantityStepOptions = dynamicStepDefinition(data.precisionRules.amount);

    let quantityToSet = data.suggestedInput.quantity;

    // if max available
    if (this.entryForm.rangeValue === 100) {
      // if suggested bigger than max available
      const isBigger = data.suggestedInput.quantity - this.entryForm.amount > 0;

      if (isBigger) {
        quantityToSet = data.suggestedInput.quantity - 1;
      }
    }

    // animate input
    if (!data.checkList.pricePrecision) {
      this.entryForm.price = data.suggestedInput.price;
      this.$refs.inputLimitPrice.animateAnimate();
    }

    if (!data.checkList.quantityPrecision) {
      this.entryForm.amount = data.suggestedInput.quantity;
      this.$refs.inputContracts.animateAnimate();
    }
  }

  saveFormData() {
    const formData = {
      ...this.entryForm,
      isMarket: this.adaptationsType.value === "market",
      isLimit: this.adaptationsType.value === "limit",
      totalValue: this.totalAmount,
      adaptationsType: this.adaptationsType,
    };

    this.saveEntry(formData);
    this.editIndex = null;
  }

  setEditData({ price, amount, rangeValue }: any, index: number) {
    const newFormData = { price, amount, rangeValue };
    this.entryForm = { ...newFormData };

    this.editIndex = index;
  }

  async calculateEntryAmout() {
    await this.validateFields();

    const quantity = (this.maxAvailableAmount * this.entryForm.rangeValue) / 100;
    this.entryForm.amount = Number(quantity.toFixed(this.quantityStepOptions.size));
  }

  async handleAmountChange(val: string) {
    await this.validateFields();

    const value = Number(val);

    this.entryForm.amount = Number(value.toFixed(this.quantityStepOptions.size));
    if (value >= this.maxAvailableAmount) {
      //reset to 100% and max quantity when too big number is entered
      this.entryForm.rangeValue = 100;
      this.entryForm.amount = this.maxAvailableAmount;
    } else {
      this.entryForm.rangeValue = (value * 100) / this.maxAvailableAmount;
    }
  }

  onDragging() {
    // Calculate token amout when slider dragging
    this.calculateEntryAmout();
  }
}
</script>

<style lang="scss" scoped>
/* Chrome, Safari, Edge, Opera */
::v-deep input::-webkit-outer-spin-button,
::v-deep input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

/* Firefox */
::v-deep input[type="number"] {
  -moz-appearance: textfield;
}
</style>
