<template>
  <GeneralLayout content-custom-classes="md:flex-col overflow-y-auto custom-scrollbar">
    <!-- HEADER TITLE -->
    <template v-if="!$breakpoint.mdAndDown" slot="title">
      Welcome
      <span class="font-bold ml-8">{{ user.firstname }} !</span>
    </template>

    <!-- HEADER LINK -->
    <router-link v-if="!$breakpoint.smAndDown" slot="header-nav-left-end" to="/new-trade" :class="!$breakpoint.mdAndDown && 'ml-22'">
      <AppButton type="light-green-reverse-bordered" size="xxs" class="start-trade-btn flex-shrink-0 w-full text-sm leading-sm">
        Start a Trade
      </AppButton>
    </router-link>

    <!-- HEADER RIGHT SIDE (ADD COUPON AND VERIFY EMAIL) -->
    <template slot="header-right-side-start">
      <AppButton v-if="!hasCoupons" type="light-green" size="xs" class="mr-20" @click="couponDialog = true">
        {{ $breakpoint.smAndDown ? "Coupon" : "Add coupon" }}
      </AppButton>

      <AppButton v-if="!getUserEmailVerified" type="red" size="xs" class="mr-20" @click="verifyEmailDialog = true">
        {{ $breakpoint.smAndDown ? "Verify Email" : "Please Verify Email" }}
      </AppButton>
    </template>

    <!-- HEADER OPEN TUTORIAL -->
    <div
      slot="header-right-side-end"
      class="tutorial__icon-wrap flex items-center justify-center h-32 w-32 bg-abyssal-anchorfish-blue hover:bg-astral rounded-full ml-14 lg:ml-22 cursor-pointer"
      @click="tutorialModalOpen = true"
    >
      <i class="icon-tutorial text-astral text-md" />
    </div>

    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full relative overflow-x-hidden custom-scrollbar">
      <div class="flex flex-col overflow-y-auto custom-scrollbar">
        <div :class="$breakpoint.mdAndDown ? 'mb-30' : 'mb-40'" class="flex flex-shrink-0">
          <!-- CAROUSEL -->
          <HomepageCarousel
            v-if="$breakpoint.width >= 900"
            :class="$breakpoint.mdAndDown ? 'mr-30' : 'lg:mr-20'"
            class="flex items-center justify-center text-white w-1/2 rounded-5 xl:mr-40"
          />
          <HomepageCarousel v-if="$breakpoint.width < 900" class="flex items-center justify-center text-white w-full rounded-5 xl:mr-0" />

          <!-- MARKET VALUE WIDGET -->
          <MarketValueWidget v-if="$breakpoint.width >= 900" class="market-value-widget flex flex-1 w-1/2 rounded-5 bg-dark-200" />
        </div>

        <!-- COMING SOON MODA BADGES -->
        <AppModal v-model="comingsoonModalOpen" persistent max-width="500px">
          <div class="relative flex flex-col pt-60 pb-40 px-20">
            <div class="flex flex-col items-center">
              <h2 class="text-xxl text-white text-center mb-20">Latest Badges - Coming Soon</h2>
              <div class="last-badges__modal-desc flex flex-col items-center justify-center text-center text-base mb-30">
                <p class="text-grey-cl-100 leading-xs">
                  As you progress through using the UpBots platform you will receive badges of accomplishment and honor to mark your
                  journey.
                </p>
              </div>
              <AppButton type="light-green" class="last-badges__modal-btn" @click="handleComingSoonModal">Close</AppButton>
            </div>
          </div>
        </AppModal>

        <div :class="$breakpoint.mdAndDown ? 'mb-30' : 'mb-40'" class="flex items-start flex-shrink-0">
          <!-- MY WALLETS -->
          <Card
            v-if="!$breakpoint.mdAndDown"
            class="my-wallets__inner flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 mr-20 xl:mr-40 overflow-y-auto custom-scrollbar"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <i class="icon-ubxt-wallet text-xl1 text-astral mr-10" />
              <span class="leading-xxs text-iceberg">Wallets</span>
            </template>
            <template slot="header-right">
              <AppDropdownBasic
                class="dots-transformed"
                @change="handleDropDownChange(dropdownBasicValue.sortField, dropdownBasicValue.sortType)"
                v-model="dropdownBasicValue"
                :options="dropdownBasicData"
                dots
              />
            </template>

            <MyWallets
              slot="content"
              :data="myWalletsData"
              :balance="myBalance"
              :sortField="walletSortField"
              :sortType="walletSortType"
              class="flex flex-1 flex-col w-full h-full pb-20 overflow-y-auto custom-scrollbar"
            />
          </Card>

          <!-- PORTFOLIO EVOLUTION -->
          <div class="w-full overflow-hidden">
            <PortfolioEvolution
              :key="$breakpoint.width"
              :portfolio-evolution-data="totalPortfolioEvolution"
              :active-currencies-names="activeCurrenciesNames"
              :line-chart-labels="lineChartLabels"
              class="portfolio-evolution__wrap home-disable flex flex-col justify-between relative h-full w-full bg-dark-200 rounded-3 overflow-y-auto md:overflow-visible custom-scrollbar"
            />
          </div>

          <!-- MY BOTS -->
          <Card
            v-if="!$breakpoint.mdAndDown"
            class="my-bot__inner flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 ml-20 xl:ml-40 overflow-y-auto custom-scrollbar"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <i class="icon-my-bots text-xl1 text-astral mr-10" />
              <div class="mb-4">
                <span class="leading-xxs text-iceberg mr-6">Best Performing Bots</span>
                <span class="text-xs text-iceberg">(6m perf%)</span>
              </div>
            </template>

            <MyBots slot="content" :bots="getAlgoBots" class="flex flex-col flex-1 w-full h-full pb-20 overflow-y-auto custom-scrollbar" />
          </Card>
        </div>

        <!-- ONLY FOR TABLET START -->
        <div v-if="$breakpoint.mdAndDown" class="flex items-start flex-shrink-0 mb-30">
          <!-- MY WALLETS -->
          <Card
            class="my-wallets__inner flex flex-col w-full bg-dark-200 rounded-3"
            header-classes="flex items-center justify-between overflow-y-auto custom-scrollbar"
          >
            <template slot="header-left">
              <i class="icon-ubxt-wallet text-xl1 text-astral mr-10" />
              <span class="leading-xxs text-iceberg">Wallets</span>
            </template>

            <template slot="header-right">
              <AppDropdownBasic
                class="dots-transformed"
                v-model="dropdownBasicValue"
                :options="dropdownBasicData"
                dots
                @change="handleDropDownChange(dropdownBasicValue.sortField, dropdownBasicValue.sortType)"
              />
            </template>

            <MyWallets
              slot="content"
              :data="myWalletsData"
              :balance="myBalance"
              :sortField="walletSortField"
              :sortType="walletSortType"
              class="flex flex-1 flex-col w-full h-full pt-10 pb-20 overflow-y-auto custom-scrollbar"
            />
          </Card>

          <!-- MY BOTS -->
          <Card
            class="my-bot__inner flex flex-col w-full bg-dark-200 rounded-3 ml-30"
            header-classes="flex items-center justify-between overflow-y-auto custom-scrollbar"
          >
            <template slot="header-left">
              <i class="icon-my-bots text-xl1 text-astral mr-10" />
              <div class="mb-4">
                <span class="leading-xxs text-iceberg mr-6">Best Performing Bots</span>
                <span class="text-xs text-iceberg">(6m perf%)</span>
              </div>
            </template>

            <MyBots slot="content" :bots="getAlgoBots" class="flex flex-col flex-1 w-full h-full pb-20 overflow-y-auto custom-scrollbar" />
          </Card>

          <!-- STAKING -->
          <Card
            v-if="$breakpoint.width > 900"
            class="staking__inner flex flex-col w-full bg-dark-200 rounded-3 ml-30"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <i class="icon-staking-new text-xl1 text-astral mr-10" />
              <span class="leading-md text-iceberg">Staking</span>
            </template>

            <Staking slot="content" class="flex flex-col flex-1 w-full h-full pb-20 overflow-y-auto custom-scrollbar" />
          </Card>
        </div>

        <!-- TABLET CONTENT (ADDITIONAL) -->
        <!-- STAKING -->
        <Card
          v-if="$breakpoint.width <= 900"
          class="staking__inner flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 mb-30"
          header-classes="flex items-center justify-between"
        >
          <template slot="header-left">
            <i class="icon-staking-new text-xl1 text-astral mr-10" />
            <span class="leading-md text-iceberg">Staking</span>
          </template>

          <Staking slot="content" />
        </Card>

        <div class="flex items-start flex-shrink-0 w-full">
          <Card
            v-if="!$breakpoint.mdAndDown"
            class="staking__inner flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <i class="icon-staking-new text-xl1 text-astral mr-10" />
              <span class="leading-md text-iceberg">Staking</span>
            </template>

            <Staking slot="content" />
          </Card>

          <!-- MARKETPLACE -->
          <Card
            :class="$breakpoint.mdAndDown ? 'ml-0' : 'ml-20'"
            class="marketplace__inner flex flex-col w-full bg-dark-200 rounded-3 xl:ml-40"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <i class="icon-marketplace text-xl1 text-astral mr-10" />
              <span class="leading-md text-iceberg">Discover our Marketplace</span>
            </template>

            <Marketplace slot="content" class="marketplace__items-wrap flex w-full h-full flex-grow items-center px-6" />
          </Card>
        </div>

        <!-- TUTORIAL MODAL -->
        <AppModal v-model="tutorialModalOpen" persistent max-width="600px">
          <TutorialModals @close="tutorialModalOpen = false" />
        </AppModal>

        <!-- COMING SOON -->
        <ComingSoonDesktop v-if="isComingSoon" />
      </div>
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="!isComingSoon" class="w-full flex flex-col relative bg-dark-200 rounded-t-15">
        <!-- APP TABS -->
        <AppTabs :tabs="tabs" shrink>
          <template v-slot="{ currentTab }">
            <!-- HOME TAB -->
            <template v-if="currentTab.componentName === 'WalletsTab'">
              <WalletsTab
                :my-wallets-data="myWalletsData"
                :my-wallets-balance="myBalance"
                :balances-wallet="favoriteCurrency || 'usd'"
                :ubxtModalOpen.sync="ubxtModalOpen"
                :portfolio-evolution-data="totalPortfolioEvolution"
                :active-currencies-names="activeCurrenciesNames"
                :line-chart-labels="lineChartLabels"
                :sortField="walletSortField"
                :sortType="walletSortType"
              />
            </template>

            <!-- CHART TAB -->
            <template v-if="currentTab.componentName === 'MyBotsTab'">
              <MyBotsTab :getAlgoBots="getAlgoBots" />
            </template>

            <!-- MARKETPLACE TAB -->
            <template v-if="currentTab.componentName === 'MarketplaceTab'">
              <MarketplaceTab />
            </template>
          </template>
        </AppTabs>

        <!-- TUTORIAL MODAL -->
        <AppModal v-model="tutorialModalOpen" persistent full-mobile-screen>
          <TutorialModals @close="tutorialModalOpen = false" class="h-full justify-center" />
        </AppModal>
      </div>

      <!-- COMING SOON -->
      <div v-if="isComingSoon" class="w-full flex flex-col">
        <ComingSoonWithoutDesign />
      </div>
    </template>

    <!-- UBXT MODAL -->
    <AppModal v-model="ubxtModalOpen" persistent max-width="550px">
      <UBXTModal />
    </AppModal>

    <!-- COMING SOON MODA BADGES -->
    <AppModal v-model="couponDialog" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="w-full text-xxl text-iceberg text-center mb-30">Add your coupon</h2>

          <ValidationObserver v-slot="{ invalid }" tag="div" class="flex flex-col w-full">
            <AppInput v-model="couponCode" rules="required" class="add-coupon-modal__input w-full mb-30 mx-auto" />

            <div class="flex flex-col items-center justify-center">
              <AppButton type="light-green" :disabled="invalid" class="add-coupon-modal__btn w-full" @click="validateCoupon">
                Add coupon
              </AppButton>
            </div>
          </ValidationObserver>
        </div>
      </div>
    </AppModal>

    <!-- VERIFY EMAIL MODAL -->
    <AppModal v-model="verifyEmailDialog" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="w-full text-xxl text-iceberg text-center mb-20">Verify your email</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 row-gap-20 md:row-gap-0 md:col-gap-20 items-center w-full md:w-auto">
            <AppButton type="grey" class="w-full min-w-150" @click="verifyEmailDialog = false">Close</AppButton>
            <AppButton type="light-green" class="px-20 min-w-150" @click="verifyEmail">Verify</AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import moment from "moment";
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";
import { AxiosError } from "axios";
import { namespace } from "vuex-class";
import { Tab } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";
import { cloneDeep } from "@/core/helper-functions";

