<template>
  <general-layout title="Admin: All Algobots Subscriptions">
    <div v-if="loading === false" class="flex flex-col w-full h-full" style="color: white;">
      <div style="border: 1px solid red;" v-for="(item, index) in getAdminBotsSubcriptions" :key="index">
        {{ item }}
      </div>
    </div>
  </general-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import GeneralLayout from "@/views/GeneralLayout.vue";
import moment from "moment";
import { AdminAlgoBotSubscription } from "../../store/algo-bots/types/admin-algo-bots.payload";

const algobots = namespace("algobotsModule");

@Component({ name: "AdminAlgobots", components: { GeneralLayout } })
export default class AdminAlgobots extends Vue {
  /* VUEX */
  @algobots.Action fetchAdminAlgoBotsSubscriptionsAction: () => Promise<AdminAlgoBotSubscription[]>;
  @algobots.Getter getAdminBotsSubcriptions: AdminAlgoBotSubscription[];

  /* DATA */
  loading: boolean = false;

  /* HOOKS */
  async mounted() {
    this.loading = true;
    await this.fetchAdminAlgoBotsSubscriptionsAction();
    // eslint-disable-next-line no-console
    console.log(this.getAdminBotsSubcriptions);
    this.loading = false;
  }
}
</script>

<style lang="scss" scoped>
.search-input {
  max-width: 310px;
}

.notifications {
  &__label {
    &--date {
      width: 35%;
      min-width: 332px;
    }
  }
  &__item {
    &.is-unread {
      background: rgba(46, 47, 51, 0.4);
    }
  }
  &__item-date {
    width: 35%;
    min-width: 332px;
  }
}
</style>
