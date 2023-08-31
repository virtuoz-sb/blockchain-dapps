<template>
  <div class="accordion-item" @click="toggle">
    <div :class="customClass">
      <!-- TITLE -->
      <div class="flex justify-between items-center cursor-pointer">
        <slot name="title" />

        <!-- COLLAPS ICON -->
        <p class="flex" :class="[collapseIcon, { 'transform rotate-180': isOpen }]" />
      </div>

      <!-- CONTENT -->
      <transition name="fade">
        <slot v-if="!isOpen" name="caption" />
        <slot v-else />
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";

@Component({ name: "AppAccordionItem", inject: ["accordion"] })
export default class AppAccordionItem extends Vue {
  /* PROPS */
  @Prop({ type: String, default: "" }) collapseIcon: any;
  @Prop({ type: Boolean, default: false }) defaultOpen: any;
  @Prop({ type: Number, required: true }) index: any;
  @Prop({ type: String, default: "" }) customClass: any;

  /* TYPES */
  $parent: any;
  accordion: any;

  /* DATA */
  isOpen: boolean = false;

  /* HOOKS */
  created() {
    this.isOpen = this.accordion.defaultOpen === this.index;
  }

  /* METHODS */
  toggle() {
    this.isOpen = !this.isOpen;
    this.$parent.handleCollapseAction(this.index);
  }

  close() {
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.icon-arrow-expand {
  font-size: 6px;
}
</style>
