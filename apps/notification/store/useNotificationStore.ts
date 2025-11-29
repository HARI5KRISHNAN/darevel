import { create } from 'zustand';
import { Notification, NotificationPreferences, NotificationFilter } from '../types';
import { notificationApi } from '../services/api';
import { wsService } from '../services/websocket';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  filter: NotificationFilter;
  isPanelOpen: boolean;
  
  fetchNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (prefs: NotificationPreferences) => Promise<void>;
  addNotification: (notification: Notification) => void;
  setPanelOpen: (isOpen: boolean) => void;
  setFilter: (filter: Partial<NotificationFilter>) => void;
  initWebSocket: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: null,
  isLoading: false,
  isPanelOpen: false,
  filter: {
    readStatus: 'all',
    types: [],
    priority: 'all',
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const [response, unreadCount, prefs] = await Promise.all([
        notificationApi.fetchNotifications(),
        notificationApi.getUnreadCount(),
        notificationApi.getPreferences(),
      ]);
      set({ 
        notifications: response.data, 
        unreadCount, 
        preferences: prefs,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const currentLen = get().notifications.length;
    const response = await notificationApi.fetchNotifications(currentLen.toString());
    set(state => ({
      notifications: [...state.notifications, ...response.data],
    }));
  },

  markAsRead: async (id) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
    await notificationApi.markAsRead(id);
  },

  markAllAsRead: async () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
    await notificationApi.markAllAsRead();
  },

  updatePreferences: async (prefs) => {
    set({ preferences: prefs });
    await notificationApi.updatePreferences(prefs);
  },

  addNotification: (notification) => {
    const prefs = get().preferences;
    
    if (prefs?.mutedUntil && new Date(prefs.mutedUntil) > new Date()) {
      return;
    }

    if (prefs?.enabledTools && !prefs.enabledTools[notification.type]) {
      return;
    }

    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),

  setFilter: (newFilter) => set(state => ({
    filter: { ...state.filter, ...newFilter }
  })),

  initWebSocket: () => {
    wsService.connect();
    wsService.onMessage((msg) => {
      if (msg.event === 'notification') {
        get().addNotification(msg.data);
      }
    });
  }
}));
