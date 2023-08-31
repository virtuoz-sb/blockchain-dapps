<template>
  <tr>
    <td class="relative table_column_1 pt-10 pb-10 pl-0">
      <div />
    </td>
    <td class="table_column_1 pt-10 pb-10 pl-0">
      <div class="flex">
        <span v-if="data.type" class="text-iceberg px-10 text-base italic">&rarr;&nbsp;{{ getType() }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>
    <td class="table_column_2 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.status" class="text-iceberg px-10 text-base">{{ data.botName }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>
    <td class="table_column_2 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.status" class="text-iceberg px-10 text-base">{{ getCapitalizeText(data.status) }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
        <div v-if="isFailed && data.error" class="tooltip-box">
          <span class="error-circle mt-2 px-5 border text-xs text-red-cl-100 text-shadow-6">i</span>
          <div class="tooltip">
            <span class="triangle"></span>
            {{ data.error }}
          </div>
        </div>
      </div>
    </td>
    <td rowspan="1" colspan="1" class="table_column_3 px-10 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.amount" class="text-white text-base">{{ getAmount() }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>
    <td rowspan="1" colspan="1" class="table_column_4 px-10 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.confirmPercent" class="text-iceberg text-base">{{ confirmPercent }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>
    <td rowspan="1" colspan="1" class="table_column_6 px-10 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.createdAt" class="text-iceberg text-base"> {{ getDate(data.createdAt) }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>
    <td rowspan="1" colspan="1" class="table_column_5 px-10 pt-10 pb-10">
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
    </td>
  </tr>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import { TransactionTypes } from "@/store/perfees/types";

@Component({ name: "UBXTTransactionItem" })
export default class UBXTTransactionItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;

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
  getCapitalizeText(text: string) {
    return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase().replace("_", " ")}`;
  }

  getType() {
    let type = this.getCapitalizeText(this.data.type);
    if (this.data.subType) {
      type = this.getCapitalizeText(this.data.subType);
    }
    return type;
  }

  getAmount() {
    if (
      this.data.type === TransactionTypes.PERFORMANCE_FEE &&
      Number(this.data.amount) > 0 &&
      Number(this.data.totalAmount) > 0 &&
      this.data.totalAmount > this.data.amount
    ) {
      return `${this.data.amount.toFixed(3)}/${this.data.totalAmount.toFixed(3)} UBXT`;
    } else {
      return `${Number.isInteger(this.data.amount) ? this.data.amount : this.data.amount.toFixed(3)} UBXT`;
    }
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
    width: 400px;
    max-width: 400px;
    background: rgba(50, 75, 86, 0.95);
    color: #ffffff;
    padding: 10px 10px 10px 10px;
    border-radius: 5px;
    bottom: calc(100% + 11px);
    transform: translate-x(-50%);
    left: -80%;
    .triangle {
      border-width: 0px 6px 6px;
      border-color: transparent transparent rgba(50, 75, 86, 0.95);
      position: absolute;
      left: 10px;
      transform: rotate(180deg) translateX(-50%);
      bottom: -6px;
    }
  }
}
</style>
