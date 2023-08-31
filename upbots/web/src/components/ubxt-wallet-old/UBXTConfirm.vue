<template>
  <div>
    <h1 class="text-xl text-white">In order to generate wallets:</h1>
    <div class="flex flex-col my-10 text-md w-150 text-center">
      <span class="mb-10 cursor-pointer" @click="openVerifyEmail">
        <i v-if="isEmail" class="icon-check text-green-cl-100 text-md leading-xs mr-6" />
        <span class="text-blue-cl-100">Verify your email</span>
      </span>
      <span class="text-blue-cl-100 cursor-pointer" @click="enable2FA">
        <i v-if="isTwoFactor" class="icon-check text-green-cl-100 text-md leading-xs mr-6" />
        <span class="text-blue-cl-100">Enable 2FA</span>
      </span>
    </div>

    <!-- VERIFY EMAIL MODAL -->
    <AppModal v-model="verifyEmailDialog" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="w-full text-xxl text-white text-center mb-20">Verify your email</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 row-gap-20 md:row-gap-0 md:col-gap-20 items-center w-full md:w-auto">
            <AppButton type="grey" class="w-full min-w-150" @click="verifyEmailDialog = false">Close</AppButton>
            <AppButton type="light-green" class="px-20 min-w-150" @click="verifyEmail">Verify</AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { AxiosError } from "axios";

const auth = namespace("authModule");

@Component({
  name: "UBXTConfirm",
})
export default class UBXTWallet extends Vue {
  /* VUEX */
  @auth.Action sendVerifyEmailLink: Function;
  @auth.State user!: any;

  /* PROPS */
  @Prop({ required: true }) isEmail: boolean;
  @Prop({ required: true }) isTwoFactor: boolean;

  /* DATA */
  verifyEmailDialog: boolean = false;

  openVerifyEmail() {
    if (this.isEmail) return;

    this.verifyEmailDialog = true;
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

  enable2FA() {
    if (this.isTwoFactor) return;

    this.$router.push("/profile");
  }
}
</script>
