<template>
  <div class="flex flex-col flex-grow flex-shrink-0 p-30">
    <div class="flex items-center mb-20">
      <div class="flex items-center justify-center relative h-30 w-30 bg-abyssal-anchorfish-blue rounded-full">
        <span class="icon-ubxt-info text-astral" />
      </div>
      <h3 class="text-lg text-xl font-bold text-white leading-xs ml-16">Performance Fee system</h3>
    </div>

    <p class="text-md text-white leading-xs mb-20">
      Bots rental is based on your earnings only. As long as you are not in profit, no fees will be charged.
    </p>

    <h4 class="text-xl font-bold text-white text-center mb-20">Suggested UBXT allocation</h4>

    <div class="flex flex-col w-full">
      <div class="grid grid-cols-2 items-center w-full mb-15">
        <div class="text-white text-md leading-xs">For 1 week</div>
        <div class="flex items-center justify-center w-120 bg-ore-blish-black py-4 px-8">
          <span class="text-white text-md leading-xs">{{
            ubxtsuggestedValue > 0 && getEnablePerfFees ? ubxtsuggestedValue / 4 : "N/A"
          }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 items-center w-full mb-15">
        <div class="text-white text-md leading-xs">For 1 month</div>
        <div class="flex items-center justify-center w-120 bg-ore-blish-black py-4 px-8">
          <span class="text-white text-md leading-xs">{{ ubxtsuggestedValue > 0 && getEnablePerfFees ? ubxtsuggestedValue : "N/A" }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 items-center w-full">
        <div class="text-white text-md leading-xs">For 12 months</div>
        <div class="flex items-center justify-center w-120 bg-ore-blish-black py-4 px-8">
          <span class="text-white text-md leading-xs">{{
            ubxtsuggestedValue > 0 && getEnablePerfFees ? ubxtsuggestedValue * 12 : "N/A"
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component({ name: "BotDetailedInactivePerfFeeCard" })
export default class BotDetailedInactivePerfFeeCard extends Vue {
  /* VUEX */
  @Getter getEnablePerfFees: boolean;

  /* PROPS */
  @Prop({ required: true }) algoBot: any;
  @Prop({ required: true }) baseLimit: number;

  /* DATA */
  baseAvailable: number = 0.0;

  /* COMPUTED */
  get ubxtsuggestedValue() {
    if (!this.algoBot) return 0;
    const perfMonth6 = this.algoBot.perfSnapshots.month6 || 0;
    return Math.trunc(this.baseLimit * (perfMonth6 / 6 / 100) * (this.getBotPerfFees / 100) * 1.2);
  }

  get getBotPerfFees() {
    if (!this.algoBot) {
      return 0;
    }
    if (this.algoBot.botRef === "AVAXUSDT1" || this.algoBot.botRef === "TOMOLO1") {
      return 0;
    }
    return 20;
  }
}
</script>
