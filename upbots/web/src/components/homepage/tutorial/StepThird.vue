<template>
  <div class="modal__wrap relative flex flex-col bg-dark-200 rounded-3 pt-70 pb-40 px-20">
    <div class="flex flex-col items-center overflow-y-auto custom-scrollbar md:overflow-visible">
      <h2 class="font-raleway text-xxl text-white-lilac text-center mb-20">All your Balances in one place</h2>

      <div class="tutorial__img w-full mb-20">
        <img src="/img/homepage/tutorial/step-3-img.png" alt="img" class="w-full h-full object-cover" />
      </div>

      <p class="tutorial__paragraph w-full text-base leading-sm text-iceberg text-center mx-auto mb-30">
        Upbots will connect you to all the markets from digital (Crypto/DeFi) to traditional (Forex, Commodities, etc). To start trading,
        you will need to add an account to Upbots. You can easily do that from the homepage, the portfolio monitoring section or the API key
        management section in the top menu
      </p>

      <AppButton type="light-green" class="tutorial__btn w-full" @click="$emit('next')">Next</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "StepThird" })
export default class StepThird extends Vue {}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    min-height: 576px;
  }
}

.tutorial {
  &__paragraph {
    max-width: 470px;
  }

  &__img {
    max-width: 410px;
    min-height: 256px;
  }

  &__btn {
    max-width: 320px;
  }

  @media (max-width: 767px) {
    &__img {
      min-height: 178px;
    }
  }
}
</style>
