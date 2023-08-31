<template>
  <div>
    <!-- SLOT -->
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  name: "ProjectDetailsAccordion",
  provide() {
    return {
      accordion: {
        // @ts-ignore
        defaultOpen: this.defaultOpen,
      },
    };
  },
})
export default class ProjectDetailsAccordion extends Vue {
  /* PROPS */
  @Prop({ type: Boolean, default: false }) accordionBehave: any;
  @Prop({ type: Number, required: false }) defaultOpen: any;

  /* METHODS */
  handleCollapseAction(activeIndex: number) {
    this.$children.map((accordion: any) => {
      if (this.accordionBehave && activeIndex !== accordion.index) {
        accordion.close();
      }
    });
  }
}
</script>
