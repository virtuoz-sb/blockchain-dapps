<template>
  <div class="flex flex-col pt-10">
    <div class="flex flex-col">
      <h3 class="text-grey-cl-100 text-md md:text-sm md:leading-xs md:mb-20 md:mb-5 px-20">Active Alerts</h3>
      <p v-if="!alerts.length" class="flex flex-col text-grey-cl-300 md:text-xs md:leading-xs px-20">
        <span>List is empty,</span>
        <span>create the new alert.</span>
      </p>
      <div v-else class="pt-10 md:pt-0">
        <div class="flex w-full justify-between md:text-xs md:leading-xs text-white border-b border-grey-cl-100 pb-10">
          <span class="flex w-1/2 pl-20">Ticker</span>
          <span class="flex w-1/2 pr-20">Message</span>
        </div>
        <!-- ALERT LIST ITEM -->
        <AlertListItem
          v-for="(alert, index) in alerts"
          :key="index"
          :alert-data="alert"
          class="px-20"
          @click.native="$emit('edit-alert', index)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AlertForm } from "@/models/interfaces";

import AlertListItem from "@/components/alert/AlertListItem.vue";

@Component({ name: "AlertsList", components: { AlertListItem } })
export default class AlertsList extends Vue {
  /* PROPS */
  @Prop({ required: true }) alerts!: AlertForm;
}
</script>
