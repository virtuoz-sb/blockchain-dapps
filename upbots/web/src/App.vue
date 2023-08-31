<template>
  <div class="flex h-full relative custom-scrollbar" :class="{ 'pl-70': isSidebarOpen }">
    <!-- PAGE LOADING INDICATIOR -->
    <div v-if="!showMainView" class="page-preloader__inner fixed top-0 left-0 h-full w-full flex items-center justify-center z-210">
      <div class="page-preloader__wrap relative">
        <div class="page-preloader__item absolute border-4 border-solid border-blue-cl-400 opacity-100 rounded-full" />
        <div class="page-preloader__item absolute border-4 border-solid border-blue-cl-400 opacity-100 rounded-full" />
      </div>
    </div>

    <!-- If user not logged in, sidebar won't be accessible -->
    <Sidebar v-if="user && !showSidebar" />

    <template v-if="user && $route.name !== 'totp-auth' && $route.name !== 'login'">
      <!-- MOBILE MENU -->
      <MobileMenu :is-open="isMobileMenu" />
      <!-- OVERLAY -->
      <div
        v-if="isMobileMenu"
        class="mobile-menu-overlay fixed top-0 left-0 right-0 bottom-0 w-full h-full cursor-pointer"
        @click="toggleMobileMenu(false)"
      />
    </template>

    <!-- MAIN VIEW -->
    <router-view v-if="showMainView" />

    <!-- NOTIFICATIONS -->
    <AppNotifications />

    <!-- PORTALS -->
    <div id="modals-target" />
  </div>
</template>

<script lang="ts">
const { version } = require("../package.json");

const authPages = ["login", "register", "totp-auth", "reset-password", "recover-password", "verify", "terms-conditions", "privacy-policy"];

import { Component, Vue } from "vue-property-decorator";
import { State, Mutation, namespace } from "vuex-class";
const fromAuth = namespace("authModule");

import Sidebar from "@/components/Sidebar.vue";
import MobileMenu from "@/components/MobileMenu.vue";

@Component({ name: "App", components: { Sidebar, MobileMenu } })
export default class App extends Vue {
  /* VUEX */
  @fromAuth.State private user!: Boolean;
  @State isAppInitialized: boolean;
  @State isLoading: boolean;
  @State isMobileMenu: boolean;
  @State isSidebarOpen: boolean;
  @Mutation toggleMobileMenu: (payload: boolean) => void;

  /* DATA */
  // authPages = authPages;

  /* COMPUTED */
  get showSidebar(): boolean {
    return authPages.includes(this.$route.name);
  }

  get showMainView() {
    return this.showSidebar || this.isAppInitialized;
  }

  /* HOOKS */
  mounted() {
    // eslint-disable-next-line no-console
    console.info("version: ", version);
    // set web page title
    // document.title = `UpBots - ${process.env.VUE_APP_BETA_SERVER === "1" ? "Beta" : "Demo"}`;
    document.title = `UpBots - Next`;

    // redirect from demo to beta
    const originURL = window.location.origin;
    const urlPairs = [
      {
        baseURL: "https://upbots-front.upbots-development.cluster.cortex.upbots.com",
        nextURL: "https://upbots-front-next.upbots-development.cluster.cortex.upbots.com",
      },
      {
        baseURL: "https://staging.demo.upbots.com",
        nextURL: "https://staging.next.upbots.com",
      },
      {
        baseURL: "https://demo.upbots.com",
        nextURL: "https://next.upbots.com",
      },
      {
        baseURL: "https://upbots-front-beta.upbots-development.cluster.cortex.upbots.com",
        nextURL: "https://upbots-front-next.upbots-development.cluster.cortex.upbots.com",
      },
      // {
      //   baseURL: "https://staging.beta.upbots.com",
      //   nextURL: "https://staging.next.upbots.com",
      // },
      {
        baseURL: "https://beta.upbots.com",
        nextURL: "https://next.upbots.com",
      },
    ];

    for (let i = 0; i < urlPairs.length; i++) {
      const urlPair = urlPairs[i];
      if (urlPair.baseURL === originURL) {
        window.location.href = urlPair.nextURL + window.location.pathname + window.location.search;
        break;
      }
    }
  }
}
</script>
