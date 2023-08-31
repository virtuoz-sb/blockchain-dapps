<template>
  <GeneralLayout title="My Bots" content-custom-classes="overflow-y-auto custom-scrollbar">
    <!-- HEADER LEFT -->
    <router-link slot="header-nav-left-end" to="/create-new-bot" class="ml-20">
      <AppButton
        type="light-green-bordered"
        size="xxs"
        class="my-bots__create-bot-btn-wrap hidden sm:block text-sm leading-sm ml-30 md:ml-0"
      >
        Create New Bot
      </AppButton>
    </router-link>

    <!-- MY BOTS -->
    <div v-if="!isComingSoon" class="flex flex-col w-full relative overflow-hidden">
      <Card
        class="flex flex-col w-full h-full bg-dark-200 rounded-t-15 md:rounded-3"
        header-classes="flex items-center justify-between"
        :header="$breakpoint.smAndDown ? false : true"
      >
        <template slot="header-left">
          <span class="leading-md text-white">My Bots</span>
        </template>
        <div slot="content" class="flex flex-col overflow-y-auto custom-scrollbar">
          <!-- BOT FILTERS -->
          <BotFilters :showButton="false" />

          <!-- BOT CARDS -->
          <div class="mt-5 px-20 pb-20 overflow-y-auto custom-scrollbar">
            <div class="my-bots__card-wrap grid row-gap-25 col-gap-25 cursor-pointer" :class="{ 'grid-cols-3': !$breakpoint.mdAndDown }">
              <!-- BOT CARD -->
              <router-link v-for="item of botDetailFakeData" :key="item.id" :to="{ name: 'bot-detail', query: { bot: item.id } }" tag="div">
                <BotCard
                  is-fake
                  :bot-data="item"
                  :chart-data="item.botData.chartData"
                  :chart-option="chartOptions"
                  chart-classes="h-120"
                  class="shadow-110 rounded-5 py-20"
                >
                  <div slot="header" class="my-bots__card flex flex-col">
                    <div class="flex items-center justify-between mb-20 px-20">
                      <div class="flex items-center">
                        <AppSwitcher v-model="item.botData.description.switch" />
                        <p class="text-iceberg text-base ml-14">{{ item.botData.description.title }}</p>
                      </div>
                      <!-- COMING SOON -->
                      <!-- <app-dropdown-basic v-model="selectedOption" :options="dropdownData" dots dark /> -->
                    </div>
                    <div class="grid grid-cols-3 row-gap-10 col-gap-15 mb-30 px-20">
                      <div class="flex items-center">
                        <span class="text-xs text-iceberg mr-10">Created:</span>
                        <span class="text-xs text-white">{{ item.botData.description.created | dateLocal }}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-xs text-iceberg mr-10">Exchange:</span>
                        <span class="text-xs text-white">{{ item.botData.description.exchange }}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-xs text-iceberg mr-10">Strategy:</span>
                        <span class="text-xs text-white">{{ item.botData.description.strategy }}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-xs text-iceberg mr-10">Pair:</span>
                        <span class="text-xs text-white">{{ item.botData.description.pair }}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-xs text-iceberg mr-10">Position:</span>
                        <span
                          class="text-xs"
                          :class="[
                            { 'text-red-cl-100': item.botData.description.position === 'Closed' },
                            { 'text-green-cl-100': item.botData.description.position === 'Open' },
                            {
                              'text-white': item.botData.description.position !== 'Closed' || item.botData.description.position !== 'Open',
                            },
                          ]"
                        >
                          {{ item.botData.description.position }}
                        </span>
                      </div>
                      <div class="flex items-center">
                        <span class="text-xs text-iceberg mr-10">Bot Profit:</span>
                        <span class="text-xs text-green-cl-100">{{ item.botData.description.botProfit }}</span>
                      </div>
                    </div>
                  </div>
                </BotCard>
              </router-link>
            </div>
          </div>

          <!-- CREATE NEW BOT BTN -->
          <router-link tag="div" :to="{ name: 'create-new-bot' }" class="add-exchanges-btn flex fixed right-20">
            <AppButton v-if="$breakpoint.smAndDown" type="circle" icon="icon-plus" class="w-70 h-70" />
          </router-link>
        </div>
      </Card>
    </div>

    <!-- COMING SOON -->
    <div v-if="isComingSoon" class="w-full flex flex-col">
      <ComingSoonWithoutDesign />
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State } from "vuex-class";
import { GroupItems } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";

@Component({ name: "MyBots", components: { GeneralLayout }, mixins: [ComingSoon] })
export default class MyBots extends Vue {
  /* VUEX */
  @State botDetailFakeData: any;

  /* DATA */
  selectedOption = { value: "1", label: "One" };
  dropdownData: GroupItems[] = [
    { value: "1", label: "Activate" },
    { value: "2", label: "Modify" },
    { value: "3", label: "Remove" },
    { value: "4", label: "Info" },
    { value: "5", label: "Duplicate" },
  ];

  chartOptions = {
    scales: {
      yAxes: [
        {
          ticks: {
            padding: 0,
            fontColor: "#427E7E",
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    tooltips: {
      enabled: false,
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
  };
}
</script>

<style lang="scss" scoped>
.my-bots {
  &__create-bot-btn-wrap {
    min-width: 120px;
  }
  &__card-wrap {
    grid-auto-rows: minmax(min-content, max-content);
  }
  @media (max-width: 1300px) {
    &__card-wrap {
      @apply grid-cols-2;
    }
  }
  @media (max-width: 900px) {
    &__card-wrap {
      @apply grid-cols-1;
    }
  }
}

.add-exchanges-btn {
  bottom: 80px;
}
</style>
