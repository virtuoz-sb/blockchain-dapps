<template>
  <div
    v-if="isAppInitialized"
    class="sidebar flex flex-col w-full md:w-70 fixed bottom-0 left-0 md:relative z-110"
    :class="{ 'is-active': isSidebarOpen }"
  >
    <div
      v-if="!$breakpoint.smAndDown"
      class="sidebar__expand absolute w-30 h-30 bg-mirage rounded-full cursor-pointer"
      @click="toggleSidebar(!isSidebarOpen)"
    >
      <i class="icon-arrow-right-new absolute text-md text-jelly-bean" :class="{ 'is-active transform rotate-180': isSidebarOpen }" />
    </div>

    <div class="block h-full">
      <div class="flex flex-col h-full bg-dark-100 shadow-10 p-0 md:py-20 overflow-y-auto custom-scrollbar">
        <div v-if="!$breakpoint.smAndDown" class="flex items-center flex-shrink-0 px-12 mb-50 lg:mb-70">
          <router-link
            tag="div"
            :to="{ name: 'home' }"
            class="flex items-center justify-center h-45 w-45 min-w-45 rounded-full cursor-pointer"
          >
            <img src="@/assets/images/UpBotsLogo.png" alt="user" class="w-full h-full object-cover" />
          </router-link>

          <div v-if="isSidebarOpen" class="flex items-center ml-22">
            <span class="leading-xs text-iceberg truncate w-100">{{ user.firstname }}</span>
          </div>
        </div>

        <!-- Sideabr show (screen <= 767) -->
        <div v-if="$breakpoint.smAndDown" class="flex h-60">
          <ul class="grid grid-cols-5 items-center w-full" @click="toggleSidebarNavClick">
            <router-link
              v-for="item in mobileSidebarNav"
              :key="item.route"
              :to="{ name: item.route }"
              tag="li"
              :exact="item.exact"
              class="sidebar__nav-item flex items-center justify-center w-auto h-full cursor-pointer"
            >
              <i class="sidebar__nav-icon flex items-center h-full text-blue-dianne text-xxl" :class="item.icon" />
            </router-link>
          </ul>
        </div>

        <!-- Sideabr show (screen > 767) -->
        <div v-if="!$breakpoint.smAndDown" class="flex flex-col overflow-y-auto custom-scrollbar">
          <ul class="flex flex-col items-center flex-shrink-0 w-full" @click="toggleSidebarNavClick">
            <router-link
              v-for="item in topSidebarNav"
              :key="item.route"
              :to="{ name: item.route }"
              tag="li"
              :exact="item.exact"
              class="sidebar__nav-item w-full flex items-center justify-start h-26 mb-30 last:mb-0 cursor-pointer"
            >
              <div class="flex ml-20">
                <i class="sidebar__nav-icon flex items-center justify-center text-blue-dianne w-30 text-xxl" :class="item.icon" />
              </div>

              <div v-if="isSidebarOpen" class="flex flex-col ml-26">
                <span class="sidebar__nav-title text-blue-dianne text-sm leading-xs">
                  {{ item.label }}
                </span>
                <!-- <span v-if="isSidebarOpen && item.comingSoon" class="text-xs leading-xs text-blue-cl-400 mt-2">Available Now</span> -->
              </div>
            </router-link>
          </ul>

          <AppDivider class="flex-shrink-0 bg-aquamarine-blue mt-30 mb-10 opacity-50" />

          <p class="flex-shrink-0 text-shakespeare text-xs leading-xs mb-20" :class="[isSidebarOpen ? 'text-left px-22' : 'text-center']">
            Coming Soon
          </p>

          <!-- DEVELOPER MODE 
          <div v-if="isDeveloperUser" class="flex flex-col items-center flex-shrink-0 w-full pb-30">
            <div class="sidebar__nav-item flex items-center justify-start h-26 w-full cursor-pointer" @click="developerMode()">
              <div class="flex ml-22">
                <i class="icon-my-bots sidebar__nav-icon flex items-center justify-center text-blue-dianne w-30 text-xxl" />
              </div>

              <div v-if="isSidebarOpen" class="flex flex-col ml-18">
                <span class="sidebar__nav-title text-blue-dianne text-sm leading-xs">Developer Mode</span>
              </div>
            </div>
          </div>
          -->
          <ul class="flex flex-col items-center flex-shrink-0 w-full pb-30">
            <router-link
              v-for="item in bottomSidebarNav"
              :key="item.route"
              :to="{ name: item.route }"
              tag="li"
              :exact="item.exact"
              class="sidebar__nav-item flex items-center justify-start h-26 w-full mb-30 last:mb-0 cursor-pointer"
            >
              <div class="flex ml-20">
                <i class="sidebar__nav-icon flex items-center justify-center w-30 text-blue-dianne text-xxl" :class="item.icon" />
              </div>

              <div v-if="isSidebarOpen" class="flex flex-col ml-26">
                <span class="sidebar__nav-title text-blue-dianne text-sm leading-xs">
                  {{ item.label }}
                </span>
                <!-- <span v-if="isSidebarOpen && item.comingSoon" class="text-xs leading-xs text-blue-cl-400 mt-2">Available Now</span> -->
              </div>
            </router-link>
          </ul>

          <!-- UPBOTS COMMUNITY LINKS -->
          <div v-if="isSidebarOpen" class="traders-community flex flex-shrink-0 w-full px-20 pb-30">
            <div class="traders-community__wrap flex flex-col w-full rounded-4 pt-10 pb-18 px-10">
              <p class="traders-community__title text-sm leading-md text-center mb-15">UpBots Community</p>

              <div class="flex items-center justify-between w-full">
                <a :href="item.link" v-for="(item, index) in tradersCommunity" :key="index" target="_blank" class="flex">
                  <i :class="item.icon" class="traders-community__item-icon" :style="`font-size: ${item.size}`" />
                </a>
              </div>
            </div>
          </div>

          <!-- METAMASK -->
          <div class="flex flex-col items-center flex-shrink-0 w-full pb-30">
            <div class="sidebar__nav-item flex items-center justify-start h-26 w-full cursor-pointer" @click="checkMetamaskEnabled()">
              <div class="flex ml-22">
                <img :src="require('@/assets/icons/ubxt-logo.png')" alt="wallet" class="w-25 h-25" />
              </div>

              <div v-if="isSidebarOpen" class="flex flex-col ml-18">
                <span class="sidebar__nav-title text-blue-dianne text-sm leading-xs">Add UBXT to Metamask</span>
                <!-- <span v-if="isSidebarOpen && item.comingSoon" class="text-xs leading-xs text-blue-cl-400 mt-2">Available Now</span> -->
              </div>
            </div>
          </div>

          <!-- TERMS AND PRIVACY LINKS -->
          <div class="flex flex-col items-center flex-shrink-0 w-full pb-30">
            <div class="sidebar__nav-item flex items-center justify-start h-26 w-full">
              <div v-if="isSidebarOpen" class="flex flex-col ml-18">
                <span class="sidebar__nav-title text-blue-dianne text-sm leading-xs">
                  <a href="/terms-conditions" target="_blank" class="underline cursor-pointer">Term of Service</a>
                  <span> and </span><a href="/privacy-policy" target="_blank" class="underline cursor-pointer">Privacy Policy</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AxiosError } from "axios";
