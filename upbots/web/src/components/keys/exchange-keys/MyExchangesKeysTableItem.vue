<template>
  <div class="flex-1 min-w-130 md:min-w-150 pb-15 pl-20 md:px-20" :class="[field === 'exchange' && 'capitalize', statusClass]">
    <template v-if="field === 'valid'"> {{ data ? "Valid" : "Invalid" }} </template>
    <template v-else-if="field === 'exchange'"> {{ data === "ftx" ? "FTX" : data }} </template>
    <template v-else-if="isDate"> {{ data | dateLocal }} </template>
    <template v-else> {{ data }} </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ExchangeKey } from "@/store/exchangeKeys/types";

@Component({ name: "MyExchangesKeysTableItem" })
export default class MyExchangesKeysTableItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) data!: ExchangeKey;
  @Prop({ required: true }) field!: string;

  /* COMPUTED */
  get isDate() {
    return this.field === "created" || this.field === "updated";
  }

  get statusClass() {
    return this.field === "valid" ? (this.data ? "text-green-cl-100" : "text-red-cl-100") : null;
  }
}
</script>
