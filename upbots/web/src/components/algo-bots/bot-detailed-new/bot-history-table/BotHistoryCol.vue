<template>
  <col :name="`table_column_${index}`" :width="data" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "BotHistoryCol" })
export default class BotHistoryCol extends Vue {
  /* PROPS */
  @Prop({ required: true }) index: number;
  @Prop({ required: true }) data: any;
}
</script>