import { State, Mutation, namespace } from "vuex-class";
import { AccountTotal } from "@/store/portfolio/types";
import { DexWallet } from "@/store/dex-monitoring/types";

const auth = namespace("authModule");
const user = namespace("userModule");
const notifications = namespace("notificationsModule");
const dexMonitoring = namespace("dexMonitoringModule");

@Component({ name: "Sidebar" })
export default class Sidebar extends Vue {
  /* VUEX */
  @State isAppInitialized: boolean;
  @State isSidebarOpen: boolean;
  @Mutation isLoading: any;
  @Mutation appInitialized: any;
  @Mutation toggleSidebar: (payload: boolean) => void;
  @auth.State user!: any;
  @auth.Getter getUserIsAuthenticated: boolean;
  @auth.Getter isDeveloperUser: boolean;
  @user.State accounts: AccountTotal[];
  @user.Mutation portfolioSelected: any;
  @user.Action fetchUserSummary!: any;
  @user.Action fetchKeysActionAsync!: any;
  @user.Action fetchPortfolioEvolution!: any;
  @user.Action fetchPagesStatus!: any;
  @user.Action fetchUserCoupons: any;
  @auth.Action getInfoUser!: any;
  @user.Action fetchTradingSettings!: any;
  @notifications.Action openWebsocketConnection!: any;
  @dexMonitoring.Getter getSelectedWallet: DexWallet;
  @dexMonitoring.Action loadWallets: () => Promise<void>;
  @dexMonitoring.Action fetchBalances: () => Promise<void>;

