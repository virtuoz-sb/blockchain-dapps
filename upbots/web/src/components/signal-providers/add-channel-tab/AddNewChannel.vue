<template>
  <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
    <!-- CHANNEL FILTERS -->
    <ChannelFilters />

    <!-- CHANNEL CARDS -->
    <div class="flex flex-col flex-grow overflow-y-auto custom-scrollbar mt-14 px-20 mb-20">
      <div class="grid grid-cols-4 col-gap-30 row-gap-50">
        <ChannelCard v-for="(item, index) in data" :data="item" :key="index" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ChannelCard from "@/components/signal-providers/add-channel-tab/ChannelCard.vue";
import ChannelFilters from "@/components/signal-providers/add-channel-tab/ChannelFilters.vue";

@Component({ name: "AddNewChannel", components: { ChannelCard, ChannelFilters } })
export default class AddNewChannel extends Vue {
  /* DATA */
  data: any[] = [
    {
      titleImg: "/img/signal-providers/card-img-1.png",
      title: "Rocket Pro",
      subtitle: "Let us send your crypto wallet to the moon",
      exchange: "Bitmex",
      price: "3000 UBX",
      signals: "16",
      average: "20",
      subscribers: "80",
      listImgs: [
        "/img/signal-providers/img-1.png",
        "/img/signal-providers/img-2.png",
        "/img/signal-providers/img-3.png",
        "/img/signal-providers/img-4.png",
      ],
      connected: false,
    },
    {
      titleImg: "/img/signal-providers/card-img-2.png",
      title: "4C-Trading",
      subtitle: "1 Cryoti currency consulting channel",
      exchange: "Bitmex",
      price: "3000 UBX",
      signals: "16",
      average: "20",
      subscribers: "80",
      listImgs: [
        "/img/signal-providers/img-1.png",
        "/img/signal-providers/img-2.png",
        "/img/signal-providers/img-3.png",
        "/img/signal-providers/img-4.png",
      ],
      connected: true,
    },
  ];
}
</script>
