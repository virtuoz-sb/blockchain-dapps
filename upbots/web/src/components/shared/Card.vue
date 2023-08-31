<template>
  <div class="card__wrap">
    <!-- CARD HEADER -->
    <div v-if="header" class="card__header min-h-40 border-b border-solid border-grey-cl-300 px-20 py-7" :class="headerClasses">
      <div v-if="$slots['header-left']" class="flex flex-grow items-center">
        <!-- HEADER LEFT -->
        <slot name="header-left" />
      </div>
      <div v-if="$slots['header-right']" class="flex">
        <!-- HEADER RIGHT -->
        <slot name="header-right" />
      </div>
    </div>
    <!-- CONTENT -->
    <slot name="content" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "Card" })
export default class Card extends Vue {
  /* PROPS */
  @Prop({ default: "" }) headerClasses: string;
  @Prop({ type: Boolean, default: true }) header: true;
}
</script>
