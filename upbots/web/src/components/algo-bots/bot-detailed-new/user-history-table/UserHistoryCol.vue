<template>
  <col :name="`table_column_${index}`" :width="data" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UserHistoryCol" })
export default class UserHistoryCol extends Vue {
  /* PROPS */
  @Prop({ required: true }) index: number;
  @Prop({ required: true }) data: string[];
}
</script>
