<template>
  <th colspan="1" rowspan="1" :class="`table_column_${index + 1}`">
    <div class="text-hidden-sea-glass text-sm leading-xs py-8 text-left" :class="index === 0 && 'pl-20'">{{ data }}</div>
  </th>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UserHistoryLabel" })
export default class UserHistoryLabel extends Vue {
  /* PROPS */
  @Prop({ required: true }) index: number;
  @Prop({ required: true }) data: any;
}
</script>
