<template>
  <div class="flex flex-col">
    <div class="flex flex-col mb-15 lg:mb-10">
      <div class="flex items-center mb-15 lg:mb-10">
        <p class="flex items-center">
          <span class="text-iceberg">{{ item.createdAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
          <span class="text-white mx-5">-</span>
        </p>
        <p class="flex items-center">
          <span v-html="emojiData.rocket.code" :style="`width: ${emojiData.rocket.size}px`" class="mr-5" />
          <span class="text-green-cl-100">Position {{ item.oTrackId.ctxBot === "open" && "Opened" }}</span>
        </p>
      </div>

      <div class="flex lg:items-center w-full lg:w-auto">
        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Quantity executed:</span>
          <span class="text-white mt-auto">{{ item.oTrackId.completion.qExec }}</span>
          <!-- TODO -->
          <!-- <span class="text-white">{{ item.oTrackId.sbl.split("/")[0] }}</span> -->
        </div>

        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Price executed:</span>
          <span class="text-white mt-auto">{{ item.oTrackId.completion.pExec }} </span>
          <!-- TODO -->
          <!-- <span class="text-white">{{ item.currency }}</span> -->
        </div>

        <div class="flex flex-col lg:flex-row items-center w-full lg:w-auto">
          <span class="text-iceberg text-center lg:text-left lg:mr-2 mb-2 lg:mb-0">Total:</span>
          <span class="text-white mt-auto lg:mt-0">
            {{ item.oTrackId.completion.cumulQuoteCost }}&nbsp;{{ item.oTrackId.sbl.split("-")[1] }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col mb-15 lg:mb-10">
      <div class="flex items-center mb-15 lg:mb-10">
        <span class="text-iceberg">{{ item.updatedAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
        <span class="text-white mx-5">-</span>
        <span v-html="emojiData.chart.code" :style="`width: ${emojiData.chart.size}px`" class="mr-5" />
        <span class="text-green-cl-100">{{ item.oTrackId.side }} order placed at {{ item.oTrackId.orderType }}</span>
      </div>

      <div class="flex lg:items-center w-full lg:w-auto">
        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg lg:text-left lg:mr-2 mb-2 lg:mb-0">Exchange:</span>
          <span class="text-white">{{ item.oTrackId.exch.toUpperCase() }} </span>
        </div>

        <div
          class="flex flex-col lg:flex-row items-center w-full lg:w-auto pr-5 lg:pr-10 mr-5 lg:mr-10 border-r border-solid border-grey-cl-920"
        >
          <span class="text-iceberg lg:text-left lg:mr-2 mb-2 lg:mb-0">Pair:</span>
          <span class="text-white">{{ item.oTrackId.sbl }}</span>
        </div>

        <div class="flex flex-col lg:flex-row items-center w-full lg:w-auto">
          <span class="text-iceberg lg:text-left lg:mr-2 mb-2 lg:mb-0">Quantity asked:</span>
          <span class="text-white">{{ item.oTrackId.completion.qExec }} </span>
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
        <span class="text-green-cl-100">Buy Signal Received</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { BotPerformanceCycleDto } from "@/store/algo-bots/types/algo-bots.payload";

@Component({ name: "BotActivityBuy" })
export default class BotActivityBuy extends Vue {
  /* PROPS */
  @Prop({ required: true }) botCycleData: BotPerformanceCycleDto[];
  @Prop({ required: true }) item: any;
  @Prop({ required: true }) emojiData: any;

  /* METHODS */
  profiteTradeValue(auditItem: any) {
    return this.botCycleData.find((cycleEl: any) => {
      return cycleEl.cycleSequence === auditItem.cycleSequence;
    });
  }
}
</script>
