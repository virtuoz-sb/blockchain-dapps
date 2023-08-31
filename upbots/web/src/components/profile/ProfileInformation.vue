<template>
  <div class="flex flex-col w-full h-full overflow-y-auto md:overflow-visible custom-scrollbar">
    <div class="flex flex-col w-full h-full overflow-y-auto custom-scrollbar md:overflow-visible">
      <div class="flex flex-col w-full h-full px-20 py-20 overflow-y-auto custom-scrollbar md:overflow-visible">
        <div class="flex-shrink-0 grid grid-cols-1 xl:grid-cols-2 col-gap-60 row-gap-15 xl:row-gap-15 mb-15 xl:mb-20">
          <div class="flex flex-col">
            <h3 class="text-iceberg leading-xs text-sm mb-8">User Name</h3>
            <AppInput v-model="form.firstname" type="text" size="sm" />
          </div>
          <div class="flex flex-col">
            <h3 class="text-iceberg leading-xs text-sm mb-8">Home Address</h3>
            <AppInput v-model="form.homeAddress" type="text" name="address" size="sm" />
          </div>
        </div>
        <div class="flex-shrink-0 grid grid-cols-1 xl:grid-cols-2 col-gap-60 row-gap-15 xl:row-gap-15 mb-15 xl:mb-20">
          <div class="flex flex-col">
            <h3 class="text-iceberg leading-xs text-sm mb-8">Country</h3>
            <AppInput v-model="form.country" type="text" name="country" size="sm" />
          </div>
          <div class="flex flex-col">
            <h3 class="text-iceberg leading-xs text-sm mb-8">City</h3>
            <AppInput v-model="form.city" type="text" name="street" size="sm" />
          </div>
        </div>

        <div class="flex-shrink-0 flex flex-col mb-0 xl:mb-20">
          <div class="grid grid-cols-1 xl:grid-cols-2 col-gap-60 row-gap-15 xl:row-gap-15 mb-20 xl:mb-20">
            <div class="flex flex-col">
              <h3 class="text-iceberg leading-xs text-sm mb-8">Telegram</h3>
              <AppInput v-model="form.telegram" type="text" size="sm" />
            </div>
            <!-- <div class="flex w-full pt-11 xl:pt-20">
              <div class="flex items-center justify-between w-full xl:w-auto mr-0 xl:mr-10 mb-20 xl:mb-0">
                <app-checkbox v-model="form.smsAlert" class="mr-10">SMS Alert notifications</app-checkbox>
              </div>
            </div> -->
          </div>
        </div>

        <div class="flex-shrink-0 flex flex-col mb-20">
          <h3 class="text-iceberg leading-xs text-sm mb-8">About Me</h3>
          <AppTextarea v-model="form.aboutMe" custom-class="textarea w-full" />
        </div>

        <div class="flex-shrink-0 flex justify-end">
          <AppButton type="light-green" class="profile-information__btn" @click="updateProfileInfo">Update profile</AppButton>
        </div>
        <!-- Password update -->
        <div class="flex-shrink-0 flex flex-col mt-32 xl:mt-20 mb-15 xl:mb-20">
          <ValidationObserver ref="updatePassword" tag="div">
            <h2 class="leading-xs text-white mb-20 xl:mb-22">Change password</h2>
            <div v-if="this.getUser.authProvider === 'LOCAL'" class="grid grid-cols-1 xl:grid-cols-2 col-gap-60 mb-22">
              <div class="flex flex-col">
                <h3 class="text-iceberg leading-xs text-sm mb-8">Current password</h3>
                <AppInput v-model="updatePasswordForm.password" name="Current password" rules="required" type="password" size="sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 col-gap-60 row-gap-15 xl:row-gap-15">
              <div class="flex flex-col">
                <h3 class="text-iceberg leading-xs text-sm mb-8">New password</h3>
                <AppInput
                  v-model="updatePasswordForm.newPassword"
                  name="Password"
                  rules="required|validate_pass"
                  type="password"
                  size="sm"
                />
              </div>

              <div class="flex flex-col">
                <h3 class="text-iceberg leading-xs text-sm mb-8">Repeat new password</h3>
                <AppInput
                  v-model="updatePasswordForm.repeatNewPassword"
                  name="Confirm password"
                  rules="required|validate_pass|equal:@Password"
                  type="password"
                  size="sm"
                />
              </div>
            </div>
          </ValidationObserver>
        </div>

        <div class="flex-shrink-0 flex justify-end md:mt-auto">
          <AppButton type="light-green" class="profile-information__btn" @click="updatePassword">Update password</AppButton>
        </div>
      </div>
    </div>

    <!-- CONFIRM MODAL -->
    <AppConfirmModal
      prompt
      ref="confirmModal"
      title="Update profile"
      subtitle="Please enter your password in order to update your profile information"
      confirm-button="Update"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ProfilUpdatePayload, UserAuthInfo } from "@/store/auth/types";
import { AxiosError } from "axios";

const fromAuth = namespace("authModule");

@Component({ name: "ProfileInformation" })
export default class ProfileInformation extends Vue {
  /* VUEX */
  @fromAuth.Action passwordUpdateAction!: any;
  @fromAuth.Action profileUpdateAction: (payload: ProfilUpdatePayload) => Promise<any>;
  @fromAuth.Action getInfoUser: () => UserAuthInfo;
  @fromAuth.Getter getUser: UserAuthInfo;
  @fromAuth.Getter getError: AxiosError;

  /* REFS */
  $refs!: {
    updatePassword: any;
    confirmModal: Vue & {
      show: () => Promise<void>;
    };
  };

  /* DATA */
  formData: any[] = [];
  form: any = {
    firstname: "",
    homeAddress: "",
    country: "",
    city: "",
    telegram: "",
    // smsAlert: false,
    aboutMe: "",
  };
  updatePasswordForm = {
    password: "",
    newPassword: "",
    repeatNewPassword: "",
  };

  /* HOOKS */
  async mounted() {
    await this.getInfoUser();
    this.setFormValues();
  }

  /* METHODS */
  setFormValues() {
    const { firstname, telegram, homeAddress, city, country, aboutMe } = this.getUser;
    this.form.firstname = firstname;
    this.form.telegram = telegram;
    this.form.homeAddress = homeAddress;
    this.form.city = city;
    this.form.country = country;
    this.form.aboutMe = aboutMe;
  }

  async updateProfileInfo() {
    this.$refs.confirmModal.show().then((password: any) => {
      const { email } = this.getUser;
      let payload: ProfilUpdatePayload = { password, email, ...this.form };
      this.profileUpdateAction(payload).then(() => {
        if (this.getError) {
          this.$notify({ text: this.getError.message, type: "error" });
        } else {
          this.$notify({ text: "Profile information has been updated.", type: "success" });
        }
      });
    });
  }

  updatePassword() {
    this.$refs.updatePassword.validate().then((valid: Boolean) => {
      if (valid) {
        const { email } = this.getUser;
        this.passwordUpdateAction({ ...this.updatePasswordForm, email }).then(() => {
          this.$notify({ text: "Password has been successfully changed. Please login with new password", type: "success" });
          this.$router.push("/login");
        });
      }
    });
  }
}
</script>
<style lang="scss" scoped>
::v-deep .textarea {
  @apply h-100;
  resize: none;
}
.profile-information {
  &__btn {
    min-width: 150px;
    @media (max-width: 767px) {
      @apply w-full;
    }
  }
}
</style>
