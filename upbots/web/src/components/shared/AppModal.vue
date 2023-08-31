<template>
  <portal selector="#modals-target">
    <transition name="fade">
      <div
        v-if="value"
        :class="!fullMobileScreen && 'p-20'"
        class="modal fixed flex justify-center h-full w-full top-0 left-0 bottom-0 right-0 overflow-y-auto overflow-x-hidden custom-scrollbar z-200"
      >
        <!-- SLOT HEADER -->
        <slot name="header" />

        <div
          :class="[customClass, fullMobileScreen && 'h-full']"
          :style="modalWidth"
          class="modal__inner relative w-full bg-tangaroa rounded-3 my-auto z-90"
        >
          <i class="modal__icon-close absolute right-20 top-20 icon-close text-william z-90 cursor-pointer" @click="close" />

          <!-- SLOT CONTENT -->
          <slot />
        </div>

        <!-- SLOT FOOTER -->
        <slot name="footer" />

        <!-- BACKDROP -->
        <div class="overlay fixed top-0 bottom-0 left-0 right-0 h-full w-full" @click="backdropClick" />
      </div>
    </transition>
  </portal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppModal" })
export default class AppModal extends Vue {
  /* PROPS */
  @Prop({ required: true }) value: boolean;
  @Prop({ default: "" }) customClass!: string;
  @Prop({ type: Boolean, default: false }) persistent!: boolean;
  @Prop({ type: String, default: "" }) width: string;
  @Prop({ type: String, default: "" }) maxWidth: string;
  @Prop({ type: String, default: "" }) minWidth: string;
  @Prop({ type: Boolean, default: false }) fullMobileScreen: boolean;

  /* COMPUTED */
  get modalWidth() {
    if (this.width) {
      return `width: ${this.width}`;
    } else if (this.maxWidth) {
      return `maxWidth: ${this.maxWidth}`;
    } else if (this.minWidth) {
      return `maxWidth: ${this.minWidth}`;
    } else {
      return null;
    }
  }

  /* METHODS */
  backdropClick() {
    !this.persistent ? this.$emit("input", false) : null;
  }

  close() {
    this.$emit("close");
    this.$emit("input", false);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.modal {
  &__icon-close {
    font-size: 25px;
  }
}

.overlay {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
