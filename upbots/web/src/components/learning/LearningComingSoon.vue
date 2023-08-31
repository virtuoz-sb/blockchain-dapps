<template>
  <div class="learning__coming-soon-inner flex flex-col items-center justify-center absolute w-full h-full left-0 top-0 p-16">
    <div class="learning__coming-soon-wrap flex flex-col items-center justify-center w-full h-full">
      <h2 class="learning__coming-soon-title text-blue-cl-500 font-semibold text-center mb-5 md:mb-10">Coming Soon</h2>
      <p class="learning__coming-soon-subtitle text-md md:text-xl leading-md text-white text-center mb-40 mx-auto">
        This part is under construction. We are working hard on this page, stay tuned! It will bring a lot of new features.
      </p>
      <AppButton type="light-green" class="learning__coming-soon-btn w-full" @click="$router.push('/')">Back to home page</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "LearningComingSoon" })
export default class LearningComingSoon extends Vue {}
</script>

<style lang="scss" scoped>
.learning {
  &__coming-soon-inner {
    z-index: 101;
  }
  &__coming-soon-wrap {
    background: rgba(0, 0, 0, 0.6);
  }
  &__coming-soon-title {
    font-size: 85px;
  }
  &__coming-soon-subtitle {
    max-width: 520px;
  }
  &__coming-soon-btn {
    max-width: 240px;
  }
  @media (max-width: 767px) {
    &__coming-soon-title {
      font-size: 55px;
    }
  }
}
</style>
