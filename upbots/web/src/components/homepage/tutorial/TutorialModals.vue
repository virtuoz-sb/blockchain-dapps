<template>
  <component :is="tutorialStep.componentName" @click="$emit('close')" @next="tutorialNext" />
</template>

<script lang="ts">
import { Component, Vue, Prop, PropSync } from "vue-property-decorator";

import StepFirst from "@/components/homepage/tutorial/StepFirst.vue";
import StepSecond from "@/components/homepage/tutorial/StepSecond.vue";
import StepThird from "@/components/homepage/tutorial/StepThird.vue";
import StepFourth from "@/components/homepage/tutorial/StepFourth.vue";
import StepFifth from "@/components/homepage/tutorial/StepFifth.vue";
import StepSixth from "@/components/homepage/tutorial/StepSixth.vue";
import StepSeventh from "@/components/homepage/tutorial/StepSeventh.vue";
import StepEighth from "@/components/homepage/tutorial/StepEighth.vue";

type IModalComponent = { step: number; componentName: string };

@Component({
  name: "TutorialModals",
  components: {
    StepFirst,
    StepSecond,
    StepThird,
    StepFourth,
    StepFifth,
    StepSixth,
    StepSeventh,
    StepEighth,
  },
})
export default class TutorialModals extends Vue {
  /* PROPS */
  @PropSync("value", { required: false }) modalValue: boolean;

  /* DATA */
  tutorialStep: IModalComponent = { step: 1, componentName: "StepFirst" };

  modalComponent: IModalComponent[] = [
    { step: 1, componentName: "StepFirst" },
    { step: 2, componentName: "StepSecond" },
    { step: 3, componentName: "StepThird" },
    { step: 4, componentName: "StepFourth" },
    { step: 5, componentName: "StepFifth" },
    { step: 6, componentName: "StepSixth" },
    { step: 7, componentName: "StepSeventh" },
    { step: 8, componentName: "StepEighth" },
  ];

  /* METHODS */
  tutorialNext() {
    if (this.tutorialStep.step > 7) {
      this.$emit("close");
    } else {
      this.tutorialStep = this.modalComponent.find((i: any) => {
        return i.step === this.tutorialStep.step + 1;
      });
    }
  }
}
</script>
