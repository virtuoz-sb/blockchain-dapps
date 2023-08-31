<template>
  <general-layout
    :title="!!fakeData.botData.description.title ? fakeData.botData.description.title : 'Bot Detailed'"
    content-custom-classes="md:flex-col overflow-y-auto custom-scrollbar"
  >
    <!-- H E A D E R   L E F T -->
    <router-link slot="header-nav-left-start" to="/my-bots" tag="div" class="flex items-center flex-shrink-0 cursor-pointer mr-20">
      <span class="icon-arrow-back text-xxl text-blue-cl-100" />
    </router-link>

    <!-- D E S K T O P   C O N T E N T -->
    <div v-if="!$breakpoint.smAndDown" class="bot-detail__inner flex flex-col items-start w-full relative">
      <div class="flex flex-col w-full flex-grow overflow-y-auto custom-scrollbar">
        <div class="bot-detail__wrap flex flex-shrink-0 w-full">
          <!-- L E F T   S I D E -->
          <div class="bot-detail__left-side flex flex-col flex-grow">
            <!-- B O T   D E T A I L S -->
            <Card
              class="result__inner relative flex flex-col h-3/5 bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar xl:mb-30 xl:mb-40"
              header-classes="flex items-center justify-between"
            >
              <template slot="header-left">
                <span class="leading-md text-white"> Bot details ({{ fakeData.botData.description.title }}) </span>
              </template>
              <!-- <template slot="header-right">
                <span class="icon-edit text-blue-cl-100 text-xs cursor-pointer" />
                <span class="text-xs leading-xs text-blue-cl-100 cursor-pointer pl-8">Edit</span>
              </template> -->

              <bot-details slot="content" :data="botDetailsData" />
            </Card>

            <!-- W E B   H O O K   D E S K T O P -->
            <card
              v-if="$breakpoint.width >= 1280"
              class="web-hook__inner relative flex flex-col h-2/5 bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar"
              header-classes="flex items-center"
            >
              <template slot="header-left">
                <span class="leading-md text-white">Webhooks</span>
              </template>

              <web-hook
                slot="content"
                :data="webHookData"
                :stratType="fakeData.botData.description.strategy"
                class="py-10 overflow-y-auto custom-scrollbar"
              />
            </card>
          </div>

          <!-- R I G H T   S I D E -->
          <div class="bot-detail__right-side flex flex-col w-full ml-20 lg:ml-30 xl:ml-40 overflow-y-auto custom-scrollbar">
            <!-- P E R F O R M A N C E -->
            <card
              class="relative flex flex-col flex-grow bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar"
              header-classes="flex items-center"
            >
              <template slot="header-left">
                <span class="leading-md text-white">Performance</span>
              </template>

              <performance slot="content" :data="fakeData.ditailedData" class="flex-1" />
            </card>
          </div>
        </div>

        <!-- W E B   H O O K   T A B L E T -->
        <card
          v-if="$breakpoint.width < 1280"
          class="web-hook__inner relative flex flex-col w-full bg-dark-200 rounded-3 mt-30 overflow-y-auto custom-scrollbar"
          header-classes="flex items-center"
        >
          <template slot="header-left">
            <span class="leading-md text-white">Web Hook</span>
          </template>

          <web-hook
            slot="content"
            :data="webHookData"
            :stratType="fakeData.botData.description.strategy"
            class="py-10 overflow-y-auto custom-scrollbar"
          />
        </card>

        <!-- C O M I N G   S O O N -->
        <coming-soon-desktop v-if="isComingSoon" />
      </div>
    </div>

    <!-- M O B I L E   C O N T E N T -->
    <template v-else>
      <div v-if="!isComingSoon" class="w-full flex flex-col flex-grow bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
        <div class="flex items-center min-h-40 border-b border-solid border-grey-cl-300 px-20 py-7">
          <span class="leading-md text-white">Performance</span>
        </div>
        <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar mb-35">
          <!-- P E R F O R M A N C E -->
          <performance :data="fakeData.ditailedData" class="flex-shrink-0 mb-40" />

          <!-- B O T   D E T A I L S -->
          <div class="flex flex-col flex-shrink-0 mb-40">
            <div class="flex items-center justify-between px-20 mb-30">
              <div class="flex mr-20">
                <span class="text-white text-xl1">Bot details ({{ fakeData.botData.description.title }})</span>
              </div>
              <div class="flex items-center">
                <span class="icon-edit text-blue-cl-100 text-xs cursor-pointer" />
                <span class="text-xs leading-xs text-blue-cl-100 cursor-pointer pl-8">Edit</span>
              </div>
            </div>

            <bot-details :data="botDetailsData" />
          </div>

          <!-- W E B   H O O K -->
          <div class="flex flex-col flex-shrink-0">
            <div class="flex items-center px-20 mb-15">
              <span class="text-white text-xl1">Web Hook</span>
            </div>

            <web-hook :data="webHookData" :stratType="fakeData.botData.description.strategy" />
          </div>
        </div>
      </div>

      <!-- C O M I N G   S O O N -->
      <div v-if="isComingSoon" class="w-full flex flex-col">
        <coming-soon-without-design />
      </div>
    </template>
  </general-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State } from "vuex-class";
