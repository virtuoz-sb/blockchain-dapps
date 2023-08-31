<template>
  <div class="modal__wrap relative flex flex-col bg-dark-200 rounded-3 pt-70 pb-40 px-20">
    <div class="flex flex-col items-center overflow-y-auto custom-scrollbar md:overflow-visible">
      <h2 class="tutorial__title w-full font-raleway text-xxl text-white-lilac text-center mb-20 mx-auto">
        Access a trading superstore
      </h2>

      <div class="tutorial__img w-full mb-20">
        <img src="/img/homepage/tutorial/step-7-img.png" alt="img" class="w-full h-full object-cover" />
      </div>

      <div class="tutorial__paragraph flex flex-col w-full text-base leading-sm text-iceberg text-center mx-auto mb-25">
        <span>
          And we arrive to the corner stone of why you are going to fall in love with Upbots. The Upbots Marketplace. Here you will be able
          to:
        </span>
        <span>- rent algos (developed by the UpBot’s community ) on a performance fee basis,</span>
        <span>- access courses on every aspect of trading (whatever flavour you prefer best)</span>
        <span>- the best signal provider subscriptions in the marketplace</span>
        <span>- DeFi Solutions: direct swaps and more</span>
        <span>- Access liquidity pools or other staking options via our partners</span>
      </div>

      <AppButton type="light-green" class="tutorial__btn w-full" @click="$emit('next')">Next</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "StepSeventh" })
export default class StepSeventh extends Vue {}
</script>

<style lang="scss" scoped>
.modal {
  &__wrap {
    min-height: 630px;
    @media (max-width: 767px) {
      &__img {
        min-height: 640px;
      }
    }
  }
}

.tutorial {
  &__title {
    max-width: 300px;
  }

  &__paragraph {
    max-width: 470px;
  }

  &__img {
    max-width: 400px;
    min-height: 250px;
  }

  &__btn {
    max-width: 320px;
  }

  @media (max-width: 767px) {
    &__img {
      min-height: 180px;
    }
  }
}
</style>
