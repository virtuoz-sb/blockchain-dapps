<template>
  <AuthLayout title="Enter new password" subtitle="Create your password using 8 characters or more">
    <ValidationObserver ref="form">
      <form @submit.prevent="resetPassword">
        <router-link to="/login" class="flex items-center mb-20">
          <i class="icon-long-arrow text-white text-sm font-semibold mr-12" />
          <span class="text-white text-sm">Back to Sign In</span>
        </router-link>

        <label>
          <span class="flex text-grey-cl-600 text-sm mb-6">New password</span>
          <AppInput
            v-model="user.newPassword"
            name="Password"
            rules="required|validate_pass"
            placeholder="Enter your new password"
            :type="isPasswordVisible ? 'text' : 'password'"
            class="mb-20"
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

        <label>
          <span class="flex text-grey-cl-600 text-sm mb-6">Confirm password</span>
          <AppInput
            v-model="user.repeatNewPassword"
            name="Confirm password"
            rules="required|validate_pass|equal:@Password"
            placeholder="Confirm your new password"
            :type="isConfirmPasswordVisible ? 'text' : 'password'"
            class="mb-30"
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

        <p v-if="error" class="text-center text-red-orange mb-10">{{ error }}</p>

        <AppButton type="light-green" class="w-full mb-14" :disabled="!this.$route.query.code">Reset password</AppButton>
      </form>
    </ValidationObserver>
  </AuthLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AxiosError } from "axios";
import { namespace } from "vuex-class";

const fromAuth = namespace("authModule"); // matches the module name

import AuthLayout from "@/views/AuthLayout.vue";

@Component({ name: "PasswordReset", components: { AuthLayout } })
export default class PasswordReset extends Vue {
  /* VUEX */
  @fromAuth.State private loading!: Boolean;
  @fromAuth.Action resetPasswordAction: Function;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  user = {
    newPassword: "",
    repeatNewPassword: "",
  };
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  isRememberMe = true;
  error = "";

  /* METHODS */
  resetPassword() {
    this.$refs.form.validate().then((valid: Boolean) => {
      if (valid) {
        this.resetPasswordAction({ code: this.$route.query.code, ...this.user })
          .then(() => this.$router.push("/login"))
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

.icon-eye {
  top: 10px;
  right: 13px;
}
</style>
