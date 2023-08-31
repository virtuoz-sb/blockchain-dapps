<template>
  <div class="flex flex-col flex-shrink-0 pb-35 md:pb-20 pt-20">
    <div class="flex flex-col mb-15 md:mb-20 md:px-20">
      <h3 class="text-iceberg text-sm leading-xs mb-8">First Name</h3>
      <AppInput v-model="form.firstname" type="text" size="sm" />
    </div>

    <div class="flex flex-col mb-15 md:mb-20 md:px-20">
      <h3 class="text-iceberg text-sm leading-xs mb-8">Last Name</h3>
      <AppInput v-model="form.lastname" type="text" size="sm" />
    </div>

    <div class="flex flex-col mb-15 md:mb-20 md:px-20">
      <h3 class="text-iceberg text-sm leading-xs mb-8">Phone</h3>
      <VueTelInput
        v-model="form.phone"
        required
        defaultCountry="FR"
        placeholder=""
        :inputClasses="['input-tel']"
        :wrapperClasses="['wrapper-inside']"
      />
    </div>

    <div class="flex flex-col mb-24 md:px-20">
      <h3 class="text-iceberg text-sm leading-xs mb-8">Email Address</h3>
      <AppInput v-model="form.email" type="text" size="sm" readonly />
    </div>

    <div class="mt-auto md:px-20">
      <AppButton type="light-green" class="w-full" @click="updateProfileInfo">Save changes</AppButton>
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
import { VueTelInput } from "vue-tel-input";
import { ProfilUpdatePayload, UserAuthInfo } from "@/store/auth/types";
import { AxiosError } from "axios";
import { namespace } from "vuex-class";

const fromAuth = namespace("authModule");

@Component({ name: "GeneralInformation", components: { VueTelInput } })
export default class GeneralInformation extends Vue {
  /* VUEX */
  @fromAuth.Action passwordUpdateAction!: any;
  @fromAuth.Action profileUpdateAction: (payload: ProfilUpdatePayload) => Promise<any>;
  @fromAuth.Action getInfoUser: () => UserAuthInfo;
  @fromAuth.Getter getUser: UserAuthInfo;
  @fromAuth.Getter getError: AxiosError;

  /* DATA */
  formData: any[] = [];

  form: any = {
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
  };

  updatePasswordForm = {
    password: "",
    newPassword: "",
    repeatNewPassword: "",
  };

  /* REFS */
  $refs!: {
    updatePassword: any;
    confirmModal: Vue & {
      show: () => Promise<void>;
    };
  };

  /* HOOKS */
  async mounted() {
    await this.getInfoUser();
    this.setFormValues();
  }

  /* METHODS */
  setFormValues() {
    const { firstname, lastname, phone, email } = this.getUser;
    this.form.firstname = firstname;
    this.form.lastname = lastname;
    this.form.phone = phone;
    this.form.email = email;
  }

  updateProfileInfo() {
    this.$refs.confirmModal.show().then((password: any) => {
      const { email } = this.getUser;
      const payload: ProfilUpdatePayload = { password, email, ...this.form };
      this.profileUpdateAction(payload).then(() => {
        if (this.getError) {
          this.$notify({ text: this.getError.message, type: "error" });
        } else {
          this.$notify({ text: "Profile information has been updated.", type: "success" });
        }
      });
    });
  }
}
</script>
