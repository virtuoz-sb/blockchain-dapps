<template>
  <div class="bg-tiber shadow-140 rounded-5 p-15 mb-10 last:mb-0">
    <!-- TYPE -->
    <div class="grid grid-cols-2 col-gap-20 items-center mb-20">
      <p class="text-iceberg leading-xs">Type:</p>

      <div class="flex items-center">
        <div class="flex mr-10">
          <img v-if="data.type === 'DEPOSIT'" src="/img/ubxt-balance/deposit.png" :alt="data.type" class="w-24 h-24" />
          <img v-else src="/img/ubxt-balance/payment2.png" :alt="data.type" class="w-24 h-24" />
        </div>

        <div class="flex">
          <span v-if="data.type" class="text-iceberg leading-xs">{{ getCapitalizeText(data.type) }}</span>
          <span v-else class="flex bg-grey-100 w-full h-px" />
        </div>
      </div>
    </div>

    <!-- STATUS -->
    <div class="grid grid-cols-2 col-gap-20 items-center mb-20 tooltip-box">
      <p class="text-iceberg leading-xs">Status:</p>

      <div class="flex items-center">
        <span v-if="data.status" class="text-iceberg leading-xs">{{ getCapitalizeText(data.status) }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
        <div v-if="isFailed">
          <span class="error-circle mt-2 ml-10 px-5 border text-xs text-red-cl-100 text-shadow-6">i</span>
          <div class="tooltip">
            <span class="triangle"></span>
            {{ data.error }}
          </div>
        </div>
      </div>
    </div>

    <!-- AMOUNT -->
    <div class="grid grid-cols-2 col-gap-20 items-center mb-20">
      <p class="text-iceberg leading-xs">Amount:</p>

      <div class="flex">
        <span v-if="data.amount" class="text-white leading-xs">
          {{ `${Number.isInteger(data.amount) ? data.amount : data.amount.toFixed(6)} UBXT` }}
        </span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </div>

    <!-- CONFIRM% -->
    <div class="grid grid-cols-2 col-gap-20 items-center mb-20">
      <p class="text-iceberg leading-xs">Confirm%:</p>

      <div class="flex">
        <span v-if="data.confirmPercent" class="text-white leading-xs">{{ confirmPercent }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </div>

    <!-- DATE -->
    <div class="grid grid-cols-2 col-gap-20 items-center mb-20">
      <p class="text-iceberg leading-xs">Date:</p>

      <div class="flex">
        <span v-if="data.createdAt" class="text-white leading-xs"> {{ getDate(data.createdAt) }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </div>

    <!-- TRANSACTION HASH -->
    <div class="grid grid-cols-2 col-gap-20 items-center">
      <p class="text-iceberg leading-xs">Transaction Hash:</p>

      <div class="flex">
        <span v-if="data.hash" class="text-iceberg text-sm">
          <a :href="data.explorer" target="_blank" class="cursor-pointer hover:text-white hover:underline">
            {{ reducedHash(data.type == "DEPOSIT" ? data.hash : data.hash) || "" }}
          </a>
          <span class="pl-4 cursor-pointer" @click="copyHash(data)">
            <i class="icon-copy text-white" />
          </span>
        </span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </div>
    <div class="flex justify-center py-10">
      <AppButton v-if="data.details" type="light-green" size="xs" @click="toggleCollapsed()">
        Show details
      </AppButton>
    </div>
    <template v-if="data.details && !isCollapsed">
      <UBXTTransactionItemSubItemMobile v-for="(item, index) in data.details" :key="index" :data="item" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import UBXTTransactionItemSubItemMobile from "@/components/ubxt-wallet/ubxt-transaction-table/UBXTTransactionItemSubItemMobile.vue";

@Component({ name: "UBXTTransactionItemMobile", components: { UBXTTransactionItemSubItemMobile } })
export default class UBXTTransactionItemMobile extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;

  /* DATA */
  isCollapsed: boolean = true;

  /* GETTERS */
  get confirmPercent() {
    if (!this.data.confirmPercent) {
      return "";
    } else if (this.data.confirmPercent == 100) {
      return "100 %";
    }
    return this.data.confirmPercent.toFixed(2) + " %";
  }

  get isFailed() {
    return this.data.status.toLowerCase() === "failed";
  }

  /* METHODS */
  toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
  }

  getCapitalizeText(text: string) {
    return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase().replace("_", " ")}`;
  }

  getDate(createdAt: string) {
    return moment(new Date(createdAt)).format("DD/MM/YYYY HH:mm");
  }

  statusStyle(status: string) {
    return status ? "green" : "grey";
  }

  sideStyle(side: string) {
    return side && side.toLowerCase() === "long" ? "green" : "red";
  }

  profitStyle(profit: number) {
    return profit > 0 ? "text-green-cl-100 text-shadow-2" : "text-red-cl-100 text-shadow-6";
  }

  reducedHash(hash: string) {
    if (this.$breakpoint && this.$breakpoint.width > 900) {
      if (!hash || hash.length <= 20) {
        return hash;
      }
      return hash.slice(0, 20) + " ... " + hash.slice(-18);
    } else {
      return hash.slice(0, 4) + " ... " + hash.slice(-3);
    }
  }

  copyHash(data: any) {
    const hash = data.type == "DEPOSIT" ? data.hash : data.detail.hash;

    var tempInput = document.createElement("input");
    tempInput.value = hash;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }
}
</script>

<style lang="scss" scoped>
.error-circle {
  height: 16px;
  text-align: center;
  line-height: 14px;
  border-radius: 50%;
  cursor: pointer;
}
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
    width: 100%;
    max-width: 400px;
    text-align: center;
    background: rgba(50, 75, 86, 0.95);
    color: #ffffff;
    padding: 10px 10px 10px 10px;
    border-radius: 5px;
    bottom: calc(100% + 11px);
    left: 50%;
    transform: translateX(-50%);
    .triangle {
      border-width: 0px 6px 6px;
      border-color: transparent transparent rgba(50, 75, 86, 0.95);
      position: absolute;
      left: calc(50% + 52px);
      transform: rotate(180deg) translateX(-50%);
      bottom: -6px;
    }
  }
}
</style>
