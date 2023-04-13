import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { filter, find, forEach, orderBy, remove, map } from 'lodash-es';

import api from '@common/api';
import { convertDbDate } from '@common/helpers/dates';
import { vanillaStore as vanillaAppStore } from '@hooks/useAppStore';

const baseUrl = process?.env?.NEXT_PUBLIC_API_BASE;

interface INotifications {
  unreadCount: number;
  messages: IAppNotification[];
}

interface INotificationsState {
  connections: HubConnection[];
  notifications: INotifications;
  addConnection: Function;
  removeConnection: Function;

  getNotifications: Function;
  addNotification: Function;
  addNotifications: Function;

  sendNotificationWithoutSaveToDb: Function;
  sendNotification: Function;
  sendNotificationToAll: Function;
  removeNotification: Function;
  setReadNotification: Function;
  setReadAllNotifications: Function;
}

const useNotificationStore = createVanilla<INotificationsState>((set, get) => ({
  sendNotificationWithoutSaveToDb: async (title, message) => {
    const connections = get().connections;

    const payload: INotificationMessage = {
      title,
      message,
    };

    if (connections && connections.length) await connections[0].send('SendMessage', payload);
  },
  sendNotification: async (title, message) => {
    const userRegistrationId = vanillaAppStore?.getState()?.profile?.userRegistrationId;
    const connections = get().connections;

    const payload: INotificationMessage = {
      title,
      message,
    };
    await api.post(`/api/notification/${userRegistrationId}`, payload);
  },
  sendNotificationToAll: async (title, message) => {
    const payload: INotificationMessage = {
      title,
      message,
    };
    await api.post(`/api/notification/sendToAll`, payload);
  },
  getNotifications: async () => {
    const userRegistrationId = vanillaAppStore?.getState()?.profile?.userRegistrationId;
    const connectionId = get()?.connections?.[0].connectionId;

    if (userRegistrationId && connectionId) {
      const { data } = await api.get(`/api/notification/${userRegistrationId}`, {
        params: { signalRConnectionId: connectionId },
      });

      if (data?.items?.length > 0) {
        const notifications = map(data.items, n => ({
          date: convertDbDate(n?.notification?.date),
          title: n?.notification?.title,
          message: n?.notification?.message,
          read: n?.isRead,
          userNotificationId: n.userNotificationId,
        }));

        get().addNotifications(notifications);
      }
    }
  },
  connections: get()?.connections || [],
  addConnection: (connection: HubConnection) => {
    const connections = [...get()?.connections];
    connections.push(connection);
    set({ connections });
  },
  removeConnection: connection => {
    const connections = remove(get()?.connections, connection);
    set({ connections });
  },

  notifications: get()?.notifications || {
    unreadCount: 0,
    messages: [],
  },
  addNotification: (message: IAppNotification) => {
    const old = get()?.notifications;
    const newMessages = orderBy([...old.messages, message], m => m.date, ['desc']);

    const notifications = {
      unreadCount: filter(newMessages, m => !m.read).length,
      messages: newMessages,
    };

    set({ notifications });
  },
  addNotifications: (messages: IAppNotification[]) => {
    const old = get()?.notifications;
    const newMessages = orderBy([...old.messages, ...messages], m => m.date, ['desc']);

    const notifications = {
      unreadCount: filter(newMessages, m => !m.read).length,
      messages: newMessages,
    };

    set({ notifications });
  },
  removeNotification: async message => {
    const old = get()?.notifications;
    const messages = filter(old.messages, m => m !== message);
    const notifications = {
      unreadCount: filter(messages, m => !m.read).length,
      messages: messages,
    };

    set({ notifications });

    // remove notification via api
    if (message.userNotificationId) {
      await api.delete(`/api/notification/${message.userNotificationId}`);
    }
  },
  setReadNotification: async message => {
    const old = get()?.notifications;
    const notification = find(old.messages, m => m === message);

    if (notification) {
      notification.read = true;
    }

    const notifications = {
      unreadCount: filter(old.messages, m => !m.read).length,
      messages: [...old.messages],
    };

    set({ notifications });

    // set notification as read via api
    if (message.userNotificationId) {
      await api.post(`/api/notification/read/${message.userNotificationId}`);
    }
  },
  setReadAllNotifications: async () => {
    const userRegistrationId = vanillaAppStore?.getState()?.profile?.userRegistrationId;
    const old = get()?.notifications;
    const messages = forEach(old.messages, m => {
      m.read = true;
    });

    const notifications = {
      unreadCount: 0,
      messages: [...messages],
    };

    set({ notifications });

    // set all notifications as read via api
    await api.post(`/api/notification/readAllNotifications/${userRegistrationId}`);
  },
}));

// setup signalr connection on load
async function setupNotificationsConnection() {
  const state = useNotificationStore.getState();

  const connection = new HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/notifications`)
    .withAutomaticReconnect()
    .build();

  if (connection) {
    state.addConnection(connection);

    connection
      .start()
      .then(() => {
        state.getNotifications();

        connection.on('ReceiveMessage', notification => {
          state.addNotification({
            date: new Date(),
            message: notification?.message,
            title: notification?.title,
            read: false,
            userNotificationId: notification?.userNotificationId,
          });
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
}

if (typeof window !== 'undefined') {
  setupNotificationsConnection();
}

export const vanillaStore = useNotificationStore;
// @ts-ignore-start
export default create<INotificationsState>(useNotificationStore);
// @ts-ignore-end
