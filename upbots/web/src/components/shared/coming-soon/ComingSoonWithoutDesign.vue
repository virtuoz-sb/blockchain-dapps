<template>
  <div class="flex w-full h-full">
    <div class="coming-soon flex flex-col w-full h-full relative rounded-3">
      <ImageItem
        :src="background"
        :alt="'coming-soon'"
        img-class="w-full h-full object-cover"
        class="absolute left-0 top-0 w-full h-full"
      />
      <div class="flex flex-col items-center justify-center w-full h-full relative z-2 p-25">
        <h2 class="coming-soon__title text-blue-cl-500 font-semibold text-center mb-5 md:mb-10">Coming Soon</h2>
        <p class="coming-soon__subtitle text-md md:text-xl leading-md text-white text-center mb-40 mx-auto">
          This part is under construction. We are working hard on this page, stay tuned! It will bring a lot of new features.
        </p>
        <AppButton type="light-green" class="coming-soon__btn w-full" @click="$router.push('/')">Back to home page</AppButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import PageLayout from "@/views/PageLayout.vue";

@Component({ name: "ComingSoonWithoutDesign", components: { PageLayout } })
export default class ComingSoonWithoutDesign extends Vue {
  /* DATA */
  backgroundDesktop: any = "/img/coming-soon/coming-soon-desktop.jpg";
  backgroundMobile: any = "/img/coming-soon/coming-soon-mobile.jpg";

  /* COMPUTED */
  get background() {
    if (!this.$breakpoint.smAndDown) {
      return this.backgroundDesktop;
    } else {
      return this.backgroundMobile;
    }
  }
}
</script>

<style lang="scss" scoped>
.coming-soon {
  &:after {
    content: "";
    @apply absolute left-0 top-0 w-full h-full;
    background: rgba(0, 0, 0, 0.8);
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
