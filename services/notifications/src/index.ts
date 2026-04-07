import { Logger } from '@acme/shared-utils';

const logger = new Logger({ service: 'notification-service' });

export { EmailChannel } from './channels/email.js';
export { SlackChannel } from './channels/slack.js';
export { InAppChannel } from './channels/in-app.js';
export { NotificationQueue, NotificationProcessor } from './queue/processor.js';
export { NotificationStore } from './models/notification.js';
export { PreferenceStore } from './models/preference.js';
export { renderWelcomeEmail } from './templates/welcome.js';
export { renderInvoiceEmail } from './templates/invoice.js';
export { renderAlertEmail } from './templates/alert.js';

export type { EmailConfig } from './channels/email.js';
export type { SlackBlock } from './channels/slack.js';
export type { InAppNotification } from './channels/in-app.js';
export type { Notification } from './models/notification.js';
export type { NotificationPreference } from './models/preference.js';
export type { NotificationJob } from './queue/processor.js';

logger.info('Notification service module loaded');
