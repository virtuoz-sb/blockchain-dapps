<template>
  <div class="relative">
    <!-- LOADER -->
    <AppLoader v-show="isLoading" class="absolute right-10 top-10" color-inside="#151619" />

    <!-- FIELD LIMIT OR MARKET -->
    <div class="flex items-center mt-10 mb-10">
      <p class="text-iceberg text-sm leading-xs mr-12 md:mr-8">Order type:</p>

      <AppDropdownBasic v-model="type" :options="availableTypes" dark @change="onAmountChange" />
    </div>

    <!-- FIELD PRICE (SHOW IF TYPE LIMIT) -->
    <div v-if="type.value === 'limit'" class="mb-20">
      <p class="text-iceberg text-sm leading-xs mb-10">Limit Price Order ({{ pair.quoteCurrency }})</p>

      <AppInputNumber
        ref="inputLimitPrice"
        v-model.number="formData.price"
        :step="priceStepOptions || defineStep(pair.quoteCurrency)"
        size="sm"
        :disabled="inputDisabled"
        @input="calculateEntryAmout"
      />
    </div>

    <!-- FIELD TOKEN AMOUNT -->
    <div class="flex flex-col mb-20">
      <p v-if="!pair.perpetualContract" class="text-iceberg text-sm leading-xs mb-10">Quantity of {{ pair.baseCurrency }}</p>
      <p v-else class="text-iceberg text-sm leading-xs mb-10">Contracts</p>

      <ValidationObserver ref="tokenAmout" tag="div">
        <AppInputNumber
          ref="inputContracts"
          :step="quantityStepOptions || defineStep(pair.baseCurrency)"
          :rules="`max_value:${maxAvailableAmount}`"
          :value="formData.amount"
          :custom-error-text="isNotEnoughFunds && 'Not Enough Funds'"
          name="Amount"
          size="sm"
          :disabled="inputDisabled"
          @input="handleAmountChange"
        />
      </ValidationObserver>
    </div>

    <div class="mb-30">
      <!-- FIELD CURSOR -->
      <AppRangeSlider
        :options="{ min: 0, max: 100 }"
        v-model.number="formData.rangeValue"
        labels="%"
        tooltip="active"
        :formatter="`${formData.rangeValue}%`"
        class="mb-15"
        @dragging="onDragging"
        @change="calculateEntryAmout"
      />
    </div>

    <!-- FIELD TOTAL -->
    <div class="flex items-center mb-30">
      <p class="text-iceberg text-sm leading-md mr-10 whitespace-no-wrap">
        Total {{ pair.inverse ? pair.baseCurrency : pair.quoteCurrency }}:
      </p>
      <AppInput v-model="totalAmountInput" type="number" size="sm" class="flex-grow" @input="handleTotalChange" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { GroupItems } from "@/models/interfaces";
import { maxFloatCharacters } from "@/core/helper-functions";
import { defineStep, dynamicStepDefinition } from "@/core/services/trade.service";
import { ExchangePairSettings } from "@/store/trade/types";
import debounce from "@/core/debounce";

const trade = namespace("tradeModule");

@Component({ name: "NewOrderSimple" })
export default class NewOrderSimple extends Vue {
  /* VUEX */
  @trade.State isFormValidated: boolean;
  @trade.Action changeFormValidationStatus: any;

  /* PROPS */
  @Prop({ required: true }) pair: ExchangePairSettings;
  @Prop({ required: true }) baseAvailable: number; // misnommer: it is the max available balance (in quote for buy and in base for sell)
  @Prop({ required: true }) priceCorrelationPair: number;
  @Prop({ required: true }) operationType: string;
  @Prop({ required: true }) exchange: string;
  @Prop({ required: true }) allowCreate: boolean;
  @Prop({ required: true }) lastOrderPrice: any;
  @Prop({ required: true }) isPrice: boolean;
  @Prop({ required: true }) isGetBaseAvailableDone: boolean;

