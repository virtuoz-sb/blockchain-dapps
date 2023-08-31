<template>
  <div class="flex flex-col flex-shrink-0 bg-tiber sahdow-140 rounded-15 p-20 mb-20 last:mb-0">
    <!-- EXCHANGE -->
    <div class="flex items-center justify-between mb-10">
      <span class="text-iceberg leading-xs">Exchange</span>
      <span class="text-white leading-xs capitalize">{{ data.exchange }}</span>
    </div>

    <!-- NAME -->
    <div class="flex items-center justify-between mb-10">
      <span class="text-iceberg leading-xs">Name</span>
      <span class="text-white leading-xs">{{ data.name }}</span>
    </div>

    <!-- CREATED -->
    <div class="flex items-center justify-between mb-10">
      <span class="text-iceberg leading-xs">Creation date</span>
      <span class="text-white leading-xs">{{ data.created | dateLocal }}</span>
    </div>

    <!-- UPDATED -->
    <div class="flex items-center justify-between mb-10">
      <span class="text-iceberg leading-xs">Last update</span>
      <span class="text-white leading-xs">{{ data.updated | dateLocal }}</span>
    </div>

    <!-- STATUS -->
    <div class="flex items-center justify-between mb-10">
      <span class="text-iceberg leading-xs">Status</span>
      <span class="leading-xs" :class="statusClass">{{ data.valid ? "Valid" : "Invalid" }}</span>
    </div>

    <!-- ACTION BUTTONS (EDIT, DELETE) -->
    <div class="flex items-center justify-between">
      <AppButton type="light-green" size="xxs" class="edit-btn w-100" @click="$emit('set-edit-data', data)">Edit</AppButton>
      <AppButton type="light-green-bordered" size="xxs" class="delete-btn w-100" @click="$emit('remove', data)">Delete</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { IMyExchangeKey } from "../types/my-keys.types";

@Component({ name: "MyExchangeKeysItemMobile" })
export default class MyExchangeKeysItemMobile extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: IMyExchangeKey;

  /* COMPUTED */
  get statusClass() {
    return this.data.valid ? "text-green-cl-100" : "text-red-cl-100";
  }
}
</script>
