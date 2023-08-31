<template>
  <div class="accordion-item" @click="toggle">
    <div :class="customClass">
      <!-- PREVIEW -->
      <slot name="preview" />

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

@Component({ name: "ProjectDetailsAccordionItem", inject: ["accordion"] })
export default class ProjectDetailsAccordionItem extends Vue {
  /* PROPS */
  @Prop({ type: Boolean, default: false }) defaultOpen: any;
  @Prop({ type: Number, required: true }) index: any;
  @Prop({ type: String, default: "" }) customClass: any;

  /* DATA */
  isOpen: boolean = false;

  /* TYPES */
  $parent: any;
  accordion: any;

  /* HOOKS */
  created() {
    this.isOpen = this.accordion.defaultOpen === this.index;
  }

  /* METHODS */
  toggle() {
    this.isOpen = !this.isOpen;
    this.$parent.handleCollapseAction(this.index);
    this.$emit("toggle", this.isOpen);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.icon-arrow-expand {
  font-size: 6px;
}
</style>
