<template>
  <div class="relative">
    <!-- VALIDATION -->
    <ValidationProvider
      ref="validateProvider"
      tag="div"
      :name="name"
      :customMessages="customErrorMessage"
      :rules="rules"
      v-slot="{ errors }"
    >
      <!-- ERROR MESSAGE -->
      <span
        v-if="errors.length"
        class="error-message absolute right-0 text-red-orange leading-md text-sm border border-solid border-transparent"
      >
        {{ errors[0] }}
      </span>

      <span
        v-else-if="!errors.length && customErrorText"
        class="error-message absolute right-0 text-red-orange leading-md text-sm border border-solid border-transparent"
      >
        {{ customErrorText }}
      </span>
      <!-- INPUT -->
      <input
        ref="input"
        class="input relative w-full text-iceberg border border-solid border-transparent rounded-5 pr-35"
        :class="[inputClasses, animateInput && 'animate']"
        v-bind="{ ...$attrs }"
        :value="value"
        :name="name"
        :disabled="disabled"
        :placeholder="placeholder"
        type="number"
        @input="({ target }) => $emit('input', Number(target.value))"
        @focus="inputOnFocus"
        @blur="inputOnBlur"
        @click="$emit('click', $refs.input)"
      />
      <!-- ARROW -->
      <div
        class="absolute flex flex-col items-center w-15 right-10 top-1/2 transform -translate-y-1/2"
        :class="disabled && 'cursor-not-allowed select-none'"
      >
        <i
          :class="disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:text-white'"
          class="block icon-arrow-expand text-xxs text-grey-100 transform rotate-180"
          @click="changeAmount('up')"
        />
        <i
          :class="[disbaledArrow || disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:text-white']"
          class="block icon-arrow-expand text-xxs text-grey-100 mt-4"
          @click="changeAmount('down')"
        />
      </div>
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Decimal from "decimal.js-light";

import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import { log } from "util";

@Component({ name: "AppInputNumber" })
export default class AppInputNumber extends Vue {
  /* PROPS */
  @Prop({ default: "" }) value!: any;
  @Prop({ default: () => ({ size: 1, value: 1 }) }) step: any;
  @Prop({ default: "" }) rules: string;
  @Prop({ default: "" }) errorMessage: string;
  @Prop({ default: "Field" }) name: string;
  @Prop({ default: "" }) placeholder: string;
  @Prop({ default: "" }) customClass!: String;
  @Prop({ default: "md" }) size: string;
  @Prop({ type: Boolean, default: false }) disabled!: boolean;
  @Prop({ default: "" }) customErrorText!: string;

  /* REFS */
  $refs!: {
    validateProvider: any;
    input: any;
  };

  /* DATA */
  isMounted: boolean = false;

  inputFocused: boolean = false;

  animateInput: boolean = false;

  /* COMPUTED */
  get customErrorMessage() {
    return {
      [this.name.toLowerCase()]: this.errorMessage,
    };
  }

  get inputSize() {
    if (this.size === "sm") {
      return "size-sm leading-md py-8 px-12 text-sm";
    } else {
      return "size-md leading-md py-12 px-12 text-sm";
    }
  }

  get focusedClasses() {
    return this.inputFocused && !this.$refs.validateProvider.errors.length ? "bg-cello" : "bg-san-juan hover:bg-ming";
  }

  get disabledClasses() {
    return !this.disabled ? "bg-san-juan" : "disabled opacity-50 cursor-not-allowed";
  }

  get errorClasses() {
    return this.isMounted && this.$refs.validateProvider.errors.length ? "error" : this.customErrorText ? "error" : null;
  }

  get inputClasses() {
    return [this.focusedClasses, this.disabledClasses, this.errorClasses, this.customClass, this.inputSize];
  }

  get disbaledArrow() {
    return this.value <= 0;
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }

  /* METHODS */
  changeAmount(value: string) {
    const number = +this.value;
    if (value === "down" && number <= 0) {
      return;
    }

    Decimal.config({ rounding: this.step.size });
    const a = new Decimal(this.value);

    let newValue;

    if (value === "up") {
      newValue = a.plus(this.step.value || 0.1).toNumber();
    } else {
      newValue = a.minus(this.step.value || 0.1).toNumber();
    }

    this.$emit("input", newValue);
  }

  inputOnFocus() {
    this.inputFocused = true;
  }

  inputOnBlur() {
    this.inputFocused = false;
  }

  animateAnimate() {
    this.animateInput = true;
    setTimeout(() => {
      this.animateInput = false;
    }, 400);
  }
}
</script>

<style lang="scss" scoped>
.input {
  &::placeholder {
    @apply text-sm leading-md text-iceberg;
  }

  &.animate {
    animation: pulse 1s;
  }

  &.disabled {
    &:hover {
      @apply bg-san-juan;
    }
  }

  &.error {
    @apply bg-masala border border-solid border-red-orange;
  }
}

.error-message {
  top: -22px;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input::-webkit-credentials-auto-fill-button {
  margin: 0;
  width: 0;
  background-color: transparent;
}

input::-webkit-contacts-auto-fill-button,
input::-webkit-credentials-auto-fill-button {
  visibility: hidden;
  display: none !important;
  pointer-events: none;
  height: 0;
  width: 0;
  margin: 0;
}

@-webkit-keyframes pulse {
  0% {
    -webkit-box-shadow: 0px 0px 0px rgba(110, 212, 202, 0.3);
  }
  70% {
    -webkit-box-shadow: 0px 0px 7px rgba(110, 212, 202, 0);
  }
  100% {
    -webkit-box-shadow: 0px 0px 0px rgba(110, 212, 202, 0);
  }
}
@keyframes pulse {
  0% {
    -moz-box-shadow: 0px 0px 0px rgba(110, 212, 202, 0.3);
    box-shadow: 0px 0px 0px rgba(110, 212, 202, 0.7);
  }
  70% {
    -moz-box-shadow: 0px 0px 10px rgba(110, 212, 202, 0);
    box-shadow: 0px 0px 10px rgba(110, 212, 202, 0);
  }
  100% {
    -moz-box-shadow: 0px 0px 0px rgba(110, 212, 202, 0);
    box-shadow: 0px 0px 0px rgba(110, 212, 202, 0);
  }
}
</style>
