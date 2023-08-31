<template>
  <div
    v-if="isAppInitialized"
    class="mobile-menu flex flex-col fixed left-0 top-0 h-full bg-dark-100 pt-20 overflow-y-auto custom-scrollbar"
    :class="{ 'is-active': isOpen }"
  >
    <!-- CLOSE MOBILE MENU -->
    <span class="icon-close text-iceberg absolute right-0 top-0 p-20 cursor-pointer" @click="toggleMobileMenu(false)" />

    <!-- AVATAR, NAME, MY BALANCE -->
    <div class="flex flex-col w-full flex-shrink-0">
      <div class="flex items-center px-20 mb-20">
        <router-link
          tag="div"
          :to="{ name: 'home' }"
          class="flex items-center justify-center h-50 w-full max-w-50 bg-dark-cl-100 rounded-full cursor-pointer"
          @click.native="toggleMobileMenu(false)"
        >
          <img src="@/assets/images/UpBotsLogo.png" alt="user" class="h-full w-full object-cover" />
        </router-link>

        <div class="flex items-center ml-22">
          <span class="leading-xs text-iceberg truncate w-100">{{ user.firstname }}</span>
        </div>
      </div>

      <div class="flex flex-col flex-shrink-0 mb-38">
        <div class="flex items-start justify-between px-20">
          <div class="flex flex-col mr-12">
            <span class="text-xs leading-md text-grey-cl-100 mb-4">My Balance:</span>
            <span class="text-sm leading-xs text-iceberg">{{ myBalance }}</span>
          </div>

          <template v-if="showFavouriteCurrency">
            <AppDropdownBasic v-if="availableCurrencyList.length" v-model="selectedCurrency" :options="availableCurrencyList" dark />
          </template>
        </div>
      </div>
    </div>

    <!-- ROUTER LIST -->
    <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
      <div class="flex flex-col flex-shrink-0">
        <ul class="flex flex-col items-center w-full">
          <router-link
            v-for="item in topSidebarNav"
            :key="item.route"
            :to="{ name: item.route }"
            tag="li"
            :exact="item.exact"
            class="mobile-menu__nav-item w-full flex items-center justify-start px-20 mb-30 last:mb-0 cursor-pointer"
            @click.native="toggleMobileMenu(false)"
          >
            <div class="flex w-30">
              <i class="mobile-menu__nav-icon flex items-center justify-center text-xxl text-blue-dianne" :class="item.icon" />
            </div>
            <div class="flex flex-col ml-26">
              <span class="mobile-menu__nav-title text-blue-dianne text-sm leading-xs">{{ item.label }}</span>
              <!-- <span v-if="item.comingSoon" class="text-xs leading-xs text-blue-cl-400 mt-2">Available Now</span> -->
            </div>
          </router-link>
        </ul>

        <AppDivider class="bg-aquamarine-blue mt-35 mb-10 flex-shrink-0 opacity-50" />

        <p class="text-shakespeare text-xs leading-xs text-left mb-25 px-10">Coming Soon</p>

        <!-- DEVELOPER MODE
        <div v-if="isDeveloperUser" class="flex flex-col items-center flex-shrink-0 w-full px-20 mb-20">
          <div class="mobile-menu__nav-item flex items-center justify-start h-26 w-full cursor-pointer" @click="developerMode()">
            <div class="flex w-30">
              <i class="icon-my-bots sidebar__nav-icon flex items-center justify-center text-blue-dianne w-30 text-xxl" />
            </div>

            <div class="flex flex-col ml-26">
              <span class="sidebar__nav-title text-blue-dianne text-sm leading-xs">Developer Mode</span>
            </div>
          </div>
        </div>
        -->
        <ul class="flex flex-col items-center w-full pb-20">
          <router-link
            v-for="item in bottomSidebarNav"
            :key="item.route"
            :to="{ name: item.route }"
            tag="li"
            :exact="item.exact"
            class="mobile-menu__nav-item flex items-center justify-start w-full px-20 mb-30 last:mb-0 cursor-pointer"
            @click.native="toggleMobileMenu(false)"
          >
            <div class="flex w-30">
              <span class="mobile-menu__nav-icon flex items-center justify-center text-xxl text-blue-dianne" :class="item.icon" />
            </div>
            <div class="flex flex-col ml-26">
              <span class="mobile-menu__nav-title text-blue-dianne text-sm leading-xs">{{ item.label }}</span>
              <!-- <span v-if="item.comingSoon" class="text-xs leading-xs text-blue-cl-400 mt-2">Available Now</span> -->
            </div>
          </router-link>
        </ul>

        <AppDivider class="bg-aquamarine-blue flex-shrink-0 opacity-50 mb-20" />

        <!-- Community -->
        <div class="traders-community flex w-full px-20 pb-30">
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
        <div class="flex flex-col items-center flex-shrink-0 w-full px-20 mb-20">
          <div class="mobile-menu__nav-item flex items-center justify-start h-26 w-full cursor-pointer" @click="checkMetamaskEnabled()">
            <div class="flex w-30">
              <img :src="require('@/assets/icons/ubxt-logo.png')" alt="wallet" class="w-25 h-25" />
            </div>

            <div class="flex flex-col ml-26">
              <span class="sidebar__nav-title text-blue-dianne text-sm leading-xs">Add UBXT to Metamask</span>
            </div>
          </div>
        </div>

        <!-- TERMS AND PRIVACY LINKS -->
        <div class="flex flex-col items-center flex-shrink-0 w-full px-20 mb-20">
          <div class="mobile-menu__nav-item flex items-center justify-start h-26 w-full">
            <span class="text-blue-dianne text-sm leading-xs">
              <a href="/terms-conditions" target="_blank" class="underline cursor-pointer">Term of Service</a>
              <span> and </span><a href="/privacy-policy" target="_blank" class="underline cursor-pointer">Privacy Policy</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { State, Mutation, namespace } from "vuex-class";
