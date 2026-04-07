import { Logger } from '@acme/shared-utils';

export type NotificationType = 'welcome' | 'invoice' | 'alert' | 'general';

export interface ChannelPreference {
  email: boolean;
  slack: boolean;
  in_app: boolean;
}

export interface NotificationPreference {
  userId: string;
  channels: Record<NotificationType, ChannelPreference>;
  updatedAt: Date;
}

const logger = new Logger({ service: 'preference-store' });

const DEFAULT_CHANNELS: ChannelPreference = {
  email: true,
  slack: false,
  in_app: true,
};

function createDefaultPreference(userId: string): NotificationPreference {
  return {
    userId,
    channels: {
      welcome: { email: true, slack: false, in_app: true },
      invoice: { email: true, slack: false, in_app: true },
      alert: { email: true, slack: true, in_app: true },
      general: { ...DEFAULT_CHANNELS },
    },
    updatedAt: new Date(),
  };
}

export class PreferenceStore {
  private readonly preferences: Map<string, NotificationPreference> = new Map();

  get(userId: string): NotificationPreference {
    const existing = this.preferences.get(userId);
    if (existing) return existing;

    const defaults = createDefaultPreference(userId);
    this.preferences.set(userId, defaults);
    logger.info(`Created default preferences for user ${userId}`);
    return defaults;
  }

  update(
    userId: string,
    type: NotificationType,
    channels: Partial<ChannelPreference>,
  ): NotificationPreference {
    const pref = this.get(userId);
    const current = pref.channels[type];

    pref.channels[type] = {
      email: channels.email ?? current.email,
      slack: channels.slack ?? current.slack,
      in_app: channels.in_app ?? current.in_app,
    };
    pref.updatedAt = new Date();

    logger.info(`Updated preferences for user ${userId}, type=${type}`);
    return pref;
  }

  isEnabled(userId: string, type: NotificationType, channel: keyof ChannelPreference): boolean {
    const pref = this.get(userId);
    return pref.channels[type][channel];
  }
}
