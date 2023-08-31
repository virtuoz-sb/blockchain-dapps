<template>
  <div v-if="!$breakpoint.smAndDown" class="relative h-34 bg-dark-200 rounded-3 mb-20 lg:mb-30 xl:mb-40">
    <div
      class="active-line absolute left-0 bottom-0 h-full gradient-3 rounded-l-3"
      :class="currentStep.step === data.length && 'rounded-r-3'"
      :style="lineStyle"
    >
      <transition name="fade">
        <img
          v-if="currentStep.step > 0 && currentStep.step !== 5"
          src="@/assets/images/create-new-bot/progress-bar-2.png"
          alt="progress-icon"
          class="icon absolute h-34 top-0"
        />
      </transition>
    </div>
    <div class="flex items-center w-full h-full">
      <div v-for="(item, index) in data" :key="index" class="relative flex justify-center w-1/5 z-2">
        <span class="text-white text-sm leading-xs text-center">{{ item.step }}. {{ item.label }}</span>
      </div>
    </div>
  </div>

  <div v-else class="progress-bar-mobile active-line fixed left-0 bg-blue-cl-400 h-3 w-full" :style="lineStyle" />
</template>

<script lang="ts">
const steps: { [key: string]: string } = {
  "1": "width: 20%",
  "2": "width: 40%",
  "3": "width: 60%",
  "4": "width: 80%",
  "5": "width: 100%",
};

import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "ProgressBar" })
export default class ProgressBar extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;
  @Prop({ required: true }) currentStep: any;

  /* COMPUTED */
  get lineStyle() {
    return steps[this.currentStep.step];
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
  transition-delay: 0.8s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.active-line {
  transition: width 1.5s;
  .icon {
    right: -10px;
  }

  @media (max-width: 1023px) {
    .icon {
      right: -20px;
    }
  }
}
</style>