  $refs!: {
    inputLimitPrice: any;
    inputContracts: any;
  };

  /* DATA */
  isLoading: boolean = false;
  formData: any = {
    price: 1,
    amount: 0,
    rangeValue: 100,
  };

  type: GroupItems<string, string> = { value: "limit", label: "Limit" };
  availableTypes: GroupItems[] = [
    { value: "limit", label: "Limit" },
    { value: "market", label: "Market" },
  ];

  priceStepOptions: any = null;
  quantityStepOptions: any = { size: 5 };
  editIndex: number = null;
  inputDisabled: boolean = false;
  // isSaveDisabled: boolean = false;
  defineStep = defineStep;

  totalAmountInput: number = 0;

  /* COMPUTED */
  get maxAvailableAmount(): number {
    if (this.pair.inverse && this.pair.perpetualContract) {
      // this.baseAvailable  is always in XBT
      return this.baseAvailable * this.formData.price;
    }
    //computes maximum quantity as maxBalance/price
    if (this.operationType === "buy") {
      return this.baseAvailable / this.formData.price;
    } else {
      return this.baseAvailable;
    }
  }

  get isNotEnoughFunds() {
    if (this.operationType === "buy") {
      // return this.baseAvailable === 0 || this.baseAvailable <= this.maxAvailableAmount;
      return this.formData.amount === 0 || this.formData.amount > this.maxAvailableAmount;
    } else {
      // return this.baseAvailable === 0 || this.maxAvailableAmount > this.baseAvailable;
      return this.formData.amount === 0 || this.maxAvailableAmount <= this.formData.amount;
    }
  }

  /* WATCHERS */
  @Watch("pair", { immediate: true, deep: true })
  onDataChange() {
    this.quantityStepOptions = this.defineStep(this.pair.baseCurrency);
    this.formData.price = this.priceCorrelationPair;
  }

  @Watch("priceCorrelationPair", { immediate: true, deep: true })
  onCorrelationPairChange() {
    this.formData.price = this.priceCorrelationPair;
  }

  @Watch("maxAvailableAmount", { immediate: true, deep: true })
  onChange() {
    this.formData.amount = maxFloatCharacters((this.maxAvailableAmount * this.formData.rangeValue) / 100, this.quantityStepOptions.size);
    this.formData.amount = this.correctQuality(this.formData.amount);
  }

  @Watch("formData.amount", { immediate: true, deep: true })
  onAmountChange() {
    if (this.pair.inverse && this.pair.perpetualContract) {
      if (this.type.value === "market") {
        this.totalAmountInput = this.formData.amount / this.lastOrderPrice;
      } else {
        this.totalAmountInput = this.formData.amount / this.formData.price;
      }
    } else {
      if (this.type.value === "market") {
        this.totalAmountInput = this.formData.amount * this.lastOrderPrice;
      } else {
        this.totalAmountInput = this.formData.amount * this.formData.price;
      }
    }
    const quoteStepOption = this.defineStep(this.pair.quoteCurrency);
    const fixedTotalAmountInput = this.totalAmountInput.toFixed(quoteStepOption.size);
    this.totalAmountInput = Number(fixedTotalAmountInput);
  }

  @debounce(600)
  async handleTotalChange(val: any) {
    let quantity = this.type.value === "market" ? val / this.lastOrderPrice : val / this.formData.price;
    this.formData.amount = quantity;
    this.formData.amount = this.correctQuality(this.formData.amount);
    await this.handleAmountChange(quantity.toFixed(this.quantityStepOptions.size));
  }

  /* HOOKS */
  async mounted() {
    if (this.isFormValidated) {
      await this.validateFields();
    }

    this.calculateEntryAmout();
  }

  beforeDestroy() {
    this.changeFormValidationStatus(true);
  }

