<template>
  <div class="active-channel__row grid grid-cols-5 shadow-110 rounded-3 mb-10">
    <!-- CHANNEL -->
    <div class="flex py-25">
      <div class="active-channel__col-text flex flex-col items-center justify-center w-full">
        <span class="text-white leading-xs text-xl mb-10">Channel</span>
        <span class="text-blue-cl-500 text-shadow-3 text-xl leading-xs font-bold">{{ data.channel }}</span>
      </div>
      <div class="gradient-7 w-px" />
    </div>

    <!-- SUBSCRIPTION -->
    <div class="flex py-25">
      <div class="active-channel__col-text flex flex-col items-center justify-center w-full">
        <span class="text-white leading-xs text-xl mb-10">Subscription</span>
        <span class="text-blue-cl-500 text-shadow-3 text-xl leading-xs font-bold">{{ data.subscription }}</span>
      </div>
      <div class="gradient-7 w-px" />
    </div>

    <!-- VALID FORM -->
    <div class="flex py-25">
      <div class="active-channel__col-text flex flex-col items-center justify-center w-full">
        <span class="text-white leading-xs text-xl mb-10">Valid from</span>
        <span class="text-blue-cl-500 text-shadow-3 text-xl leading-xs font-bold">{{ data.validFrom }}</span>
      </div>
      <div class="gradient-7 w-px" />
    </div>

    <!-- TO -->
    <div class="flex py-25">
      <div class="active-channel__col-text flex flex-col items-center justify-center w-full">
        <span class="text-white leading-xs text-xl mb-10">To:</span>
        <span class="text-blue-cl-500 text-shadow-3 text-xl leading-xs font-bold">{{ data.to }}</span>
      </div>
      <div class="gradient-7 w-px" />
    </div>

    <!-- LAST MONTH PERFS -->
    <div class="flex py-25">
      <div class="active-channel__col-text flex flex-col items-center justify-center w-full">
        <span class="text-white leading-xs text-xl mb-10">Last month perfs</span>
        <span class="text-blue-cl-500 text-shadow-3 text-xl leading-xs font-bold">{{ data.lastMonthPerfs }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "ActiveChannelRow" })
export default class ActiveChannelRow extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;
}
</script>

<style lang="scss" scoped>
.active-channel {
  &__row {
    background: linear-gradient(180deg, rgba(96, 102, 117, 0.15) 0%, rgba(96, 102, 117, 0) 100%), #151619;
  }
  &__col-text {
    min-height: 72px;
  }
}
</style>
