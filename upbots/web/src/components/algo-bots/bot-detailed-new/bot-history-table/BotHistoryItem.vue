<template>
  <tr>
    <td class="table_column_1 pt-10 pb-10 pl-20">
      <div class="flex">
        <span v-if="data.sbl" class="text-iceberg text-sm leading-xs">{{ data.sbl }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>

    <td class="table_column_2 pt-10 pb-10">
      <div class="flex">
        <div v-if="data.hasOwnProperty('open')" class="flex items-center">
          <span class="cicle w-8 h-8 rounded-full mr-10" :class="statusStyle(data.open)" />
          <span class="text-iceberg text-sm leading-xs">{{ data.open ? "OPEN" : "CLOSED" }}</span>
        </div>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>

    <td rowspan="1" colspan="1" class="table_column_3 pt-10 pb-10">
      <div class="flex">
        <div v-if="data.stratType" class="flex items-center">
          <span class="icon-arrow-expand" :class="sideStyle(data.stratType)" />
          <span class="text-iceberg text-sm leading-xs ml-10">{{ data.stratType }}</span>
        </div>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>

    <td rowspan="1" colspan="1" class="table_column_4 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.entryPrice" class="text-iceberg text-sm leading-xs">{{ data.entryPrice }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>

    <td rowspan="1" colspan="1" class="table_column_5 pb-10 pt-10">
      <div class="flex">
        <span v-if="data.closePrice" class="text-iceberg text-sm leading-xs"> {{ data.closePrice }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>

    <td rowspan="1" colspan="1" class="table_column_6 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.profitPercentage" class="text-sm leading-xs" :class="profitStyle(data.profitPercentage)">
          {{ data.profitPercentage | toProfit }}
        </span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>

    <td rowspan="1" colspan="1" class="table_column_7 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.openAt" class="text-iceberg text-sm leading-xs">{{ data.openAt | dateLocal }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>

    <td rowspan="1" colspan="1" class="table_column_8 pt-10 pb-10">
      <div class="flex">
        <span v-if="data.closeAt" class="text-iceberg text-sm leading-xs">{{ data.closeAt | dateLocal }}</span>
        <span v-else class="flex bg-grey-100 w-full h-px mr-20" />
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "BotHistoryItem" })
export default class BotHistoryItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;

  /* METHODS */
  statusStyle(status: string) {
    return status ? "green" : "grey";
  }

  sideStyle(side: string) {
    return side && side.toLowerCase() === "long" ? "green" : "red";
  }

  profitStyle(profit: number) {
    return profit > 0 ? "text-green-cl-100 text-shadow-2" : "text-red-cl-100 text-shadow-6";
  }
}
</script>

<style lang="scss" scoped>
.cicle {
  &.grey {
    @apply bg-grey-cl-400;
  }
  &.green {
    @apply bg-green-cl-100 shadow-70;
  }
}

.icon-arrow-expand {
  font-size: 6px;
  &.red {
    @apply text-red-cl-100;
    background-blend-mode: normal, overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(255, 49, 34, 0.5);
  }
  &.green {
    @apply text-green-cl-100 transform rotate-180;
    background-blend-mode: overlay, normal, normal;
    text-shadow: 0px 0px 7px rgba(89, 167, 51, 0.5);
  }
}
</style>
