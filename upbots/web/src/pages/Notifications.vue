<template>
  <GeneralLayout title="Notifications" content-custom-classes="flex-col overflow-y-auto custom-scrollbar">
    <div class="flex flex-col w-full h-full">
      <Card
        class="flex flex-col flex-grow bg-tangaroa rounded-t-15 md:rounded-3 overflow-y-auto custom-scrollbar"
        header-classes="flex items-center justify-between"
      >
        <template slot="header-left">
          <p class="leading-md text-astral cursor-pointer" @click="addNotifications">
            <span class="icon-refresh text-astral mr-5 self-end" />
            <span>Refresh messages</span>
          </p>
        </template>

        <template slot="header-right">
          <span class="leading-md text-astral cursor-pointer mr-20" @click="markAsRead">Mark as Read</span>
          <span class="leading-md text-astral cursor-pointer" @click="deleteSelectedNotifications">Delete</span>
        </template>

        <div slot="content" class="flex flex-col flex-grow pt-20 overflow-y-auto custom-scrollbar">
          <!-- TABLE TABLET DESKTOP -->
          <div v-if="!$breakpoint.smAndDown" class="flex flex-col overflow-y-auto custom-scrollbar">
            <!-- TABLE LABELS -->
            <div class="notifications__label-wrap grid col-gap-10 md:col-gap-20 mb-6 px-20 mb-20">
              <AppCheckbox :value="selectAll" @click="toggleAllCheckboxes" />

              <div class="text-iceberg">{{ `Date & Time` }}</div>

              <div class="text-iceberg">Message</div>
              <div class="text-iceberg">Bot Name</div>

              <div class="flex items-center">
                <div class="text-iceberg mr-10">Source</div>
                <AppDropdownBasic v-model="selectedSortKey" :options="sourceOptions" dark @change="onSourceChanged" />
              </div>
            </div>

            <!-- TABLE ITEMS -->
            <div class="flex flex-col overflow-y-auto custom-scrollbar">
              <div
                v-for="item in getSortedNotifications"
                :key="item.id"
                :class="!getIsNotificationRead(item.id) && 'bg-gable-green'"
                class="notifications__items-wrap grid col-gap-10 md:col-gap-20 px-20 py-11 mb-10 cursor-default"
              >
                <div class="notifications__item-checkbox flex">
                  <AppCheckbox
                    id="item.id"
                    class="self-center"
                    :value="getIsNotificationSelected(item.id)"
                    @click="toggleCheckbox(item.id)"
                  />
                </div>

                <div class="notifications__item-date flex items-center">
                  <span class="text-downy text-md leading-xs">{{ item.createdAt | date("MMMM Do, h:mm:ss A") }}</span>
                </div>

                <div class="notifications__item-desc flex flex-col">
                  <span class="text-md leading-xs mb-2" :class="!item.isRead ? 'text-downy' : 'text-white'">
                    {{ `${item.exch.toUpperCase()} : ${item.type} ${item.side} - ${item.status}` }}
                  </span>

                  <template v-if="item.status === 'ERROR'">
                    <span class="leading-xs text-downy">
                      {{ item.errorReason ? `${item.sbl}: failure: ${getErrorMsg(item.errorReason, item.exch)}` : "" }}
                    </span>
                  </template>

                  <template v-if="item.status === 'CANCELLED'">
                    <span class="leading-xs text-downy">
                      {{ item.errorReason ? `${item.sbl}: order cancelled: ${item.errorReason}` : "" }}
                    </span>
                  </template>

                  <template v-if="item.status === 'NEW'">
                    <span class="leading-xs text-white">
                      {{ `${item.sbl}: asked: ${item.qOrig} @ ${item.pAsk}` }}
                    </span>
                  </template>

                  <template v-if="item.status === 'FILLED' || item.status === 'PARTIALLY_FILLED'">
                    <span class="leading-xs text-downy">
                      {{ `${item.sbl}: executed ${item.qExec} @ ${item.pExec}` }}
                    </span>
                    <span class="leading-xs text-downy">
                      {{ `Cumulative cost: ${item.cumulQuoteCost} ${getCurrency(item.sbl)}` }}
                    </span>
                  </template>
                </div>
                <div class="notifications__item-botname flex items-center">
                  <span class="text-downy text-md leading-xs capitalize">{{ item.botName || "-------" }}</span>
                </div>

                <div class="notifications__item-source flex items-center">
                  <span class="text-downy text-md leading-xs capitalize">{{ item.initiator }}</span>
                </div>
                <div class="flex items-center relative cursor-pointer z-40" @click="deleteNotification(item.id)">
                  <i class="icon-trash text-astral text-xl1" />
                </div>
              </div>
            </div>
          </div>

          <!-- TABLE MOBILE -->
          <div v-else class="flex flex-col overflow-y-auto custom-scrollbar">
            <!-- TABLE MOBILE FILTERS -->
            <div class="grid grid-cols-2 col-gap-20 px-20 mb-20">
              <!-- SOURCE -->
              <div class="flex items-center">
                <div class="text-iceberg mr-10">Source</div>
                <AppDropdownBasic v-model="selectedSortKey" :options="sourceOptions" dark @change="onSourceChanged" />
              </div>

              <!-- SELECT ITEMS -->
              <div class="flex items-center justify-end">
                <p class="text-white mr-10">Select all</p>
                <AppCheckbox :value="selectAll" @click="toggleAllCheckboxes" />
              </div>
            </div>

            <!-- TABLE MOBILE ITEMS -->
            <div class="flex flex-col px-20 pb-20 overflow-y-auto custom-scrollbar">
              <div
                v-for="item in getSortedNotifications"
                :key="item.id"
                class="flex flex-col flex-shrink-0 bg-tiber sahdow-140 rounded-15 p-20 mb-20 last:mb-0"
              >
                <!-- TABLE MOBILE CHECK ITEM -->
                <div class="flex justify-end w-full mb-20">
                  <AppCheckbox
                    id="item.id"
                    class="self-center"
                    :value="getIsNotificationSelected(item.id)"
                    @click="toggleCheckbox(item.id)"
                  />
                </div>

                <div class="grid grid-rows-1 row-gap-20">
                  <!-- TABLE MOBILE DATE TIME -->
                  <div class="grid grid-cols-2 col-gap-20">
                    <p class="text-white text-md leading-xs">Date & Time:</p>
                    <p class="flex justify-end text-downy text-md leading-xs">{{ item.createdAt | date("MMMM Do, h:mm:ss A") }}</p>
                  </div>

                  <!-- TABLE MOBILE MESSAGE -->
                  <div class="grid grid-cols-2 col-gap-20">
                    <p class="text-white text-md leading-xs">Message:</p>

                    <p class="flex flex-col items-end">
                      <span class="text-md leading-xs mb-2" :class="!item.isRead ? 'text-downy' : 'text-white'">
                        {{ `${item.exch.toUpperCase()} : ${item.type} ${item.side} - ${item.status}` }}
                      </span>

                      <template v-if="item.status === 'ERROR'">
                        <span class="leading-xs text-downy">
                          {{ item.errorReason ? `${item.sbl}: failure: ${getErrorMsg(item.errorReason, item.exch)}` : "" }}
                        </span>
                      </template>

                      <template v-if="item.status === 'CANCELLED'">
                        <span class="leading-xs text-downy">
                          {{ item.errorReason ? `${item.sbl}: order cancelled: ${item.errorReason}` : "" }}
                        </span>
                      </template>

                      <template v-if="item.status === 'NEW'">
                        <span class="leading-xs text-white">
                          {{ `${item.sbl}: asked: ${item.qOrig} @ ${item.pAsk}` }}
                        </span>
                      </template>

                      <template v-if="item.status === 'FILLED' || item.status === 'PARTIALLY_FILLED'">
                        <span class="leading-xs text-downy">
                          {{ `${item.sbl}: executed ${item.qExec} @ ${item.pExec}` }}
                        </span>
                        <span class="leading-xs text-downy">
                          {{ `Cumulative cost: ${item.cumulQuoteCost} ${getCurrency(item.sbl)}` }}
                        </span>
                      </template>
                    </p>
                  </div>
                  <!-- TABLE MOBILE BOT NAME -->
                  <div v-if="item.botName" class="grid grid-cols-2 col-gap-20">
                    <p class="text-white text-md leading-xs">Bot Name:</p>
                    <p class="flex justify-end text-downy text-md leading-xs">{{ item.botName }}</p>
                  </div>

                  <!-- TABLE MOBILE SOURCE -->
                  <div class="grid grid-cols-2 col-gap-20">
                    <p class="text-white text-md leading-xs">Source:</p>
                    <p class="flex justify-end text-downy text-md leading-xs capitalize">{{ item.initiator }}</p>
                  </div>

                  <!-- TABLE MOBILE ACTION BUTTON -->
                  <div class="flex justify-end w-full">
                    <AppButton type="light-green-bordered" size="xxs" class="w-100" @click="deleteNotification(item.id)">
                      Delete
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Notification } from "@/store/notifications/types";
import { namespace } from "vuex-class";

