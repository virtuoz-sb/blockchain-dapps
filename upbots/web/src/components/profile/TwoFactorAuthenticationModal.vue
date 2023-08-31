<template>
  <div class="relative flex flex-col pb-50 md:pb-28 lg:pb-60 pt-60 px-20 md:px-40">
    <div class="flex flex-col">
      <h2 class="font-raleway text-white text-xxl text-center mb-15 md:mb-20" :class="{ 'mx-20': is2FAEnabled }">
        {{ is2FAEnabled ? "Disable" : "Enable" }} Two Factor Authentication
      </h2>

      <template v-if="!is2FAEnabled">
        <ul class="flex flex-col items-start md:items-center mb-18 md:mb-20 lg:mb-30">
          <li class="point-gradient text-iceberg text-sm md:text-base md:leadning-md mb-8 md:mb-4 lg:mb-8">
            Install an authenticator app in your mobile device (eg. Authy).
          </li>
          <li class="point-gradient text-iceberg text-sm md:text-base md:leadning-md mb-8 md:mb-4 lg:mb-8">
            Scan the QR code or type in the code manually on your mobile device
          </li>
          <li class="point-gradient text-iceberg text-sm md:text-base md:leadning-md mb-8 md:mb-4 lg:mb-8">
            Write down or save the secret code in case you lose your device
          </li>
          <li class="point-gradient text-iceberg text-sm md:text-base md:leadning-md">
            Do not share your secret code. Upbots will never ask for your secret code
          </li>
        </ul>

        <div class="flex qr-code mb-16 md:mb-20 lg:mb-30 mx-auto">
          <VueQrcode
            :value="get2FASecret && get2FASecret.otpauth_url"
            :options="!$breakpoint.mdAndDown ? { width: 170 } : { width: 130 }"
          />
        </div>

        <p class="paragraph leading-xs text-sm md:text-md text-iceberg text-center mx-auto mb-20 lg:mb-30">
          Open the Authenticator app on your device and either scan the QR code provided, or manually enter the secret code.
        </p>

        <div class="flex flex-col text-center mx-auto mb-35 md:mb-30 lg:mb-40 truncate">
          <div class="md:leading-md text-md md:text-sm text-white mb-10 md:mb-2">AUTHENTICATOR SECRET CODE</div>
          <div class="secret-code leading-md text-sm text-white truncate">{{ get2FASecret && get2FASecret.base32 }}</div>
        </div>
      </template>

      <div class="flex flex-col mb-36 md:mb-32 lg:mb-50">
        <h3 class="text-iceberg leading-xs mb-12">Enter the code given by Authenticator App</h3>
        <ValidationObserver ref="form">
          <AppInput v-model="code" rules="required" type="text" size="sm" />
        </ValidationObserver>
      </div>

      <!-- <p v-if="getError" class="text-center text-red-cl-100 mb-10">{{ getError.message }}</p> -->
      <div class="flex justify-center w-full">
        <AppButton type="light-green" class="verify-btn w-full" @click="verify2FA">
          {{ !is2FAEnabled ? "Verify and Activate" : "Disable" }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";

const fromAuth = namespace("authModule");

import VueQrcode from "@chenfengyuan/vue-qrcode";

@Component({ name: "TwoFactorAuthenticationModal", components: { VueQrcode } })
export default class TwoFactorAuthenticationModal extends Vue {
  /* VUEX */
  @fromAuth.Getter get2FASecret!: any;
  @fromAuth.Getter is2FAEnabled!: any;

  @fromAuth.Action deactivate2FAAction!: Function;
  @fromAuth.Action verify2FAAction!: Function;
  @fromAuth.Action get2FASecretAction!: Function;

  /* PROPS */
  @Prop({ required: true }) value: boolean;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  isModalOpen: boolean = false;
  closeModal: boolean = true;
  code: string = "";

  /* HOOKS */
  created() {
    if (!this.is2FAEnabled) {
      this.get2FASecretAction();
    }
  }

  /* METHODS */
  verify2FA() {
    this.$refs.form.validate().then((valid: Boolean) => {
      if (valid) {
        if (!this.is2FAEnabled) {
          this.verify2FAAction({ userToken: this.code })
            .then((res: boolean) => {
              this.$notify({ text: `Two Factor Authentication has been successfully enabled!`, type: "success" });
              this.$router.push("/login");
            })
            .catch(({ response }: any) => {
              const { data } = response;
              this.$notify({ text: data.message, type: "error" });
            });
        } else {
          this.deactivate2FAAction({ userToken: this.code })
            .then((res: boolean) => {
              this.$notify({ text: `Two Factor Authentication has been successfully disabled!`, type: "success" });
              this.$router.push("/login");
            })
            .catch(({ response }: any) => {
              const { data } = response;
              this.$notify({ text: data.message, type: "error" });
            });
        }
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.qr-code {
  width: 170px;
  height: 170px;
  @media (max-width: 1024px) {
    width: 130px;
    height: 130px;
  }
}

.paragraph {
  max-width: 420px;
  @media (max-width: 767px) {
    max-width: 262px;
  }
}

.verify-btn {
  max-width: 335px;
  @media (max-width: 767px) {
    @apply max-w-full;
  }
}

.secret-code {
  max-width: 400px;
  @media (max-width: 767px) {
    max-width: 270px;
  }
}
</style>
