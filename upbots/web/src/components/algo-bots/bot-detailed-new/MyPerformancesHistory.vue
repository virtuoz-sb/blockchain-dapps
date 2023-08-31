<template>
  <div class="flex flex-col justify-between flex-grow pt-20 pb-20">
    <!-- BOT HISTORY -->
    <div class="flex flex-col mt-auto">
      <h2 v-if="!hideTitle" class="text-iceberg leading-xs mb-24 px-20">My Trade history</h2>
      <UserHistory :bot-cycle-data="getBotSubscriptionCycles" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

const algobots = namespace("algobotsModule");

import UserHistory from "@/components/algo-bots/bot-detailed-new/user-history-table/UserHistory.vue";

@Component({ name: "MyPerformancesHistory", components: { UserHistory } })
export default class MyPerformancesHistory extends Vue {
  @Prop({ type: Boolean, default: false }) hideTitle: boolean;
  /* VUEX */
  @algobots.Getter getBotSubscriptionCycles: BotPerformanceCycleDto[];
}
</script>