  /* METHODS */
  @debounce(400)
  validateFields() {
    this.inputDisabled = true;
    this.isLoading = true;

    const { symbol } = this.pair;
    const { amount } = this.formData;

    return this.$http
      .get(`/api/trade/format-validity/${this.exchange}`, { params: { symbol, quantity: amount, price: this.formData.price } })
      .then(({ data }: any) => {
        const { validity } = data;

        // if valid stop calculations
        if (data.suggestedInput.amount && data.suggestedInput.quantity) {
          this.applyCorrection(data);
        }

        if (validity) {
          this.$emit("update:allowCreate", false);
          return;
        }
        const { costLimit, priceLimit, pricePrecision, quantityLimit, quantityPrecision } = data.checkList;
        const { price, amount } = data.precisionRules;

        // Handle errors
        this.handleValidationError({ costLimit, priceLimit, quantityLimit }, data.comments);
      })
      .finally(() => {
        this.isLoading = false;
        this.inputDisabled = false;
      });
  }

  handleValidationError({ costLimit, priceLimit, quantityLimit }: any, msg: string) {
    if (!costLimit) {
      this.$notify({ text: msg || "Cost Limit!", type: "error" });
      this.$emit("update:allowCreate", true);
    } else if (!priceLimit) {
      this.$notify({ text: msg || "Price Limit!", type: "error" });
      this.$emit("update:allowCreate", true);
    } else if (!quantityLimit) {
      this.$notify({ text: msg || "Quantity Limit!", type: "error" });
      this.$emit("Quantity Limit!", true);
    } else {
      this.$emit("update:allowCreate", false);
    }
  }

  applyCorrection(data: any) {
    this.priceStepOptions = dynamicStepDefinition(data.precisionRules.price);
    this.quantityStepOptions = dynamicStepDefinition(data.precisionRules.amount);

    let quantityToSet = data.suggestedInput.quantity;

    // if max available
    if (this.formData.rangeValue === 100) {
      // if suggested bigger than max available
      const isBigger = data.suggestedInput.quantity - this.formData.amount > 0;

      if (isBigger) {
        quantityToSet = data.suggestedInput.quantity - 1;
      }
    }

    // animate input
    if (!data.checkList.pricePrecision) {
      this.formData.price = data.suggestedInput.price;
      this.$refs.inputLimitPrice.animateAnimate();
    }

    if (!data.checkList.quantityPrecision) {
      this.formData.amount = data.suggestedInput.quantity;
      this.formData.amount = this.correctQuality(this.formData.amount);
      this.$refs.inputContracts.animateAnimate();
    }
  }

  getFormData() {
    const { price, amount } = this.formData;

    const formData = {
      price,
      quantity: amount,
      type: this.type.value.toUpperCase(),
      totalValue: this.totalAmountInput,
    };

    return formData;
  }

  async calculateEntryAmout() {
    if (this.isGetBaseAvailableDone) {
      this.validateFields();
    }
    const quantity = (this.maxAvailableAmount * this.formData.rangeValue) / 100;
    this.formData.amount = Number(quantity.toFixed(this.quantityStepOptions.size));
    this.formData.amount = this.correctQuality(this.formData.amount);
  }

  async handleAmountChange(val: string) {
    await this.validateFields();

    const value = Number(val);
    this.formData.amount = Number(value.toFixed(this.quantityStepOptions.size));
    if (value >= this.maxAvailableAmount) {
      //reset to 100% and max quantity when too big number is entered
      this.formData.rangeValue = 100;
      this.formData.amount = this.maxAvailableAmount;
      this.formData.amount = this.correctQuality(this.formData.amount);
    } else {
      this.formData.rangeValue = (value * 100) / this.maxAvailableAmount;
    }
  }

  correctQuality(amount: number): number {
    const step = this.quantityStepOptions || defineStep(this.pair.baseCurrency);
    let correctAmount = Math.min(amount * 0.99, this.maxAvailableAmount);
    correctAmount = parseInt((correctAmount * 10 ** step.size).toString()) / 10 ** step.size;
    return correctAmount;
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