import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";
import BotDetails from "@/components/bot-detail/BotDetails.vue";
import WebHook from "@/components/bot-detail/WebHook.vue";
import Performance from "@/components/bot-detail/Performance.vue";

@Component({ name: "BotDetail", components: { GeneralLayout, BotDetails, WebHook, Performance }, mixins: [ComingSoon] })
export default class BotDetail extends Vue {
  /* V U E X */
  @State botDetailFakeData: any;

  /* D A T A */
  fakeData: any = {};

  botDetailsData: any = {
    botParameters: { yourAccount: "", exchange: "", pair: "", strategy: "" },
    botEntryLong: { entryTrigger: "Trading View webhook", orderType: "Adaptive limit", sizePosition: "75%", leverage: "33x" },
    botEntryShort: { entryTrigger: "Trading View webhook", orderType: "Adaptive limit", sizePosition: "25%", leverage: "12x" },
    averageDown: {
      level1: { belowPrice: "10", sizePosition: "20" },
      level2: { belowPrice: "30", sizePosition: "40" },
    },
    botsExit: {
      trigger: "Trading View webhook",
      target: [
        { type: "Limit", targetType: "Take profit", profit: "10", profitPercentage: "5" },
        { type: "Limit", targetType: "Take profit", profit: "20", profitPercentage: "10" },
      ],
      stopLoss: { stopType: "StopLoss", entryPrice: "50", profitPercentage: "10" },
    },
    botSafeties: { losses: "3", trades: "2", profit: "1" },
  };

  webHookData: any[] = [
    {
      id: 1,
      title: "Start Long",
      desc: `
      {
        "message_type": "bot",
        "bot_id": 1367447,
        "email_token": "zzddc9ea-d00d-4a0d-ab9e-31334c9ecd37",
      " action": "open_long"
      }`,
    },
    {
      id: 2,
      title: "Start Short",
      desc: `
      {
        "message_type": "bot",
        "bot_id": 1367447,
        "email_token": "zzddc9ea-d00d-4a0d-ab9e-31334c9ecd37",
       " action": "open_short"
      }`,
    },
    {
      id: 3,
      title: "Close Position",
      desc: `
             {
        "message_type": "bot",
        "bot_id": 1367447,
        "email_token": "zzddc9ea-d00d-4a0d-ab9e-31334c9ecd37",
       " action": "close_position"
      }`,
    },
  ];

  /* H O O K S */
  created() {
    const { query } = this.$route;
    if (query.hasOwnProperty("bot")) {
      const data = this.botDetailFakeData.find((b: any) => b.id === query.bot);
      this.fakeData = data;
      this.botDetailsData.botParameters.yourAccount = `${this.fakeData.botData.description.exchange}1`;
      this.botDetailsData.botParameters.exchange = this.fakeData.botData.description.exchange;
      this.botDetailsData.botParameters.pair = this.fakeData.botData.description.pair;
      this.botDetailsData.botParameters.strategy = this.fakeData.botData.description.strategy;
    }
  }
}
</script>

<style lang="scss" scoped>
.bot-detail {
  &__right-side {
    max-width: 590px;
  }
  @media (max-width: 1279px) {
    &__wrap {
      height: 770px;
    }
    &__right-side {
      @apply max-w-full;
    }
    &__left-side {
      @apply w-full h-full flex-shrink-0;
      max-width: 240px;
    }
  }
}

.result {
  &__inner {
    @media (max-width: 1279px) {
      @apply h-full w-full;
    }
  }
}

.web-hook {
  &__inner {
    @media (min-width: 768px) {
      &:after {
        content: "";
        bottom: -1px;
        height: 55px;
        background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
        @apply absolute left-0 w-full;
      }
    }

    @media (max-width: 1279px) {
      @apply flex-shrink-0;
      height: 264px;
    }
  }
}
</style>