  /* DATA */
  contractAddress = process.env.VUE_APP_WEB3_UBXTOKEN_PROXY_CONTRACT_ADDRESS;

  mobileSidebarNav: { route: string; icon: string; exact: boolean }[] = [
    { route: "home", icon: "icon-dashboard-new", exact: true },
    { route: "portfolio-monitoring", icon: "icon-portfolio-new", exact: false },
    { route: "algo-bots", icon: "icon-bots-new", exact: false },
    { route: "keys", icon: "icon-key-new", exact: false },
    { route: "manual-trade", icon: "icon-trade-new", exact: false },
  ];

  topSidebarNav: { route: string; label: string; icon: string; comingSoon: boolean; exact: boolean }[] = [
    { route: "home", label: "Dashboard", icon: "icon-dashboard-new", comingSoon: false, exact: true },
    { route: "portfolio-monitoring", label: "Portfolio", icon: "icon-portfolio-new", comingSoon: false, exact: false },
    { route: "algo-bots", label: "Algo Rental", icon: "icon-bots-new", comingSoon: false, exact: false },
    { route: "keys", label: "My API’s", icon: "icon-key-new", comingSoon: false, exact: false },
    { route: "swap", label: "Swap", icon: "icon-swap-new", comingSoon: false, exact: false },
    { route: "manual-trade", label: "Manual Trade", icon: "icon-trade-new", comingSoon: false, exact: false },
    { route: "staking", label: "Staking", icon: "icon-staking-new", comingSoon: false, exact: true },
    { route: "ubxt-bridge", label: "Bridge", icon: "icon-infinite", comingSoon: false, exact: false },
    { route: "ubxt-wallet", label: "My UBXT wallet", icon: "icon-ubxt-wallet", comingSoon: false, exact: true },
  ];

  bottomSidebarNav: { route: string; label: string; icon: string; comingSoon: boolean; exact: boolean }[] = [
    // { route: "ubxt-wallet", label: "My UBXT wallet", icon: "icon-ubxt-wallet", comingSoon: true, exact: true },
    // { route: "my-performance", label: "My Performance", icon: "icon-my-performance", comingSoon: true, exact: true },
    // { route: "my-bots", label: "Bot Creator", icon: "icon-bot-new", comingSoon: true, exact: true },
    // { route: "learning", label: "Learning", icon: "icon-education-new", comingSoon: true, exact: true },
    // { route: "copy-trading", label: "Copy trading", icon: "icon-copy-new", comingSoon: true, exact: true },
    // { route: "staking", label: "Farm/Stake/Vault", icon: "icon-staking-new", comingSoon: true, exact: true },
    // { route: "signal-providers", label: "Signal Providers", icon: "icon-signal-new", comingSoon: true, exact: true },
    { route: "coming-soon", label: "Coming Soon", icon: "icon-clock", comingSoon: false, exact: false },
  ];

