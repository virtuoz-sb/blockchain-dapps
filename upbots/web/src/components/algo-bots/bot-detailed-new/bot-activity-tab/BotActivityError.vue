<template>
  <div class="flex flex-col">
    <template v-if="item.oTrackId && !item.oTrackId.completed">
      <div class="flex items-center mb-10">
        <div class="flex items-center mr-5">
          <span class="text-iceberg mr-5">{{ item.errorAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
          <span class="text-white">-</span>
        </div>

        <div class="flex items-center">
          <span v-html="emojiData.error.code" :style="`width: ${emojiData.error.size}px`" />
          <span class="text-red-cl-100 ml-5">Error : Exchange issue</span>
        </div>
      </div>

      <div class="flex">
        <span class="text-red-orange">
          The bot was not able to pass the order, could be due to exchange connexion issue or api settings
        </span>
      </div>
    </template>

    <template v-else-if="item.errorReason === 'minCost' || item.errorReason === 'minEmount'">
      <div class="flex items-center mb-10">
        <div class="flex items-center mr-5">
          <span class="text-iceberg mr-5">{{ item.errorAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
          <span class="text-white">-</span>
        </div>

        <div class="flex items-center">
          <span v-html="emojiData.error.code" :style="`width: ${emojiData.error.size}px`" />
          <span class="text-red-cl-100 ml-5">Error: Not enough capital to trade</span>
        </div>
      </div>

      <div class="flex">
        <span class="text-red-orange">Capital available: {{ item.balance }} ({{ item.currency }})</span>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center mb-10">
        <div class="flex items-center mr-5">
          <span class="text-iceberg mr-5">{{ item.errorAt | dateLocal("YYYY-MM-DD HH:mm:ss") }}</span>
          <span class="text-white">-</span>
        </div>

        <div class="flex items-center">
          <span v-html="emojiData.error.code" :style="`width: ${emojiData.error.size}px`" />
          <span class="text-red-cl-100 ml-5">Error : API code {{ item.errorReason }}</span>
        </div>
      </div>

      <div class="flex">
        <span class="text-red-orange">Wrong API - create a new one</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "BotActivitySell" })
export default class BotActivitySell extends Vue {
  /* PROPS */
  @Prop({ required: true }) item: any;
  @Prop({ required: true }) emojiData: any;
}
</script>
