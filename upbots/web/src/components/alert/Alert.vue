<template>
  <div class="h-full">
    <div class="flex md:hidden justify-between w-full items-center border-b border-grey-cl-300 px-20 pb-10">
      <div class="flex items-center">
        <span v-if="!isCreate" class="icon-arrow-back text-grey-cl-920 text-xl1" @click="$emit('close-alert')" />
        <span class="text-white text-md pl-15">Alerts</span>
      </div>
      <div v-if="isCreate">
        <span class="icon-cross text-blue-cl-100" @click="hide" />
      </div>
    </div>

    <div v-if="!isCreate" class="flex flex-col pt-10 md:pt-0">
      <div class="hidden md:flex items-center px-20 pb-10 cursor-pointer" @click="toggleShow">
        <span class="icon-plus text-md text-blue-cl-100 mr-10" />
        <span class="text-blue-cl-100 text-md leading-xs">Create Alert</span>
      </div>
      <AppDivider class="hidden md:flex bg-grey-cl-400" />
      <!-- ALERT LIST -->
      <AlertsList :alerts="alerts" @edit-alert="handleEdit" />
    </div>

    <div v-else class="block w-full h-full overflow-y-auto custom-scrollbar">
      <div class="flex flex-col px-20 pt-10 h-full">
        <div class="flex items-center mb-25 md:mb-22">
          <p class="text-grey-cl-920 text-md md:text-sm md:leading-xs mr-5">Condition:</p>
          <AppDropdownBasic v-model="alertForm.crossing" :options="crossing" dark />
        </div>

        <div class="flex items-center mb-25 md:mb-22">
          <p class="text-grey-cl-920 text-md md:text-sm md:leading-xs mr-5">Value:</p>
          <AppInput v-model="alertForm.value" size="sm" />
        </div>

        <div class="flex items-center mb-25 md:mb-22">
          <p class="text-grey-cl-920 text-md md:text-sm md:leading-xs mr-5">Option:</p>
          <AppDropdownBasic v-model="alertForm.option" :options="options" dark />
        </div>

        <div class="flex justify-between md:flex-col mb-25 md:mb-22">
          <h3 class="text-grey-cl-920 text-md md:text-sm md:leading-xs md:mb-15">Expiration Time</h3>
          <div class="flex items-center text-blue-cl-100">
            <span class="icon-calendar text-xxl1 md:text-md mr-8" />
            <span class="text-md md:leading-xs md:text-sm">16.04.2020</span>
            <span class="text-md md:leading-xs md:text-sm mx-4">|</span>
            <span class="text-md md:leading-xs md:text-sm">21:00</span>
          </div>
        </div>

        <div class="flex items-center mb-25 md:mb-22">
          <p class="text-grey-cl-920 text-md md:text-sm md:leading-xs mr-5">Notification:</p>
          <AppDropdownBasic v-model="alertForm.notificationType" :options="notificationTypeList" dark />
        </div>

        <div class="flex flex-col mb-25 md:mb-22">
          <h3 class="text-grey-cl-920 text-md md:text-sm md:leading-xs mb-10">Alert Message</h3>
          <AppTextarea v-model="alertForm.alertMessage" custom-class="textarea w-full h-50 md:h-70" />
        </div>

        <div class="hidden md:flex items-center justify-between">
          <div v-if="state === 'save'" class="flex items-center text-blue-cl-100 cursor-pointer">
            <span class="icon-check text-md mr-6" />
            <span class="text-md md:text-sm md:leading-xs" @click="handleCreateEdit">Create</span>
          </div>
          <div
            v-if="state === 'save'"
            class="text-md md:text-sm md:leading-xs text-grey-cl-100 border-b border-grey-cl-100 cursor-pointer"
            @click="clearAll"
          >
            <span>Clear All</span>
          </div>
          <div v-else class="flex items-center w-full justify-between">
            <span class="text-md md:text-sm md:leading-xs text-blue-cl-100 cursor-pointer" @click="handleCreateEdit">Save</span>
            <span class="text-md md:text-sm md:leading-xs text-red-cl-100 cursor-pointer" @click="handleRemove">Delete</span>
            <span class="text-md md:text-sm md:leading-xs text-grey-cl-100 cursor-pointer" @click="cancelEdit">Cancel</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isCreate" class="px-20 mb-20 md:hidden">
      <div class="flex md:hidden justify-between items-center bg-black p-3 text-md rounded-full">
        <div class="flex w-3/5 items-center text-white justify-center gradient-1 py-15 rounded-full" @click="handleCreateEdit">
          <span class="icon-check" />
          <span class="leading-xs pl-8">Save</span>
        </div>

        <div v-if="state === 'save'" class="flex items-center m-auto text-grey-cl-920 border-b" @click="clearAll">Clear All</div>
        <div v-else class="flex items-center m-auto text-grey-cl-920 border-b" @click="handleRemove">Remove</div>
      </div>
    </div>

    <div v-if="!isCreate" class="px-20 md:hidden absolute w-full bottom-20 text-md">
      <AppButton type="light-green" @click="toggleShow">Create Alert</AppButton>
    </div>

    <!-- COMING SOON MODAL -->
    <AppModal v-model="isComingSoonModal" max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20 md:px-85">
        <h2 class="font-raleway text-white text-xxl text-center mb-20">Coming Soon</h2>
        <p class="account-detect-modal__desc text-grey-cl-920 text-center mx-auto mb-20">
          TradingView alerts are very useful tools to make sure you don't miss an opportunity. They will warn you when the chosen conditions
          are reached or will automatically trigger trades.
        </p>
        <AppButton type="light-green" @click="isComingSoonModal = false">Close</AppButton>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { mapActions, mapState } from "vuex";
