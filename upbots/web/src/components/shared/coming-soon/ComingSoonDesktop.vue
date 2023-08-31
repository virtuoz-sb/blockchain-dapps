<template>
  <div class="coming-soon-desktop__inner flex flex-col items-center justify-center absolute w-full h-full left-0 top-0">
    <div class="coming-soon-desktop__wrap flex flex-col items-center justify-center w-full h-full">
      <h2 class="coming-soon-desktop__title text-blue-cl-500 font-semibold text-center mb-5 md:mb-10">Coming Soon</h2>
      <template v-if="!hideTextAndButton">
        <p class="coming-soon-desktop__subtitle text-md md:text-xl leading-md text-iceberg text-center mb-40 mx-auto">
          This part is under construction. We are working hard on this page, stay tuned! It will bring a lot of new features.
        </p>
        <AppButton type="light-green" class="coming-soon-desktop__btn w-full" @click="$router.push('/')">Back to home page</AppButton>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "ComingSoonDesktop" })
export default class ComingSoonDesktop extends Vue {
  /* PROPS */
  @Prop({ type: Boolean, required: false }) hideTextAndButton: boolean;
}
</script>

<style lang="scss" scoped>
.coming-soon-desktop {
  &__inner {
    z-index: 101;
  }
  &__wrap {
    background: rgba(0, 0, 0, 0.6);
  }
  &__title {
    font-size: 85px;
  }
  &__subtitle {
    max-width: 520px;
  }
  &__btn {
    max-width: 240px;
  }
  @media (max-width: 767px) {
    &__title {
      font-size: 55px;
    }
  }
}
</style>
