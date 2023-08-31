<template>
  <GeneralLayout title="Coming Soon" content-custom-classes="md:flex-col pb-20 overflow-y-auto custom-scrollbar">
    <div
      class="coming-soon__wrap grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 col-gap-30 row-gap-30 flex-grow px-20 md:px-0 overflow-y-auto custom-scrollbar"
    >
      <div v-for="(item, index) in comingSoonImages" :key="index" class="coming-soon__img-wrap">
        <ImageItem :src="item.img" :alt="item.alt" img-class="w-full h-full object-contain" />
      </div>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import GeneralLayout from "@/views/GeneralLayout.vue";

type IComingSoonImages = { img: string; alt: string };

@Component({ name: "ComingSoon", components: { GeneralLayout } })
export default class ComingSoon extends Vue {
  /* DATA */
  comingSoonImages: IComingSoonImages[] = [
    {
      img: "/img/coming-soon-pages/ubxt-wallet.png",
      alt: "UBXT Wallet",
    },
    {
      img: "/img/coming-soon-pages/my-bots.png",
      alt: "My Bots",
    },
    {
      img: "/img/coming-soon-pages/learning.png",
      alt: "Learning",
    },
    {
      img: "/img/coming-soon-pages/signal-providers.png",
      alt: "Signal Providers",
    },
    {
      img: "/img/coming-soon-pages/copy-trading.png",
      alt: "Copy trading",
    },
  ];
}
</script>

<style lang="scss">
.coming-soon {
  &__wrap {
    grid-auto-rows: minmax(min-content, max-content);
  }

  @media (max-width: 767px) {
    &__img-wrap {
      height: 400px;
    }
  }

  @media (max-width: 600px) {
    &__img-wrap {
      @apply h-auto;
    }
  }
}
</style>
