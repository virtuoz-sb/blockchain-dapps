<template>
  <div
    class="flex items-center justify-center relative w-40 md:w-64 h-40 md:h-64 border border-solid border-grey-cl-200 rounded-full p-5 md:p-10"
    :class="customClasses"
  >
    <img src="@/assets/images/dashboard-images/ubxt.svg" alt="ubxt" class="w-full h-full object-cover" />
    <div
      class="chain-token__exchange-icon flex items-center absolute w-20 h-20 md:w-25 md:h-25 border border-solid bg-white border-grey-cl-200 rounded-full"
    >
      <img :src="require(`@/assets/images/bridge/${chainName}.svg`)" alt="ethereum" class="w-full h-full object-cover" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "ChainTokenIcon" })
export default class ChainTokenIcon extends Vue {
  /* PROPS */
  @Prop({ default: "eth" }) chainName: string; // eth, bsc
  @Prop({ default: "" }) customClasses: string;
}
</script>

<style lang="scss" scoped>
.chain-token {
  &__exchange-icon {
    bottom: -5px;
    right: -5px;

    @media (max-width: 767px) {
      bottom: -5px;
      right: -5px;
    }
  }
}
</style>
