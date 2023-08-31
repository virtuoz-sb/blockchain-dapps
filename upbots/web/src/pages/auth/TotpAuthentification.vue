<template>
  <AuthLayout title="Two Factor Authentication" subtitle="Submit your code from Authenticator app">
    <ValidationObserver ref="form">
      <router-link to="/login" class="flex items-center mb-20">
        <i class="icon-long-arrow mr-12 text-white text-sm font-semibold" />
        <span class="text-white text-sm">Back to Log In</span>
      </router-link>

      <label class="mb-30">
        <span class="flex text-grey-cl-600 text-sm mb-6">Code given by Authenticator App</span>
        <app-input
          v-model="code"
          name="Code"
          rules="required"
          placeholder="Enter your code"
          custom-class="border border-solid border-san-juan"
          text-color="text-white"
          v-bind:isFocused="true"
        />
      </label>

      <p v-if="error" class="text-center text-red-orange mb-10" @click="error = ''">{{ error }}</p>

      <AppButton type="light-green" class="w-full mb-14" :disabled="isLoading" @click="verify">Sign In</AppButton>

      <p class="text-white text-center text-md">
        Don’t have an account?
        <router-link to="/register" class="text-puerto-rico">Sign Up</router-link>
      </p>
    </ValidationObserver>
  </AuthLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { AxiosError } from "axios";
import { State, namespace } from "vuex-class";

const fromAuth = namespace("authModule");

import AuthLayout from "@/views/AuthLayout.vue";

@Component({ name: "TotpAuthentification", components: { AuthLayout } })
export default class TotpAuthentification extends Vue {
  /* VUEX */
  @fromAuth.Getter get2FASecret!: any;
  @fromAuth.Getter is2FAEnabled!: any;

  @fromAuth.Action deactivate2FAAction!: Function;
  @fromAuth.Action verify2FAAction!: Function;
  @fromAuth.Action get2FASecretAction!: Function;

  @State isLoading: boolean;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  code = "";
  error = "";

  /* WATCHER */
  @Watch("code")
  inputVerify() {
    if (this.code.length === 6) {
      this.verify();
    }
  }

  /* METHODS */
  verify() {
    this.$refs.form.validate().then((valid: Boolean) => {
      if (valid) {
        this.verify2FAAction({ userToken: this.code })
          .then((res: boolean) => {
            this.$router.push("/");
          })
          .catch(({ response: { data } }: AxiosError) => {
            this.error = data.message;
            // GA Event
            this.$gtag.event(`${data.message}`, { event_category: "error", event_label: "2fa" });
          });
      }
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/app-input/_input-auth.scss";
</style>
