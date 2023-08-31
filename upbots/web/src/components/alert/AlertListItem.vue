<template>
  <div class="flex w-full md:text-sm md:leading-xs py-10 text-grey-cl-100 border-b border-grey-cl-300 bg-dark-cl-300 cursor-pointer">
    <div class="w-1/2">{{ alertData.condition.label }}</div>
    <div class="w-1/2 truncate">{{ alertData.alertMessage }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AlertForm } from "@/models/interfaces";

@Component({ name: "AlertListItem" })
export default class AlertListItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) alertData!: AlertForm;
}
</script>
