<template>
  <div class="custom-blur-card rounded-5 relative flex flex-col pt-50 pb-40 px-20 md:px-45">
    <div class="flex items-center justify-center border-b border-solid border-iceberg mb-30 pb-16">
      <div class="flex items-center mr-10">
        <CryptoCoinChecker v-for="coin in coins" :key="coin" :data="coin" class="mr-5">
          <template slot-scope="{ isExist, coinName, srcCoin }">
            <img v-if="isExist" :src="require(`@/assets/icons/${srcCoin}.png`)" :alt="srcCoin" class="w-27 h-27 -ml-10" />
            <cryptoicon v-else :symbol="coinName" size="27" generic class="-ml-10" />
          </template>
        </CryptoCoinChecker>
      </div>
      <h2 class="font-raleway font-semibold text-xxl text-white text-center mr-5">Vault Deposit</h2>
    </div>

    <div v-for="coin in coins" :key="coin" class="flex flex-col flex-shrink-0 mb-40">
      <div class="flex items-center mb-5">
        <div class="flex items-center justify-center mr-8">
          <CryptoCoinChecker :data="coin" class="mr-5">
            <template slot-scope="{ isExist, coinName, srcCoin }">
              <img v-if="isExist" :src="require(`@/assets/icons/${srcCoin}.png`)" :alt="srcCoin" class="w-27 h-27" />
              <cryptoicon v-else :symbol="coinName" size="27" generic />
            </template>
          </CryptoCoinChecker>
          <span class="text-white text-md font-bold">{{ coin }}: </span>
        </div>
        <AppInput v-model="values[coin]" type="number" size="sm" class="withdraw-modal__input w-full">
          <div class="flex items-center justify-center absolute right-0 px-10 h-full cursor-pointer" @click="values[coin] = maxUSDT">
            <span class="text-shakespeare underline text-sm">Max</span>
          </div>
        </AppInput>
      </div>
    </div>

    <div class="flex items-center justify-center w-full">
      <AppButton type="light-green" size="sm" class="withdraw-modal__btn flex-shrink-0 w-full" @click="handleSubmit">
        Deposit USDT
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({ name: "VaultDetails" })
export default class VaultDetails extends Vue {
  @Prop({ required: true }) depositUSDT!: (amount: number) => Promise<void>;
  @Prop({ required: true }) maxUSDT!: number;

  coins = ["USDT"];
  // coins = ["USDT", "BUSD", "USDC", "DAI"];

  values = {
    USDT: 0,
    BUSD: 0,
    USDC: 0,
    DAI: 0,
  };

  maxValues = {
    USDT: 9999,
    BUSD: 9999,
    USDC: 9999,
    DAI: 9999,
  };

  handleSubmit() {
    this.depositUSDT(this.values.USDT);
  }
}
</script>
