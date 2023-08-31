<template>
  <div class="relative">
    <ValidationProvider
      ref="validateProvider"
      :name="name"
      :customMessages="customErrorMessage"
      :rules="rules"
      v-slot="{ errors }"
      tag="div"
    >
      <span v-if="errors.length" class="error-message absolute right-0 text-red-orange leading-md text-sm">
        {{ errors[0] }}
      </span>
      <textarea
        class="textarea text-iceberg text-md md:text-sm md:leading-md border border-solid border-transparent py-10 px-12 rounded-5"
        :class="textareaClasses"
        v-bind="$attrs"
        :value="value"
        :disabled="disabled"
        min="0"
        @input="({ target }) => $emit('input', target.value)"
        @focus="textareaOnFocus"
        @blur="textareaOnBlur"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";

@Component({ name: "AppTextarea" })
export default class AppTextarea extends Vue {
  /* PROPS */
  @Prop({ default: "" }) value!: String;
  @Prop({ type: Boolean, default: false }) disabled!: boolean;
  @Prop({ default: "" }) customClass!: String;
  @Prop({ default: "" }) rules: string;
  @Prop({ default: "Field" }) name: string;
  @Prop({ default: "" }) errorMessage: string;
  @Prop({ default: "text-iceberg" }) textColor: string;

  /* REFS */
  $refs!: {
    validateProvider: any;
  };

  /* DATA */
  isMounted: boolean = false;

  textareaFocused: boolean = false;

  /* COMPUTED */
  get customErrorMessage() {
    return {
      [this.name.toLowerCase()]: this.errorMessage,
    };
  }

  get focusedClasses() {
    return this.textareaFocused && !this.$refs.validateProvider.errors.length ? "bg-cello" : "bg-san-juan hover:bg-ming";
  }

  get disabledClasses() {
    return !this.disabled ? "bg-san-juan" : "disabled opacity-50 cursor-not-allowed";
  }

  get errorClasses() {
    return this.isMounted && this.$refs.validateProvider.errors.length ? "error" : "";
  }

  get textareaClasses() {
    return [this.focusedClasses, this.disabledClasses, this.errorClasses, this.customClass, this.textColor];
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }

  /* METHODS */
  textareaOnFocus() {
    this.textareaFocused = true;
  }

  textareaOnBlur() {
    this.textareaFocused = false;
  }
}
</script>

<style lang="scss" scoped>
.textarea {
  &::placeholder {
    @apply text-base leading-xs text-sm;
    color: #6f7685;
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
</style>
