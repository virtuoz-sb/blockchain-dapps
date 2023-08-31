<template>
  <!-- COMING SOON -->
  <div
    class="flex flex-col items-center justify-center w-full h-full absolute bg-ore-blish-black p-10 xl:p-20 rounded-3 z-1 cursor-not-allowed"
  >
    <div class="flex flex-col items-center w-full mb-25">
      <div class="mb-15">
        <i class="icon-lock text-blue-cl-400" />
      </div>

      <div class="mb-10">
        <span class="text-xl1 leading-xs text-blue-cl-400 text-shadow-4 font-semibold">Unlock Now</span>
      </div>

      <div class="unlock-btn__wrap flex flex-col w-full mx-auto">
        <router-link tag="div" to="/ubxt-staking" class="mb-4">
          <AppButton type="light-green" size="xs" class="w-full mx-auto">Stake on UpBots</AppButton>
        </router-link>

        <p class="algo-bots-detailed__coming-soon-text text-sm text-white text-center ml-auto">
          APR variable min 2500 UBXT
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "ComingSoon" })
export default class ComingSoon extends Vue {}
</script>

<style lang="scss" scoped>
.algo-bots-detailed {
  &__coming-soon-text {
    max-width: 285px;
  }
}

.unlock-btn {
  &__wrap {
    max-width: 200px;
  }
}

.icon-lock {
  font-size: 78px;
}
</style>
