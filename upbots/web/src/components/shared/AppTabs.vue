<template>
  <div class="flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar">
    <div class="flex flex-shrink-0 border-b border-grey-cl-300" :class="customClass">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="flex relative items-center py-15 md:py-11.5 leading-md px-5 cursor-pointer"
        :class="[{ 'is-active': currentTab.value === tab.value }, tabsClasses]"
        @click="selectTab(tab)"
      >
        <span class="block md:text-sm xl:text-base leading-xs xl:leading-md text-center text-iceberg">{{ tab.value }}</span>
        <slot :name="tab.componentName" />
      </div>
    </div>
    <!-- SLOT -->
    <slot :current-tab="currentTab" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";

@Component({ name: "AppTabs" })
export default class AppTabs extends Vue {
  /* PROPS */
  @Prop({ required: true, validator: (prop) => prop.length > 0 }) tabs!: Tab[];
  @Prop({ type: Boolean, default: false }) shrink: boolean;
  @Prop({ default: "" }) customClass!: String;

  /* DATA */
  currentTab = {};

  /* COMPUTED */
  get tabsClasses() {
    return this.shrink ? "justify-center w-full" : "px-20";
  }

  /* HOOKS */
  created() {
    this.currentTab = this.tabs[0];
    if (this.$route.params.tabtoselect) {
      const tab: Tab = this.tabs.find((tab) => tab.componentName === this.$route.params.tabtoselect);
      if (tab) {
        this.currentTab = tab;
      }
    }
  }

  /* METHODS */
  selectTab(tab: Tab) {
    this.currentTab = tab;
    this.$emit("change", tab);
  }
}
</script>

<style lang="scss" scoped>
.is-active {
  @apply text-white;

  &::after {
    content: "";
    bottom: -1px;
    background: linear-gradient(0deg, #6ed4ca 0%, #27adc5 100%), #24819b;
    @apply absolute left-0 h-2 w-full shadow-30;
  }
}
</style>
