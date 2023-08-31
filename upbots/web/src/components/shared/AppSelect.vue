<template>
  <div class="relative flex flex-col" :class="{ 'pointer-events-none': disabled }">
    <!-- SELECT TITLE -->
    <div
      class="select relative flex items-center justify-between h-32 px-12 bg-san-juan hover:bg-ming rounded-5 cursor-pointer z-90"
      :class="{ 'bg-san-juan opacity-50': disabled }"
      @click="selectOpen"
    >
      <div class="flex items-center w-full pr-5">
        <img v-if="value && value.img" :class="customClass" :src="value.img" :alt="value.alt" class="max-w-14 max-h-14" />
        <span class="text-sm leading-xs text-iceberg">{{ value.label }}</span>
      </div>
      <div>
        <span class="flex icon-arrow-expand text-xxs" :class="{ 'transform rotate-180': isOpen }" />
      </div>
    </div>

    <!-- SELECT CONTENT -->
    <transition name="fade">
      <div v-if="isOpen" class="select__content-inner flex flex-col absolute left-0 w-full rounded-5 mt-3 z-130">
        <ul class="select__content-wrap flex flex-col my-11">
          <custom-scroll :ops="scrollData">
            <li
              v-for="item in options"
              :key="item.value"
              :class="disabledOptions && disabledOptions.includes(item.value) && 'opacity-30 cursor-not-allowed select-none'"
              class="select__content-item flex items-center text-sm leading-xs text-bali-hai hover:text-white hover:bg-grey-cl-400 py-13 md:py-8 px-15 cursor-pointer"
            >
              <div
                class="flex items-center w-full h-full"
                :class="disabledOptions && disabledOptions.includes(item.value) && 'pointer-events-none'"
                @click="selectItem(item)"
              >
                <div v-if="item.img" class="w-15 mr-5">
                  <img :class="customClass" :src="item.img" :alt="item.alt" class="max-w-14 max-h-14" />
                </div>
                <span>{{ item.label }}</span>
              </div>
            </li>
          </custom-scroll>
        </ul>
      </div>
    </transition>

    <!-- SELECT BACKDROP -->
    <div v-if="isOpen" class="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-110 cursor-pointer" @click="isOpen = false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppSelect" })
export default class AppSelect extends Vue {
  /* PROPS */
  @Prop({ required: true }) value!: any[];
  @Prop({ required: true }) options!: any[];
  @Prop({ required: false }) disabledOptions!: any[];
  @Prop({ default: "mr-6" }) customClass!: string;
  @Prop({ type: Boolean, default: false }) disabled!: boolean;

  /* DATA */
  isOpen: boolean = false;

  // FOR CUSTOM SCROLLBAR
  scrollData = {
    rail: {
      gutterOfSide: "5px",
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
      speed: 800,
    },
    vuescroll: {
      wheelScrollDuration: 0,
      wheelDirectionReverse: false,
    },
  };

  /* METHODS */
  selectItem(item: string) {
    this.isOpen = false;
    this.$emit("input", item);
    this.$emit("change");
  }

  selectOpen() {
    if (this.disabled) return;

    this.isOpen = !this.isOpen;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.select {
  &__content-inner {
    top: 32px;
    background: #214759;
    @media (max-width: 767px) {
      top: 42px;
    }
  }
  &__content-wrap {
    height: 112px;
    @media (max-width: 767px) {
      height: 117px;
    }
  }
  &__content-item {
    &:hover {
      background: #3c6c83b3;
    }
  }
}

.icon-arrow-expand {
  transition: all 0.2s;
  color: #f1f1f1;
}
</style>
