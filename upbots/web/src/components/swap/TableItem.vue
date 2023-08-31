<template>
  <div class="table__item flex items-center flex-shrink-0 py-9 px-20 md:px-10 lg:px-20" :class="{ 'gradient-4': isActiveItem }">
    <!-- NAME -->
    <div class="table__col-1 flex flex-col pr-10 xl:pr-20">
      <div class="flex flex-col md:flex-row items-center justify-center md:justify-start">
        <img
          v-if="exchangeImages[item.dex]"
          :src="exchangeImages[item.dex]"
          :alt="item.name"
          class="h-28 max-w-28 lg:h-auto lg:max-w-32 md:pr-7 mb-4 md:mb-0"
        />
        <span v-if="isActiveItem" class="w-full text-base lg:text-xl font-bold text-iceberg leading-xs text-left">{{ item.name }}</span>
        <span v-else class="text-base lg:text-xl text-iceberg leading-xs">{{ item.name }}</span>
      </div>
      <div v-if="item && item.nameDesc" class="text-xs xl:text-sm text-iceberg leading-xs">{{ item.nameDesc }}</div>
    </div>

    <!-- PRICE -->
    <div class="table__col-2 block truncate text-base lg:text-xl text-iceberg pr-10 xl:pr-20" :class="isActiveItem && 'font-bold'">
      {{ item.price }}
    </div>

    <!-- TOTAL -->
    <div class="table__col-3 block truncate text-base lg:text-xl text-iceberg pr-10 xl:pr-20" :class="isActiveItem && 'font-bold'">
      {{ item.total }}
    </div>

    <!-- MARKUP -->
    <div class="table__col-4 block text-base lg:text-xl text-iceberg pr-10 xl:pr-20 truncate">{{ markup }}</div>

    <!-- ACTION BUTTONS DESKTOP, TABLET -->
    <div v-if="!$breakpoint.smAndDown" class="table__col-5">
      <AppButton v-if="isActiveItem" type="light-green" class="w-full" @click="executeTrade">Buy Now</AppButton>
      <AppButton v-else type="light-green-bordered" class="w-full text-md leading-xs" @click="executeTrade">
        Buy Direct
      </AppButton>
    </div>

    <!-- ACTION BUTTONS MOBILE -->
    <div v-else class="table__col-5 dropdown-btn-mobile flex justify-end relative">
      <i class="icon-dots text-iceberg" @click="isDropdown = !isDropdown" />
      <transition name="fade">
        <div v-if="isDropdown" class="dropdown-btn-mobile__content absolute right-0 w-100 bg-dark-cl-100 shadow-20 p-10 rounded-5 z-2">
          <p class="text-sm leading-xs text-iceberg" @click="isDropdown = false">{{ isActiveItem ? "Buy Now" : "Buy Direct" }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TableColumn, DexagRequest } from "@/store/swap/types";
import { namespace } from "vuex-class";

const swap = namespace("swapModule");

@Component({ name: "TableItem" })
export default class TableItem extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: TableColumn[];
  @Prop({ required: true }) item: TableColumn;
  @Prop({ required: true }) index: number;
  @Prop({ required: true }) exchangeImages: any;

  /* VUEX */
  @swap.Getter getProviderSdk: any;
  @swap.Getter getProviderRequest: DexagRequest;

  /* DATA */
  isDropdown: boolean = false;

  /* COMPUTED */
  get isActiveItem() {
    return this.item.markup === "Best trade";
  }

  get markup() {
    return this.isActiveItem
      ? parseFloat(this.item.markup) >= 0
        ? `+${this.item.markup}`
        : `${this.item.markup}`
      : parseFloat(this.item.markup) >= 0
      ? `+${this.item.markup}%`
      : `${this.item.markup}%`;
  }

  /* METHODS */
  async executeTrade() {
    this.$notify({ text: "A new trade has been started", type: "info" });
    const trade = await this.getProviderSdk.getTrade({
      ...this.getProviderRequest,
      discluded: "",
      dex: this.item.dex,
      proxy: "0x655cc4C803af0D613475aC1CeF90D02EbD52ae45",
    });
    const validation = await this.getProviderSdk.validate(trade);
    const execution = await this.getProviderSdk.sendTrade(trade, {});
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";

.table {
  &__col-1 {
    width: 26.3%;
  }

  &__col-2 {
    width: 22%;
  }

  &__col-3 {
    width: 22%;
  }

  &__col-4 {
    width: 15.4%;
  }

  &__col-5 {
    width: 16.3%;
  }

  @media (max-width: 1279px) {
    &__col-1 {
      width: 25.3%;
    }

    &__col-2 {
      width: 19%;
    }

    &__col-3 {
      width: 19%;
    }

    &__col-4 {
      width: 13.4%;
    }

    &__col-5 {
      width: 26.4%;
    }
  }

  @media (max-width: 998px) {
    &__col-5 {
      width: 23%;
    }
  }

  @media (max-width: 767px) {
    &__col-1 {
      width: 23.5%;
    }

    &__col-2 {
      width: 23.7%;
    }

    &__col-3 {
      width: 24.8%;
    }

    &__col-4 {
      width: 24%;
    }

    &__col-5 {
      width: 4%;
    }
  }
}

.dropdown-btn-mobile {
  &__content {
    bottom: -40px;
  }
}
</style>
