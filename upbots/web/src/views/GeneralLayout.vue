<template>
  <div
    class="flex flex-col w-full px-0 pt-0 md:pt-30 lg:pt-30 pb-60 md:pb-20 lg:pb-40 md:pr-20 md:pl-40 lg:pr-30 xl:pr-40"
    @click="toggleSidebar(false)"
  >
    <!-- PAGE LOADING INDICATOR -->
    <div v-if="isLoading" class="page-preloader__inner fixed top-0 left-0 h-full w-full flex items-center justify-center z-210">
      <div class="page-preloader__wrap relative inline-block h-80 w-80">
        <div
          v-for="item in 2"
          :key="item"
          class="page-preloader__item absolute border-4 border-solid border-blue-cl-400 opacity-full rounded-full"
        />
      </div>
    </div>

    <!-- HEADER -->
    <div class="flex items-center px-20 py-21 md:p-0 md:mb-30">
      <div class="flex items-center justify-between w-full">
        <!-- HEADER LEFT SIDE -->
        <div class="flex items-center flex-grow">
          <!-- MENU -->
          <div v-if="$breakpoint.smAndDown" class="flex flex-col mr-20 cursor-pointer" @click="toggleMobileMenu(true)">
            <i class="icon-menu text-xl text-grey-cl-200 cursor-pointer" />
          </div>

          <!-- SLOT LEFT START -->
          <slot name="header-nav-left-start" />

          <!-- TITLE -->
          <h2 class="flex items-center font-raleway text-md md:text-xl leading:sm md:leading-xs text-iceberg whitespace-no-wrap">
            <template v-if="title && !$slots.title">{{ title }}</template>

            <slot name="title" />
          </h2>

          <!-- SLOT LEFT END -->
          <slot name="header-nav-left-end" />
        </div>

        <!-- HEADER RIGHT SIDE -->
        <div class="flex items-center justify-end flex-shrink-0">
          <!-- SLOT RIGHT START -->
          <slot name="header-right-side-start" />

          <!-- USER -->
          <user class="ml-14 lg:ml-22" />

          <!--INFO -->
          <router-link
            tag="div"
            :to="{ name: 'ubxt-info' }"
            class="icon-wrap ml-14 lg:ml-22 flex items-center justify-center h-32 w-32 bg-abyssal-anchorfish-blue hover:bg-astral rounded-full cursor-pointer"
          >
            <span class="icon-ubxt-info icon-item text-astral text-md" />
          </router-link>

          <!--MY BALANCE -->
          <router-link
            v-if="!$breakpoint.smAndDown"
            tag="div"
            :to="{ name: 'ubxt-wallet' }"
            class="icon-wrap ml-14 lg:ml-22 flex items-center justify-center h-32 w-32 bg-abyssal-anchorfish-blue hover:bg-astral rounded-full cursor-pointer"
          >
            <span class="icon-ubxt-wallet icon-item text-astral text-md" />
          </router-link>

          <!-- NOTIFICATIONS -->
          <notifications class="ml-14 lg:ml-22" />

          <!-- SLOT RIGHT END -->
          <slot name="header-right-side-end" />
        </div>
      </div>

      <!-- SLOT BOTTOM -->
      <slot name="header-bottom" />
    </div>

    <!-- CONTENT -->
    <div ref="content" :class="contentCustomClasses" class="content__wrap flex">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { State, Mutation, namespace } from "vuex-class";

const user = namespace("userModule");
const dexMonitoring = namespace("dexMonitoringModule");

import User from "@/components/User.vue";
import Sidebar from "@/components/Sidebar.vue";
import Notifications from "@/components/Notifications.vue";
//import { BtcAmount } from "@/store/portfolio/types";
//import { FavoriteCurrency } from "@/components/portfolio/types/portfolio.types";
//import { calculateTotalBalance } from "@/services/balance.service";

@Component({ name: "PageLayout", components: { User, Sidebar, Notifications } })
export default class PageLayout extends Vue {
  /* Would like to confirm with you if we can delete this */
  //@user.State favoriteCurrency: FavoriteCurrency;
  //@user.Getter cexBalance: BtcAmount;
  //@dexMonitoring.Getter getNetworth: BtcAmount;
  //
  /* VUEX */
  @State isLoading: boolean;
  @Mutation toggleMobileMenu: (payload: boolean) => void;
  @Mutation toggleSidebar: (payload: boolean) => void;

  /* PROPS */
  @Prop({ default: "" }) title: string;
  @Prop({ default: false, type: Boolean }) loading: boolean;
  @Prop({ default: "" }) contentCustomClasses: string;
}
</script>

<style lang="scss" scoped>
.content {
  &__wrap {
    height: calc(100% - 62px);
    @media screen and (max-width: 1023px) {
      height: calc(100% - 62px);
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
.icon-wrap {
  transition: all 0.2s;
  &:hover {
    .icon-item {
      @apply text-white;
    }
  }
}
</style>
