<template>
  <AuthLayout>
    <div class="flex flex-col justify-center h-full">
      <h2 class="text-30 text-white font-medium text-center mb-10">
        {{ isSuccess ? "Woohoo, your email has been validated!" : "Opsss, Something went wrong..." }}
      </h2>

      <p v-if="isSuccess" class="account-activation__subtitle flex flex-col text-sm leading-xs text-white text-center mb-35">
        That's all good, now you can enter UpBots and find out what we have to offer you. Are you ready?
      </p>

      <p v-else class="account-activation__subtitle flex flex-col text-sm leading-xs text-white text-center mb-35">
        It seems that the link is expired or the token is invalid, don't worry, you can request a new one on the homepage of the dashboard
        by clicking on the 'Verify Email' button, but if it doesn't work contact us.
      </p>

      <AppButton v-if="isSuccess" type="light-green" class="w-full mb-14" :disabled="!$route.query.token" @click="$router.push('/login')">
        Go to login page
      </AppButton>

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

import AuthLayout from "@/views/AuthLayout.vue";

@Component({ name: "AccountActivation", components: { AuthLayout } })
export default class AccountActivation extends Vue {
  /* DATA */
  isSuccess: boolean = false;

  /* HOOKS */
  created() {
    this.accountVerify();
  }

  /* METHODS */
  accountVerify() {
    if (this.$route.query.token) {
      this.$http
        .post<any>(`/api/account/verify`, { code: this.$route.query.token })
        .then(() => {
          this.isSuccess = true;
        })
        .catch(({ response }: AxiosError) => {
          this.isSuccess = false;
        });
    } else {
      this.$notify({ text: "Token does not exist", type: "error" });
      this.$router.push("/login");
    }
  }
}
</script>

<style lang="postcss" scoped>
.account-activation {
  @media (max-width: 767px) {
    &__subtitle {
      max-width: 246px;
      @apply mx-auto text-center;
    }
  }
}
</style>
