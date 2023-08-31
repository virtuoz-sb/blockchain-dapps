<template>
  <AuthLayout title="Login to your account" subtitle="Please enter your email and password for sign in">
    <ValidationObserver ref="form" tag="div">
      <form @submit.prevent="login">
        <label>
          <span class="flex text-grey-cl-600 text-sm mb-6">Email address</span>
          <AppInput
            v-model="user.email"
            name="Email"
            type="email"
            rules="email|required"
            placeholder="Email"
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
            rules="required"
            placeholder="Enter your password"
            :type="isPasswordVisible ? 'text' : 'password'"
            class="mb-12"
            custom-class="border border-solid border-san-juan pr-50"
            text-color="text-white"
          >
            <i
              class="icon-eye absolute text-xl1 cursor-pointer"
              :class="[isPasswordVisible ? 'text-white' : 'text-white opacity-50']"
              @click="isPasswordVisible = !isPasswordVisible"
            />
          </AppInput>
        </label>

        <div class="flex justify-between text-sm mb-50 md:mb-40">
          <AppCheckbox v-model="isRememberMe">Remember me</AppCheckbox>
          <router-link to="/recover-password" class="text-white">Forgot password?</router-link>
        </div>

        <p v-if="error" class="text-center text-red-orange mb-10" @click="error = ''">{{ error }}</p>

        <AppButton type="light-green" class="w-full mb-14" :disabled="isLoading">Log In</AppButton>

        <p class="text-white text-center text-md">
          Don’t have an account?
          <router-link to="/register" class="text-puerto-rico">Sign Up</router-link>
        </p>
      </form>
    </ValidationObserver>

    <AppDivider class="bg-grey-cl-400 mt-15 mb-30" />

    <div class="flex flex-col sm:flex-row justify-between px-5">
      <button class="google-btn relative flex items-center justify-center rounded-8 px-30 py-12 mb-20 sm:mb-0" @click="signin('google')">
        <span class="icon-google absolute left-11 text-white text-xl" />
        <span class="text-white text-center leading-xs">Login with Google</span>
      </button>

      <button class="facebook-btn relative flex items-center justify-center rounded-8 px-30 py-12" @click="signin('facebook')">
        <span class="icon-facebook-short absolute left-11 text-white text-xl" />
        <span class="text-white leading-xs">Login with Facebook</span>
      </button>
    </div>
  </AuthLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AxiosError } from "axios";
import { State, Getter, namespace } from "vuex-class";

const fromAuth = namespace("authModule"); // matches the module name
const ubxtWallet = namespace("ubxtWalletModule");

import AuthLayout from "@/views/AuthLayout.vue";

@Component({ name: "Login", components: { AuthLayout } })
export default class Login extends Vue {
  /* VUEX */
  @State isLoading: boolean;
  @Getter getEnablePerfFees: boolean;
  @fromAuth.Getter private getUserIsAuthenticated!: Boolean;
  @fromAuth.Action loginRequestAction: Function;
  @fromAuth.Mutation logout: Function;
  @fromAuth.Mutation setJWT: Function;
  @fromAuth.Getter getJWT: Function;
  @fromAuth.Action getInfoUser: Function;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  user = {
    email: "",
    password: "",
  };
  isPasswordVisible = false;
  isRememberMe = false;
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
      this.checkRememberMe();
    }
  }

  mounted() {
    this.useRememberMeInfo();
  }

  /* METHODS */
  login() {
    // GA Event
    this.$gtag.event("login", { event_category: "engagement", event_label: "method" });

    this.$refs.form.validate().then((valid: Boolean) => {
      if (valid) {
        this.loginRequestAction(this.user)
          .then((res: any) => {
            if (this.isRememberMe) {
              this.saveRememberMeInfo();
            }
            if (res.totpAuth) this.$router.push("totp-auth");
            else this.$router.push("/");
          })
          .catch(({ response: { data } }: AxiosError) => {
            this.error = data.message;
            // GA Event
            this.$gtag.event(`${data.message}`, { event_category: "error", event_label: "login" });
          });
      }
    });
  }

  signin(provider: string) {
    const state = this.getEnablePerfFees ? "?state=beta" : "";
    location.replace(`${process.env.VUE_APP_ROOT_API}/api/auth/${provider}${state}`);
  }

  saveRememberMeInfo() {
    localStorage.setItem("upbotsRememberMe", this.user.email);
  }

  useRememberMeInfo() {
    const upbotsRememberMe = localStorage.getItem("upbotsRememberMe");
    this.user.email = upbotsRememberMe;
  }

  checkRememberMe() {
    const isRememberMe = localStorage.getItem("upbotsRememberMe");

    this.isRememberMe = !!isRememberMe || false;
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
