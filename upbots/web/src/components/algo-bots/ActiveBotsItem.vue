<template>
  <router-link
    class="mb-20 last:mb-0 md:mb-0"
    :to="{ name: 'algo-bot-detailed', params: { id: (algoBot && algoBot.id) || 0, name: (algoBot && algoBot.name) || '' } }"
    tag="div"
    exact
  >
    <!-- DESKTOP -->
    <div
      v-if="!$breakpoint.smAndDown"
      class="table__cell flex items-center shadow-140 rounded-4 md:py-14 mb-20 md:mb-10 md:mx-20 last:mb-0"
    >
      <div class="table__col-1 flex items-center pl-20 pr-10 md:pl-10 lg:px-20">
        <AppSwitcher :value="data.enabled" class="mr-15" @click="changeSwitcher(data)" />
        <!-- <div class="flex items-center cursor-pointer mr-15">
          <i class="icon-edit text-base text-blue-cl-100" />
        </div> -->
        <div class="flex items-center cursor-pointer" @click.stop="$emit('delete')">
          <i class="icon-trash text-base text-blue-cl-100" />
        </div>
      </div>

      <div class="table__col md:truncate text-iceberg text-sm pr-10 lg:pr-20">{{ algoBot && algoBot.name }}</div>

      <div class="table__col md:truncate text-iceberg text-sm pr-10 lg:pr-20">{{ exchangeKey && exchangeKey.name }}</div>

      <div class="table__col md:truncate text-iceberg text-sm pr-10 lg:pr-20">{{ data.createdAt }}</div>

      <div class="table__col md:truncate text-iceberg text-sm pr-10 lg:pr-20">
        {{ data.stratType }}, {{ data.botRunning ? "Open" : "Close" }}
      </div>

      <div class="table__col text-grey-cl-100 text-sm text-shadow-2 pr-20 md:pr-10 lg:pr-20" />
    </div>

    <!-- MOBILE -->
    <div v-else class="flex flex-col bg-tiber shadow-140 p-20 rounded-15">
      <div class="flex items-center justify-between mb-10">
        <span class="flex flex-shrink-0 text-iceberg leading-xs mr-20">Bot name</span>
        <span class="block truncate text-white leading-xs">{{ algoBot && algoBot.name }}</span>
      </div>

      <div class="flex items-center justify-between mb-10">
        <span class="flex flex-shrink-0 text-iceberg leading-xs mr-20">Account plugged </span>
        <span class="block truncate text-white leading-xs">{{ exchangeKey && exchangeKey.name }}</span>
      </div>

      <div class="flex items-center justify-between mb-10">
        <span class="flex flex-shrink-0 text-iceberg leading-xs mr-20">Activator</span>
        <span class="block truncate text-white leading-xs">{{ data.createdAt }}</span>
      </div>

      <div class="flex items-center justify-between mb-20">
        <span class="flex flex-shrink-0 text-iceberg leading-xs mr-20">Current position</span>
        <span class="block truncate text-white leading-xs">{{ data.stratType }}, {{ data.botRunning ? "Open" : "Close" }}</span>
      </div>

      <div class="flex items-center justify-between">
        <AppSwitcher :value="data.enabled" class="mr-15" @click="changeSwitcher(data)" />

        <div class="flex items-center">
          <!-- <div class="flex items-center cursor-pointer mr-15">
          <i class="icon-edit text-base text-blue-cl-100" />
        </div> -->
          <div class="flex items-center cursor-pointer" @click.stop="$emit('delete')">
            <i class="icon-trash text-base text-blue-cl-100" />
          </div>
        </div>
      </div>
    </div>

    <!-- HOLD MODAL -->
    <AppModal v-model="isHoldModalOpen" persistent max-width="690px">
      <div class="active-bot__hold-modal relative flex flex-col w-full pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Put The Bot On Hold?</h2>

          <div class="active-bot__hold-modal-desc w-full text-grey-cl-100 leading-xs text-center text-base mx-auto mb-40">
            Are you sure you want to pause the bot ? If you have an open position, we will leave it open so you can manage it manually
          </div>

          <div class="flex flex-col md:flex-row items-center w-full md:w-auto">
            <AppButton
              type="light-green"
              class="active-bot__hold-modal-btn w-full md:w-auto mb-30 md:mb-0 md:mr-40"
              @click="pousePosition(data)"
            >
              Pause
            </AppButton>
            <!-- <AppButton type="light-green" class="active-bot__hold-modal-btn w-full md:w-auto" @click="isHoldModalOpen = false">
              Pause and Close Now
            </AppButton> -->
          </div>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="isActiveModalOpen" persistent max-width="690px">
      <div class="active-bot__hold-modal relative flex flex-col w-full pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Are you sure you want to activate this bot?</h2>

          <div class="flex flex-col md:flex-row items-center w-full md:w-auto">
            <AppButton
              type="light-green"
              class="active-bot__hold-modal-btn w-full md:w-auto mb-30 md:mb-0 md:mr-40"
              @click="isActiveModalOpen = false"
            >
              Cancel
            </AppButton>

            <AppButton type="light-green" class="active-bot__hold-modal-btn w-full md:w-auto" @click="activePosition(data)">
              Activate
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  </router-link>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AlgoBotSubscription } from "../../store/algo-bots/types/algo-bots.payload";
import { AlgoBot } from "../../store/algo-bots/types/algo-bots.payload";
import { namespace } from "vuex-class";

const algobots = namespace("algobotsModule");
const user = namespace("userModule");

@Component({ name: "ActiveBotsItem" })
export default class ActiveBotsItem extends Vue {
  /* VUEX */
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;
  @algobots.Getter getAlgoBots: AlgoBot[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Getter getBotsSubcriptions: AlgoBotSubscription[];
  @user.Getter getKeyNamesWithExchange!: any;

  /* PROPS */
  @Prop({ required: true }) data: any;

  /* DATA */
  isHoldModalOpen: boolean = false;
  isActiveModalOpen: boolean = false;

  algoBot: AlgoBot | null = null;
  exchangeKey: string = null;

  /* HOOKS */
  async mounted() {
    const apiKeyRef: string = this.data.apiKeyRef;
    this.algoBot = this.getAlgoBotById(this.data.botId);
    this.exchangeKey = this.getKeyNamesWithExchange.find((e: any) => e.id === apiKeyRef);
  }

  /* METHODS */
  changeSwitcher(data: AlgoBotSubscription) {
    if (data.enabled) {
      this.isHoldModalOpen = true;
    } else {
      this.isActiveModalOpen = true;
    }
  }

  pousePosition(data: AlgoBotSubscription) {
    this.isHoldModalOpen = false;
    this.$emit("pause-subscription", data);
  }

  activePosition(data: AlgoBotSubscription) {
    this.isActiveModalOpen = false;
    this.$emit("resume-subscription", data);
  }
}
</script>

<style lang="scss" scoped>
.table {
  &__col-1 {
    width: 12%;
    min-width: 144px;
  }
  &__col {
    width: 17.6%;
  }

  @media (min-width: 768px) {
    &__cell {
      background: rgba(13, 31, 40, 0.7);
    }
  }

  @media (max-width: 767px) {
    &__col {
      min-width: 90px;
    }
  }
}

.active-bot {
  &__hold-modal-desc {
    max-width: 330px;
  }
  &__hold-modal-btn {
    min-width: 200px;
  }
}
</style>
