<template>
  <div class="my-wallets-card relative flex flex-col mb-10 last:mb-0 rounded-5 p-12" :class="{ 'is-edit': isCardMenuOpen }">
    <div class="flex items-center justify-between mb-12">
      <div class="flex flex-col">
        <div class="flex items-center cursor-pointer">
          <div
            class="check-icon__wrap hidden md:flex items-center justify-center flex-shrink-0 w-18 h-18 rounded-full mr-7 cursor-pointer"
            :class="selectedWallets.includes(data.name) ? 'bg-white' : 'border border-solid border-white'"
            @click="$emit('select', data)"
          >
            <i
              v-if="selectedWallets.includes(data.name)"
              class="icon-check text-xxs"
              :class="{ 'text-blue-cl-200': selectedWallets.includes(data.name) }"
            />
          </div>
          <p class="leading-md text-white">{{ data.name }}</p>
        </div>
      </div>

      <div class="flex flex-col items-end">
        <div class="flex h-12 mb-4">
          <div v-if="!isCardMenuOpen" class="flex items-center justify-end cursor-pointer" @click="isCardMenuOpen = true">
            <i class="flex icon-more text-grey-cl-200" />
          </div>
          <div v-else class="flex items-center justify-end" :class="{ 'z-2': isCardMenuOpen }">
            <i class="icon-edit text-sm text-grey-cl-200 mr-10 cursor-pointer" @click="setEditData(data)" />
            <i class="icon-trash text-sm text-grey-cl-200 mr-10 cursor-pointer" @click="remove(data)" />
            <i class="icon-cross text-sm text-grey-cl-200 cursor-pointer" @click="isCardMenuOpen = false" />
          </div>
        </div>
        <!-- TODO wire to API -->
        <!-- <line-chart class="line-chart__wrap relative" :chart-data="dataSets" :options="options" /> -->
      </div>
    </div>

    <div class="flex justify-between items-center">
      <div class="flex">
        <span class="text-grey-cl-100 text-sm leading-xs capitalize">{{ data.exchange }}</span>
      </div>
      <div class="flex">
        <p class="text-white text-xs leading-xs pr-5 mr-5 border-r border-solid border-grey-cl-400">
          {{ data.total[currencyKey] | toCurrency(currencyKey.toUpperCase(), 2) }}
        </p>
        <p class="text-white text-xs leading-xs">{{ data.total.btc | toCurrency("BTC", 8) }}</p>
      </div>
    </div>

    <!-- CONFIRM MODAL -->
    <AppConfirmModal
      ref="confirmModal"
      title="Delete your key"
      subtitle="Are you sure you want to delete your key?"
      confirm-button="Delete"
    >
      <!-- <span class="text-white pr-6">Total profit estimation if close now</span>
      <span class="text-blue-cl-400">+2%</span> -->
    </AppConfirmModal>

    <!-- EDIT MODAL -->
    <AppModal v-model="editModalData" max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20 md:px-75">
        <h2 class="font-raleway text-white text-xxl text-center mb-45">Edit API key</h2>
        <!-- MY EXCHANGES KEYS UPDATE FORM -->
        <MyExchangesKeysUpdateForm :data="editModalData" @update="handleUpdate" />
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ExchangeKey } from "@/store/exchangeKeys/types";
import { Accounts } from "@/store/user/types";

const user = namespace("userModule");

import MyExchangesKeysUpdateForm from "@/components/keys/MyExchangesKeysUpdateForm.vue";
import LineChart from "@/components/charts/LineChart.vue";

@Component({ name: "PortfolioWalletsCard", components: { LineChart, MyExchangesKeysUpdateForm } })
export default class PortfolioWalletsCard extends Vue {
  /* VUEX */
  @user.State selectedWallets!: any;
  @user.State keys!: any;
  @user.Action deleteKeyActionAsync: any;
  @user.Action editExchangeKeyAction: any;
  @user.Action fetchUserSummary: any;

  /* PROPS */
  @Prop({ required: true }) currencyKey: string;
  @Prop({ required: true }) data: Accounts;

  /* REFS */
  $refs!: {
    confirmModal: Vue & {
      show: () => Promise<void>;
    };
  };

  /* DATA */
  loading: boolean = false;
  isCardMenuOpen: boolean = false;
  editModalData: any = null;

  // CHART OPTIONS
  options = {
    scales: {
      xAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    tooltips: {
      enabled: false,
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
  };

  /* COMPUTED */
  get dataSets() {
    return "";

    // TODO wire API

    // return {
    //   datasets: [
    //     {
    //       data: this.data.data,
    //       backgroundColor: this.data.backgroundColor,
    //       borderColor: this.data.borderColor,
    //       ...walletChartOption,
    //     },
    //   ],
    //   labels: TODO add lables
    // };
  }

  /* METHODS */
  setEditData(data: ExchangeKey) {
    const currentKey = this.keys.find((el: any) => el.id === data.id);

    this.editModalData = currentKey;
    this.isCardMenuOpen = false;
  }

  handleUpdate(payload: ExchangeKey) {
    this.editExchangeKeyAction(payload)
      .then((res: boolean) => {
        this.$notify({ text: `"${payload.name}" key has been updated`, type: "success" });
        this.editModalData = null;
      })
      .then(() => {
        this.fetchUserSummary();
      });
  }

  remove({ id, name }: any) {
    this.$refs.confirmModal.show().then(() => {
      this.loading = true;
      this.deleteKeyActionAsync({ id })
        .then((res: boolean) => {
          this.$notify({ text: `"${name}" key has been deleted`, type: "success" });
        })
        .finally(() => {
          this.loading = false;
        });
    });
  }
}
</script>

<style lang="scss" scoped>
.my-wallets-card {
  background: #373c47;
  &.is-edit {
    &:after {
      content: "";
      @apply absolute top-0 left-0 w-full h-full z-1;
      background: #373c4780;
    }
  }
}
.line-chart {
  &__wrap {
    height: 30px;
    width: 135px;
    @media (max-width: 1279px) {
      width: 70px;
    }
    @media (max-width: 767px) {
      width: 124px;
    }
  }
}

.icon-more {
  font-size: 3px;
}
</style>