import { availableFilterCurrency } from "@/models/default-models";

import { calculateTotalBalance } from "@/services/balance.service";
import { FavoriteCurrency } from "./portfolio/types/portfolio.types";
import { BtcAmount } from "@/store/portfolio/types";

const auth = namespace("authModule");
const user = namespace("userModule");
const dexMonitoring = namespace("dexMonitoringModule");

@Component({ name: "MobileMenu" })
export default class MobileMenu extends Vue {
  /* VUEX */
  @State isAppInitialized: boolean;
  @Mutation toggleMobileMenu: (payload: boolean) => void;
  @auth.State user!: any;
  @auth.Getter isDeveloperUser: boolean;
  @user.State favoriteCurrency: FavoriteCurrency;
  @user.Getter cexBalance: BtcAmount;
  @user.Mutation setFavoriteCurrency: any;
  @dexMonitoring.Getter getNetworth: BtcAmount;

  /* PROPS */
  @Prop({ type: Boolean, default: false }) isOpen: boolean;

  /* DATA */
  availableCurrencyList = availableFilterCurrency();
  contractAddress = process.env.VUE_APP_WEB3_UBXTOKEN_PROXY_CONTRACT_ADDRESS;

  tradersCommunity: { link: string; label: string; icon: string; size: string }[] = [
    { link: "https://t.me/Upbots_announcement", label: "Telegram", icon: "icon-telegram", size: "15px" },
    { link: "https://twitter.com/UpBotscom", label: "Twitter", icon: "icon-twitter", size: "15px" },
    { link: "https://www.facebook.com/UpBotscom", label: "Facebook", icon: "icon-facebook", size: "15px" },
    { link: "https://www.linkedin.com/company/upbots", label: "LinkedIn", icon: "icon-linkedin", size: "15px" },
    { link: "https://discord.com/invite/wCrdMYEVjd", label: "Discord", icon: "icon-discord", size: "19px" },
  ];

  topSidebarNav: { route: string; label: string; icon: string; comingSoon: boolean; exact: boolean }[] = [
    { route: "home", label: "Dashboard", icon: "icon-dashboard-new", comingSoon: false, exact: true },
    { route: "portfolio-monitoring", label: "Portfolio", icon: "icon-portfolio-new", comingSoon: false, exact: false },
    { route: "algo-bots", label: "Algo Rental", icon: "icon-bots-new", comingSoon: false, exact: false },
    { route: "keys", label: "My API’s", icon: "icon-key-new", comingSoon: false, exact: false },
    { route: "swap", label: "Swap", icon: "icon-swap-new", comingSoon: false, exact: false },
    { route: "manual-trade", label: "Manual Trade", icon: "icon-trade-new", comingSoon: true, exact: false },
    { route: "staking", label: "Staking", icon: "icon-staking-new", comingSoon: false, exact: true },
    { route: "ubxt-bridge", label: "Bridge", icon: "icon-infinite", comingSoon: false, exact: false },
    { route: "ubxt-wallet", label: "My UBXT wallet", icon: "icon-ubxt-wallet", comingSoon: false, exact: true },
  ];

  bottomSidebarNav: { route: string; label: string; icon: string; comingSoon: boolean; exact: boolean }[] = [
    { route: "coming-soon", label: "Coming Soon", icon: "icon-clock", comingSoon: true, exact: false },
  ];

  /* METHODS */
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

  developerMode() {
    this.$router.push("/dev-mode");
  }

  /* COMPUTED */
  get myBalance() {
    return calculateTotalBalance(this.cexBalance, this.getNetworth, this.favoriteCurrency);
  }
  get selectedCurrency() {
    return this.favoriteCurrency;
  }

  set selectedCurrency(value) {
    this.setFavoriteCurrency(value);
  }

  get showFavouriteCurrency() {
    return this.$route.name === "profile";
  }
}
</script>

<style lang="scss" scoped>
.mobile-menu {
  width: 67%;
  @apply shadow-10;
  transition: transform 0.3s ease-in-out, -webkit-transform 0.3s ease-in-out;
  transform: translateX(-150%);
  z-index: 112;
  &.is-active {
    transform: translateX(0);
  }
}

.mobile-menu {
  &__nav-item {
    &.is-active {
      @apply relative;
      &:after {
        content: "";
        @apply absolute left-0 w-3 h-full bg-aquamarine-blue;
      }
      .mobile-menu {
        &__nav-icon {
          @apply text-aquamarine-blue;
        }
        &__nav-title {
          @apply text-aquamarine-blue;
        }
      }
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
</style>
