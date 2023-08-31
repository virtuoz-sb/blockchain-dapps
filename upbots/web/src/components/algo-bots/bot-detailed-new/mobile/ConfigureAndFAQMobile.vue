<template>
  <!-- :class="selectedView.value === 'FAQ' && 'shadow'" -->
  <div class="flex flex-col flex-grow relative overflow-y-auto custom-scrollbar">
    <!-- SELECT COMPONENT -->
    <!-- <div class="flex flex-shrink-0 items-center px-20 mb-10">
      <div class="text-grey-cl-920 text-sm leading-xs mr-12 md:mr-8">View:</div>
      <AppDropdown-basic v-model="selectedView" :options="view" dark />
    </div> -->

    <!-- CONFIGURE -->
    <div class="flex flex-col flex-grow relative py-20 overflow-y-auto custom-scrollbar">
      <!-- CONFIGURE COMING SOON -->
      <ComingDoon v-if="!cupon" class="top-0 z-100" />

      <!-- v-if="selectedView.value === 'Configure'" -->
      <Configure :bot-name="botName" class="flex flex-col flex-grow relative overflow-y-auto custom-scrollbar" />
    </div>

    <!-- FAQ -->
    <!-- <Faq v-if="selectedView.value === 'FAQ'" class="pt-10" /> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import Configure from "@/components/algo-bots/bot-detailed-new/Configure.vue";
import FAQ from "@/components/algo-bots/bot-detailed-new/FAQ.vue";
import ComingSoonOverlay from "@/components/algo-bots/bot-detailed-new/ComingSoon.vue";

@Component({ name: "ConfigureAndFAQMobile", components: { Configure, faq: FAQ, ComingSoon: ComingSoonOverlay } })
export default class ConfigureAndFAQMobile extends Vue {
  /* PROPS */
  @Prop({ required: true }) botName: string;
  @Prop({ required: true, type: Boolean }) cupon: boolean;

  /* DATA */
  // selectedView: object = { value: "Configure", label: "Configure" };
  // view: GroupItems[] = [
  //   { value: "Configure", label: "Configure" },
  // { value: "FAQ", label: "FAQs" },
  // ];
}
</script>

<style lang="scss" scoped>
.shadow {
  &:after {
    content: "";
    bottom: -1px;
    height: 55px;
    background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
    @apply absolute left-0 w-full;
  }
}
</style>
