<template>
  <div class="modal__wrap relative flex flex-col pt-70 pb-40 px-20">
    <div class="flex flex-col items-center overflow-y-auto custom-scrollbar md:overflow-visible">
      <h2 class="font-raleway text-xxl text-white-lilac text-center mb-20">Welcome to Upbots !</h2>

      <div class="tutorial__img w-full mb-20">
        <img src="/img/homepage/tutorial/step-1-img.png" alt="img" class="w-full h-full object-cover" />
      </div>

      <p class="tutorial__paragraph w-full text-base leading-sm text-iceberg text-center mx-auto mb-15 md:mb-30">
        Hey captain, we are delighted to welcome you on Upbots and to unveil a preview of its interface.
      </p>

      <AppButton type="light-green" class="tutorial__btn w-full" @click="$emit('next')">Start The Tour</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "StepFirst" })
export default class StepFirst extends Vue {}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    min-height: 472px;
  }
}

.tutorial {
  &__paragraph {
    max-width: 450px;
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
