<template>
  <div class="h-full px-20 my-20 overflow-y-auto custom-scrollbar">
    <ValidationObserver ref="form" tag="div" class="h-full overflow-y-auto custom-scrollbar" @submit.prevent>
      <form class="flex flex-col items-start h-full overflow-y-auto custom-scrollbar">
        <div class="flex flex-col flex-shrink-0 md:flex-row md:items-center w-full md:w-auto">
          <div class="flex flex-col flex-shrink-0 md:mr-70 mb-25 md:mb-0">
            <h3 class="text-iceberg leading-xs mb-10">Select Exchange</h3>
            <AppSelect
              v-model="form.exchangeName"
              :options="getExchangesFormatted"
              :disabled-options="disabledValues"
              class="flex-shrink-0 h-32 w-full md:w-280 max-w-full md:mb-25"
            />
          </div>

          <div v-if="isFTX" class="flex items-center mb-24 md:mb-0">
            <p class="text-grey-cl-920 text-md md:text-sm md:leading-xs mr-5">Account Type:</p>
            <AppDropdownBasic v-model="ftxTypeAccount" :options="ftxTypeAccountData" dark />
          </div>
        </div>

        <h3 class="w-full md:w-auto text-iceberg leading-xs mb-20">API Keys</h3>
        <div class="flex w-full md:w-auto flex-col lg:items-end h-full">
          <div class="flex flex-col lg:flex-row flex-shrink-0">
            <label class="w-full md:w-280 lg:w-240 xl:w-350 max-w-full mb-20">
              <p class="text-iceberg text-sm leading-xs mb-8">API Key Label</p>
              <AppInput v-model="form.name" placeholder="Enter a API Key Label" name="Key Label" rules="required" size="sm" />
            </label>

            <label class="w-full md:w-280 lg:w-240 xl:w-350 max-w-full lg:mx-50 mb-20">
              <p class="text-iceberg text-sm leading-xs mb-8">API Key</p>
              <AppInput v-model.trim="form.publicKey" show-last placeholder="Enter the API Key" name="API Key" rules="required" size="sm" />
            </label>

            <label class="w-full md:w-280 lg:w-240 xl:w-350 max-w-full mb-20">
              <p class="text-iceberg text-sm leading-xs mb-8">API Secret</p>
              <AppInput
                v-model.trim="form.secretKey"
                show-last
                placeholder="Enter the API Secret"
                name="API Secret"
                rules="required"
                size="sm"
              />
            </label>
          </div>

          <div class="flex flex-shrink-0 w-full">
            <label v-if="subAccountName" class="w-full md:w-280 xl:w-350 max-w-full mb-20">
              <p class="text-iceberg text-sm leading-xs mb-8">Subaccount Name</p>
              <AppInput v-model="subaccount" placeholder="Enter the Subaccount Name" name="Subaccount" size="sm" />
            </label>

            <div v-if="showPassphare" class="flex w-full mb-20 lg:mb-0">
              <label class="w-full md:w-280 lg:w-240 xl:w-350 max-w-full">
                <p class="text-iceberg text-sm leading-xs mb-8">Passphrase</p>
                <AppInput
                  v-model.trim="form.password"
                  show-last
                  placeholder="Enter the Passphrase"
                  name="Passphrase"
                  rules="required"
                  size="sm"
                />
              </label>
            </div>
          </div>

          <div class="flex flex-col flex-shrink-0 md:flex-row md:justify-end w-full mt-5 md:mt-auto mb-20 lg:mb-0 xl:mb-20">
            <AppButton type="light-green" class="connect-exchanges__btn md:mr-30 w-full md:w-auto" @click="connectNewExchanges">
              Connect
            </AppButton>
            <AppButton class="open-now-btn w-full md:w-auto mt-20 md:mt-0" type="grey" :disabled="!referalLink" @click="handleReferalLink">
              Open an account now
            </AppButton>
          </div>
        </div>
      </form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
const referralLinks: any = {
  ftx: "https://ftx.com/#a=Upbots",
  binance: "https://www.binance.com/en/register?ref=40365219",
  binanceus: "https://www.binance.com/en/register?ref=40365219",
  bitmex: "https://www.bitmex.com/register/l1uQdD",
  bitmex_test: "https://testnet.bitmex.com/register",
  huobipro: "https://www.huobi.com/en-us/topic/invited/?invite_code=ft4b6",
  kucoin: "https://www.kucoin.com/ucenter/signup?rcode=1ucK7sh",
  okex: "https://www.okex.com/join/3/2232856",
};

import { Component, Vue } from "vue-property-decorator";
import { AxiosError } from "axios";
import { namespace } from "vuex-class";
import { AddExchangeKeyRequestPayload } from "@/store/exchangeKeys/types";
import { ErrorResponse } from "@/store/error-response";
import { defaultExchangeForm } from "@/models/default-models";
import { GroupItems } from "@/models/interfaces";

const user = namespace("userModule"); // matches the module name

@Component({ name: "ConnectNewExchanges" })
export default class ConnectNewExchanges extends Vue {
  /* VUEX */
  @user.Getter getExchangesFormatted!: ErrorResponse;
  @user.Action fetchTradingSettings!: any;
  @user.Action createExchangeKeyActionAsync: any;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
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

  get referalLink() {
    return referralLinks[this.form.exchangeName.value];
  }

  /* HOOKS */
  created() {
    this.fetchTradingSettings();
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
          this.$router.push({ name: "portfolio-monitoring-cexs" });
        })
        .catch(({ response: { data } }: AxiosError) => {
          this.$notify({ text: data.message, type: "error" });
        })
        .finally(() => {
          this.form = defaultExchangeForm();
          this.$refs.form && this.$refs.form.reset();
        });
    });
  }

  handleReferalLink() {
    window.open(this.referalLink, "_blank");
  }
}
</script>

<style lang="scss" scoped>
.connect-exchanges {
  &__btn {
    min-width: 240px;
  }
}

.open-now-btn {
  min-width: 240px;
}
</style>
