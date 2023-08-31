<template>
  <div>
    <!-- TABLE LABELS -->
    <ul class="flex justify-between text-hidden-sea-glass px-12">
      <li class="min-w-19 border-b border-grey-cl-300 md:hidden" />

      <li class="min-w-19 border-b border-grey-cl-300 md:hidden" />

      <li
        v-for="(item, index) in tableHeaders"
        :key="index"
        class="flex-1 block min-w-130 md:min-w-150 text-left py-12 pl-20 md:px-20 font-normal truncate border-b border-grey-cl-300"
      >
        {{ item.name }}
        <div v-if="item.sortable" class="inline-block w-7 ml-8">
          <i
            class="block icon-arrow-expand text-xxxs text-white transform rotate-180 cursor-pointer"
            @click="$emit('set-sort', 'up', item.field)"
          />
          <i class="block icon-arrow-expand text-xxxs text-white cursor-pointer mt-2" @click="$emit('set-sort', 'down', item.field)" />
        </div>
      </li>

      <li class="min-w-24 border-b border-grey-cl-300 hidden md:block" />

      <li class="min-w-24 border-b border-grey-cl-300 hidden md:block" />
    </ul>

    <!-- TABLE CONTENT -->
    <div class="table-wrap">
      <div class="block h-full w-full py-12">
        <div v-for="(data, index) in tableData" :key="index" class="flex justify-between px-12 text-iceberg">
          <template v-for="item in tableHeaders">
            <!-- MY EXCHANGES KEYS TABLE ITEM -->
            <MyExchangesKeysTableItem :data="data[item.field]" :field="item.field" :key="item.filed" />
          </template>

          <div class="flex items-center pb-15 px-5 mr-4">
            <i class="icon-edit text-blue-cl-100 text-sm cursor-pointer block" @click="$emit('set-edit-data', data)" />
          </div>

          <div class="flex items-center pb-15 px-5">
            <i class="icon-trash text-blue-cl-100 text-sm cursor-pointer block" @click="$emit('remove', data)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ExchangeKey } from "@/store/exchangeKeys/types";

import MyExchangesKeysTableItem from "@/components/keys/exchange-keys/MyExchangesKeysTableItem.vue";

@Component({ name: "MyExchangesKeysTable", components: { MyExchangesKeysTableItem } })
export default class MyExchangesKeysTable extends Vue {
  /* PROPS */
  @Prop({ required: true }) tableData!: ExchangeKey[];

  /* DATA */
  tableHeaders: { name: string; field: string; sortable: boolean }[] = [
    { name: "Exchange", field: "exchange", sortable: true },
    { name: "Name", field: "name", sortable: true },
    { name: "Create Date", field: "created", sortable: true },
    { name: "Last Update", field: "updated", sortable: false },
    { name: "Status", field: "valid", sortable: false },
  ];
}
</script>
