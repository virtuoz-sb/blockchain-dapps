<template>
  <div class="table__inner">
    <div class="w-full overflow-x-auto custom-scrollbar">
      <div class="w-full">
        <div class="table relative flex-1 w-full max-w-full overflow-hidden">
          <div class="w-full">
            <table cellspacing="0" cellpadding="0" border="0" class="table__header w-full md:px-20">
              <colgroup>
                <col v-for="(item, index) in tableColData" :key="index" :name="`table_column_${index}`" :width="item" />
              </colgroup>
              <thead class="has-gutter">
                <tr>
                  <th v-for="(item, index) in tableLabels" :key="index" colspan="1" rowspan="1" :class="`table_column_${index + 1}`">
                    <div class="text-iceberg font-normal px-10 text-base py-8 text-left">{{ item }}</div>
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <div class="table__body-wrapper w-full custom-scrollbar md:px-20">
            <table ref="table" cellspacing="0" cellpadding="0" border="0" class="table__body w-full">
              <colgroup>
                <col v-for="(item, index) in tableColData" :key="index" :name="`table_column_${index}`" :width="item" />
              </colgroup>

              <tbody v-for="(item, index) in tableData" :key="index">
                <tr class="text-white">
                  <td class="flex pl-10 mb-10">
                    <div v-if="getPairData(item.botRef)" class="w-32 h-18 mr-10 relative">
                      <CryptoCoinChecker :data="getPairData(item.botRef).base" class="absolute top-0 left-0">
                        <template>
                          <cryptoicon :symbol="getPairData(item.botRef).base" size="18" generic />
                        </template>
                      </CryptoCoinChecker>

                      <CryptoCoinChecker :data="getPairData(item.botRef).quote" class="absolute top-0 right-0">
                        <template>
                          <cryptoicon :symbol="getPairData(item.botRef).quote" size="18" generic />
                        </template>
                      </CryptoCoinChecker>
                    </div>
                    <span class="text-sm md:text-base">{{ item.name }}</span>
                  </td>
                  <td class="text-sm md:text-base text-left mb-10 pl-10">{{ getDate(item.activatedAt) }}</td>
                  <td class="text-sm md:text-base text-left mb-10 pl-30">{{ item.totalUsers }}</td>
                  <td class="text-sm md:text-base text-left mb-10 pl-30">{{ item.totalRealisedUbxtGain | toDefaultFixed }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { AlgoBotsStats } from "@/store/algo-bots/types/algo-bots-stats.payload";
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";
import moment from "moment";

const algobots = namespace("algobotsModule");

@Component({ name: "MyRentedBotTable" })
export default class MyRentedBotTable extends Vue {
  /* PROPS */
  @Prop({ required: true }) tableData: AlgoBotsStats[];

  /* VUEX */
  @algobots.Getter getAlgoBots: AlgoBot[];

  /* METHOD */
  getPairData(botRef: string) {
    if (this.getAlgoBots) {
      return this.getAlgoBots.find((bot: AlgoBot) => bot.id === botRef);
    }
    return null;
  }

  getDate(createdAt: string) {
    return moment(new Date(createdAt)).format("DD/MM/YYYY HH:mm");
  }

  /* COMPUTED */
  get tableColData() {
    if (this.$breakpoint.width > 1024) {
      return ["30%", "30%", "20%", "20%"];
    } else {
      return ["35%", "25%", "20%", "20%"];
    }
  }

  get tableLabels() {
    if (this.$breakpoint && this.$breakpoint.width <= 768) {
      return ["Algobot", "Activated", "Total Users", "Total Gained"];
    } else {
      return ["Algobot", "Activated", "Total Users", "Total Gained UBXT"];
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  &__body,
  &__header {
    table-layout: fixed;
    border-collapse: separate;
  }
}

.table {
  &__body-wrapper {
    @apply overflow-hidden relative;
    height: 197px;
  }

  .table {
    &__body-wrapper {
      @apply overflow-y-auto;
    }
  }
}
</style>
