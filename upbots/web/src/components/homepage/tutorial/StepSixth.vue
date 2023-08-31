<template>
  <div class="modal__wrap relative flex flex-col bg-dark-200 rounded-3 pt-70 pb-40 px-20">
    <div class="flex flex-col items-center overflow-y-auto custom-scrollbar md:overflow-visible">
      <h2 class="font-raleway text-xxl text-white font-bold mb-20">Automate your strategy</h2>

      <div class="tutorial__img w-full mb-20">
        <img src="/img/homepage/tutorial/step-6-img.png" alt="img" class="w-full h-full object-cover" />
      </div>

      <p class="tutorial__paragraph w-full text-base leading-sm text-iceberg text-center mx-auto mb-30">
        Now that you have mastered the main areas of the Upbots interface, it’s time to create your own bots, with your signals and your
        strategy. Good news! We have made this really simple! You can link your strategy from tradingview and follow its performance easily.
      </p>

      <AppButton type="light-green" class="tutorial__btn w-full" @click="$emit('next')">Next</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "StepSixth" })
export default class StepSixth extends Vue {}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    min-height: 583px;
    @media (max-width: 767px) {
      min-height: 540px;
    }
  }
}

.tutorial {
  &__paragraph {
    max-width: 470px;
  }

  &__img {
    max-width: 420px;
    min-height: 263px;
  }

  &__btn {
    max-width: 320px;
  }

  @media (max-width: 767px) {
    &__img {
      min-height: 180px;
    }
  }
}
</style>
