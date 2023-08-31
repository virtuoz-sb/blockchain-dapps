<template>
  <div v-if="!$breakpoint.mdAndDown" class="table__items-wrap flex flex-col px-20 overflow-y-auto custom-scrollbar">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="flex items-center pb-10 mb-10 last:mb-0 border-b border-solid border-grey-cl-300 last:border-none"
    >
      <!-- TITLE -->
      <div class="table__item--col-1 flex items-center pr-10">
        <i class="w-24 text-grey-cl-300 text-xxl1 mr-30" :class="item.icon" />
        <span class="text-grey-cl-300 text-md leading-xs">{{ item.title }}</span>
      </div>

      <!-- PRICE -->
      <div class="table__item--col-2 flex items-center pr-10" :class="item.price >= 0 ? 'text-green-cl-100 ' : 'text-red-cl-100'">
        <span class="text-md leading-xs">
          {{ item.price ? (item.price >= 0 ? `+ ${item.price}` : `- ${item.price.toString().slice(1)}`) : "-" }}
        </span>
        &nbsp;
        <span class="text-md leading-xs">UBXT</span>
      </div>

      <!-- DATE -->
      <div class="table__item--col-3 flex">
        <span class="text-grey-cl-920 text-md leading-xs">{{ item.date }}</span>
      </div>
    </div>
  </div>

  <!-- ITEMS MOBILE -->
  <div v-else class="table__items-wrap grid row-gap-10 overflow-y-auto custom-scrollbar">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="table__item grid items-center pt-10 pb-20 px-30 border-b border-solid border-grey-cl-300 last:border-none"
    >
      <div class="flex items-center pr-15">
        <div class="flex">
          <i class="w-24 text-grey-cl-300 text-xxl1 mr-20" :class="item.icon" />
        </div>
        <div class="flex flex-col">
          <span class="text-grey-cl-920 text-md leading-xs mb-2">{{ item.title }}</span>
          <span class="text-grey-cl-920 leading-xs">{{ item.date }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center">
        <span class="flex text-md leading-xs" :class="item.price >= 0 ? 'text-green-cl-100 ' : 'text-red-cl-100'">
          {{ item.price ? (item.price >= 0 ? `+ ${item.price}` : `- ${item.price.toString().slice(1)}`) : "-" }}
        </span>
        &nbsp;
        <span class="flex text-md leading-xs" :class="item.price >= 0 ? 'text-green-cl-100 ' : 'text-red-cl-100'">UBXT</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UBXTTransactionItem" })
export default class UBXTTransactionItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any[];
}
</script>

<style lang="scss" scoped>
.table {
  &__item {
    @media (max-width: 1024px) {
      grid-template-columns: 2.5fr 1fr;
    }
  }
  &__item {
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

.icon-algo-bots {
  font-size: 17px;
}

.icon-learning {
  font-size: 26px;
}

.icon-signals-providers {
  @apply text-xxl1;
}
</style>
