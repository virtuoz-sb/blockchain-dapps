<template>
  <!-- DESKTOP  -->
  <div v-if="!$breakpoint.smAndDown">
    <div class="flex items-center mb-15">
      <div class="flex items-center justify-center bg-dark-cl-100 h-32 w-32 rounded-full overflow-hidden cursor-pointer mr-10">
        <img src="@/assets/images/4c_logo.png" alt="user" class="h-full w-full object-cover" />
      </div>

      <div class="flex flex-col mr-40">
        <span class="text-xs leading-xs text-iceberg mb-2">Created:</span>
        <span class="text-sm leading-xs text-iceberg">{{ algoBot && algoBot.creator }}</span>
      </div>

      <div v-if="tagData && tagData.length > 0" class="flex items-center">
        <AppTag v-for="(item, index) in tagData" :key="index" class="flex items-center justify-center py-6 px-20 mr-20 last:mr-0">
          {{ item }}
        </AppTag>
      </div>
    </div>
    <p class="text-sm leading-xs text-white">{{ algoBot && algoBot.name }}, {{ algoBot && algoBot.description }}</p>
  </div>

  <!-- MOBILE -->
  <div v-else>
    <div class="flex items-center justify-between" @click="isOpen = !isOpen">
      <div class="flex items-center flex-grow pr-30">
        <div class="flex items-center justify-center bg-dark-cl-100 h-32 w-32 rounded-full overflow-hidden cursor-pointer mr-10">
          <img src="@/assets/images/4c_logo.png" alt="user" class="h-full w-full object-cover" />
        </div>

        <div class="flex flex-col mr-40">
          <span class="text-xs leading-xs text-iceberg mb-2">Created:</span>
          <span class="text-sm leading-xs text-iceberg">{{ algoBot && algoBot.creator }}</span>
        </div>
      </div>

      <div class="flex">
        <i :class="{ 'transform rotate-180': isOpen }" class="flex icon-arrow-expand text-iceberg" />
      </div>
    </div>

    <transition name="fade">
      <div v-if="isOpen" class="flex flex-col mt-15">
        <div class="flex items-center flex-wrap">
          <AppTag v-for="(item, index) in tagData" :key="index" class="flex items-center justify-center py-6 px-20 mr-4 mb-10 last:mr-0">
            {{ item }}
          </AppTag>
        </div>
        <p class="text-sm leading-xs text-white">{{ algoBot && algoBot.name }}, {{ algoBot && algoBot.description }}</p>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AlgoBot } from "../../../store/algo-bots/types/algo-bots.payload";
import { namespace } from "vuex-class";

const algobots = namespace("algobotsModule");

@Component({ name: "Description" })
export default class Description extends Vue {
  /* VUEX */
  @algobots.Getter getAlgoBots: AlgoBot[];
  @algobots.Getter getAlgoBotById: any;
  @algobots.Action fetchAlgoBotsAction: () => Promise<AlgoBot[]>;

  /* DATA */
  tagData: any = null;
  algoBot: AlgoBot | null = null;
  isOpen: boolean = false;

  /* HOOKS */
  async mounted() {
    await this.fetchAlgoBotsAction();
    if (this.$route.params.id) {
      /* GET THE SELECTED BOT */
      this.algoBot = this.getAlgoBotById(this.$route.params.id);
      const symbolVirtual = this.algoBot.base + " / " + this.algoBot.quote;
      this.tagData = [symbolVirtual.toUpperCase(), this.algoBot.stratType.toUpperCase()];
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.icon-arrow-expand {
  font-size: 6px;
  transition: all 0.3s linear;
}
</style>