const notifications = namespace("notificationsModule");

import GeneralLayout from "@/views/GeneralLayout.vue";

const binanceErrorCodes: any = [
  { code: "-1000", msg: "An unknown error occured while processing the request" },
  { code: "-1001", msg: "Internal error, Please try again" },
  { code: "-1002", msg: "You are not authorized to execute this request" },
  { code: "-1003", msg: "Too many requests queued" },
  { code: "-1006", msg: "An unexpected response was received from the message bus. Execution status unknown" },
  { code: "-1007", msg: "Timeout waiting for response from backend server. Send status unknown; execution status unknown" },
  { code: "-1010", msg: "Error message received" },
  { code: "-1011", msg: "This IP cannot access this route" },
  { code: "-1013", msg: "Order size does not meet minimum order quantity" },
  { code: "-1014", msg: "Unsupported order combination" },
  { code: "-1015", msg: "Too many new orders" },
  { code: "-1016", msg: "This service is no longer available" },
  { code: "-1020", msg: "This operation is not supported" },
  { code: "-1021", msg: "Invalid timestamp" },
  { code: "-1022", msg: "Invalid signature" },
  { code: "-1023", msg: "Start time is greater than end time" },
  { code: "-1100", msg: "Illegal characters found in a parameter" },
  { code: "-1101", msg: "Too many parameters sent for this endpoint" },
  { code: "-1102", msg: "A mandatory parameter was not sent, was empty/null, or malformed" },
  { code: "-1103", msg: "An unknown parameter was sent" },
  { code: "-1104", msg: "Not all sent parameters were read" },
  { code: "-1105", msg: "A parameter was empty" },
  { code: "-1106", msg: "A parameter was sent when not required" },
  { code: "-1111", msg: "Precision is over the maximum defined for this asset" },
  { code: "-1112", msg: "No orders on book for symbol" },
  { code: "-1114", msg: "TimeInForce parameter sent when not required" },
  { code: "-1115", msg: "Invalid timeInForce" },
  { code: "-1116", msg: "Invalid orderType" },
  { code: "-1117", msg: "Invalid side" },
  { code: "-1118", msg: "New client order ID was empty" },
  { code: "-1119", msg: "Original client order ID was empty" },
  { code: "-1120", msg: "Invalid interval" },
  { code: "-1121", msg: "Invalid symbol" },
  { code: "-1125", msg: "This listenKey does not exist" },
  { code: "-1127", msg: "Lookup interval is too big" },
  { code: "-1128", msg: "Combination of optional parameters invalid" },
  { code: "-1130", msg: "Invalid data sent for a parameter" },
  { code: "-2010", msg: "New order rejected" },
  { code: "-2011", msg: "Cancel rejected" },
  { code: "-2013", msg: "Order does not exist" },
  { code: "-2014", msg: "API-key format invalid" },
  { code: "-2015", msg: "Invalid API-key, IP, or permissions for action" },
  { code: "-2016", msg: "No trading window could be found for the symbol. Try ticker/24hrs instead" },
  { code: "-2018", msg: "Balance is insufficient" },
  { code: "-2019", msg: "Margin is insufficient" },
  { code: "-2020", msg: "Unable to fill" },
  { code: "-2021", msg: "Order would immediately trigger" },
  { code: "-2022", msg: "ReduceOnly Order is rejected" },
  { code: "-2023", msg: "User in liquidation mode now" },
  { code: "-2024", msg: "Position is not sufficient" },
  { code: "-2025", msg: "Reach max open order limit" },
  { code: "-2026", msg: "This OrderType is not supported when reduceOnly" },
  { code: "-2027", msg: "Exceeded the maximum allowable position at current leverage" },
  { code: "-2028", msg: "Leverage is smaller than permitted: insufficient margin balance" },
];

