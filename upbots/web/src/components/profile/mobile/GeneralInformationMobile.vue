<template>
  <div class="flex flex-col p-20 overflow-y-auto custom-scrollbar">
    <!-- PROFILE PHOTO -->
    <ProfilePhoto />

    <!-- GENERAL INFORMATION -->
    <GeneralInformation />

    <!-- SETTINGS -->
    <Card
      class="settings__container flex flex-col flex-shrink-0 w-full flex-1 bg-mirage rounded-3 mb-20"
      header-classes="flex items-center"
    >
      <template slot="header-left">
        <span class="leading-md text-white">Settings</span>
      </template>

      <Settings slot="content" />
    </Card>

    <!-- 2FA -->
    <Card
      class="two-fa-auth__container flex flex-col flex-shrink-0 w-full flex-1 bg-mirage rounded-3 mb-20"
      header-classes="flex items-center"
    >
      <template slot="header-left">
        <span class="leading-md text-white">Two-factor Authentication</span>
      </template>

      <TwoFactorAuthentication slot="content" class="h-full" @click="$emit('open-modal')" />
    </Card>

    <!-- REFERRAL -->
    <Card
      class="referral__container flex flex-col flex-shrink-0 w-full flex-1 bg-mirage rounded-3 mb-20"
      header-classes="flex items-center justify-between"
    >
      <template slot="header-left">
        <span class="leading-md text-white">Referral</span>
      </template>
      <template slot="header-right">
        <span class="text-sm leading-xs text-blue-cl-400">Coming Soon</span>
      </template>

      <Referral slot="content" class="h-full" />
    </Card>

    <!-- WALLETS -->
    <Card class="wallets__container flex flex-col flex-shrink-0 w-full flex-1 bg-mirage rounded-3" header-classes="flex items-center">
      <template slot="header-left">
        <span class="leading-md text-white">Wallets</span>
        <img src="@/assets/icons/wallet-icon.svg" alt="wallet" class="wallets__header-img ml-5" />
      </template>

      <Wallets slot="content" />
    </Card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ProfilePhoto from "@/components/profile/ProfilePhoto.vue";
import GeneralInformation from "@/components/profile/GeneralInformation.vue";
import Settings from "@/components/profile/Settings.vue";
import TwoFactorAuthentication from "@/components/profile/TwoFactorAuthentication.vue";
import Referral from "@/components/profile/Referral.vue";
import Wallets from "@/components/profile/Wallets.vue";
import PortfolioBalance from "@/components/portfolio/PortfolioBalance.vue";

@Component({
  name: "GeneralInformationMobile",
  components: { ProfilePhoto, GeneralInformation, Settings, TwoFactorAuthentication, Referral, Wallets, PortfolioBalance },
})
export default class GeneralInformationMobile extends Vue {}
</script>

<style lang="scss" scoped>
.my-balance {
  &__container {
    min-height: 155px;
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
    min-height: 146px;
  }
}

.wallets {
  &__container {
    min-height: 178px;
  }
  &__header-img {
    width: 25px;
  }
}
</style>
