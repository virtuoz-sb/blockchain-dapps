<template>
  <div class="flex flex-col md:py-20">
    <!-- TOTAL BALANCE -->
    <div class="flex flex-col items-center justify-center pb-20 px-20">
      <p class="flex text-iceberg text-md leading-xs mb-20">Total UBXT Balance</p>
      <p class="flex text-bright-turquoise text-xl leading-xs font-bold">
        <span class="block truncate">{{ Number.isInteger(balance) ? balance : balance == 0 ? 0 : balance.toFixed(4) }}</span>
        &nbsp;
        <span class="font-light">UBXT</span>
      </p>
    </div>

    <div class="flex">
      <!-- <div class="tooltip-box">
        <AppButton :disabled="true" type="light-green" size="xs" @click="$emit('clickDeposit')">Top Up</AppButton>
        <div class="tooltip">
          <span class="triangle"></span>
          Deposit currently under maintenance
        </div>
      </div> -->
      <AppButton :disabled="!enablePerfFees" type="light-green" size="xs" @click="$emit('clickDeposit')">Top Up</AppButton>
      <AppButton :disabled="!enablePerfFees" type="light-green" size="xs" class="ml-4" @click="$emit('clickWithdraw')">Withdraw</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "UBXTBalance" })
export default class UBXTBalance extends Vue {
  /* PROPS */
  @Prop({ required: true }) balance: number;
  @Prop({ required: true }) enablePerfFees: boolean;
}
</script>

<style lang="scss" scoped>
.tooltip-box {
  position: relative;
  &:hover {
    .tooltip {
      display: block;
    }
  }
  .tooltip {
    display: none;
    position: absolute;
    width: 240px;
    background: rgba(50, 75, 86, 0.95);
    color: #ffffff;
    text-align: center;
    padding: 10px 10px 10px 10px;
    border-radius: 5px;
    bottom: calc(100% + 11px);
    transform: translate-x(-50%);
    left: -120%;
    .triangle {
      border-width: 0px 6px 6px;
      border-color: transparent transparent rgba(50, 75, 86, 0.95);
      position: absolute;
      left: calc(50% - 12px);
      transform: rotate(180deg) translateX(-50%);
      bottom: -6px;
    }
  }
}
</style>
