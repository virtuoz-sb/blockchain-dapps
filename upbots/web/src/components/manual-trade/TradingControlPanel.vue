<template>
  <div class="flex flex-col w-full h-full bg-dark-200 rounded-3 overflow-auto custom-scrollbar" :class="{ 'is-full-screen': isFullScreen }">
    <!-- TRAINING PANEL -->
    <div
      class="flex items-center relative justify-between w-full h-40 md:border-b border-grey-cl-300 px-20 py-10 md:px-0 md:py-0 rounded-t-5"
    >
      <!-- HEADER TITLE -->
      <div class="flex flex-grow justify-center" :class="{ 'justify-center': isShowAssetsList }">
        <span class="leading-xs text-iceberg">TradingView</span>
      </div>

      <!-- HEADER RIGHT SIDE -->
      <div class="flex items-center h-full pl-20">
        <div class="flex mr-20">
          <i
            class="flex text-astral cursor-pointer"
            :class="[isFullScreen ? 'icon-contract' : 'icon-expand']"
            @click="isFullScreen = !isFullScreen"
          />
        </div>
        <div class="flex items-center justify-between md:pr-20" :class="[{ 'min-w-200 bg-dark-cl-300 h-full pl-20': isShowAlert }]">
          <div class="flex items-center" :class="{ 'opacity-50 pointer-events-none': !isShowAlert }">
            <i class="hidden md:flex icon-alert text-md text-astral cursor-pointer" @click="isShowAlert = true" />
            <span v-if="isShowAlert" class="text-sm leading-xs text-white ml-15">Alerts</span>
          </div>
          <div v-if="isShowAlert" class="flex pl-6 py-6 cursor-pointer" @click="isShowAlert = false">
            <i class="alert__icon-cross icon-cross text-grey-cl-200" @click="isCreateAlert = false" />
          </div>
        </div>
      </div>
    </div>

    <!-- TRADING VIEW -->
    <div class="flex h-full overflow-auto">
      <!-- TRADING CHART -->
      <div class="flex flex-col overflow-x-auto w-full h-full">
        <TradingChart :symbol="widgetSymbol" class="w-full h-full flex-grow" />
      </div>

      <!-- TRADING CHART RIGHT BAR -->
      <div
        v-if="isShowAlert"
        class="flex flex-col overflow-y-auto custom-scrollbar h-auto w-full rounded-b-5 pt-10 pb-20 z-10 md:bg-dark-cl-300 md:max-w-200"
      >
        <!-- ALERT -->
        <Alert />
      </div>
    </div>

    <!-- TRADING FOOTER -->
    <div class="hidden md:block w-full h-40 bg-dark-200 flex-shrink-0" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { mapActions } from "vuex"; // temporary
import { GroupItems } from "@/models/interfaces";

const trade = namespace("tradeModule");

import Alert from "@/components/alert/Alert.vue";
import TradingChart from "@/components/charts/TradingChart.vue";

@Component({
  name: "TradingControlPanel",
  components: { TradingChart, Alert },
  methods: { ...mapActions({ setAssets: "orderModule/setAssets" }) },
})
export default class TradingControlPanel extends Vue {
  /* VUEX TYPES */
  setAssets!: (payload: any) => any;

  /* PROPS */
  @Prop({ required: true }) widgetSymbol: string;

  /* DATA */
  isShowAlert: boolean = false;
  isCreateAlert: boolean = false;
  isShowAssetsList: boolean = false;
  isFullScreen: boolean = false;

  selectedBuyCurrency: GroupItems = { label: "EUR", value: "EUR" };
  selectedSellCurrency: GroupItems = { label: "USD", value: "USD" };
  selectedAssets: GroupItems = { label: "BTC/USD", value: "BTC/USD" };

  /* HOOKS */
  created() {
    this.selectAsset(this.selectedAssets);
  }

  /* MEDTHODS */
  selectAsset(assets: any) {
    const splitedAssets = assets.value.split("/");
    this.selectedBuyCurrency.value = splitedAssets[0];
    this.selectedBuyCurrency.label = splitedAssets[0];
    this.selectedSellCurrency.value = splitedAssets[1];
    this.selectedSellCurrency.label = splitedAssets[1];
    this.setAssets(assets);
    this.isShowAssetsList = false;
  }
}
</script>

<style lang="scss" scoped>
.is-full-screen {
  @apply fixed top-0 left-0 w-full h-full z-200;
  background: rgb(50, 75, 86);
}

.alert {
  &__icon-cross {
    font-size: 6px;
  }
}
</style>
