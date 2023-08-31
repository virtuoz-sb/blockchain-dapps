<template>
  <AuthLayout
    :title="isDone ? '' : 'Lost your password?'"
    :subtitle="isDone ? '' : 'You will receive a link to create a new password via email'"
  >
    <ValidationObserver v-if="!isDone" ref="form" tag="div">
      <form @submit.prevent="recoverPassword">
        <router-link to="/login" class="flex items-center mb-20">
          <i class="icon-long-arrow text-white text-sm font-semibold mr-12" />
          <span class="text-white text-sm">Back to Sign In</span>
        </router-link>

        <label class="mb-30">
          <span class="flex text-grey-cl-600 text-sm mb-6">Email address</span>
          <AppInput
            v-model="emailUsername"
            name="Email or Username"
            rules="required"
            placeholder="Email address or user name"
            custom-class="border border-solid border-san-juan"
            text-color="text-white"
          />
        </label>

        <p v-if="error" class="text-center text-red-orange mb-10" @click="error = ''">{{ error }}</p>

        <AppButton type="light-green" class="w-full mb-14" :disabled="loading">Reset my password</AppButton>

        <p class="text-white text-center text-md">
          Don’t have an account?
          <router-link to="/register" class="text-puerto-rico">Sign Up</router-link>
        </p>
      </form>
    </ValidationObserver>

    <div v-else>
      <h2 class="text-xxl2 text-white font-medium text-center mb-10">Done!</h2>
      <p class="text-sm text-white text-center mb-30">
        Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
      </p>

      <p v-if="error" class="text-center text-red-orange mb-10" @click="error = ''">{{ error }}</p>

      <router-link to="/login">
        <AppButton type="light-green" class="w-full mb-14" :disabled="loading">Back to sign in</AppButton>
      </router-link>

      <p class="text-white text-center text-md">
        Don’t have an account?
        <router-link to="/register" class="text-puerto-rico">Sign Up</router-link>
      </p>
    </div>
  </AuthLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AxiosError } from "axios";
import { namespace } from "vuex-class";

const fromAuth = namespace("authModule"); // matches the module name

import AuthLayout from "@/views/AuthLayout.vue";

@Component({ name: "PasswordRecover", components: { AuthLayout } })
export default class PasswordRecover extends Vue {
  /* VUEX */
  @fromAuth.State private loading!: Boolean;
  @fromAuth.Action recoverPasswordRequestAction: Function;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  emailUsername = "";
  isDone = false;
  error = "";

  /* METHODS */
  recoverPassword() {
    this.$refs.form.validate().then((valid: Boolean) => {
      if (valid) {
        this.recoverPasswordRequestAction({ email: this.emailUsername })
          .then(() => (this.isDone = true))
          .catch(({ response: { data } }: AxiosError) => {
            this.error = data.message;
          });
      }
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/app-input/_input-auth.scss";
</style>
