<template>
  <AuthLayout title="Ready to get started?" subtitle="Create an account to start your trading adventure">
    <ValidationObserver ref="form" tag="div" class="mb-25">
      <form @submit.prevent="register">
        <router-link to="/login" class="flex items-center">
          <i class="icon-long-arrow text-white text-sm font-semibold mr-12" />
          <span class="text-white text-sm">Back to Sign In</span>
        </router-link>

        <label class="mt-20">
          <span class="flex text-grey-cl-600 text-sm mb-6">Email address</span>
          <AppInput
            v-model="user.email"
            name="Email"
            rules="email|required"
            placeholder="Email"
            type="email"
            class="mb-20"
            custom-class="border border-solid border-san-juan"
            text-color="text-white"
          />
        </label>

        <label>
          <span class="flex text-grey-cl-600 text-sm mb-6">First name</span>
          <AppInput
            v-model="user.firstname"
            name="FirstName"
            rules="required"
            placeholder="Firstname"
            class="mb-20"
            custom-class="border border-solid border-san-juan"
            text-color="text-white"
          />
        </label>

        <label>
          <span class="flex text-grey-cl-600 text-sm mb-6">Password</span>
          <AppInput
            v-model="user.password"
            name="Password"
            rules="required|validate_pass"
            placeholder="Enter your password"
            :type="isPasswordVisible ? 'text' : 'password'"
            class="mb-20"
            custom-class="border border-solid border-san-juan pr-50"
            text-color="text-white"
          >
            <i
              class="icon-eye absolute top-17 sm:top-11 right-17 text-xl1 cursor-pointer"
              :class="[isPasswordVisible ? 'text-white' : 'text-white opacity-50']"
              @click="isPasswordVisible = !isPasswordVisible"
            />
          </AppInput>
        </label>

        <label>
          <span class="flex text-grey-cl-600 text-sm mb-6">Confirm password</span>
          <AppInput
            v-model="user.password2"
            name="Confirm password"
            rules="required|validate_pass|equal:@Password"
            placeholder="Confirm your password"
            :type="isConfirmPasswordVisible ? 'text' : 'password'"
            class="mb-20"
            custom-class="border border-solid border-san-juan pr-50"
            text-color="text-white"
          >
            <i
              class="icon-eye absolute text-xl1 cursor-pointer"
              :class="[isConfirmPasswordVisible ? 'text-white' : 'text-white opacity-50']"
              @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
            />
          </AppInput>
        </label>
        <label class="mt-18 mb-18">
          <app-checkbox v-model="getMarketingUpdates" class="mb-4" @click="onUpdateChanged()">
            I would love to receive early giveaways, contests, free NFTs, airdrop info, and other exclusive email updates from UpBots. (We
            will never share your info with third parties)
          </app-checkbox>
        </label>

        <VueRecaptcha
          ref="recaptcha"
          size="mini"
          @verify="onVerify"
          @expired="onExpired"
          theme="dark"
          :sitekey="captchaSiteKey"
          :loadRecaptchaScript="true"
          language="en"
          class="mb-20"
        />

        <p v-if="error" class="text-center text-red-orange mb-10" @click="error = ''">{{ error }}</p>

        <div class="flex justify-center text-grey-cl-600 text-xs mb-20 text-justify">
          <span>
            By continuing, you agree to Upbots's
            <a href="/terms-conditions" target="_blank" class="text-white">Term of Service</a>
            <span> and </span>
            <a href="/privacy-policy" target="_blank" class="text-white">Privacy Policy</a>
          </span>
        </div>

        <AppButton type="light-green" class="w-full mb-14" :disabled="isLoading">Create an account</AppButton>

        <p class="text-white text-center text-md">
          Already have an account?
          <router-link to="/login" class="text-puerto-rico">Sign In</router-link>
        </p>
      </form>
    </ValidationObserver>
    <AppDivider class="bg-grey-cl-400 mt-15 mb-30" />

    <div class="flex flex-col sm:flex-row justify-between px-5">
      <button class="google-btn relative flex items-center justify-center rounded-8 px-30 py-12 mb-20 sm:mb-0" @click="signup('google')">
        <span class="icon-google absolute left-11 text-white text-xl" />
        <span class="text-white text-center leading-xs">Register with Google</span>
      </button>

      <button class="facebook-btn relative flex items-center justify-center rounded-8 px-30 py-12" @click="signup('facebook')">
        <span class="icon-facebook-short absolute left-11 text-white text-xl" />
        <span class="text-white leading-xs">Register with Facebook</span>
      </button>
    </div>
  </AuthLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AxiosError } from "axios";
