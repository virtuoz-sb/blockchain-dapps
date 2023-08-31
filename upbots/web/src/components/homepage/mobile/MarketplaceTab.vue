<template>
  <div class="flex flex-col flex-grow p-20 overflow-y-auto custom-scrollbar">
    <div class="flex items-center mb-20">
      <i class="icon-marketplace text-xl1 text-blue-cl-400 text-shadow-1 mr-10" />
      <span class="leading-md text-iceberg">Discover our Marketplace</span>
    </div>

    <Marketplace class="grid grid-cols-2 gap-15 flex-grow overflow-y-auto custom-scrollbar" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import Marketplace from "@/components/homepage/Marketplace.vue";

@Component({ name: "MarketplaceTab", components: { Marketplace } })
export default class MarketplaceTab extends Vue {}
</script>
