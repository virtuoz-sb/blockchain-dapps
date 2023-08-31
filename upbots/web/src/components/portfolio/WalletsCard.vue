<template>
  <div
    class="my-wallets-card relative flex flex-col pt-20 md:pt-10 pb-20 px-20 md:px-10 xl:px-20 border-b border-solid border-grey-cl-400 last:border-none"
    :class="{ 'is-edit': isCardMenuOpen }"
  >
    <div class="flex items-center justify-between mb-12">
      <div class="flex flex-col">
        <div class="flex items-center cursor-pointer">
          <div
            class="check-icon__wrap hidden md:flex items-center justify-center flex-shrink-0 w-18 h-18 border border-solid border-grey-cl-400 rounded-full mr-7 cursor-pointer"
            :class="{ 'is-active': selectedWallets.includes(data.name) }"
            @click="$emit('select', data)"
          >
            <i v-if="selectedWallets.includes(data.name)" class="icon-check text-iceberg text-xxs" />
          </div>

          <p class="leading-md text-iceberg">{{ data.name }}</p>
        </div>
      </div>

      <div class="flex flex-col items-end">
        <div class="flex h-12 mb-4">
          <div v-if="!isCardMenuOpen" class="flex items-center justify-end cursor-pointer" @click="isCardMenuOpen = true">
            <i class="flex icon-more text-iceberg" />
          </div>

          <div v-else class="flex items-center justify-end" :class="{ 'z-2': isCardMenuOpen }">
            <i class="icon-edit text-sm text-iceberg mr-10 cursor-pointer" @click="setEditData(data)" />
            <i class="icon-trash text-sm text-iceberg mr-10 cursor-pointer" @click="remove(data)" />
            <i class="icon-cross text-sm text-iceberg cursor-pointer" @click="isCardMenuOpen = false" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <div class="flex">
        <span class="text-grey-cl-100 text-sm leading-xs capitalize">{{ data.exchange === "ftx" ? "FTX" : data.exchange }}</span>
      </div>
      <div class="flex">
        <p class="text-iceberg text-xs leading-xs pr-5 mr-5 border-r border-solid border-grey-cl-400">
          {{ data.total[currencyKey] | toCurrency(currencyKey.toUpperCase(), 2) }}
        </p>
        <p class="text-iceberg text-xs leading-xs">{{ data.total.btc | toCurrency("BTC", 8) }}</p>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <AppConfirmModal
      ref="confirmModal"
      title="Delete your key"
      subtitle="Are you sure you want to delete your key?"
      confirm-button="Delete"
    />

    <!-- EDIT MODAL -->
    <AppModal v-model="editModalData" max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20 md:px-75">
        <h2 class="font-raleway text-iceberg text-xxl text-center mb-45">Edit API key</h2>
        <MyExchangesKeysUpdateForm :data="editModalData" @update="handleUpdate" />
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ExchangeKey } from "@/store/exchangeKeys/types";
import { Keys } from "@/components/portfolio/types/portfolio.types";
import { Accounts } from "../../store/user/types";

const user = namespace("userModule");

import LineChart from "@/components/charts/LineChart.vue";
import MyExchangesKeysUpdateForm from "@/components/keys/MyExchangesKeysUpdateForm.vue";

@Component({ name: "WalletsCard", components: { LineChart, MyExchangesKeysUpdateForm } })
export default class WalletsCard extends Vue {
  /* VUEX */
  @user.State selectedWallets!: string[];
  @user.State keys!: Keys[];
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

  /* CHART OPTIONS */
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

  /* METHODS */
  setEditData(data: ExchangeKey) {
    const currentKey = this.keys.find((el: Keys) => el.id === data.id);

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
  &.is-edit {
    &:after {
      content: "";
      @apply absolute top-0 left-0 w-full h-full z-1;
      background: rgba(27, 49, 58, 0.8);
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

.check-icon {
  &__wrap {
    &.is-active {
      @apply shadow-30;
      background: linear-gradient(225deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), #27adc5;
      background-blend-mode: overlay, normal;
    }
  }
}

.icon-more {
  font-size: 3px;
}
</style>
