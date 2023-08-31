<template>
  <div class="flex flex-col flex-grow py-40 overflow-y-auto custom-scrollbar px-30">
    <!-- ACTIVE CHANNEL ROW -->
    <ActiveChannelRow v-for="(item, index) in data" :data="item" :key="index" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ActiveChannelRow from "@/components/signal-providers/active-channel-tab/ActiveChannelRow.vue";

@Component({ name: "ActiveChannels", components: { ActiveChannelRow } })
export default class ActiveChannels extends Vue {
  /* DATA */
  data: any[] = [
    {
      channel: "4C-Trading",
      subscription: "Silver pack",
      validFrom: "01/09/2019",
      to: "01/11/2019",
      lastMonthPerfs: "32%",
    },
    {
      channel: "4C-Trading",
      subscription: "Silver pack",
      validFrom: "01/09/2019",
      to: "01/11/2019",
      lastMonthPerfs: "32%",
    },
    {
      channel: "4C-Trading",
      subscription: "Silver pack",
      validFrom: "01/09/2019",
      to: "01/11/2019",
      lastMonthPerfs: "32%",
    },
    {
      channel: "4C-Trading",
      subscription: "Silver pack",
      validFrom: "01/09/2019",
      to: "01/11/2019",
      lastMonthPerfs: "32%",
    },
  ];
}
</script>
