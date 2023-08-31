<template>
  <div class="modal__wrap relative flex flex-col bg-dark-200 rounded-3 pt-70 pb-40 px-16 md:px-20">
    <div class="flex flex-col items-center overflow-y-auto custom-scrollbar md:overflow-visible">
      <h2 class="font-raleway text-xxl text-white-lilac text-center mb-20">How is your wealth growing?</h2>

      <div class="tutorial__img w-full mb-20">
        <img src="/img/homepage/tutorial/step-4-img.png" alt="img" class="w-full h-full object-cover" />
      </div>

      <p class="tutorial__paragraph w-full text-base leading-xs text-iceberg text-center mx-auto mb-30">
        Here you can track the evolution of all your assets to easily keep an eye on the big picture of your trading over time. But what
        about your historical trading situation? Our tool will enable you to upload your past situation too so your timeline and portfolio
        evolution is complete!
      </p>

      <AppButton type="light-green" class="tutorial__btn w-full" @click="$emit('next')">Next</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "StepFourth" })
export default class StepFourth extends Vue {}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    min-height: 614px;
    @media (max-width: 767px) {
      min-height: 537px;
    }
  }
}

.tutorial {
  &__paragraph {
    max-width: 480px;
  }

  &__img {
    max-width: 445px;
    min-height: 292px;
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
