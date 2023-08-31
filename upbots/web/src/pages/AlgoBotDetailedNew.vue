<template>
  <GeneralLayout
    :title="algobotData && algobotData.name"
    class="overflow-x-hidden"
    content-custom-classes="algo-bot-detailed-inactive md:flex-col overflow-y-auto custom-scrollbar"
  >
    <router-link slot="header-nav-left-start" to="/algo-bots" tag="div" class="flex items-center flex-shrink-0 cursor-pointer mr-20">
      <span class="icon-arrow-back text-xxl text-astral" />
    </router-link>

    <!-- SCROLL TO CONFIGURE BLOCK (FOR TABLET AND DESKTOP VIEWS) -->
    <a
      v-if="status === 'inactive' && !$breakpoint.smAndDown"
      href="#configure"
      slot="header-right-side-start"
      class="flex items-center flex-shrink-0 cursor-pointer mr-20"
    >
      <AppButton type="light-green" size="xs">Configure</AppButton>
    </a>

    <!-- DETAILED-TO-ACTIVATE -->
    <BotDetailedToActivate v-if="status === 'inactive'" />

    <!-- DETAILED-ACTIVATED -->
    <BotDetailedActivated v-else />
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { State, namespace } from "vuex-class";
import { AlgoBotSubscription } from "../store/algo-bots/types/algo-bots.payload";

const algobots = namespace("algobotsModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import BotDetailedToActivate from "@/components/algo-bots/bot-detailed-new/BotDetailedToActivate.vue";
import BotDetailedActivated from "@/components/algo-bots/bot-detailed-new/BotDetailedActivated.vue";

@Component({
  name: "AlgoBotDetailed",
  components: { GeneralLayout, BotDetailedToActivate, BotDetailedActivated },
})
export default class AlgoBotDetailed extends Vue {
  /* VUEX */
  @State isLoading: boolean;
  @algobots.Getter getAlgoBotById: any;
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @algobots.Action fetchAlgoBotsSubscriptionsAction: () => Promise<AlgoBotSubscription[]>;

  /* DATA */
  algobotData: any = null;

  /* COMPUTED */
  get status() {
    if (!this.algobotData) {
      return "inactive";
    }

    const activeBots = this.getBotsSubcriptions.filter((sub) => sub.enabled).map((sub) => sub.botId);
    const pausedBots = this.getBotsSubcriptions.filter((sub) => !sub.enabled).map((sub) => sub.botId);
    const botId = this.algobotData.id;

    if (activeBots.includes(botId)) {
      return "active";
    } else if (pausedBots.includes(botId)) {
      return "paused";
    } else {
      return "inactive";
    }
  }

  /* WATCHERS */
  @Watch("isLoading")
  handler(val: boolean) {
    if (!val) {
      this.algobotData = this.getAlgoBotById(this.$route.params.id);
    }
  }

  /* HOOKS */
  async mounted() {
    await this.fetchAlgoBotsSubscriptionsAction();
  }
}
</script>

<style lang="scss" scoped>
.bot-detailed {
  &__header-tag {
    max-width: 122px;
  }

  &__left-side-tabs {
    height: 598px;
    max-width: 370px;

    &.shadow {
      &:after {
        content: "";
        bottom: -1px;
        height: 55px;
        background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
        @apply absolute left-0 w-full;
      }
    }
  }

  &__chart {
    height: 280px;
  }

  &__right-side-tabs {
    height: 278px;
  }

  @media (max-width: 1280px) {
    &__left-side-tabs {
      max-width: 200px;
    }

    &__chart {
      height: 222px;
    }

    &__right-side-tabs {
      height: 228px;
    }
  }
}

.chart {
  &__circle {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, #9277af, #9277af),
      #c4c4c4;
    background-blend-mode: overlay, normal, normal;
    box-shadow: 0px 0px 7px rgba(146, 119, 175, 0.5);
  }
}

.bot-detailed-description {
  &__wrap {
    min-height: 130px;
  }
}

::v-deep .algo-bot-detailed-inactive {
  scroll-behavior: smooth;
}
</style>
