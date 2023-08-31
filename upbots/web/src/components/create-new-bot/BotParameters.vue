<template>
  <div class="flex flex-col flex-shrink-0 mb-30">
    <!-- TITLE -->
    <!-- <h4 class="text-sm leading-xs text-grey-cl-100 mb-30">
      Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based
      price methods while optimizing your automated trading strategies.
    </h4> -->

    <div class="content-container">
      <div class="flex flex-col items-start mb-20 xl:mb-30">
        <p class="text-grey-cl-100 text-sm leading-xs mb-8">Bot name</p>
        <AppInput v-model="stepData.botName" type="text" size="sm" class="max-w-240 w-full" />
      </div>

      <div class="flex flex-col mb-20 xl:mb-30">
        <p class="text-grey-cl-100 text-sm leading-xs mb-8">Short description</p>
        <AppTextarea v-model="stepData.shortDescription" custom-class="textarea w-full h-80" class="textarea__wrap" />
      </div>

      <div class="flex flex-col lg:flex-row items-start justify-between w-full lg:w-auto mb-20 xl:mb-30">
        <div class="flex flex-col items-start lg:max-w-240 w-full mb-20 lg:mb-0">
          <p class="text-grey-cl-100 text-sm leading-xs mb-8">Select your account</p>
          <!-- <AppSelect v-model="stepData.selectYourAccount" :options="selectYourAccountData" custom-class="mr-6" class="w-full" /> -->
          <AppDropdownBasic
            class="w-full"
            :value="exchange"
            :options="getKeyNamesWithExchange"
            key-value="id"
            key-label="displayName"
            :disabled-options="disabledExchanges"
            disabled-key-name="exchange"
            dark
            truncate
            @change="handleAccountSelection"
          />
        </div>

        <div class="flex flex-col items-start lg:max-w-240 w-full">
          <p class="text-grey-cl-100 text-sm leading-xs mb-8">Select the pair to trade</p>
          <AppSelect v-model="stepData.selectPairToTrade" :options="selectPairToTradeData" class="w-full" />
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <h3 class="text-white leading-xs mb-20">Select your strategy</h3>
      <!-- not final text -->
      <!-- <p class="text-green-cl-100 text-xs mb-20">Long position small text to explain the difference between long, short, long & short</p> -->
      <div class="bot-parameters__buttons-group">
        <AppButtonsGroup v-model="stepData.botType" :items="buttonsGroupData" customClasses="h-50 leading-normal py-7 px-5" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";
import { namespace } from "vuex-class";

const user = namespace("userModule");

@Component({ name: "BotParameters" })
export default class BotParameters extends Vue {
  /* VUEX */
  @user.Getter getKeyNamesWithExchange: any;
  @user.Getter disabledExchanges: any;

  /* DATA */
  stepName: string = "botParameters";

  exchange: any = {};

  stepData: any = {
    botName: "Algobit 6952",
    shortDescription: "",
    selectYourAccount: { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    exchange: "Binance 1",
    selectPairToTrade: { label: "USD/BTC" },
    botType: "Long",
  };

  buttonsGroupData: GroupItems[] = [
    { value: "Long", label: "Long" },
    { value: "Short", label: "Short" },
    { value: "Long & Short", label: "Long & Short" },
  ];

  selectYourAccountData: any[] = [
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "BinanceUS", alt: "binance" },
    { img: require("@/assets/images/bitfinex.svg"), label: "BitFinex", alt: "binance" },
    { img: require("@/assets/images/kucoin.svg"), label: "Kucoin", alt: "binance" },
  ];

  selectPairToTradeData: any[] = [
    { label: "USD/BTC" },
    { label: "BTC/USDT" },
    { label: "ETH/USDT" },
    { label: "ETH/BTC" },
    { label: "XRP/USDT" },
    { label: "XRP/BTC" },
    { label: "LTC/USDT" },
    { label: "LTC/BTC" },
    { label: "DASH/USDT" },
    { label: "DASH/BTC" },
    { label: "DeFi/USDT" },
    { label: "LINK/USDT" },
    { label: "LINK/BTC" },
    { label: "FTT/USDT" },
    { label: "FTT/BTC" },
    { label: "UBXT/USDT" },
    { label: "UBXT/BTC" },
    { label: "XTZ/USDT" },
    { label: "XTZ/BTC" },
    { label: "UNI/USDT" },
    { label: "UNI/BTC" },
  ];

  /* HOOKS */
  created() {
    const defaultWatllet = this.getKeyNamesWithExchange.find((e: any) => e.exchange === "bitmex_test");
    if (defaultWatllet) {
      this.handleAccountSelection(defaultWatllet);
    } else {
      const noAcc = {
        id: "",
        name: "upload-your-key",
        exchange: "bitmex_test",
        valid: true,
        img: "/img/bitmex.d3d95224.svg",
        displayName: "nokey: upload your exchange key",
      };
      this.handleAccountSelection(noAcc);
    }
  }

  /* METHODS */
  handleAccountSelection(item: any) {
    this.exchange = item;
  }
}
</script>

<style lang="scss" scoped>
.content-container {
  max-width: 612px;
}

.bot-parameters {
  &__buttons-group {
    max-width: 365px;
  }
}

::v-deep .textarea {
  resize: none;
}
</style>
