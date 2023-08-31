<template>
  <GeneralLayout title="Profile" content-custom-classes="md:flex-col overflow-y-auto custom-scrollbar">
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full h-auto relative overflow-y-auto custom-scrollbar">
      <div class="flex w-full overflow-y-auto custom-scrollbar">
        <div class="profile__left-side--container flex flex-col justify-between self-start h-auto w-full">
          <!-- PROFILE PHOTO -->
          <Card class="flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3 mb-15 lg:mb-24 xl:mb-40" header-classes="flex items-center">
            <template slot="header-left">
              <span class="leading-md text-iceberg">Profile Picture</span>
            </template>

            <ProfilePhoto slot="content" />
          </Card>

          <!-- GENERAL INFORMATION -->
          <Card
            class="general-information__container flex flex-col flex-shrink-0 w-full bg-dark-200 rounded-3"
            header-classes="flex items-center"
          >
            <template slot="header-left">
              <span class="leading-md text-iceberg">General Information</span>
            </template>

            <GeneralInformation slot="content" />
          </Card>
        </div>

        <div class="flex flex-col flex-1 w-full h-full px-15 lg:px-24 xl:px-40">
          <!-- PROFILE INFORMATION -->
          <Card
            class="profile__center--container flex flex-col flex-shrink-0 w-full flex-1 bg-dark-200 rounded-3"
            header-classes="flex items-center"
          >
            <template slot="header-left">
              <span class="leading-md text-iceberg">Profile Information</span>
            </template>

            <ProfileInformation slot="content" />
          </Card>
        </div>

        <div class="profile__right-side--container flex flex-col self-start w-full">
          <!-- SETTINGS -->
          <Card
            class="settings__container flex flex-col flex-shrink-0 w-full flex-1 bg-dark-200 rounded-3 mb-15 lg:mb-24 xl:mb-40"
            header-classes="flex items-center"
          >
            <template slot="header-left">
              <span class="leading-md text-iceberg">Settings</span>
            </template>

            <Settings slot="content" />
          </Card>

          <!-- 2FA -->
          <Card
            class="two-fa-auth__container flex flex-col flex-shrink-0 w-full flex-1 bg-dark-200 rounded-3 mb-15 lg:mb-24 xl:mb-40"
            header-classes="flex items-center"
          >
            <template slot="header-left">
              <span class="leading-md text-iceberg">Two-factor Authentication</span>
            </template>

            <TwoFactorAuthentication slot="content" @click="openModal" />
          </Card>

          <!-- REFERRAL -->
          <Card
            class="referral__container flex flex-col flex-shrink-0 w-full flex-1 bg-dark-200 rounded-3 mb-15 lg:mb-24 xl:mb-40"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <span class="leading-md text-iceberg">Referral</span>
            </template>
            <template slot="header-right">
              <span class="text-sm leading-xs text-astral">Coming Soon</span>
            </template>

            <Referral slot="content" />
          </Card>

          <!-- WALLETS -->
          <Card
            class="wallets__container flex flex-col flex-shrink-0 w-full flex-1 bg-dark-200 rounded-3"
            header-classes="flex items-center"
          >
            <template slot="header-left">
              <span class="leading-md text-iceberg">Wallets</span>
              <img src="@/assets/icons/wallet-icon.svg" alt="wallet" class="wallets__header-img ml-5" />
            </template>

            <Wallets slot="content" />
          </Card>
        </div>
      </div>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="!isComingSoon" class="w-full flex flex-col relative bg-dark-200 rounded-t-15">
        <AppTabs :tabs="tabs" shrink>
          <template v-slot="{ currentTab }">
            <!-- GENERAL INFORMATION -->
            <template v-if="currentTab.componentName === 'GeneralInformationMobile'">
              <GeneralInformationMobile @open-modal="openModal" />
            </template>

            <!-- PROFILE INFORMATION -->
            <template v-if="currentTab.componentName === 'ProfileInformation'">
              <ProfileInformation />
            </template>
          </template>
        </AppTabs>
      </div>

      <!-- COMING SOON -->
      <div v-if="isComingSoon" class="w-full flex flex-col">
        <ComingSoonWithoutDesign />
      </div>
    </template>

    <!-- PROFILE INFORMATION MODAL -->
    <AppModal v-model="isOpenModal" persistent max-width="585px">
      <TwoFactorAuthenticationModal :value.sync="isOpenModal" class="py-40 overflow-y-auto" />
    </AppModal>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Tab } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";

const user = namespace("userModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import ProfilePhoto from "@/components/profile/ProfilePhoto.vue";
import ProfileInformation from "@/components/profile/ProfileInformation.vue";
import GeneralInformation from "@/components/profile/GeneralInformation.vue";
import GeneralInformationMobile from "@/components/profile/mobile/GeneralInformationMobile.vue";
import Settings from "@/components/profile/Settings.vue";
import TwoFactorAuthentication from "@/components/profile/TwoFactorAuthentication.vue";
import Referral from "@/components/profile/Referral.vue";
import Wallets from "@/components/profile/Wallets.vue";
import PortfolioBalance from "@/components/portfolio/PortfolioBalance.vue";
import TwoFactorAuthenticationModal from "@/components/profile/TwoFactorAuthenticationModal.vue";

@Component({
  name: "Profile",
  components: {
    GeneralLayout,
    ProfilePhoto,
    ProfileInformation,
    GeneralInformation,
    GeneralInformationMobile,
    Settings,
    TwoFactorAuthentication,
    Referral,
    Wallets,
    PortfolioBalance,
    TwoFactorAuthenticationModal,
  },
  mixins: [ComingSoon],
})
export default class Profile extends Vue {
  /* DATA */
  isOpenModal: boolean = false;

  tabs: Tab[] = [
    { value: "General Information", componentName: "GeneralInformationMobile" },
    { value: "Profile Information", componentName: "ProfileInformation" },
  ];

  /* METHODS */
  openModal() {
    this.isOpenModal = !this.isOpenModal;
  }
}
</script>

<style lang="scss" scoped>
.profile {
  &__left-side {
    &--container {
      max-width: 280px;
    }
  }
  &__center {
    &--container {
      min-height: 767px;
    }
  }
  &__right-side {
    &--container {
      max-width: 270px;
    }
  }
  @media (max-width: 1279px) {
    &__left-side {
      &--container {
        max-width: 240px;
      }
    }
    &__right-side {
      &--container {
        max-width: 240px;
      }
    }
  }
  @media (max-width: 998px) {
    &__left-side {
      &--container {
        max-width: 200px;
      }
    }
    &__right-side {
      &--container {
        max-width: 180px;
      }
    }
  }
}

.setting {
  &__container {
    min-height: 84px;
  }
}

.two-fa-auth {
  &__container {
    min-height: 130px;
  }
}

.referral {
  &__container {
    min-height: 172px;
  }
}

.wallets {
  &__container {
    min-height: 190px;
  }
  &__header-img {
    width: 25px;
  }
}

.general-information {
  &__container {
    min-height: 427px;
  }
}
</style>
