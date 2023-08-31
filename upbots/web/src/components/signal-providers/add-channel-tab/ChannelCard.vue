<template>
  <div class="channel-card flex flex-col shadow-20 rounded-5 p-20">
    <div class="flex items-center mb-40">
      <div class="w-35 h-35 rounded-full mr-15">
        <img :src="data.titleImg" alt="img" class="w-full h-full object-cover" />
      </div>
      <div class="flex flex-col">
        <span class="leading-xs font-bold text-white mb-4">{{ data.title }}</span>
        <span class="text-grey-cl-920 text-xs leading-xs">{{ data.subtitle }}</span>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex items-center justify-between mb-10">
        <span class="flex flex-grow text-xs leading-xs text-grey-cl-920 pr-20">Exchange:</span>
        <span class="text-xs leading-xs text-white">{{ data.exchange }}</span>
      </div>
      <div class="flex items-center justify-between mb-10">
        <span class="flex flex-grow text-xs leading-xs text-grey-cl-920 pr-20">Price/m:</span>
        <span class="text-xs leading-xs text-white">{{ data.price }}</span>
      </div>
      <div class="flex items-center justify-between mb-10">
        <span class="flex flex-grow text-xs leading-xs text-grey-cl-920 pr-20">Signals/week:</span>
        <span class="text-xs leading-xs text-white">{{ data.signals }}</span>
      </div>
      <div class="flex items-center justify-between mb-10">
        <span class="flex flex-grow text-xs leading-xs text-grey-cl-920 pr-20">Average success rate:</span>
        <span class="text-xs leading-xs text-white">{{ data.average }}</span>
      </div>
    </div>

    <div class="flex justify-end w-full mb-20">
      <router-link to="/signal-providers" tag="div" class="flex text-xs leading-xs text-blue-cl-100 underline cursor-pointer">
        More details
      </router-link>
    </div>

    <div v-if="data.connected" class="flex items-center justify-center min-h-32 mb-25">
      <i class="icon-check text-green-cl-100 mr-12" />
      <span class="text-xl1 leading-xs text-green-cl-100">Connected</span>
    </div>

    <div v-else class="flex items-center justify-between min-h-32 mb-25">
      <AppButton type="light-green" class="w-1/2 mr-9" size="xs">Activate</AppButton>
      <AppButton type="light-green" class="w-1/2 ml-9" size="xs">Subscribe</AppButton>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center pr-20">
        <span class="text-white text-sm leading-xs">{{ data.subscribers }}</span>
        &nbsp;
        <span class="text-white text-sm leading-xs">Subscribers:</span>
      </div>
      <div class="flex items-center">
        <div
          v-for="(item, index) in data.listImgs"
          :key="index"
          :style="`z-index: ${index + 1}`"
          class="w-26 h-26 rounded-full first:ml-0 -ml-9"
        >
          <img :src="item" alt="img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "ChannelCard" })
export default class ChannelCard extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any[];
}
</script>

<style lang="scss" scoped>
.channel-card {
  background: rgba(21, 22, 25, 0.7);
}

.icon-check {
  font-size: 17px;
}
</style>
