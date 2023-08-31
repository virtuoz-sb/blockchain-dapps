<template>
  <div>
    <template v-if="bots && bots.length">
      <div class="my-bots__container flex flex-col mb-20 overflow-y-auto custom-scrollbar">
        <custom-scroll :ops="scrollData">
          <router-link v-for="(item, index) in botData" :key="index" :to="{ name: 'algo-bot-detailed', params: { id: item.id } }">
            <div class="flex flex-col flex-shrink-0 pt-10 cursor-pointer">
              <div class="flex items-center justify-between w-full mb-10 md:px-16">
                <div class="icon-wrap h-18 mr-10 relative">
                  <CryptoCoinChecker :data="item.base" class="title-logo absolute top-0 left-0">
                    <template>
                      <div v-if="item.srcCoin">
                        <img :src="require(`@/assets/icons/${item.srcCoin}.png`)" :alt="item.srcCoin" class="w-18 h-18" />
                      </div>
                      <cryptoicon v-else :symbol="item.base" size="18" generic />
                    </template>
                  </CryptoCoinChecker>
                  <CryptoCoinChecker :data="item.quote" class="title-logo absolute top-0 right-0">
                    <template>
                      <div v-if="item.srcCoin">
                        <img :src="require(`@/assets/icons/${item.srcCoin}.png`)" :alt="item.srcCoin" class="w-18 h-18" />
                      </div>
                      <cryptoicon v-else :symbol="item.quote" size="18" generic />
                    </template>
                  </CryptoCoinChecker>
                </div>
                <div class="flex items-center mr-10 w-3/4">
                  <span class="text-iceberg text-base">{{ item.name }}</span>
                </div>
                <div class="flex flex-shrink-0 w-1/4">
                  <AppPercentageSpan class="text-sm" :data="item.perfSnapshots && item.perfSnapshots.month6" />
                </div>
              </div>
              <AppDivider class="bg-grey-cl-300 opacity-40 w-full" />
            </div>
          </router-link>
        </custom-scroll>
      </div>
    </template>

    <p v-else class="text-center m-auto text-grey-cl-100 px-20">Create your own trading bot to my bots and link it to your trading view.</p>

    <router-link to="/algo-bots" tag="div" class="flex flex-shrink-0 w-full md:px-20 md:mt-auto">
      <app-button type="light-green" class="w-full" size="sm">Connect a Bot</app-button>
    </router-link>
  </div>
</template>

<script lang="ts">
import { AlgoBot } from "@/store/algo-bots/types/algo-bots.payload";
import { Component, Vue, Prop } from "vue-property-decorator";
import { cloneDeep } from "@/core/helper-functions";

@Component({ name: "MyBots" })
export default class MyBots extends Vue {
  @Prop({ required: true }) bots: AlgoBot;

  get botData() {
    return cloneDeep(this.bots).sort((a: any, b: any) => b.perfSnapshots.month6 - a.perfSnapshots.month6);
  }
  get scrollData() {
    return {
      rail: {
        gutterOfSide: this.$breakpoint.smAndDown ? "0px" : "5px",
        gutterOfEnds: "2px",
      },

      bar: {
        background: "#378C9C",
        keepShow: true,
        size: "6px",
        hight: "100px",
      },

      scrollPanel: {
        easing: "easeInQuad",
        speed: 100,
      },

      vuescroll: {
        wheelScrollDuration: 1000,
        wheelDirectionReverse: false,
      },
    };
  }
}
</script>

<style lang="scss" scoped>
.my-bots {
  &__container {
    height: 250px;
  }
}

.icon-wrap {
  width: 40px;
  @media (max-width: 767px) {
    width: 35px;
  }
}
</style>
