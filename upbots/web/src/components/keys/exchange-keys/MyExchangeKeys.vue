<template>
  <div>
    <template v-if="tableData.length">
      <!-- MY EXCHNAGES KEYS TABLE -->
      <MyExchangesKeysTable
        v-if="!$breakpoint.smAndDown"
        :table-data="dataSet"
        @set-sort="setSort"
        @set-edit-data="setEditData"
        @remove="remove"
      />

      <div v-else class="flex flex-col pt-20 pb-120 px-20 overflow-y-auto custom-scrollbar">
        <MyExchangeKeysItemMobile
          v-for="(item, index) in tableData"
          :key="index"
          :data="item"
          @set-edit-data="setEditData"
          @remove="remove"
        />
      </div>

      <!-- ADD NEW EXCHANGES BTN -->
      <AppButton
        v-if="$breakpoint.smAndDown"
        type="circle"
        icon="icon-plus"
        class="add-exchanges-btn fixed right-20 w-70 h-70"
        @click="$emit('add-new-exchanges')"
      />
    </template>

    <div v-else class="flex justify-center items-center flex-grow">
      <p class="text-white text-center p-20">You have not connected any API keys yet</p>
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
      <div class="edit-modal__wrap relative flex flex-col pt-60 pb-40 px-20 md:px-75">
        <h2 class="font-raleway text-white text-xxl text-center mb-45">Edit API key</h2>
        <!-- MY EXCHANGES KEYS UPDATE FORM -->
        <MyExchangesKeysUpdateForm :data="editModalData" @update="handleUpdate" />
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ExchangeKey } from "@/store/exchangeKeys/types";
import { namespace } from "vuex-class";
import { cloneDeep } from "@/core/helper-functions";
const user = namespace("userModule");

import MyExchangesKeysTable from "@/components/keys/exchange-keys/MyExchangesKeysTable.vue";
import MyExchangeKeysItemMobile from "@/components/keys/exchange-keys/MyExchangeKeysItemMobile.vue";
import MyExchangesKeysUpdateForm from "@/components/keys/MyExchangesKeysUpdateForm.vue";

@Component({ name: "MyExchangeKeys", components: { MyExchangesKeysTable, MyExchangesKeysUpdateForm, MyExchangeKeysItemMobile } })
export default class MyExchangeKeys extends Vue {
  /* VUEX */
  @user.Action deleteKeyActionAsync: any;
  @user.Action editExchangeKeyActionAsync: any;
  @user.Action fetchUserSummary: any;

  /* PROPS */
  @Prop({ required: true }) tableData!: ExchangeKey[];

  /* REFS */
  $refs!: {
    confirmModal: Vue & {
      show: () => Promise<void>;
    };
  };

  /* DATA */
  loading: boolean = false;
  editModalData: any = null;
  sort = {
    type: "up",
    field: "exchange",
  };

  /* COMPUTED */
  get dataSet() {
    const data = cloneDeep(this.tableData).sort((one: any, two: any) => {
      if (!Date.parse(one[this.sort.field])) {
        const a = one[this.sort.field].toUpperCase();
        const b = two[this.sort.field].toUpperCase();
        if (a < b) return this.sort.type === "up" ? -1 : 1;
        if (a > b) return this.sort.type === "up" ? 1 : -1;
        return 0;
      } else {
        return this.sort.type === "up"
          ? Date.parse(one[this.sort.field]) - Date.parse(two[this.sort.field])
          : Date.parse(two[this.sort.field]) - Date.parse(one[this.sort.field]);
      }
    });
    return data;
  }

  /* METHODS */
  setSort(type: string, field: string) {
    this.sort.type = type;
    this.sort.field = field;
  }

  setEditData(data: ExchangeKey) {
    this.editModalData = data;
  }

  handleUpdate(payload: ExchangeKey) {
    this.editExchangeKeyActionAsync(payload)
      .then((res: boolean) => {
        this.$notify({ text: `"${payload.name}" key has been updated`, type: "success" });
        this.editModalData = null;
      })
      .then(() => {
        this.fetchUserSummary();
      });
  }

  close() {
    this.editModalData = null;
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
.table-wrap {
  height: calc(100% - 46px);
}

.edit-modal {
  &__wrap {
    min-width: 500px;
    @media (max-width: 767px) {
      @apply min-w-full;
    }
  }
}

.add-exchanges-btn {
  bottom: 80px;
}
</style>