  tradersCommunity: { link: string; label: string; icon: string; size: string }[] = [
    { link: "https://t.me/Upbots_announcement", label: "Telegram", icon: "icon-telegram", size: "15px" },
    { link: "https://twitter.com/UpBotscom", label: "Twitter", icon: "icon-twitter", size: "15px" },
    { link: "https://www.facebook.com/UpBotscom", label: "Facebook", icon: "icon-facebook", size: "15px" },
    { link: "https://www.linkedin.com/company/upbots", label: "LinkedIn", icon: "icon-linkedin", size: "15px" },
    { link: "https://discord.com/invite/wCrdMYEVjd", label: "Discord", icon: "icon-discord", size: "19px" },
  ];

  /* HOOKS */
  async created() {
    this.fetchInitialData();
    this.connectWebsocket();
  }

  /* METHODS */
  fetchInitialData() {
    return Promise.all([
      this.fetchUserSummary(),
      this.fetchKeysActionAsync(),
      this.fetchPagesStatus(),
      this.fetchUserCoupons(),
      this.getInfoUser(),
      this.loadWallets(),
      this.fetchTradingSettings(),
    ])
      .then(() => {
        const allWallets = this.accounts.map((w: AccountTotal) => w.name);
        this.fetchBalances();
        this.portfolioSelected(allWallets);
        return this.fetchPortfolioEvolution();
      })
      .catch(({ response: { data } }: AxiosError) => {
        this.$notify({ text: data.message, type: "error" });
      })
      .finally(() => {
        this.appInitialized(true);
      });
  }

  connectWebsocket() {
    //call notification store action to connect websocket and fetch JWT from store.
    this.openWebsocketConnection(); // could be dispatched anywhere in the app when app logic starts
  }

  toggleSidebarNavClick() {
    if (this.isSidebarOpen) {
      this.toggleSidebar(false);
    }
  }
  developerMode() {
    this.$router.push("/dev-mode");
  }
  async checkMetamaskEnabled() {
    if (typeof window.web3.currentProvider !== "undefined") {
      await (window.web3.currentProvider as any).request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: this.contractAddress,
            symbol: "UBXT",
            decimals: 18,
            image: `${window.location.origin}${require(`@/assets/icons/ubxt-logo.png`)}`,
          },
        },
      });
    } else {
      this.$emit("set-error");
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  min-width: 70px;

  &.is-active {
    @apply top-0;
    position: absolute !important;
    width: 220px;

    .sidebar {
      &__nav-item {
        &.is-active {
          &:after {
            @apply left-0;
          }
        }
      }
    }
  }

  &__nav-item {
    &.is-active {
      @apply relative;

      &:after {
        content: "";
        @apply absolute right-0 w-3 h-full bg-aquamarine-blue;
      }

      .sidebar {
        &__nav-icon {
          @apply text-aquamarine-blue;
        }

        &__nav-title {
          @apply text-aquamarine-blue;
        }
      }
    }

    @media screen and (max-width: 767px) {
      &.is-active {
        &:after {
          @apply top-0 h-3 left-1/2 transform -translate-x-1/2;
          width: 25px;
        }
      }
    }
  }

  &__nav-icon {
    &.icon-infinite {
      -webkit-text-stroke: 0.4px;
    }
  }

  &__expand {
    top: 70px;
    right: -15px;

    .icon-arrow-right-new {
      font-size: 11px;
      left: 13px;
      top: 10px;

      &.is-active {
        left: 11px;
        top: 9px;
      }
    }
  }

  .traders-community {
    &__wrap {
      background: rgba(93, 109, 135, 0.15);
    }

    &__title {
      color: #cfcfcf;
    }

    &__item-icon {
      color: #edf0f0;
    }
  }
}
</style>
