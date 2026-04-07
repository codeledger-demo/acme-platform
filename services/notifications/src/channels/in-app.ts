import { Logger, NotFoundError } from '@acme/shared-utils';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

interface CreateNotificationInput {
  title: string;
  body: string;
  priority: NotificationPriority;
  actionUrl?: string;
}

const logger = new Logger({ service: 'in-app-channel' });

export class InAppChannel {
  private readonly store: Map<string, InAppNotification[]> = new Map();

  async send(userId: string, notification: CreateNotificationInput): Promise<InAppNotification> {
    logger.info(`Creating in-app notification for user ${userId}: "${notification.title}"`);

    const entry: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      title: notification.title,
      body: notification.body,
      priority: notification.priority,
      read: false,
      actionUrl: notification.actionUrl,
      createdAt: new Date(),
    };

    const existing = this.store.get(userId) ?? [];
    existing.push(entry);
    this.store.set(userId, existing);

    logger.info(`In-app notification ${entry.id} created for user ${userId}`);
    return entry;
  }

  async markAsRead(userId: string, notificationId: string): Promise<InAppNotification> {
    const notifications = this.store.get(userId);
    if (!notifications) {
      throw new NotFoundError(`No notifications found for user ${userId}`);
    }

    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) {
      throw new NotFoundError(`Notification ${notificationId} not found for user ${userId}`);
    }

    notification.read = true;
    notification.readAt = new Date();

    logger.info(`Notification ${notificationId} marked as read`);
    return notification;
  }

  async getUnread(userId: string): Promise<InAppNotification[]> {
    const notifications = this.store.get(userId) ?? [];
    const unread = notifications.filter((n) => !n.read);

    logger.info(`Found ${unread.length} unread notifications for user ${userId}`);
    return unread;
  }
}
