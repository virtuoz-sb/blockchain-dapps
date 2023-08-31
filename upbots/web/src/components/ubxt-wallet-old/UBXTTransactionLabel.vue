<template>
  <!-- LABELS DESKTOP -->
  <div v-if="!$breakpoint.mdAndDown" class="flex items-center mb-27 px-20">
    <span
      v-for="(item, index) in labelsData"
      :key="index"
      :class="`table__title--col-${index + 1}`"
      class="table__title--col-1 text-grey-cl-920 text-sm leading-xs pr-10 last:pr-0"
    >
      {{ item }}
    </span>
  </div>
  <!-- LABELS TABLET, MOBILE -->
  <div v-else class="table__label grid col-gap-20 px-30 mb-6">
    <span v-for="(item, index) in labelsData" :key="index" class="text-grey-cl-920 text-sm leading-xs">{{ item }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "UBXTTransactionLabel" })
export default class UBXTTransactionLabel extends Vue {
  /* COMPUTED */
  get labelsData() {
    if (!this.$breakpoint.mdAndDown) {
      return ["Name:", "Price:", "Date"];
    } else {
      return ["Name & date:", "Price:"];
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  &__label {
    @media (max-width: 1024px) {
      grid-template-columns: 2.5fr 1fr;
    }
  }
  &__title {
    &--col-1 {
      min-width: 200px;
      width: 49%;
    }
    &--col-2 {
      min-width: 120px;
      width: 34%;
    }
    &--col-3 {
      min-width: 89px;
      width: 17%;
    }
  }
}
</style>
