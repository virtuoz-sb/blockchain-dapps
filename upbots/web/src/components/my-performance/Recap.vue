<template>
  <div class="px-44 py-19">
    <div class="flex">
      <div class="mr-50">
        <p class="text-grey-cl-920 text-sm leading-xs mb-8">Month</p>
        <AppSelect v-model="selectedMonth" :options="months" class="select" />
      </div>

      <div>
        <p class="text-grey-cl-920 text-sm leading-xs mb-8">Account</p>
        <AppSelect v-model="selectedAccount" :options="accounts" class="select" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "Recap" })
export default class Recap extends Vue {
  /* DATA */
  selectedMonth: { label: string } = { label: "September" };
  months: { label: string }[] = [{ label: "January" }, { label: "February" }, { label: "March" }, { label: "April" }, { label: "May" }];

  selectedAccount: { label: string } = { label: "All" };
  accounts: { label: string }[] = [{ label: "All" }];
}
</script>

<style lang="scss" scoped>
.select {
  width: 380px;
}
</style>
