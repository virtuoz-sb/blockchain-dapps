<template>
  <div class="modal__wrap relative flex flex-col bg-dark-200 rounded-3 pt-70 pb-40 px-20">
    <div class="flex flex-col items-center overflow-y-auto custom-scrollbar md:overflow-visible">
      <h2 class="font-raleway text-xxl text-white font-bold mb-20">Conclusion!</h2>

      <div class="tutorial__img w-full mb-20">
        <img src="/img/homepage/tutorial/step-1-img.png" alt="img" class="w-full h-full object-cover" />
      </div>

      <div class="tutorial__paragraph flex flex-col items-center w-full leading-sm text-center mx-auto mb-30">
        <p class="text-base text-iceberg">
          And that concludes our 1st platform tour! We hope you have found this first introduction helpful. Don't forget to check out the
          other sections of the dash that are still under development and will be unlocked soon!
        </p>

        <p class="text-base text-iceberg mb-10 mt-5">
          If you have any questions or need assistance you can chat with Us directly using Telegram, Discord or via E-mail.
        </p>

        <div class="flex items-center">
          <p class="text-base text-iceberg mr-3 mb-5">Telegram:</p>
          <a class="text-base text-astral" href="https://t.me/Upbots">https://t.me/Upbots</a>
        </div>

        <div class="flex items-center">
          <p class="text-base text-iceberg mr-3 mb-5">Discord:</p>
          <a class="text-base text-astral" href="https://discord.gg/ZaX4FxF6">https://discord.gg/ZaX4FxF6</a>
        </div>

        <div class="flex items-center">
          <p class="text-base text-iceberg mr-3 mb-5">E-mail:</p>
          <a class="text-base text-astral" href="mailto:contact@upbots.com">contact@upbots.com</a>
        </div>

        <div class="flex items-center mt-10">
          <p class="text-base text-iceberg mr-3">UpBots - The first All-in-one DeFi and Crypto Trading Platform on the Blockchain.</p>
        </div>
      </div>

      <AppButton type="light-green" class="tutorial__btn w-full" @click="$emit('next')">Finish</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "StepEighth" })
export default class StepEighth extends Vue {}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    min-height: 540px;
    @media (max-width: 767px) {
      min-height: 580px;
    }
  }
}
.tutorial {
  &__paragraph {
    max-width: 470px;
  }
  &__img {
    max-width: 178px;
    min-height: 184px;
  }
  &__btn {
    max-width: 320px;
  }
}
</style>
