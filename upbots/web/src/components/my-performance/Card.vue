<template>
  <div class="flex flex-col bg-dark-200 rounded-3 mb-20 last:mb:0">
    <div class="flex items-center flex-shrink-0 min-h-40 border-b border-grey-cl-300 px-20 py-12">
      <span class="leading-md text-white">Manual Trading</span>
    </div>

    <div class="flex py-10 px-20 h-90">
      <div class="flex justify-center items-center">
        <span class="highlited-text mr-10 text-blue-cl-500 font-bold text-shadow-2">{{ data.amount }}</span>
        <span class="text-white text-xl">Trades</span>
      </div>

      <div class="separator h-full w-px gradient-7 mx-30" />

      <div class="flex justify-between items-center">
        <div class="highlited-text mr-48 text-blue-cl-500 font-bold text-shadow-2">+{{ data.percentage }}%</div>
        <div class="text-white mr-40">{{ data.desc }}</div>
        <AppButton type="light-green" class="min-w-100">Details</AppButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({ name: "Card" })
export default class Card extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: object[];
}
</script>

<style lang="scss" scoped>
.highlited-text {
  font-size: 28px;
}
</style>
