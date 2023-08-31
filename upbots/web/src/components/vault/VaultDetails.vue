<template>
  <div>
    <div class="flex items-center justify-center w-full mb-20">
      <div class="flex items-center mr-10">
        <CryptoCoinChecker v-for="coin in coins" :key="coin" :data="coin" class="mr-5">
          <template slot-scope="{ isExist, coinName, srcCoin }">
            <img v-if="isExist" :src="require(`@/assets/icons/${srcCoin}.png`)" :alt="srcCoin" class="w-27 h-27 -ml-10" />
            <cryptoicon v-else :symbol="coinName" size="27" generic class="-ml-10" />
          </template>
        </CryptoCoinChecker>
      </div>

      <div class="flex">
        <span class="text-xxl text-white">UBXT Vault</span>
      </div>
    </div>

    <div class="flex items-center justify-center w-full mb-40">
      <span class="text-white text-md text-center">
        Stake USDT & earn UBXT
      </span>
    </div>

    <div class="grid grid-cols-2 col-gap-10 w-full mb-40">
      <div class="flex justify-center">
        <div class="flex flex-col items-center w-full">
          <span class="text-white text-md mb-8">APY (unstable)</span>
          <span class="staking-earn-card__value text-green-cl-100 text-xxl font-semibold break-all"> {{ this.apy.toFixed(2) }}% </span>
        </div>
      </div>

      <div class="flex justify-center">
        <div class="flex flex-col items-center w-full">
          <span class="text-white text-md mb-8">Staked in the pool</span>
          <span class="staking-earn-card__value text-white text-xxl font-semibold break-all">
            {{ this.vaultUSDTStaked }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center w-full mt-auto">
      <router-link tag="a" to="/ubxt-vault" class="staking-earn-card__select-btn-wrap flex flex-col max-w-200 w-full mx-auto">
        <AppButton size="sm" type="light-green" class="w-full">Select</AppButton>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "VaultDetails" })
export default class VaultDetails extends Vue {
  @Prop({ required: true }) vaultUSDTStaked!: number;

  apy = 0;
  coins = ["USDT"];
  // coins = ["USDT", "BUSD", "USDC", "DAI"];

  mounted() {
    this.fetchApr();
  }

  async fetchApr() {
    try {
      const { data } = await this.$http.get("https://s.belt.fi/info/all.json");
      this.apy = parseFloat(data.info.BSC.vaultPools.find((e: any) => e.name === "4Belt").totalAPR);
    } catch {
      this.$notify({ text: "Couldn't fetch APR for vault", type: "warning" });
    }
  }
}
</script>
