<template>
  <div class="relative">
    <ValidationProvider
      ref="validateProvider"
      tag="div"
      :name="name"
      :customMessages="customErrorMessage"
      :rules="rules"
      class="flex"
      v-slot="{ errors }"
    >
      <span
        v-if="errors.length"
        class="error-message absolute right-0 text-red-orange leading-md text-sm border border-solid border-transparent"
      >
        {{ errors[0] }}
      </span>
      <input
        ref="input"
        class="input relative w-full text-iceberg border border-solid border-transparent rounded-5"
        :class="[inputClasses, animateInput && 'animate']"
        v-bind="{ ...$attrs, ...(showLast && { type: 'password' }) }"
        :value="value"
        :name="name"
        :disabled="disabled"
        :placeholder="placeholder"
        @input="({ target }) => onInput(target)"
        @focus="inputOnFocus"
        @blur="inputOnBlur"
        @click="$emit('click', $refs.input)"
      />
      <div v-if="showLastDigits" :class="[textColor]" class="absolute top-0 right-0 flex items-center h-full px-10">
        <span>{{ lastDigits }}</span>
      </div>
      <!-- ICON -->
      <slot />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Decimal from "decimal.js-light";

import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { log } from "util";

@Component({ name: "AppInput" })
export default class AppInput extends Vue {
  /* PROPS */
  @Prop({ default: "" }) value!: any;
  @Prop({ default: "" }) customClass!: String;
  @Prop({ type: Boolean, default: false }) disabled!: boolean;
  @Prop({ default: "" }) rules: string;
  @Prop({ default: "Field" }) name: string;
  @Prop({ default: "" }) errorMessage: string;
  @Prop({ default: "" }) placeholder: string;
  @Prop({ default: false, type: Boolean }) isIcon: boolean;
  @Prop({ default: "text-iceberg" }) textColor: string;
  @Prop({ default: "md" }) size: string;
  @Prop({ default: false, type: Boolean }) showLast: string;
  @Prop({ default: false, type: Boolean }) autocomplete: Boolean;
  @Prop({ default: false, type: Boolean }) isNumber: Boolean;
  @Prop({ default: false, type: Boolean }) isFocused: Boolean;

  /* REFS */
  $refs!: {
    validateProvider: any;
    input: any;
  };

  /* DATA */
  isMounted: boolean = false;

  inputFocused: boolean = false;

  animateInput: boolean = false;

  oldValue: any;

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
    return this.isMounted && this.$refs.validateProvider.errors.length && "error";
  }

  get extraaPaddings() {
    return this.showLast ? "pr-60" : "";
  }

  get inputClasses() {
    return [
      this.focusedClasses,
      this.disabledClasses,
      this.errorClasses,
      this.customClass,
      this.textColor,
      this.inputSize,
      this.extraaPaddings,
    ];
  }

  get lastDigits() {
    return this.value.substring(this.value.length - 4);
  }

  get showLastDigits() {
    return this.showLast && this.value.length > 4;
  }

  /* WATCHERS */
  @Watch("value")
  handler(val: string) {
    this.oldValue = val;
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
    if (!this.autocomplete) {
      this.disableAutoComplete();
    }
    if (this.isFocused) {
      this.$refs.input.focus();
    }
  }

  /* METHODS */
  disableAutoComplete() {
    if (!this.$refs.input.hasAttribute("readonly")) {
      this.$refs.input.setAttribute("readonly", "readonly");
      setTimeout(() => {
        this.$refs.input.removeAttribute("readonly");
      }, 500);
    }
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

  onInput(target: any) {
    let newValue = target.value;
    if (!this.isNumber || !isNaN(newValue)) {
      this.$emit("input", newValue);
    } else {
      this.$emit("input", this.oldValue);
    }
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
