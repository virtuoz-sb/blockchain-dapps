<template>
  <div class="justify-between">
    <!-- WALLETS LIST -->
    <template v-if="data.length">
      <!-- TABLE LABELS -->
      <div class="my-wallets__items-wrap flex flex-col flex-grow py-10">
        <custom-scroll :ops="scrollData">
          <div v-for="(item, index) in dataSet" :key="item.id" class="flex flex-col flex-shrink-0 mb-10 last:mb-0">
            <div class="flex px-15 mr-10">
              <div class="flex items-center w-2/4 mr-10">
                <img v-if="exchangeIcons[item.exchange]" :src="exchangeIcons[item.exchange]" :alt="item.exchange" class="h-16 w-16 mr-5" />

                <div v-if="exchangeIcons[item.exchange]" class="text-iceberg text-base">{{ item.name }}:</div>

                <div v-else class="text-iceberg text-base ml-15">{{ item.name.slice(0, 6) }}:</div>
              </div>

              <div class="flex flex-wrap justify-end w-2/4">
                <div class="self-end text-bright-turquoise text-sm">{{ baseValue(item.total.base) }}</div>
              </div>
            </div>

            <div class="text-iceberg text-right text-sm mb-2 mr-10 last:mb-0 px-15 py-5">
              {{ favoriteValue(item.total.favorite) }}
            </div>
            <AppDivider v-if="dataSet.length !== index + 1" class="w-full bg-grey-cl-300 opacity-40" />
          </div>
        </custom-scroll>
      </div>
    </template>

    <!-- EMPTY WALLETS STATE -->
    <div v-else class="flex flex-grow items-center p-20">
      <span class="text-iceberg text-center mx-auto">Looks like you haven't added any wallet yet.</span>
    </div>

    <div class="flex flex-col flex-shrink-0">
      <!-- TOTAL BALANCE -->
      <div class="flex items-center justify-between md:bg-gable-green md:py-7 md:px-20 mb-20 md:mb-15">
        <span class="text-iceberg mr-10">Total:</span>
        <span class="font-semibold text-tradewind text-md">{{ balance.replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</span>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex items-center justify-between md:px-10 xl:px-20">
        <router-link :to="'/keys'" class="add-wallet-btn-wrap flex w-100 mr-10">
          <AppButton type="light-green" class="w-full" size="sm">Add CEX</AppButton>
        </router-link>
        <router-link :to="'/portfolio-monitoring/eth-portfolio'" class="add-wallet-btn-wrap flex w-100 ml-auto">
          <AppButton type="light-green" class="w-full" size="sm">Add DEX</AppButton>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "MyWallets" })
export default class MyWallets extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any[];
  @Prop({ default: "N/A" }) balance: string;
  @Prop() sortField: string;
  @Prop() sortType: string;

  /* DATA */
  exchangeIcons = {
    binance: require("@/assets/images/binance.svg"),
    ftx: require("@/assets/images/ftx.svg"),
    bitfiniex: require("@/assets/images/bitfinex.svg"),
    bitmex: require("@/assets/images/bitmex.svg"),
    okex: require("@/assets/images/okex.svg"),
    kucoin: require("@/assets/images/kucoin.svg"),
    huobipro: require("@/assets/images/huobipro.svg"),
  };

  /* COMPUTED */

  // FOR CUSTOM SCROLLBAR
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
        wheelScrollDuration: 1500,
        wheelDirectionReverse: false,
      },
    };
  }

  get dataSet() {
    const data = this.handleSortData(this.sortField, this.sortType, this.data);

    return data;
  }

  /* METHODS */
  baseValue(baseValue: string) {
    const currency = baseValue.split(" ")[1];
    const value = parseFloat(baseValue.split(" ")[0]).toFixed(6);

    return `${value} ${currency}`;
  }
  favoriteValue(favoriteValue: string) {
    const currency = favoriteValue.split(" ")[1];
    const value = favoriteValue.split(" ")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${value} ${currency}`;
  }

  handleSortData(field: string, type: string, data: any[]) {
    let sortedData: any[];

    if (field === "name" && type === "up") {
      sortedData = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (field === "name" && type === "down") {
      sortedData = data.sort((a: any, b: any) => b.name.localeCompare(a.name));
    } else if (field === "amount" && type === "up") {
      sortedData = data.sort((a: any, b: any) => a.total.base.split(" ")[0].localeCompare(b.total.base.split(" ")[0]));
    } else if (field === "amount" && type === "down") {
      sortedData = data.sort((a: any, b: any) => b.total.base.split(" ")[0].localeCompare(a.total.base.split(" ")[0]));
    }

    return sortedData;
  }
}
</script>

<style lang="scss" scoped>
.icon-arrow-expand {
  font-size: 5px;
}

.my-wallets {
  &__items-wrap {
    height: 380px;

    @media (min-width: 1025px) {
      height: 217px;
    }

    @media (min-width: 768px) {
      height: 130px;
    }
  }
}

.add-wallet-btn-wrap {
  @media (min-width: 768px) {
    @apply w-full;
    max-width: 109px;
  }
  @media (max-width: 767px) {
    @apply w-full;
    max-width: 150px;

    &.full {
      @apply w-full max-w-full;
    }
  }
}
</style>
