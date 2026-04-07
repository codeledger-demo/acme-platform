import { Logger, NotFoundError } from '@acme/shared-utils';

export type NotificationChannel = 'email' | 'slack' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';
export type NotificationType = 'welcome' | 'invoice' | 'alert' | 'general';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  payload: Record<string, unknown>;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
}

const logger = new Logger({ service: 'notification-store' });

export class NotificationStore {
  private readonly notifications: Map<string, Notification> = new Map();

  create(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    payload: Record<string, unknown>,
  ): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      type,
      channel,
      status: 'pending',
      payload,
      createdAt: new Date(),
    };

    this.notifications.set(notification.id, notification);
    logger.info(`Notification ${notification.id} created for user ${userId}`);
    return notification;
  }

  getById(id: string): Notification {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new NotFoundError(`Notification ${id} not found`);
    }
    return notification;
  }

  getByUserId(userId: string): Notification[] {
    return [...this.notifications.values()].filter((n) => n.userId === userId);
  }

  markSent(id: string): Notification {
    const notification = this.getById(id);
    notification.status = 'sent';
    notification.sentAt = new Date();
    logger.info(`Notification ${id} marked as sent`);
    return notification;
  }

  markFailed(id: string): Notification {
    const notification = this.getById(id);
    notification.status = 'failed';
    logger.warn(`Notification ${id} marked as failed`);
    return notification;
  }

  markRead(id: string): Notification {
    const notification = this.getById(id);
    notification.status = 'read';
    notification.readAt = new Date();
    logger.info(`Notification ${id} marked as read`);
    return notification;
  }
}
