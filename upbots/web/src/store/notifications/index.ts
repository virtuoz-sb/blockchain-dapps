import Vue from "vue";
import { AxiosError, AxiosResponse } from "axios";
import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import $socket from "../../socket-instance";
import { NotificationsState, OrderEventPayload, Notification } from "./types";
import {
  ALREADY_CONNECTED,
  ALREADY_DISCONNECTED,
  GET_NOTIFICATIONS_READUNREAD_LIST_BEGIN,
  GET_NOTIFICATIONS_READUNREAD_LIST_ERROR,
  GET_NOTIFICATIONS_READUNREAD_LIST_SUCCESS,
  GET_NOTIFICATIONS_UNREAD_LIST_BEGIN,
  GET_NOTIFICATIONS_UNREAD_LIST_ERROR,
  GET_NOTIFICATIONS_UNREAD_LIST_SUCCESS,
  SOCKET_IO_CONNECT,
  SOCKET_IO_DISCONNECT,
  SOCKET_IO_RECONNECT_ATTEMPT,
  WS_ABORT_CONNECTION,
  WS_CONNECTING,
  WS_DISCONNECTING,
  WS_ORDER_EVENT,
  ADD_CHECKED_NOTIFICATION,
  SET_SORT_KEY,
} from "./mutation-types";
import { ORDER_EVENT_ACTION } from "./action-types";
import $http from "@/core/api.config";

const namespaced: boolean = true;

// S T A T E
const state: NotificationsState = {
  pending: false,
  error: null,
  isConnected: false,
  clientId: "",
  reconnectAttempts: 0,
  reconnectFailed: false,
  // we store messages as a dictionary for easier access and interaction
  // @see https://hackernoon.com/shape-your-redux-store-like-your-database-98faa4754fd5
  orderEvents: [],
  notifications: [],
  unreadnotifications: [],
  selectedNotifications: [],
  sortKey: "all",
};

// G E T T E R S
export const getters: GetterTree<NotificationsState, RootState> = {
  socketConnected(state): boolean {
    return state.isConnected;
  },
  getUnreadNotifications(state): Notification[] {
    return state.unreadnotifications;
  },
  getReadUnreadNotifications(state): Notification[] {
    return state.notifications;
  },
  getUnreadNotifCount(state): number {
    if (!state || !state.notifications) {
      return 0;
    }
    return state.notifications.filter((x) => x.isRead === false).length;
  },
  getIsNotificationSelected: (state) => (id: string): boolean => {
    return state.selectedNotifications.includes(id);
  },
  getAllSelectedNotifications(state): string[] {
    return state.selectedNotifications;
  },
  getIsNotificationRead: (state) => (id: string): boolean => {
    return state.notifications.find((x) => x.isRead === true && x.id === id) ? true : false;
  },
  getSortedNotifications: (state) => {
    if (state.sortKey === "all") {
      return state.notifications;
    } else {
      return state.notifications.filter((x) => x.initiator === state.sortKey);
    }
  },
  getSortKey: (state) => {
    return state.sortKey;
  },
  // getNotificationViews(state): NotificationViewModel[] {
  //   // TODO: add some fake data for front end UI wiring
  //   // TODO: get orderEvents + algobotEvents and map them to NotificationViewModel
  //   return new Array<NotificationViewModel>();
  // },

  // getLoading(state): boolean {
  //   return state.loading;
  // },
};

