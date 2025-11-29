export type NotificationType = 'chat' | 'mail' | 'task' | 'calendar' | 'mention' | 'comment' | 'system' | 'doc' | 'form' | 'drive';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  avatarUrl?: string;
  senderName?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationPreferences {
  enabledTools: {
    [key in NotificationType]?: boolean;
  };
  mutedUntil: string | null;
  desktopPushEnabled: boolean;
  mobilePushEnabled: boolean;
  soundEnabled: boolean;
}

export interface NotificationFilter {
  readStatus: 'all' | 'unread' | 'read';
  types: NotificationType[];
  priority?: 'all' | 'high';
}

export interface WebSocketMessage {
  event: string;
  data: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
