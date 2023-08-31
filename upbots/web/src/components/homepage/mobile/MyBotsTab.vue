<template>
  <div class="flex flex-col flex-grow my-20 overflow-y-auto custom-scrollbar">
    <!-- SELECT COMPONENT -->
    <div class="flex flex-shrink-0 items-center px-20">
      <div class="text-grey-cl-920 text-sm leading-xs mr-12 md:mr-8">View:</div>
      <AppDropdownBasic v-model="selectedView" :options="view" dark />
    </div>

    <!-- COMPONENTS -->
    <div class="flex flex-col flex-grow px-20 overflow-y-auto custom-scrollbar my-20">
      <!-- MY BOTS -->
      <MyBots
        v-if="selectedView.value === 'Best Performing Bots (6m perf%)'"
        :bots="getAlgoBots"
        class="flex flex-col flex-grow overflow-y-auto custom-scrollbar"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";

import MyBots from "@/components/homepage/MyBots.vue";

@Component({ name: "MyBotsTab", components: { MyBots } })
export default class MyBotsTab extends Vue {
  /* PROPS */
  @Prop({ required: true }) getAlgoBots: any;

  /* DATA */
  selectedView: GroupItems = { value: "Best Performing Bots (6m perf%)", label: "Best Performing Bots (6m perf%)" };
  view: GroupItems[] = [{ value: "Best Performing Bots (6m perf%)", label: "Best Performing Bots (6m perf%)" }];
}
</script>