const auth = namespace("authModule");
const user = namespace("userModule");
const algobots = namespace("algobotsModule");
const dexMonitoring = namespace("dexMonitoringModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import HomepageCarousel from "@/components/homepage/HomepageCarousel.vue";
import MyWallets from "@/components/homepage/MyWallets.vue";
import MyBots from "@/components/homepage/MyBots.vue";
import Marketplace from "@/components/homepage/Marketplace.vue";
import Balances from "@/components/homepage/Balances.vue";
import Staking from "@/components/homepage/StakingNew.vue";
import TutorialModals from "@/components/homepage/tutorial/TutorialModals.vue";
import WalletsTab from "@/components/homepage/mobile/WalletsTab.vue";
import MyBotsTab from "@/components/homepage/mobile/MyBotsTab.vue";
import MarketplaceTab from "@/components/homepage/mobile/MarketplaceTab.vue";
import UBXTModal from "@/components/homepage/UBXTModal.vue";
import { DexWallet, ProjectsData, TokenData, UsdConversionRates } from "@/store/dex-monitoring/types";
import { calculateTotalAssets } from "@/store/dex-monitoring/helpers";
import { PortfolioEvolution } from "@/components/portfolio/types/portfolio.types";
import { calculateTotalBalance } from "@/services/balance.service";
import { BtcAmount } from "@/store/portfolio/types";
import MarketValueWidget from "@/components/homepage/MarketValueWidget.vue";

@Component({
  name: "Home",

  components: {
    GeneralLayout,
    HomepageCarousel,
    MyWallets,
    MyBots,
    Marketplace,
    Balances,
    TutorialModals,
    WalletsTab,
    MyBotsTab,
    MarketplaceTab,
    UBXTModal,
    MarketValueWidget,
    Staking,
  },

  mixins: [ComingSoon],
})
export default class Home extends Vue {
  /* VUEX */
  @auth.State user!: any;
  @user.State accounts: any;
  @user.State favoriteCurrency: any;
  @user.Getter portfolioEvolutionData: PortfolioEvolution;
  @user.Getter activeCurrenciesNames!: any;
  @user.Getter cexBalance!: BtcAmount;
  @user.Getter userWallets!: any;
  @user.Getter hasCoupons!: boolean;
  @auth.Getter getUserEmailVerified: boolean;
  @user.Mutation portfolioSelected!: any;
  @user.Action fetchPortfolioEvolution!: any;
  @user.Action fetchUserCoupons: any;
  @auth.Action sendVerifyEmailLink: Function;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Getter getAlgoBots: AlgoBot[];
  @dexMonitoring.Getter getUsdConversionRates: UsdConversionRates;
  @dexMonitoring.Getter getWallets: DexWallet[];
  @dexMonitoring.Getter getTokensData: TokenData[];
  @dexMonitoring.Getter getProjectsDataList: ProjectsData[];
  @dexMonitoring.Getter getNetworth: BtcAmount;
  @dexMonitoring.Getter getPortfolioEvolution: PortfolioEvolution;

  /* DATA */
  couponDialog: boolean = false;
  couponCode: string = "";
  ubxtModalOpen: boolean = false;
  verifyEmailDialog: boolean = false;
  totalPortfolioEvolution: PortfolioEvolution = null;
  walletSortField: string = "amount";
  walletSortType: string = "down";

  dropdownBasicValue: any = { value: 1, label: "Sort by Amount", headerLabel: true };
  dropdownBasicData: any = [
    { sortField: "amount", sortType: "down", label: "Sort by Amount", headerLabel: true },
    { sortField: "name", sortType: "up", label: "Sort by Name" },
  ];

  tabs: Tab[] = [
    { value: "Wallets", componentName: "WalletsTab" },
    { value: "My Bots", componentName: "MyBotsTab" },
    { value: "Marketplace", componentName: "MarketplaceTab" },
  ];

  tutorialModalOpen: boolean = false;

  comingsoonModalOpen: boolean = false;

  lineChartLabels: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* HOOKS */
  created() {
    this.showTutorial();
    this.fetchAlgoBotsAction();
    this.updateTotalPortfolioEvolution();
  }

  get myBalance() {
    return calculateTotalBalance(this.cexBalance, this.getNetworth, this.favoriteCurrency);
  }

  get myWalletsData() {
    const dexWallets = this.getWallets
      .filter(({ address }) => !!address)
      .map((wallet) => {
        const quote = calculateTotalAssets(this.getTokensData, this.getProjectsDataList, wallet);
        const balance = this.favoriteCurrency.label === "USD" ? quote : quote * this.getUsdConversionRates.eur;
        return {
          name: wallet.label,
          total: {
            base: `${(quote * this.getUsdConversionRates.btc).toFixed(8)} BTC`,
            favorite: `${balance.toFixed(2)} ${this.favoriteCurrency.label}`,
          },
        };
      });
    return [...this.userWallets, ...dexWallets];
  }

  @Watch("portfolioEvolutionData")
  @Watch("getPortfolioEvolution")
  updateTotalPortfolioEvolution() {
    if (!this.getPortfolioEvolution) {
      this.totalPortfolioEvolution = cloneDeep(this.portfolioEvolutionData);
    } else if (!this.portfolioEvolutionData) {
      this.totalPortfolioEvolution = cloneDeep(this.getPortfolioEvolution);
    } else {
      const clonedEvolution: PortfolioEvolution = cloneDeep(this.portfolioEvolutionData);

      const datasets = clonedEvolution.datasets.map((dataset, i) => {
        return {
          ...dataset,
          data: dataset.data.map((cexNetworth, j) => {
            let index: number = -1;
            this.getPortfolioEvolution.labels.find((label, p) => {
              if (moment(clonedEvolution.labels[j]).isSame(moment(label), "day")) {
                index = p;
                return true;
              }
              return false;
            });

            return (parseFloat(cexNetworth) + (index >= 0 ? parseFloat(this.getPortfolioEvolution.datasets[i].data[index]) : 0)).toString();
          }),
        };
      });

      this.totalPortfolioEvolution = {
        labels: clonedEvolution.labels,
        datasets,
      };
    }
  }

  /* METHODS */
  showTutorial() {
    const shown = localStorage.getItem(`tuto_${this.user.email}`);

    // whether show tutorial modal
    if (!shown) {
      this.tutorialModalOpen = true;
      localStorage.setItem(`tuto_${this.user.email}`, this.user.email);
    }
  }

  handleComingSoonModal() {
    this.comingsoonModalOpen = !this.comingsoonModalOpen;
  }

  validateCoupon() {
    this.$http
      .post(`/api/coupons/activate/unique/${this.couponCode}`)
      .then(async () => {
        await this.fetchUserCoupons();
        this.$notify({ text: "Your coupon has been successfully applied!", type: "success" });
        this.couponDialog = false;
      })
      .catch(({ response }: AxiosError) => {
        if (response.data.message) {
          this.$notify({ text: response.data.message, type: "error" });
        }
      });
  }

  verifyEmail() {
    this.sendVerifyEmailLink({ email: this.user.email })
      .then(() => {
        this.$notify({ text: "A new verify email has just been sent to you!", type: "success" });
        this.verifyEmailDialog = false;
      })
      .catch(({ response }: AxiosError) => {
        this.$notify({ text: response.data.message, type: "error" });
        this.verifyEmailDialog = false;
      });
  }
  handleDropDownChange(sortField: string, sortType: string) {
    this.walletSortField = sortField;
    this.walletSortType = sortType;
  }
}
</script>

<style lang="scss" scoped>
.start-trade-btn {
  min-width: 100px;
}
.market-value-widget {
  height: 146px;
  @media (max-width: 1024px) {
    height: 120px;
  }
  @media (max-width: 767px) {
    height: 73px;
  }
}

.my-wallets {
  &__inner {
    max-width: 260px;
    height: 370px;
    @media (max-width: 1279px) {
      max-width: 240px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full;
      max-width: 38%;
      height: 295px;
    }
    @media (max-width: 900px) {
      @apply max-w-full w-1/2;
    }
  }
}

.my-bot {
  &__inner {
    max-width: 280px;
    height: 370px;
    @media (max-width: 1279px) {
      max-width: 260px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full;
      max-width: 34%;
      height: 295px;
    }
    @media (max-width: 900px) {
      @apply max-w-full w-1/2;
    }
  }
}

.portfolio-evolution {
  &__wrap {
    height: 370px;
    @media (max-width: 1024px) {
      height: 245px;
    }
  }
}

.staking {
  &__inner {
    max-width: 260px;
    height: 225px;
    @media (max-width: 1389px) {
      height: 240px;
    }
    @media (max-width: 1279px) {
      height: 230px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full;
      max-width: 34%;
      height: 295px;
    }
    @media (max-width: 900px) {
      @apply w-full max-w-full;
      height: auto;
    }
  }
}

.marketplace {
  &__inner {
    height: 225px;
    @media (max-width: 1389px) {
      height: 240px;
    }
    @media (max-width: 1279px) {
      height: 230px;
    }
    @media (max-width: 1024px) {
      height: auto;
    }
  }
}

.blured.home-disable {
  &:after {
    background: rgba(0, 0, 0, 0.4);
  }
}

.add-coupon-modal {
  &__input {
    max-width: 270px;
  }

  &__btn {
    max-width: 124px;
  }
}

.tutorial {
  &__icon-wrap {
    &:hover {
      .icon-tutorial {
        @apply text-white;
      }
    }
  }
}
</style>
