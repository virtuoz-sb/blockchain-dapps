<template>
  <div class="modal__wrap relative flex flex-col bg-dark-200 rounded-3 pt-70 pb-40 px-20">
    <div class="flex flex-col items-center overflow-y-auto custom-scrollbar md:overflow-visible">
      <h2 class="font-raleway text-xxl text-white-lilac font-bold text-center mb-20">A complete trading room</h2>

      <div class="tutorial__img w-full mb-20">
        <img src="/img/homepage/tutorial/step-5-img.png" alt="img" class="w-full h-full object-cover" />
      </div>

      <p class="tutorial__paragraph w-full text-base leading-sm text-iceberg text-center mx-auto mb-30">
        Once you have connected your account, you can enter your trading room and start a manual trade. Two modes are available. Simple
        Trade, to quickly buy and sell, and Advanced Trade, with a lot exceptional features like the multiple entries, targets and stops,
        safeties, trailing profits and stops, a risk management tool and much more to come.
      </p>

      <AppButton type="light-green" class="tutorial__btn w-full" @click="$emit('next')">Next</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "StepFifth" })
export default class StepFifth extends Vue {}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    min-height: 608px;
    @media (max-width: 767px) {
      min-height: 570px;
    }
  }
}

.tutorial {
  &__paragraph {
    max-width: 475px;
  }

  &__img {
    max-width: 430px;
    min-height: 270px;
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
