<template>
  <div>
    <router-link
      v-for="(item, index) in data"
      :key="index"
      :to="{ name: item.route }"
      tag="div"
      exact
      class="marketplace__item relative flex flex-col items-center md:w-1/6 md:h-auto cursor-pointer px-10 md:px-8 lg:px-10 py-15 pb-20 md:mr-6 lg:mr-14 md:last:mr-0"
    >
      <ImageItem
        :src="item.img"
        :alt="item.alt"
        img-class="mx-auto w-full h-full object-cover"
        class="marketplace__item-img self-center w-full relative mb-10"
        :style="`max-width: ${size(index)}`"
      />
      <p class="marketplace__item-title w-full text-base leading-xs text-white text-center mt-8 z-2">
        {{ item.title }}
      </p>
      <p class="marketplace__item-subtitle text-tradewind mt-4">{{ item.subtitle }}</p>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "Marketplace" })
export default class Marketplace extends Vue {
  /* DATA */
  data: {
    id: number;
    title: string;
    subtitle?: string;
    img: string;
    alt: string;
    route: string;
    size: { desktop: string; mobile: string };
  }[] = [
    {
      id: 1,
      title: "Algo Rental",
      subtitle: null,
      img: require("@/assets/images/homepage/marketplace/algo-rental-illustration.svg"),
      alt: "algo-rental",
      route: "algo-bots",
      size: {
        desktop: "99px",
        mobile: "97px",
      },
    },
    {
      id: 2,
      title: "Staking",
      subtitle: null,
      img: require("@/assets/images/homepage/marketplace/staking-illustration.svg"),
      alt: "staking",
      route: "staking",
      size: {
        desktop: "102px",
        mobile: "98px",
      },
    },
    {
      id: 3,
      title: "Swap",
      subtitle: null,
      img: require("@/assets/images/homepage/marketplace/swap-illustration.svg"),
      alt: "swap",
      route: "swap",
      size: {
        desktop: "58px",
        mobile: "58px",
      },
    },
    {
      id: 4,
      title: "Copy Trading",
      subtitle: "(coming soon)",
      img: require("@/assets/images/homepage/marketplace/copytrading-illustration.svg"),
      alt: "copytrading",
      route: "copy-trading",
      size: {
        desktop: "93px",
        mobile: "93px",
      },
    },
    {
      id: 5,
      title: "Signal Providers",
      subtitle: "(coming soon)",
      img: require("@/assets/images/homepage/marketplace/signal-providers-illustration.svg"),
      alt: "signal-providers",
      route: "signal-providers",
      size: {
        desktop: "90px",
        mobile: "99px",
      },
    },
    {
      id: 6,
      title: "Learning",
      subtitle: "(coming soon)",
      img: require("@/assets/images/homepage/marketplace/learning-illustration.svg"),
      alt: "learning",
      route: "learning",
      size: {
        desktop: "90px",
        mobile: "98px",
      },
    },
  ];

  /* METHODS */
  size(i: number) {
    return this.$breakpoint.mdAndDown ? this.data[i].size.mobile : this.data[i].size.desktop;
  }
}
</script>

<style lang="scss" scoped>
.marketplace {
  @media (min-width: 768px) {
    &__item {
      &:after {
        @apply absolute right-0 w-2 h-80 bg-hei-se-black;
        content: "";
        top: 25px;
      }
      &:last-child {
        &:after {
          content: none;
        }
      }
    }
  }
  @media (min-width: 1025px) {
    &__item-title {
      font-size: 15px;
    }
    &__item-subtitle {
      font-size: 10px;
    }
  }
  @media (min-width: 1280px) {
    &__item-title {
      font-size: 17px;
    }
    &__item-subtitle {
      font-size: 11px;
    }
  }
}
</style>