import { State, Getter, namespace } from "vuex-class";
import { ActiveCampaignUser } from "@/store/active-campaign/types";

const fromAuth = namespace("authModule"); // matches the module name
const activeCampaign = namespace("activeCampaignModule");

import AuthLayout from "@/views/AuthLayout.vue";
import VueRecaptcha from "vue-recaptcha";

@Component({ name: "Register", components: { VueRecaptcha, AuthLayout } })
export default class Register extends Vue {
  /* VUEX */
  @State isLoading: boolean;
  @Getter getEnablePerfFees: boolean;
  @fromAuth.Getter private getUserIsAuthenticated!: Boolean;
  @fromAuth.Action registerRequestAction: Function;
  @fromAuth.Mutation logout: Function;
  @fromAuth.Mutation setJWT: Function;
  @fromAuth.Getter getJWT: Function;
  @fromAuth.Action getInfoUser: Function;
  @activeCampaign.Action addUserToUserList: Function;
  @activeCampaign.Action addUserToMasterList: Function;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  user = {
    email: "",
    firstname: "",
    password: "",
    password2: "",
  };
  getMarketingUpdates = true;
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  captchaSiteKey: string = process.env.VUE_APP_RECAPTCHA_SITE_KEY;
  captchaToken = "";
  error = "";

  /* HOOKS */
  created() {
    if (!(!this.$route.query.token || this.$route.query.token === "false")) {
      this.setJWT({ jwt: this.$route.query.token });
      if (!(!this.$route.query.totpRequired || this.$route.query.totpRequired === "false")) {
        this.$router.push("totp-auth");
      } else {
        this.getInfoUser()
          .then((res: any) => {
            this.$router.push("/");
          })
          .catch(({ response: { data } }: AxiosError) => {
            this.logout();
          });
      }
    } else {
      this.logout();
    }
  }

  /* METHODS */
  onVerify(response: string) {
    this.captchaToken = response;
  }

  signup(provider: string) {
    const state = this.getEnablePerfFees ? "?state=beta" : "";
    location.replace(`${process.env.VUE_APP_ROOT_API}/api/auth/${provider}${state}`);
  }

  onExpired() {
    this.captchaToken = null;
  }
  onUpdateChanged() {
    this.getMarketingUpdates = !this.getMarketingUpdates;
  }
  async addUserToActiveCampaignLists() {
    const userInfo: ActiveCampaignUser = {
      email: this.user.email,
      firstName: this.user.firstname,
      lastName: null,
      fullName: null,
      phoneNumber: null,
      tags: null,
    };
    await this.addUserToUserList(userInfo);
    if (this.getMarketingUpdates) {
      await this.addUserToMasterList(userInfo);
    }
  }

  register() {
    // GA Event
    this.$gtag.event("sign_up", { event_category: "engagement", event_label: "method" });
    this.$refs.form.validate().then((valid: Boolean) => {
      if (valid && this.captchaToken) {
        this.registerRequestAction({ captcha: this.captchaToken, ...this.user })
          .then(() => {
            this.$router.push("/");
            this.addUserToActiveCampaignLists();
          })
          .catch(({ response: { data } }: AxiosError) => {
            this.error = data.message;
            // GA Event
            this.$gtag.event(`${data.message}`, { event_category: "error", event_label: "register" });
          });
      }
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/app-input/_input-auth.scss";

.icon-eye {
  top: 10px;
  right: 13px;
}

.google-btn,
.facebook-btn {
  min-width: 190px;
  transition: all 0.2s linear;
}

.google-btn {
  background-color: #df4930;
  &:hover {
    background-color: #eb371b;
  }
  &:focus {
    background-color: #973727;
  }
}

.facebook-btn {
  background-color: #507cc0;
  &:hover {
    background-color: #366dc2;
  }
  &:focus {
    background-color: #45679b;
  }
}
</style>
