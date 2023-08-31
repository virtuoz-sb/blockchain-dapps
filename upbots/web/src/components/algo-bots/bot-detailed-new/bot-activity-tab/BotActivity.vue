<template>
  <div class="flex flex-col flex-grow">
    <div
      v-for="(item, index) in botSubscriptionAudits"
      :key="index"
      class="border-b border-solid last:border-none border-grey-cl-920 pb-20 last:pb-0 mb-20 last:mb-0"
    >
      <template v-if="item.oTrackId && item.oTrackId.completed">
        <template v-if="item.oTrackId.side === 'Sell'">
          <BotActivitySell :item="item" :bot-cycle-data="botCycleData" :emoji-data="emojiData" :algoBot="algoBot" />
        </template>

        <template v-if="item.oTrackId.side === 'Buy'">
          <BotActivityBuy :item="item" :bot-cycle-data="botCycleData" :emoji-data="emojiData" />
        </template>
      </template>

      <template v-else>
        <BotActivityError :item="item" :emoji-data="emojiData" />
      </template>
    </div>

    <div v-if="status === 'active'" class="text-iceberg border-b border-solid last:border-none border-grey-cl-920">
      <span class="text-iceberg">{{ algoBotSubscription.createdAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
      <span class="text-white mx-5">-</span>
      <span v-html="emojiData.bot.code" :style="`width: ${emojiData.bot.size}px`" class="mr-5" />
      <span>Bot activated</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { AlgoBot, AlgoBotSubscription, BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

const algobots = namespace("algobotsModule");

import BotActivitySell from "@/components/algo-bots/bot-detailed-new/bot-activity-tab/BotActivitySell.vue";
import BotActivityBuy from "@/components/algo-bots/bot-detailed-new/bot-activity-tab/BotActivityBuy.vue";
import BotActivityError from "@/components/algo-bots/bot-detailed-new/bot-activity-tab/BotActivityError.vue";

@Component({ name: "BotActivity", components: { BotActivitySell, BotActivityBuy, BotActivityError } })
export default class BotActivity extends Vue {
  /* VUEX */
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Getter getAlgoBotById: any;

  /* PROPS */
  @Prop({ required: true }) botSubscriptionAudits: any[];
  @Prop({ required: true }) botCycleData: BotPerformanceCycleDto[];
  @Prop({ required: true }) algoBotSubscription: any;

  /* DATA */
  algoBot: AlgoBot | null = null;
  status: "active" | "inactive" | "paused" = "inactive";
  emojiData: any = {
    rocket: {
      code: "&#128640",
      size: "18",
    },

    chart: {
      code: "&#128200",
      size: "18",
    },

    bell: {
      code: "&#128276",
      size: "18",
    },

    bot: {
      code: "&#x1F916;",
      size: "18",
    },

    error: {
      code: "&#9888;&#65039;",
      size: "18",
    },
  };

  mounted() {
    this.init();
  }

  /* METHODS */
  init() {
    if (this.$route.params.id) {
      this.algoBot = this.getAlgoBotById(this.$route.params.id);
      this.setStatus();
    }
  }

  botSubscription(auditItem: any) {
    return this.botCycleData.find((cycleEl: any) => {
      return cycleEl.cycleSequence === auditItem.cycleSequence;
    });
  }

  setStatus() {
    const activeBots = this.getBotsSubcriptions.filter((sub) => sub.enabled).map((sub) => sub.botId);
    const pausedBots = this.getBotsSubcriptions.filter((sub) => !sub.enabled).map((sub) => sub.botId);
    const botId = this.algoBot.id;

    if (activeBots.includes(botId)) {
      this.status = "active";
    } else if (pausedBots.includes(botId)) {
      this.status = "paused";
    } else {
      this.status = "inactive";
    }
  }
}
</script>
