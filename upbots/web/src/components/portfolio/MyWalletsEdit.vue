<template>
  <div class="flex flex-col h-full overflow-y-auto custom-scrollbar">
    <!-- FORM -->
    <ValidationObserver ref="form" tag="div" class="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <form @submit.prevent="connectNewExchanges" class="flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div class="flex-1 h-full mb-20 overflow-y-auto custom-scrollbar">
          <div class="flex flex-col mb-20 px-20">
            <h3 class="text-grey-cl-100 text-sm leading-xs mb-12">API Key Label</h3>
            <AppInput
              v-model="form.name"
              placeholder="Enter a API Key Label"
              name="Key Label"
              rules="required"
              custom-class="py-8"
              size="sm"
            />
          </div>

          <div class="flex flex-col mb-20 px-20">
            <h3 class="text-grey-cl-100 text-sm leading-xs mb-8">Exchange Name</h3>
            <AppSelect v-model="form.exchangeName" :options="getExchangesFormatted" :disabled-options="disabledValues" />
          </div>

          <div v-if="isFTX" class="flex items-center mb-30 px-20">
            <p class="text-grey-cl-920 text-md md:text-sm md:leading-xs mr-5">Account Type:</p>
            <AppDropdownBasic v-model="ftxTypeAccount" :options="ftxTypeAccountData" dark />
          </div>

          <div class="flex flex-col mb-20 px-20">
            <h3 class="text-grey-cl-100 text-sm leading-xs mb-8">API Key</h3>
            <AppInput
              v-model.trim="form.publicKey"
              show-last
              placeholder="Enter a API Key"
              name="API key"
              rules="required"
              custom-class="py-8"
              size="sm"
            />
          </div>

          <div class="flex flex-col mb-20 px-20">
            <h3 class="text-grey-cl-100 text-sm leading-xs mb-8">API Secret</h3>
            <AppInput
              v-model.trim="form.secretKey"
              show-last
              placeholder="Enter the API Secret"
              name="API Secret"
              rules="required"
              custom-class="py-8"
              size="sm"
            />
          </div>

          <div v-if="showPassphare" class="flex flex-col mb-20 px-20">
            <p class="text-grey-cl-920 text-sm leading-xs mb-8">Passphrase</p>
            <AppInput
              v-model.trim="form.password"
              show-last
              placeholder="Enter the passphrase"
              name="Passphrase"
              rules="required"
              size="sm"
            />
          </div>

          <div v-if="subAccountName" class="flex flex-col mb-20 px-20">
            <p class="text-grey-cl-920 text-sm leading-xs mb-8">Subaccount Name</p>
            <AppInput v-model="subaccount" placeholder="Enter the Subaccount Name" name="Subaccount" size="sm" />
          </div>
        </div>

        <div class="flex items-center justify-between mt-auto px-20 pb-20">
          <button class="text-blue-cl-200 leading-md mr-15" @click="cancel">Cancel</button>
          <AppButton type="light-green" class="my-wallets__submit-btn">Submit</AppButton>
        </div>
      </form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AxiosError } from "axios";
import { namespace } from "vuex-class";
import { AddExchangeKeyRequestPayload } from "@/store/exchangeKeys/types";
import { ErrorResponse } from "@/store/error-response";
import { defaultExchangeForm } from "@/models/default-models";
import { GroupItems } from "@/models/interfaces";

const user = namespace("userModule"); // matches the module name

@Component({ name: "MyWalletsEdit" })
export default class MyWalletsEdit extends Vue {
  /* VUEX */
  @user.Getter getExchangesFormatted!: ErrorResponse;
  @user.Action createExchangeKeyActionAsync: any;

  /* REFS */
  $refs: {
    form: any;
  };

  /* DATA */
  form = defaultExchangeForm();
  subaccount: string = "";
  disabledValues: string[] = ["bitfinex"];
  passphraseData: string[] = ["okex", "kucoin"];

  ftxTypeAccount: GroupItems = { label: "Main account", value: "mainAccount" };
  ftxTypeAccountData: GroupItems[] = [
    { label: "Main account", value: "mainAccount" },
    { label: "Subaccount", value: "subaccount" },
  ];

  /* COMPUTED */
  get showPassphare() {
    return this.passphraseData.includes(this.form.exchangeName.value);
  }

  get isFTX() {
    return this.form.exchangeName.value === "ftx";
  }

  get subAccountName() {
    return this.isFTX && this.ftxTypeAccount.value == "subaccount";
  }

  /* METHODS */
  connectNewExchanges() {
    this.$refs.form.validate().then((valid: Boolean) => {
      if (!valid) return;

      const {
        name,
        exchangeName: { alt },
        publicKey,
        secretKey,
        password,
      } = this.form;

      const payload: AddExchangeKeyRequestPayload = { name, exchange: alt, publicKey, secretKey };

      if (this.isFTX && this.subaccount) {
        payload.subAccountName = this.subaccount;
      }

      if (this.showPassphare) {
        payload.password = password;
      }

      this.createExchangeKeyActionAsync(payload)
        .then((res: boolean) => {
          this.$notify({ text: `"${name}" has been successfuly created!`, type: "success" });
          this.$emit("cancelEdit");
        })
        .catch(({ response: { data } }: AxiosError) => {
          this.$notify({ text: data.message, type: "error" });
        })
        .finally(() => {
          this.clearAllFields();
          this.$refs.form && this.$refs.form.reset();
        });
    });
  }

  cancel() {
    this.clearAllFields();
    this.$emit("cancelEdit");
  }

  clearAllFields() {
    this.form = defaultExchangeForm();
  }
}
</script>

<style lang="scss" scoped>
.my-wallets {
  &__submit-btn {
    min-width: 140px;
    @media (max-width: 1279px) {
      min-width: 100px;
    }
  }
}
</style>
