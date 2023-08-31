<template>
  <portal selector="#modals-target">
    <transition name="fade">
      <div v-if="opened" class="fixed flex top-0 bottom-0 left-20 md:left-0 right-20 md:right-0 z-200">
        <!-- CONTENT -->
        <div
          class="confirm-modal__container relative bg-tangaroa rounded-3 w-full px-20 pt-60 pb-40 m-auto z-190"
          :class="{ 'cursor-wait': isDisabled }"
        >
          <i class="icon-close text-white absolute top-20 right-20" :class="isDisabled ? 'cursor-wait' : 'cursor-pointer'" @click="close" />
          <div class="w-330 max-w-full mx-auto text-center">
            <!-- TITLE -->
            <h2 v-if="title" class="font-raleway text-white text-xxl mb-20">
              {{ title }}
            </h2>

            <!-- SUBTITLE -->
            <p v-if="subtitle" class="text-grey-cl-920 mb-25">
              {{ subtitle }}
            </p>

            <!-- CONTENT -->
            <p v-if="!prompt && $slots.default" class="mb-45 md:mb-60">
              <slot />
            </p>

            <!-- PROMPT INPUT -->
            <ValidationObserver v-show="prompt" ref="input" class="mb-25" tag="div">
              <AppInput v-model="inputValue" name="Password" type="password" rules="required" placeholder="Enter your password" />
            </ValidationObserver>

            <div v-if="isCheckbox" class="flex items-center mb-25">
              <AppCheckbox v-model="checkbox" @click="$emit('on-checkbox', checkbox)" />
              <slot name="checkbox-label" />
            </div>

            <!-- CONTROLS -->
            <div class="flex justify-center items-center flex-col-reverse md:flex-row">
              <button class="text-blue-cl-200 md:mr-70 mt-40 md:mt-0" :class="{ 'is-disabled': isDisabled }" @click="close">
                {{ cancelButton }}
              </button>
              <AppButton
                type="light-green"
                class="confirm-modal__btn"
                :class="{ 'is-disabled': isDisabled }"
                :disabled="requiredConfirm"
                @click="confirm"
              >
                {{ confirmButton }}
              </AppButton>
            </div>
          </div>
        </div>

        <!-- BACKDROP -->
        <div
          class="backdrop fixed top-0 bottom-0 left-0 right-0 h-full w-full z-90"
          :class="{ 'cursor-wait': isDisabled }"
          @click="close"
        />
      </div>
    </transition>
  </portal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppConfirmModal" })
export default class AppConfirmModal extends Vue {
  /* PROPS */
  @Prop({ default: "" }) title?: string;
  @Prop({ default: "" }) subtitle?: string;
  @Prop({ default: false, type: Boolean }) prompt!: boolean;
  @Prop({ default: "Cancel" }) cancelButton!: string;
  @Prop({ default: "Confirm" }) confirmButton!: string;
  @Prop({ default: false, type: Boolean }) isCheckbox: boolean;
  @Prop({ default: false, type: Boolean }) isDisabled: boolean;

  /* REFS */
  $refs!: {
    input: any;
  };

  /* DATA */
  opened = false;
  resolvePromise: any;
  rejectPromise: () => void;
  promise: Promise<any>;
  inputValue = "";
  checkbox: boolean = false;

  /* COMPUTED */
  get requiredConfirm() {
    if (this.isDisabled) {
      return this.isDisabled;
    } else {
      return this.isCheckbox ? (this.checkbox ? false : true) : false;
    }
  }

  /* METHODS */
  show() {
    this.checkbox = false;

    if (this.prompt) this.inputValue = "";
    this.opened = true;
    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });
  }

  confirm() {
    if (!this.isDisabled) {
      if (this.prompt) {
        this.$refs.input.validate().then((valid: Boolean) => {
          if (valid) {
            this.resolvePromise(this.inputValue);
            this.opened = false;
          }
        });
      } else {
        this.resolvePromise();
        this.opened = false;
      }
    }
  }

  close() {
    if (!this.isDisabled) {
      this.opened = false;
      this.rejectPromise();
    }
  }
}
</script>

<style lang="scss" scoped>
.confirm-modal {
  &__container {
    max-width: 500px;
  }
  &__btn {
    min-width: 240px;
  }
}

.is-disabled {
  @apply cursor-wait;
}

.icon-close {
  font-size: 25px;
}

.backdrop {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