import { GroupItems, AlertForm } from "@/models/interfaces";
import { alertModel } from "@/models/default-models";

import AlertsList from "@/components/alert/AlertsList.vue";

@Component({
  name: "Alert",
  components: {
    AlertsList,
  },
  computed: {
    ...mapState("userModule", ["alerts"]),
  },
  methods: {
    ...mapActions("userModule", ["addNewAlert", "editAlert", "removeAlert"]),
  },
})
export default class Alert extends Vue {
  /* VUEX TYPES */
  addNewAlert!: (payload: any) => any;
  editAlert!: (payload: any) => any;
  removeAlert!: (payload: any) => any;

  /* VUEX */
  alerts!: AlertForm[];

  /* DATA */
  isComingSoonModal: boolean = false;
  state: string = "save";
  editIndex: number | null = null;

  isCreate: boolean = false;

  crossing: GroupItems[] = [
    { label: "Crossing", value: "crossing" },
    { label: "Crossing Up", value: "crossing-up" },
    { label: "Crossing Down", value: "crossing-down" },
    { label: "Greater Than", value: "greater-than" },
    { label: "Less Than", value: "less-than" },
  ];

  options: GroupItems[] = [
    { label: "Only Once", value: "once" },
    { label: "Oncer Per Bar", value: "oncer-per-bar" },
    { label: "Once Per Bar Close", value: "once-per-bar-close" },
    { label: "Everytime", value: "everytime" },
  ];

  notificationTypeList: GroupItems[] = [
    { label: "SMS", value: "sms" },
    { label: "Email", value: "email" },
    { label: "Both", value: "both" },
  ];

  alertForm: AlertForm = {
    crossing: { label: "Crossing", value: "crossing" },
    line: { label: "Horizontal Line", value: "horizontal" },
    option: { label: "Only Once", value: "once" },
    notificationType: { label: "SMS", value: "sms" },
    alertMessage: "",
    alertId: null,
    condition: { label: "Crossing", value: "crossing" },
    value: "",
  };

  /* METHODS */
  handleCreateEdit() {
    this.isComingSoonModal = true;
    // if (this.state === "save") this.addNewAlert(this.alertForm);
    // if (this.state === "edit") this.editAlert({ form: this.alertForm, index: this.editIndex });
    // this.isCreate = false;
    // this.clearAll();
  }

  handleEdit(index: number) {
    this.state = "edit";
    this.editIndex = index;
    this.alertForm = { ...this.alerts[this.editIndex] };
    this.isCreate = true;
  }

  cancelEdit() {
    this.state = "save";
    this.isCreate = false;
    this.clearAll();
  }

  handleRemove() {
    this.removeAlert(this.editIndex);
    this.state = "save";
    this.isCreate = false;
    this.clearAll();
  }

  clearAll() {
    this.alertForm = alertModel();
  }

  toggleShow() {
    this.isCreate = true;
    this.state = "save";
  }

  hide() {
    this.isCreate = false;
    this.state = "save";
    this.clearAll();
  }
}
</script>

<style lang="scss" scoped>
::v-deep .textarea {
  resize: none;
}
.alert {
  &__icon-cross {
    font-size: 6px;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
  }
}
</style>
