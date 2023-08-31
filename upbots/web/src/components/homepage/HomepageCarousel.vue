<template>
  <div>
    <div v-swiper:homepageCarousel="swiperOption" class="homepage-carousel relative flex flex-col flex-1">
      <div class="swiper-wrapper">
        <div v-for="item in bannerData" :key="item.id" class="swiper-slide flex flex-shrink-0 rounded-5">
          <a v-if="item.href" :href="item.href" :class="item.href && 'cursor-pointer'" target="_blank" class="flex">
            <ImageItem :src="item.img" :alt="item.alt" img-class="w-full h-full rounded-5 object-cover" />
          </a>
          <router-link v-else :to="item.route" class="flex">
            <ImageItem :src="item.img" :alt="item.alt" img-class="w-full h-full rounded-5 object-cover" />
          </router-link>
        </div>
      </div>
      <div class="swiper-pagination swiper-pagination-bullets flex items-center justify-center w-full absolute z-50" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "HomepageCarousel" })
export default class HomepageCarousel extends Vue {
  /* DATA */
  swiperOption = {
    slidesPerView: "auto",
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    autoplay: {
      delay: 5000,
    },
  };

  get bannerUpbots() {
    if (this.$breakpoint) {
      if (this.$breakpoint.width <= 1800) {
        return "/img/homepage/carousel/banner-upbots.png";
      } else {
        return "/img/homepage/carousel/banner-upbots-l.png";
      }
    } else {
      return "";
    }
  }

  get bannerEarnUBXT() {
    if (this.$breakpoint) {
      return "/img/homepage/carousel/banner-earn-ubxt.png";
    } else {
      return "";
    }
  }

  get bannerStakingUBXT() {
    if (this.$breakpoint) {
      if (this.$breakpoint.width <= 1800) {
        return "/img/homepage/carousel/banner-staking-ubxt.png";
      } else {
        return "/img/homepage/carousel/banner-staking-ubxt-l.png";
      }
    } else {
      return "";
    }
  }

  get bannerSwapUBXT() {
    if (this.$breakpoint) {
      return "/img/homepage/carousel/banner-swap-ubxt.png";
    } else {
      return "";
    }
  }

  get bannerData() {
    return [
      {
        id: 1,
        img: this.bannerUpbots,
        alt: "bannerUpbots",
        href: "",
        route: "",
      },
      {
        id: 2,
        img: this.bannerEarnUBXT,
        alt: "bannerEarnUBXT",
        href: "",
        route: "/ubxt-wallet",
      },
      {
        id: 3,
        img: this.bannerStakingUBXT,
        alt: "bannerStakingUBXT",
        href: "",
        route: "/ubxt-staking",
      },
      {
        id: 4,
        img: this.bannerSwapUBXT,
        alt: "bannerSwapUBXT",
        href: "",
        route: "/ubxt-bridge",
      },
    ];
  }
}
</script>

<style lang="scss" scoped>
.homepage-carousel {
  margin: 0 auto !important;
  overflow: hidden !important;
  .swiper-pagination {
    bottom: 13px;
  }
  .swiper-slide {
    height: 146px;
    @media (max-width: 1024px) {
      height: 120px;
    }
    @media (max-width: 767px) {
      height: 73px;
    }
  }
}

::v-deep .swiper-pagination-bullet {
  @apply bg-grey-cl-100 w-6 h-6;
  display: flex !important;
  border-radius: 50% !important;
  margin: 0 5px 0 0 !important;
  &.swiper-pagination-bullet-active {
    @apply bg-white;
  }
}
</style>
