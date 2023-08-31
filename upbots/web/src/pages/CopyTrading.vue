<template>
  <GeneralLayout title="Copy Trading">
    <div v-if="isComingSoon" class="flex w-full h-full">
      <div
        class="copytrading flex flex-col w-full h-full relative rounded-3"
        :style="`background: url(${background}) no-repeat center center / cover`"
      >
        <div class="flex flex-col items-center justify-center w-full h-full relative z-2 p-25">
          <h2 class="copytrading__title text-blue-cl-500 font-semibold text-center mb-5 md:mb-10">Coming Soon</h2>
          <p class="copytrading__subtitle text-md md:text-xl leading-md text-white text-center mb-40 mx-auto">
            This part is under construction. We are working hard on this page, stay tuned! It will bring a lot of new features.
          </p>
          <div class="flex w-full">
            <ValidationObserver ref="form" tag="div" class="w-full">
              <form @submit.prevent="comingSoonSubmit" class="flex flex-col sm:flex-row items-center justify-center w-full">
                <AppInput
                  v-model="email"
                  type="text"
                  rules="email|required"
                  placeholder="Enter your email address"
                  class="copytrading__input w-full sm:mr-10 mb-15 sm:mb-0"
                  custom-class="h-48"
                />
                <AppButton type="light-green" class="copytrading__btn w-full">Register To Be a Copy Trader</AppButton>
              </form>
            </ValidationObserver>
          </div>
        </div>

        <!-- MODAL -->
        <AppModal v-model="isOpenModal" persistent max-width="500px">
          <div class="relative flex flex-col pt-60 pb-40 px-20">
            <div class="flex flex-col items-center">
              <h2 class="text-xxl text-white text-center mb-10 md:mb-20">Thank you for your interest</h2>
              <p class="text-grey-cl-100 leading-xs text-center mb-50 md:mb-35">We will contact you soon with more information</p>
              <AppButton type="light-green" class="w-full" @click="$router.push('/')">Back to Home</AppButton>
            </div>
          </div>
        </AppModal>
      </div>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
const backgroundDesktop = "/img/coming-soon/coming-soon-desktop.jpg";
const backgroundMobile = "/img/coming-soon/coming-soon-mobile.jpg";

// import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Action, Getter, State, namespace } from "vuex-class";
import { ComingSoon } from "@/core/mixins/coming-soon";

const fromAuth = namespace("authModule"); // matches the module name

export interface ComingSoonInterface {
  _id: string;
  email: string;
  feature: string;
  logtime: string;
}

import GeneralLayout from "@/views/GeneralLayout.vue";

@Component({ name: "CopyTrading", components: { GeneralLayout }, mixins: [ComingSoon] })
export default class CopyTrading extends Vue {
  /* DATA */
  email: string = "";
  isOpenModal: boolean = false;
  trackedComingSoon: ComingSoonInterface | null = null;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* COMPUTED */
  get background() {
    if (!this.$breakpoint.smAndDown) {
      return backgroundDesktop;
    } else {
      return backgroundMobile;
    }
  }

  /* METHODS */
  async sendMail(): Promise<void> {
    let url = "/api/marketing";

    const trackComingSoon: Partial<ComingSoonInterface> = {
      email: this.email, //email entered from the user
      feature: "COMINGSOONCOPYTRADING",
      logtime: new Date().toLocaleString(),
    };

    const response = await this.$http.post(url, trackComingSoon);
    this.trackedComingSoon = response.data;
  }

  async comingSoonSubmit(): Promise<void> {
    try {
      const validated = await this.$refs.form.validate();
      if (validated) {
        await this.sendMail();
        this.isOpenModal = true;
      }
    } catch (e) {
      this.$notify({ text: "Sorry, operation failed", type: "error" });
    }
  }
}
</script>

<style lang="scss" scoped>
.copytrading {
  &:after {
    content: "";
    @apply absolute left-0 top-0 w-full h-full;
    background: rgba(0, 0, 0, 0.8);
  }
  &__back-link {
    top: 50px;
    left: 70px;
  }
  &__title {
    font-size: 85px;
  }
  &__subtitle {
    max-width: 520px;
  }
  &__input {
    max-width: 420px;
  }
  &__modal-btn {
    max-width: 240px;
  }
  @media (min-width: 640px) {
    &__btn {
      max-width: 240px;
    }
  }
  @media (max-width: 767px) {
    &__title {
      font-size: 55px;
    }
  }
  @media (max-width: 639px) {
    &__back-link {
      top: 25px;
      left: 25px;
    }
    &__input {
      @apply max-w-full;
    }
  }
}
</style>
