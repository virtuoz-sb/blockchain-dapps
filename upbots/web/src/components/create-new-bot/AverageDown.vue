<template>
  <div class="flex flex-col flex-shrink-0 mb-30 md:mb-0">
    <!-- TITLE -->
    <!-- <h2 class="text-sm leading-xs text-grey-cl-100 mb-30">
      Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based
      price methods while optimizing your automated trading strategies.
    </h2> -->

    <!-- ROW -->
    <div class="flex md:items-start mb-35 md:mb-25">
      <AppTag type="blue-filled" class="w-full md:w-auto text-center py-7 px-25">Recommended for experts</AppTag>
    </div>

    <!-- R O W -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:flex-wrap mb-20 md:mb-40 xl:mb-30">
      <p class="flex-shrink-0 text-grey-cl-100 text-sm leading-xs mb-15 lg:mb-0 md:mr-15 xl:mr-20">Number of levels</p>
      <div class="grid grid-cols-5 row-gap-20 col-gap-35 lg:flex lg:items-center">
        <div
          v-for="item in numberLevelList"
          :key="item.value"
          class="flex items-center justify-center w-32 h-32 border-solid rounded-full mr-10 xl:mr-15 last:mr-0 cursor-pointer"
          :class="[item.value === currentNumberLevel.value ? 'shadow-30 border-blue-cl-400 border-2' : 'border border-grey-cl-400']"
          @click="levelSteps(item)"
        >
          <span class="text-grey-cl-200 text-sm leading-1">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- ROW -->
    <div class="flex grid grid-cols-1 md:grid-cols-2 row-gap-20 md:row-gap-30 md:col-gap-30 md:pb-50">
      <!-- COLUMN 1 -->
      <div class="flex flex-col md:max-w-240 w-full" v-for="(item, index) in stepData" :key="index">
        <div class="flex items-center mb-15">
          <span class="leading-md text-white mr-15">Level {{ index + 1 }}</span>
          <span v-if="index < 1" class="link__text text-blue-cl-100 leading-1 cursor-pointer" @click="applyToAll">Apply to all</span>
        </div>
        <div class="flex flex-col">
          <div class="flex flex-col mb-20">
            <p class="text-grey-cl-100 text-sm leading-xs mb-8">% below price</p>
            <AppInput v-model="item.belowPrice" type="text" size="sm" />
          </div>
          <div class="flex flex-col">
            <p class="text-grey-cl-100 text-sm leading-xs mb-8">Size position regarding initial order (%)</p>
            <AppInput v-model="item.sizePosition" type="text" size="sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "AverageDown" })
export default class AverageDown extends Vue {
  /* DATA */
  stepName: string = "averageDown";
  currentNumberLevel: any = { value: 2, label: "2" };

  stepData: any[] = [
    { belowPrice: "", sizePosition: "" },
    { belowPrice: "", sizePosition: "" },
  ];

  numberLevelList: any = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: 10, label: "10" },
  ];

  /* COMPUTED */
  get formatedData() {
    let count = 1;
    return this.stepData.map((i: any) => {
      return { lvl: `lvl${count++}`, ...i };
    });
  }

  /* METHODS */
  levelSteps(item: any) {
    const index = item.value; // item index
    if (index === this.currentNumberLevel.value) return;
    const diff = this.currentNumberLevel.value - index; // difference (number)
    if (diff < 0) {
      // created array of the object for increase stepData list
      const add = Array.from({ length: Math.abs(diff) }, () => {
        return { belowPrice: "", sizePosition: "" };
      });
      this.stepData.push(...add);
    } else {
      this.stepData.splice(index, diff);
    }

    this.currentNumberLevel = item;
  }

  applyToAll() {
    const { belowPrice, sizePosition } = this.stepData[0];
    this.stepData = this.stepData.map((i: any) => ({ belowPrice, sizePosition }));
  }
}
</script>
