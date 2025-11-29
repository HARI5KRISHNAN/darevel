import { Notification, NotificationPreferences, PaginatedResponse, NotificationType } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const MOCK_NOTIFICATIONS: Notification[] = Array.from({ length: 20 }).map((_, i) => ({
  id: generateId(),
  type: ['chat', 'mail', 'task', 'calendar', 'mention'][Math.floor(Math.random() * 5)] as NotificationType,
  title: ['New Message', 'Project Update', 'Meeting Reminder', 'Task Assigned', 'You were mentioned'][Math.floor(Math.random() * 5)],
  message: `This is a simulated notification message body number ${i + 1} with some context.`,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
  isRead: Math.random() > 0.3,
  senderName: 'Alice Smith',
  avatarUrl: `https://picsum.photos/seed/${i}/40/40`,
  priority: Math.random() > 0.8 ? 'high' : 'normal',
}));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationApi = {
  fetchNotifications: async (cursor?: string): Promise<PaginatedResponse<Notification>> => {
    await delay(600);
    const start = cursor ? parseInt(cursor) : 0;
    const limit = 10;
    const data = MOCK_NOTIFICATIONS.slice(start, start + limit);
    const nextCursor = start + limit < MOCK_NOTIFICATIONS.length ? (start + limit).toString() : undefined;
    
    return {
      data: data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      nextCursor,
      hasMore: !!nextCursor,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    await delay(300);
    return MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
  },

  markAsRead: async (id: string): Promise<void> => {
    await delay(200);
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (notif) notif.isRead = true;
  },

  markAllAsRead: async (): Promise<void> => {
    await delay(400);
    MOCK_NOTIFICATIONS.forEach(n => n.isRead = true);
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    await delay(300);
    return {
      enabledTools: { chat: true, mail: true, task: true, calendar: true, mention: true, comment: true },
      mutedUntil: null,
      desktopPushEnabled: true,
      mobilePushEnabled: false,
      soundEnabled: true,
    };
  },

  updatePreferences: async (prefs: NotificationPreferences): Promise<void> => {
    await delay(300);
    console.log('Preferences updated:', prefs);
  },
};