// M U T A T I O N S
export const mutations: MutationTree<NotificationsState> = {
  [ALREADY_CONNECTED]: function (state: NotificationsState) {},

  [WS_ABORT_CONNECTION]: function (state) {},

  [WS_CONNECTING]: function (state) {},

  [WS_DISCONNECTING]: function (state) {},

  [ALREADY_DISCONNECTED]: function (state) {},

  [WS_ORDER_EVENT]: function (state, payload: OrderEventPayload) {
    state.orderEvents.push(payload);
  },

  [SOCKET_IO_CONNECT]: function (state) {
    // auto wired by socket.io-extended
    state.isConnected = true;
    state.reconnectFailed = false;
    state.clientId = $socket.id;
  },

  [SOCKET_IO_DISCONNECT]: function (state) {
    state.isConnected = false;
    state.clientId = "";
  },

  // ws_welcome
  // SOCKET_WS_WELCOME(state, payload) {
  //   // <-- this action is triggered when `ws_welcome` is emmited on the server
  //   console.log("SOCKET_WS_WELCOME mutation ", payload);
  // },

  [SOCKET_IO_RECONNECT_ATTEMPT]: function (state, attempt: number) {
    state.reconnectAttempts = attempt;
  },

  [SOCKET_IO_RECONNECT_ATTEMPT]: function (state, payload) {
    // reconnect_failed	Fired when the client couldn’t reconnect within reconnectionAttempts
    state.reconnectFailed = true;
  },
  [GET_NOTIFICATIONS_UNREAD_LIST_BEGIN]: (state: NotificationsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_NOTIFICATIONS_UNREAD_LIST_SUCCESS]: (state: NotificationsState, unreadnotifications: Notification[]) => {
    state.pending = false;
    state.error = null;
    state.unreadnotifications = unreadnotifications;
  },
  [GET_NOTIFICATIONS_UNREAD_LIST_ERROR]: (state: NotificationsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [GET_NOTIFICATIONS_READUNREAD_LIST_BEGIN]: (state: NotificationsState) => {
    state.pending = true;
    state.error = null;
  },
  [GET_NOTIFICATIONS_READUNREAD_LIST_SUCCESS]: (state: NotificationsState, notifications: Notification[]) => {
    state.pending = false;
    state.error = null;
    //Map initiator (notif.initiator = "" is when we get errors from Binance)
    notifications.forEach((notif: Notification) => {
      if (notif.initiator === "direct" || notif.initiator === "") {
        notif.initiator = "manual trade";
      }
    });
    state.notifications = notifications;
  },
  [GET_NOTIFICATIONS_READUNREAD_LIST_ERROR]: (state: NotificationsState, error: AxiosResponse) => {
    state.pending = false;
    state.error = error;
  },
  [ADD_CHECKED_NOTIFICATION]: (state: NotificationsState, selectedNotifications: string[]) => {
    state.selectedNotifications = selectedNotifications;
  },
  [SET_SORT_KEY]: (state: NotificationsState, sortKey: string) => {
    state.sortKey = sortKey;
  },
  /* For front-end notification simulation
  setNotification(state, payload) {
    state.notifications.push(payload);
  },

  removeNotification(state, payload) {
    state.notifications.splice(payload, 1);
  },
  */
};

// A C T I O N S
export const actions: ActionTree<NotificationsState, RootState> = {
  fetchUnreadNotifications({ commit }) {
    let url = "/api/notifications/unread";
    commit(GET_NOTIFICATIONS_UNREAD_LIST_BEGIN);
    return $http
      .get<Notification[]>(url)
      .then((response) => {
        const res = response && response.data;
        commit(GET_NOTIFICATIONS_UNREAD_LIST_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_NOTIFICATIONS_UNREAD_LIST_ERROR, res);
      });
  },
  fetchReadUnreadNotifications({ commit }) {
    let url = "/api/notifications";
    commit(GET_NOTIFICATIONS_READUNREAD_LIST_BEGIN);
    return $http
      .get<Notification[]>(url)
      .then((response) => {
        const res = response && response.data;
        commit(GET_NOTIFICATIONS_READUNREAD_LIST_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_NOTIFICATIONS_READUNREAD_LIST_ERROR, res);
      });
  },
  deleteSoftNotification({ dispatch, state }, payload: { id: string }) {
    const url = `/api/notifications/delete/${payload.id}`;
    return $http.put(url).then(() => {
      dispatch("fetchReadUnreadNotifications");
    });
  },
  setNotificationToRead({ dispatch }, payload: { id: string }) {
    const url = `/api/notifications/read/${payload.id}`;
    return $http.put(url).then(() => {
      dispatch("fetchReadUnreadNotifications");
    });
  },
  setNotificationReadAll({ dispatch }) {
    const url = `/api/notifications/readall`;
    return $http.put(url).then(() => {
      dispatch("fetchReadUnreadNotifications");
    });
  },
  openWebsocketConnection({ commit, state, rootGetters }) {
    const token = rootGetters["authModule/getJwt"];
    if (!token) {
      commit(WS_ABORT_CONNECTION);
      return;
    }

    if ($socket.connected) {
      commit(ALREADY_CONNECTED);
    } else {
      $socket.io.opts.transportOptions = {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        },
      };
      $socket.open();
      commit(WS_CONNECTING);
    }
  },

  closeWebsocketConnection({ commit }) {
    if ($socket.disconnected) {
      commit(ALREADY_DISCONNECTED);
    } else {
      $socket.disconnect();
      commit(WS_DISCONNECTING);
    }
  },

  [ORDER_EVENT_ACTION]: function ({ dispatch, commit }, message: OrderEventPayload) {
    if (message) {
      commit(WS_ORDER_EVENT, message);
      let eventText = `${message.exch} ${message.sbl} ${message.side} order ${message.status}`;
      if (message.status === "FILLED") {
        eventText += ` ${message.qExec} @ ${message.pExec}`;
      }
      if (message.status === "NEW") {
        eventText += ` ${message.qOrig} @ ${message.pAsk}`; // limit order do not have a pExec yet
      }
      if (message.status === "ERROR") {
        Vue.notify({ text: eventText, duration: 15000, type: "error" });
      } else if (message.status == "FILLED" || message.status == "NEW") {
        Vue.notify({ text: eventText, duration: 15000, type: "success" });
      } else {
        Vue.notify({ text: eventText, duration: 15000, type: "warning" });
      }
      dispatch("fetchReadUnreadNotifications");
    }
  },
  toggleSelectedNotification({ commit, getters, state }, payload: { id: string }) {
    if (getters.getIsNotificationSelected(payload.id)) {
      const NotifIdx = state.selectedNotifications.indexOf(payload.id);
      const newList = [...state.selectedNotifications].filter((__, idx: number) => idx !== NotifIdx);
      commit("ADD_CHECKED_NOTIFICATION", newList);
    } else {
      commit("ADD_CHECKED_NOTIFICATION", [...state.selectedNotifications, payload.id]);
    }
  },
  toggleAllSelectedNotifications({ commit, state }, checkedAll: boolean) {
    if (checkedAll) {
      commit(
        "ADD_CHECKED_NOTIFICATION",
        [...state.notifications].map((item) => item.id)
      );
    } else {
      commit("ADD_CHECKED_NOTIFICATION", []);
    }
  },
  setSortKey({ commit }, sortKey: string) {
    commit("SET_SORT_KEY", sortKey);
  },
  /* For front-end notification simulation
  addNotification({ commit }) {
    // random number from 0 to 2 for push notification
    const randomNumber = Math.floor(Math.random() * 2);

    // notifications dummy data
    const notificationsData = [
      {
        accountRef: "602bd5f87de8fd48d094d1e0",
        createdAt: "2021-02-17T17:35:36.508Z",
        cumulQuoteCost: "10.01178500",
        exOrderId: "956908183",
        exch: "binance",
        id: "602d53e898c760715827044d",
        initiator: "direct",
        isRead: false,
        orderTrack: "602d53e8441163b11afefc18",
        pAsk: "0.00000000",
        pExec: "0.87059",
        qExec: "11.50000000",
        qOrig: "11.50000000",
        qRem: "0",
        sbl: "ADAUSDT",
        side: "BUY",
        status: "FILLED",
        type: "MARKET",
        updatedAt: "2021-02-17T17:35:36.508Z",
        userId: "5ffffcfdb44fdb4239f369c9",
      },
      {
        accountRef: "6037b3f3a82124542f1766c6",
        createdAt: "2021-03-25T10:31:40.617Z",
        cumulQuoteCost: "21.1776",
        exOrderId: "35815433111",
        exch: "ftx",
        id: "605c668ca06bc70b6d3c2325",
        initiator: "algobot",
        isRead: true,
        orderTrack: "605c668bca738f0b19e56c9c",
        pAsk: "0",
        pExec: "52944",
        qExec: "0.0004",
        qOrig: "0.0004",
        qRem: "0",
        sbl: "BTC/USDT",
        side: "SELL",
        status: "FILLED",
        type: "MARKET",
        updatedAt: "2021-03-29T08:45:31.293Z",
        userId: "5ffffcfdb44fdb4239f369c9",
      },
      {
        accountRef: "602bd5f87de8fd48d094d1e0",
        createdAt: "2021-03-17T16:34:27.509Z",
        cumulQuoteCost: "0.00000000",
        exOrderId: "5262380665",
        exch: "binance",
        id: "60522f93bd0138aa63036662",
        initiator: "direct",
        isRead: true,
        orderTrack: "60522e91260d3706f91beeb9",
        pAsk: "35545.49000000",
        pExec: "35545.49000000",
        qExec: "0.00000000",
        qOrig: "0.00099500",
        sbl: "BTCUSDT",
        side: "BUY",
        status: "CANCELED",
        type: "LIMIT",
        updatedAt: "2021-03-29T08:45:26.979Z",
        userId: "5ffffcfdb44fdb4239f369c9",
      },
    ];

    commit("setNotification", notificationsData[randomNumber]);
  },

  removeNotification({ commit, state }, payload) {
    commit("removeNotification", payload);
  },
  */
};

export const notificationsModule: Module<NotificationsState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
