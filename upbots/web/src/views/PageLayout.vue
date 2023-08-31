<template>
  <div
    class="flex flex-col w-full pt-0 md:pt-30 lg:pt-30"
    :class="overflow ? 'px-0 md:pl-24 md:pr-20 lg:pr-24' : 'pb-60 md:pb-20 lg:pb-40 px-0 md:pr-20 md:pl-40 lg:pr-30 xl:pr-40'"
  >
    <!-- P A G E   L O A D I N G   I N D I C A T O R -->
    <div v-if="isLoading" class="page-preloader__inner fixed top-0 left-0 h-full w-full flex items-center justify-center z-210">
      <div class="page-preloader__wrap relative inline-block h-80 w-80">
        <div
          v-for="item in 2"
          :key="item"
          class="page-preloader__item @apply absolute border-4 border-solid border-blue-cl-400 opacity-full rounded-full"
        />
      </div>
    </div>

    <!-- H E A D E R -->
    <div
      class="flex items-center mb-0 md:mb-14"
      :class="[overflow ? 'py-21 md:py-0 px-16' : 'px-20 py-21 md:p-0', { 'flex-col': $breakpoint.smAndDown }]"
    >
      <div class="flex items-center justify-between w-full">
        <!-- H E A D E R   L E F T   S I D E -->
        <div class="flex items-center flex-grow pr-20 md:pr-40">
          <!-- M E N U   I C O N -->
          <div v-if="$breakpoint.smAndDown" class="flex flex-col mr-20 cursor-pointer" @click="toggleMobileMenu(true)">
            <i class="text-xl text-grey-cl-200 cursor-pointer bg-white" />
          </div>

          <slot name="header-nav-left-start" />

          <!-- T I T L E -->
          <h2 class="font-raleway text-md md:text-xl leading:sm md:leading-xs text-white whitespace-no-wrap">
            <template v-if="title && !$slots.title">{{ title }}</template>

            <slot name="title" />
          </h2>

          <!-- S L O T -->
          <slot name="header-nav-left-end" />
        </div>

        <!-- H E A D E R   R I G H T   S I D E -->
        <div class="flex items-center justify-end flex-shrink-0">
          <!-- S L O T   1 -->
          <slot name="header-right-side-start" />

          <!-- L I N K   T O   E X C H A N G E S   K E Y S -->
          <template>
            <!-- D E S K T O P -->
            <router-link v-if="!$breakpoint.smAndDown" to="/keys" tag="div" class="hidden md:flex cursor-pointer ml-25">
              <i class="icon-key text-blue-cl-100 text-xxl1" />
            </router-link>

            <!-- M O B I L E -->
            <router-link
              v-else
              to="/keys"
              tag="div"
              class="flex md:hidden items-center justify-center w-32 h-32 border border-solid border-grey-cl-100 rounded-full"
            >
              <i class="icon-key text-white text-xxs text-base" />
            </router-link>
          </template>

          <!-- N O T I F I C A T I O N S -->
          <notifications class="ml-25" />

          <!-- U S E R -->
          <user class="ml-20" />

          <!-- S L O T   5 -->
          <slot name="header-right-side-end" />
        </div>
      </div>

      <!-- S L O T   H E A D E R   B O T T O M   S I D E -->
      <slot name="header-bottom" />
    </div>

    <!-- C O N T E N T -->
    <div ref="content" class="content__wrap relative flex overflow-hidden md:overflow-visible custom-scrollbar">
      <!-- S L O T -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { State, Mutation, namespace } from "vuex-class";

const dexMonitoring = namespace("dexMonitoringModule");
const user = namespace("userModule");

import User from "@/components/User.vue";
import Sidebar from "@/components/Sidebar.vue";
import Notifications from "@/components/Notifications.vue";
import { BtcAmount } from "@/store/portfolio/types";
import { calculateTotalBalance } from "@/services/balance.service";

@Component({ name: "PageLayout", components: { User, Sidebar, Notifications } })
export default class PageLayout extends Vue {
  /* V U E X */
  @user.State favoriteCurrency: any;
  @user.Getter cexBalance: BtcAmount;
  @dexMonitoring.Getter getNetworth: BtcAmount;
  @State isLoading: boolean;
  @Mutation toggleMobileMenu: (payload: boolean) => void;

  /* P R O P S */
  @Prop({ default: "" }) title: string;
  @Prop({ default: false, type: Boolean }) overflow: boolean;
  @Prop({ default: false, type: Boolean }) loading: boolean;

  get myBalance() {
    return calculateTotalBalance(this.cexBalance, this.getNetworth, this.favoriteCurrency);
  }
}
</script>

<style lang="scss" scoped>
.content {
  &__wrap {
    height: calc(100% - 46px);
    @media screen and (max-width: 1279px) {
      height: calc(100% - 56px);
    }
    @media screen and (max-width: 1023px) {
      height: calc(100% - 39px);
    }
  }
}

.page-preloader {
  &__inner {
    background-color: rgba(0, 0, 0, 0.7);
  }
  &__item {
    animation: page-preloader 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    &:nth-child(2) {
      animation-delay: -0.5s;
    }
  }
}

// Preloader animation
@keyframes page-preloader {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}
</style>