type TSourceOption = { value: string; label: string; headerLabel?: boolean };

@Component({ name: "Notifications", components: { GeneralLayout } })
export default class Notifications extends Vue {
  /* VUEX */
  @notifications.State notifications!: Notification[];
  @notifications.State error: any;
  @notifications.Getter getSortKey: string;
  @notifications.Getter getAllSelectedNotifications: string[];
  @notifications.Getter getSortedNotifications: Notification[];
  @notifications.Action setSortKey: (payload: string) => any;
  @notifications.Action toggleAllSelectedNotifications: (payload: boolean) => any;
  @notifications.Action fetchReadUnreadNotifications: () => Promise<Notification[]>;
  @notifications.Getter getIsNotificationRead: (payload: { id: string }) => boolean;
  @notifications.Action toggleSelectedNotification: (payload: { id: string }) => any;
  @notifications.Getter getIsNotificationSelected: (payload: { id: string }) => boolean;
  @notifications.Action deleteSoftNotification: (payload: { id: string }) => Promise<void>;
  @notifications.Action setNotificationToRead: (payload: { id: string }) => Promise<void>;

  /* DATA */
  selectAll: boolean = false;

  selectedSortKey: TSourceOption = { value: "", label: "", headerLabel: true };

  sourceOptions: TSourceOption[] = [
    { value: "all", label: "ALL", headerLabel: true },
    { value: "algobot", label: "ALGOBOT" },
    { value: "manual trade", label: "MANUAL TRADE" },
  ];

