<template>
  <div class="flex items-center mb-20 last:mb-0">
    <div class="my-trades__col-1 flex w-full md:ml-20 pl-20 pr-10">
      <span v-if="data && data.pair" class="text-grey-cl-920 text-xs leading-xs">{{ data.pair }}</span>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>

    <div class="my-trades__col-2 flex items-center w-full pr-10">
      <div v-if="data && data.status" class="flex items-center">
        <span class="cicle w-8 h-8 rounded-full mr-10" :class="statusStyle" />
        <span class="text-grey-cl-920 text-xs leading-xs">{{ data.status }}</span>
      </div>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>

    <div class="my-trades__col-3 flex w-full pr-10">
      <div v-if="data && data.side" class="flex items-center">
        <span class="icon-arrow-expand" :class="sideStyle" />
        <span class="text-grey-cl-920 text-xs leading-xs ml-10">{{ data.side }}</span>
      </div>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>

    <div class="my-trades__col-4 flex w-full pr-10">
      <span v-if="data && data.entryPrice" class="text-grey-cl-920 text-xs leading-xs">{{ data.entryPrice }}</span>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>

    <div class="my-trades__col-5 flex w-full pr-10">
      <span v-if="data && data.closePrice" class="text-grey-cl-920 text-xs leading-xs">{{ data.closePrice }}</span>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>

    <div class="my-trades__col-6 flex w-full pr-10">
      <span v-if="data && data.profit" class="text-xs leading-xs" :class="profitStyle">{{ profit }}%</span>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>

    <div class="my-trades__col-7 flex w-full pr-10">
      <span v-if="data && data.signal" class="text-grey-cl-920 text-xs leading-xs">{{ data.signal }}</span>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>

    <div class="my-trades__col-8 flex w-full md:mr-20 pr-20">
      <span v-if="data && data.completed" class="text-grey-cl-920 text-xs leading-xs">{{ data.completed }}</span>
      <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "MyTradesItem" })
export default class MyTradesItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;

  /* COMPUTED */
  get statusStyle() {
    return this.data.status === "Active" ? "green" : "grey";
  }

  get sideStyle() {
    return this.data.side === "Long" ? "green" : "red";
  }

  get profitStyle() {
    return this.data.profit < 0 ? "text-green-cl-100 text-shadow-2" : "text-red-cl-100 text-shadow-6";
  }

  get profit() {
    return this.data.profit >= 0 ? `+${this.data.profit}` : this.data.profit;
  }
}
</script>

<style lang="scss" scoped>
.my-trades {
  &__col-1 {
    width: 13%;
    min-width: 109px;
  }
  &__col-2 {
    width: 11.1%;
    min-width: 92px;
  }
  &__col-3 {
    width: 10.6%;
    min-width: 88px;
  }
  &__col-4 {
    width: 14.1%;
    min-width: 117px;
  }
  &__col-5 {
    width: 14.2%;
    min-width: 118px;
  }
  &__col-6 {
    width: 11.2%;
    min-width: 93px;
  }
  &__col-7 {
    width: 13.2%;
    min-width: 110px;
  }
  &__col-8 {
    width: 13%;
    min-width: 109px;
  }
}

.cicle {
  &.grey {
    @apply bg-grey-cl-400;
  }
  &.green {
    @apply bg-green-cl-100 shadow-70;
  }
}

.icon-arrow-expand {
  font-size: 6px;
  &.red {
    @apply text-red-cl-100;
    background-blend-mode: normal, overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(255, 49, 34, 0.5);
  }
  &.green {
    @apply text-green-cl-100 transform rotate-180;
    background-blend-mode: overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(89, 167, 51, 0.5);
  }
}
</style>
