<template>
  <div class="flex flex-col w-full pt-14 pb-10">
    <div class="flex flex-col px-10 mb-20">
      <AppInput type="text" size="sm" readonly />
    </div>

    <div class="mt-auto px-10">
      <AppButton type="light-green" size="xs" class="w-full" disabled>Share link</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "Referral" })
export default class Referral extends Vue {}
</script>