  /* HOOKS */
  async mounted() {
    this.selectedSortKey = { value: this.getSortKey, label: this.getSortKey.toUpperCase(), headerLabel: true };

    await this.fetchReadUnreadNotifications();

    if (this.error) {
      this.$notify({ text: this.error.message, type: "error" });
    }
  }

  /* METHODS */
  addNotifications() {
    const audio = new Audio(require("@/assets/audio/notification-sound.wav"));
    audio.play();
  }

  async deleteNotification(id: string) {
    await this.deleteSoftNotification({ id })
      .then(() => {
        this.$notify({ text: "Notification has been deleted", type: "success" });
      })
      .catch(({ response: { data } }) => {
        this.$notify({ text: data.message, type: "error" });
      });
  }

  async markAsRead() {
    await Promise.all(this.getAllSelectedNotifications.map((id: string) => this.setNotificationToRead({ id })));
    this.$notify({ text: "Notifications have been read", type: "success" });
  }

  async deleteSelectedNotifications() {
    await Promise.all(this.getAllSelectedNotifications.map((id: string) => this.deleteSoftNotification({ id })));
    this.$notify({ text: "Notifications have been deleted", type: "success" });
  }

  toggleAllCheckboxes() {
    this.selectAll = !this.selectAll;
    this.toggleAllSelectedNotifications(this.selectAll);
  }

  onSourceChanged() {
    this.setSortKey(this.selectedSortKey.value);
  }

  toggleCheckbox(id: string) {
    this.toggleSelectedNotification({ id });
  }

  getErrorMsg(errReason: string, exchange: string) {
    if (exchange === "binance") {
      //errReason from Binance is status code ex. -2011
      const error = binanceErrorCodes.find((err: { code: string; msg: string }) => err.code === errReason);
      return error ? `${error.msg} (code: ${errReason.replace("-", "")})` : `code: ${errReason.replace("-", "")}`;
    }
    return errReason;
  }

  getCurrency(pair: string) {
    return pair.includes("/") ? pair.split("/")[1] : "";
  }
}
</script>

<style lang="scss" scoped>
.notifications {
  &__label-wrap {
    grid-template-columns: 30px 250px 1fr 1fr 1fr 20px;
  }

  &__items-wrap {
    grid-template-columns: 30px 250px 1fr 1fr 1fr 20px;
  }

  @media (max-width: 1023px) {
    &__label-wrap {
      grid-template-columns: 30px 180px 1fr 1fr 1fr 20px;
    }

    &__items-wrap {
      grid-template-columns: 30px 180px 1fr 1fr 1fr 20px;
    }
  }
}
</style>
