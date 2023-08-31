<template>
  <div class="flex flex-col">
    <div class="flex flex-col mb-15 lg:mb-10">
      <div class="flex items-center mb-15 lg:mb-10">
        <div class="flex items-center mr-5">
          <span class="text-iceberg mr-5">{{ item.createdAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
          <span class="text-white">-</span>
        </div>

        <div class="flex fle-col">
          <span v-html="emojiData.rocket.code" :style="`width: ${emojiData.rocket.size}px`" class="mr-5" />
          <span class="text-red-cl-100">Position {{ item.oTrackId.ctxBot === "close" && "Closed" }}</span>
        </div>
      </div>

      <div class="flex items-center mb-15 lg:mb-10">
        <span class="text-iceberg mr-2">Profit trade:</span>
        <AppPercentageSpan :data="profiteTradeValue(item) && profiteTradeValue(item).profitPercentage" />
      </div>

      <div class="flex lg:items-center w-full lg:w-auto mb-15 lg:mb-10">
        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Perf Fees rate:</span>
          <span class="text-white mt-auto">{{ getBotPerfFees }}%</span>
        </div>

        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Perf Fees due:</span>
          <span class="text-white mt-auto"
            >{{ performanceFeeValue(item).paidAmount ? performanceFeeValue(item).paidAmount.toFixed(4) : 0 }} UBXT</span
          >
        </div>

        <div class="flex flex-col lg:flex-row items-center w-full lg:w-auto">
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">UBXT Balance:</span>
          <span class="text-white mt-auto"
            >{{ performanceFeeValue(item).remainedAmount ? performanceFeeValue(item).remainedAmount.toFixed(4) : 0 }} UBXT</span
          >
        </div>
      </div>

      <div class="flex lg:items-center w-full lg:w-auto">
        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Quantity executed:</span>
          <span class="text-white mt-auto">{{ item.oTrackId.completion.qExec }}</span>
          <!-- TODO -->
          <!-- <span class="text-white">{{ item.currency }}</span> -->
        </div>

        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Price executed:</span>
          <span class="text-white mt-auto">{{ item.oTrackId.completion.pExec }}</span>
          <!-- TODO -->
          <!-- <span class="text-white">{{ item.oTrackId.sbl.split("/")[1] }}</span> -->
        </div>

        <div class="flex flex-col lg:flex-row items-center w-full lg:w-auto">
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Total:</span>
          <span class="text-white mt-auto">{{ item.oTrackId.completion.cumulQuoteCost }}&nbsp;{{ item.oTrackId.sbl.split("-")[1] }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col mb-15 lg:mb-10">
      <div class="flex items-center mb-10">
        <span class="text-iceberg">{{ item.updatedAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
        <span class="text-white mx-5">-</span>
        <span v-html="emojiData.chart.code" :style="`width: ${emojiData.chart.size}px`" class="mr-5" />
        <span class="text-red-cl-100">{{ item.oTrackId.side }} order placed at {{ item.oTrackId.orderType }}</span>
      </div>

      <div class="flex lg:items-center w-full lg:w-auto">
        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Exchange:</span>
          <span class="text-white mt-auto">{{ item.oTrackId.exch.toUpperCase() }} </span>
        </div>

        <div class="flex flex-col lg:flex-row items-center w-full lg:w-auto">
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Quantity Asked:</span>
          <span class="text-white mt-auto">{{ item.oTrackId.qtyBaseAsked }}</span>
          <!-- TODO -->
          <!-- <span class="text-white">{{ item.currency }}</span> -->
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex items-center">
        <span class="text-iceberg">{{ item.updatedAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
        <span class="text-white mx-5">-</span>
        <span v-html="emojiData.bell.code" :style="`width: ${emojiData.bell.size}px`" class="mr-5" />
        <span class="text-red-cl-100">Sell Signal Received</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AlgoBot, BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

@Component({ name: "BotActivitySell" })
export default class BotActivitySell extends Vue {
  /* PROPS */
  @Prop({ required: true }) algoBot: AlgoBot | null = null;
  @Prop({ required: true }) botCycleData: BotPerformanceCycleDto[];
  @Prop({ required: true }) item: any;
  @Prop({ required: true }) emojiData: any;

  /* COMPUTED */
  get getBotPerfFees() {
    if (!this.algoBot) {
      return 0;
    } else {
      return this.algoBot.perfFees && this.algoBot.perfFees.percent;
    }
  }

  /* METHODS */
  profiteTradeValue(auditItem: any) {
    return this.botCycleData.find((cycleEl: any) => {
      return cycleEl.cycleSequence === auditItem.cycleSequence;
    });
  }

  performanceFeeValue(auditItem: any) {
    const item = this.profiteTradeValue(auditItem);
    if (!item || !item.performanceFee) {
      return {};
    }
    return item.performanceFee;
  }
}
</script>
