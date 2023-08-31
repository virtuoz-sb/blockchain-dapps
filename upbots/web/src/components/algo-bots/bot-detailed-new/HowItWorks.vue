<template>
  <div class="flex flex-col flex-grow md:pt-12 px-20 md:pb-20 overflow-y-auto custom-scrollbar">
    <p class="text-grey-cl-920 leading-xs mb-20 md:mb-15">{{ algoBot && algoBot.description }}</p>

    <ul class="flex flex-col">
      <li class="point-gradient text-iceberg text-sm leadning-xs mb-8 last:mb-0">
        Pair: {{ algoBot && algoBot.base }}/{{ algoBot && algoBot.quote }}
      </li>

      <li class="point-gradient text-iceberg text-sm leadning-xs mb-8 last:mb-0">
        Maximum capital: {{ algoBot && algoBot.allocatedMaxAmount }} {{ algoBot && algoBot.allocatedCurrency }}
      </li>

      <li class="point-gradient text-iceberg text-sm leadning-xs mb-8 last:mb-0">
        Frequency of trade: {{ algoBot && algoBot.avgtrades }} per month
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AlgoBot } from "../../../store/algo-bots/types/algo-bots.payload";
import { namespace } from "vuex-class";

const algobots = namespace("algobotsModule");

@Component({ name: "HowItWorks" })
export default class HowItWorks extends Vue {
  /* VUEX */
  @algobots.Getter getAlgoBots: AlgoBot[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;

  /* DATA */
  algoBot: AlgoBot | null = null;

  /* HOOKS */
  async mounted() {
    await this.fetchAlgoBotsAction();
    if (this.$route.params.id) {
      /* GET THE SELECTED BOT */
      this.algoBot = this.getAlgoBotById(this.$route.params.id);
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .point-gradient {
  &:before {
    top: 6px;
    transform: none;
  }
}
</style>
