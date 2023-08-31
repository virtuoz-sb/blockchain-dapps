<template>
  <th colspan="1" rowspan="1" :class="`table_column_${index + 1}`">
    <div class="text-iceberg font-normal px-10 text-base py-8 text-left">{{ data }}</div>
  </th>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UBXTTransactionLabel" })
export default class UBXTTransactionLabel extends Vue {
  /* PROPS */
  @Prop({ required: true }) index: number;
  @Prop({ required: true }) data: any;
}
</script>
