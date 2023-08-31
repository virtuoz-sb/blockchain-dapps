<template>
  <div>
    <div class="relative flex flex-col pt-70 pb-40 px-20 md:px-45">
      <h2 class="font-raleway text-xxl text-white font-bold text-center mb-40">Buy UBXT here:</h2>

      <div class="trade-btn__wrap grid grid-cols-2 row-gap-25 col-gap-25">
        <a
          :href="item.link"
          target="_blank"
          v-for="(item, index) in data"
          :key="index"
          :class="item.class"
          class="trade-btn__item flex items-center justify-center border border-solid border-blue-cl-400 rounded-4 py-6 px-10"
        >
          <span class="trade-btn__item-text leading-xs text-white mr-4">{{ item.title }}</span>
          <img :src="item.img" class="trade-btn__item-img" />
        </a>
      </div>
    </div>

    <div class="relative flex flex-col pt-70 pb-40 px-20 md:px-45">
      <h2 class="text-xxl text-white font-bold text-center mb-40">Bridge ERC20 &#x3c;&#62; BEP20</h2>

      <a
        :href="multichain.link"
        target="_blank"
        class="trade-btn__item flex items-center justify-center border border-solid border-blue-cl-400 rounded-4 py-6 px-10"
        :class="multichain.class"
      >
        <span class="trade-btn__item-text leading-xs text-white mr-4">{{ multichain.title }}</span>
        <img :src="multichain.img" class="trade-btn__item-img" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "UBXTModal" })
export default class UBXTModal extends Vue {
  /* DATA */
  data: any[] = [
    { title: "FTX", img: require("@/assets/images/trade-images/ftx.png"), link: "https://ftx.com/trade/UBXT/USD", class: "trade-btn--ftx" },
    {
      title: "Uniswap ",
      img: require("@/assets/images/trade-images/uniswap.png"),
      link: "https://app.uniswap.org/#/swap?inputCurrency=0x8564653879a18c560e7c0ea0e084c516c62f5653",
      class: "trade-btn--uniswap",
    },
    {
      title: "Sushiswap",
      img: require("@/assets/images/trade-images/sushiswap.png"),
      link: "https://exchange.sushiswapclassic.org/#/swap?inputCurrency=0x8564653879a18c560e7c0ea0e084c516c62f5653&outputCurrency=ETH",
      class: "trade-btn--sushiswap",
    },
    {
      title: "Serum",
      img: require("@/assets/images/trade-images/serum.png"),
      link: "https://dex.projectserum.com/#/",
      class: "trade-btn--serum",
    },
    {
      title: "Kucoin",
      img: require("@/assets/images/trade-images/kucoin.svg"),
      link: "https://trade.kucoin.com/UBXT-USDT",
      class: "trade-btn--kucoin",
    },
    {
      title: "PancakeSwap",
      img: require("@/assets/images/trade-images/pancakeswap.svg"),
      link: "https://exchange.pancakeswap.finance/#/swap?inputCurrency=0xBbEB90cFb6FAFa1F69AA130B7341089AbeEF5811",
      class: "trade-btn--pancakeswap",
    },
  ];

  multichain = {
    title: "Multichain",
    img: require("@/assets/images/trade-images/multichain.png"),
    class: "trade-btn--multichain",
    link: "https://multichain.xyz/swap?pairID=UBXTv3&src=1&dest=56",
  };
}
</script>

<style lang="scss" scoped>
.trade-btn {
  &__wrap {
    grid-auto-rows: minmax(min-content, max-content);
  }
  &__item {
    height: 32px;
    filter: drop-shadow(0px 0px 6px rgba(103, 173, 185, 0.4));
  }

  &--ftx {
    .trade-btn {
      &__item-img {
        width: 17px;
      }
    }
  }
  &--sushiswap {
    .trade-btn {
      &__item-img {
        width: 18px;
      }
    }
  }

  &--serum,
  &--kucoin,
  &--uniswap,
  &--multichain,
  &--pancakeswap {
    .trade-btn {
      &__item-img {
        width: 16px;
      }
    }
  }
}
</style>
