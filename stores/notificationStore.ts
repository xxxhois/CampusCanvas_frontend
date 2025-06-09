import { create } from 'zustand';

interface Notification {
  id: string;
  chatRoomId: number;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  markAsRead: (chatRoomId: number) => void;
  clearNotifications: () => void;
  getUnreadCount: (chatRoomId: number) => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          read: false,
        },
        ...state.notifications,
      ],
    }));
  },

  markAsRead: (chatRoomId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.chatRoomId === chatRoomId ? { ...n, read: true } : n
      ),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  getUnreadCount: (chatRoomId) => {
    return get().notifications.filter(
      (n) => n.chatRoomId === chatRoomId && !n.read
    ).length;
  },
})); 